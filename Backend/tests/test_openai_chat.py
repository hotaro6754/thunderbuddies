import os
import asyncio
import json

import pytest
from httpx import AsyncClient, Response
try:
    # httpx exposes ASGI transport in different places across versions
    from httpx._transports.asgi import ASGITransport
except Exception:
    try:
        # newer httpx may expose ASGITransport on the httpx package
        from httpx import ASGITransport
    except Exception:
        raise ImportError('ASGITransport not found in httpx; please install httpx>=0.24')


@pytest.mark.asyncio
async def test_openai_chat_returns_reply(monkeypatch, respx_mock):
    # Ensure API keys and supabase vars are set for the server
    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    monkeypatch.setenv('SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('SUPABASE_KEY', 'test-supabase-key')

    # Dynamically load the backend.app module from file so pytest import paths don't interfere
    import importlib.util
    import sys
    import types
    from pathlib import Path

    # Insert a minimal fake `supabase` module so backend.app can import/create a client
    fake_supabase = types.ModuleType('supabase')

    class _DummyQuery:
        def __init__(self):
            self.error = None
            self.data = []

        def execute(self):
            return self

    class _DummyTable:
        def insert(self, data):
            return _DummyQuery()

        def select(self, *args, **kwargs):
            return _DummyQuery()

    class _DummyClient:
        def table(self, name):
            return _DummyTable()

    def create_client(url, key):
        return _DummyClient()

    fake_supabase.create_client = create_client
    sys.modules['supabase'] = fake_supabase

    repo_root = Path(__file__).resolve().parents[2]
    app_path = repo_root / 'backend' / 'app.py'
    spec = importlib.util.spec_from_file_location('backend_app', str(app_path))
    backend_app = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(backend_app)
    _app = getattr(backend_app, 'app')

    # Mock the OpenAI REST endpoint
    openai_url = "https://api.openai.com/v1/chat/completions"
    mocked = respx_mock.post(openai_url).mock(return_value=Response(200, json={
        "id": "chatcmpl-123",
        "object": "chat.completion",
        "created": 1,
        "choices": [{"index": 0, "message": {"role": "assistant", "content": "Hello from mocked OpenAI"}}],
        "usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2}
    }))

    transport = ASGITransport(app=_app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        resp = await ac.post('/openai/chat', json={'message': 'Hi', 'conversation': []})
        assert resp.status_code == 200
        body = resp.json()
        assert 'reply' in body
        assert body['reply'] == 'Hello from mocked OpenAI'
        assert mocked.called

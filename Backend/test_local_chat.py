import sys
import os
import json

# ensure repo root is on sys.path so `Backend` package imports correctly
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from fastapi.testclient import TestClient
from Backend import app as backend_app

client = TestClient(backend_app.app)
resp = client.post('/openai/chat', json={'message':'Hello from local test','conversation':[]}, timeout=60)
print('STATUS', resp.status_code)
try:
    print(json.dumps(resp.json(), indent=2))
except Exception:
    print(resp.text)


# --- Direct call to async handler to capture exceptions and tracebacks ---
import asyncio
import traceback
from Backend.app import openai_chat

async def run_direct():
    try:
        result = await openai_chat({'message':'Hello from direct async call','conversation':[]})
        print('\nDIRECT RESULT:')
        print(json.dumps(result, indent=2))
    except Exception as e:
        print('\nDIRECT EXCEPTION:')
        traceback.print_exc()

asyncio.run(run_direct())


# --- Direct call to OpenAI REST API using env OPENAI_API_KEY (for debugging) ---
import os
import httpx

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_API_BASE = os.getenv('OPENAI_API_BASE', 'https://api.openai.com')

if OPENAI_API_KEY:
    url = f"{OPENAI_API_BASE.rstrip('/')}/v1/chat/completions"
    headers = {'Authorization': f'Bearer {OPENAI_API_KEY}', 'Content-Type': 'application/json'}
    body = {'model':'gpt-4o-mini','messages':[{'role':'user','content':'Hello from direct OpenAI test'}],'max_tokens':64}
    print('\nDIRECT OPENAI REQUEST TO', url)
    try:
        with httpx.Client(timeout=30.0) as c:
            r = c.post(url, headers=headers, json=body)
        print('OPENAI STATUS', r.status_code)
        try:
            print(json.dumps(r.json(), indent=2))
        except Exception:
            print(r.text)
    except Exception as e:
        print('OPENAI REQUEST ERROR:', str(e))
else:
    print('\nOPENAI_API_KEY not set in environment; skipping direct OpenAI call')

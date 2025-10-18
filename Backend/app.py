import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client
from fastapi.middleware.cors import CORSMiddleware
import httpx

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError('SUPABASE_URL and SUPABASE_KEY must be set in environment')

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title='Afinity Backend')

# Enable CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI setup
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

OPENAI_API_BASE = os.getenv('OPENAI_API_BASE', 'https://api.openai.com')



class User(BaseModel):
    username: str
    fullname: str | None = None


@app.get('/')
def root():
    return {'status': 'ok'}


@app.post('/users')
def create_user(u: User):
    data = u.dict()
    res = sb.table('users').insert(data).execute()
    if res.error:
        raise HTTPException(status_code=500, detail=str(res.error))
    return res.data


@app.get('/users')
def list_users():
    res = sb.table('users').select('*').execute()
    if res.error:
        raise HTTPException(status_code=500, detail=str(res.error))
    return res.data


@app.post('/openai/chat')
async def openai_chat(payload: dict):
    """Proxy chat endpoint. Expects JSON: {"message": "...", "conversation": [{role, content}, ...]}"""
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail='OpenAI API key not configured on server')

    message = payload.get('message')
    conversation = payload.get('conversation', [])
    if not message:
        raise HTTPException(status_code=400, detail='message is required')

    # Build messages for Chat Completions API
    messages = []
    if isinstance(conversation, list):
        messages.extend(conversation)
    messages.append({"role": "user", "content": message})

    url = f"{OPENAI_API_BASE.rstrip('/')}/v1/chat/completions"
    headers = {
        'Authorization': f'Bearer {OPENAI_API_KEY}',
        'Content-Type': 'application/json',
    }
    body = {
        'model': 'gpt-4o-mini',
        'messages': messages,
        'max_tokens': 512,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=body)
        if resp.status_code != 200:
            # surface useful error
            detail = None
            try:
                detail = resp.json()
            except Exception:
                detail = resp.text
            raise HTTPException(status_code=502, detail={'status': resp.status_code, 'body': detail})

        data = resp.json()
        # expected shape: {choices: [{message: {role, content}}], ...}
        choices = data.get('choices') or []
        if not choices:
            return {'reply': ''}
        first = choices[0]
        # support both `message.content` and legacy `text`
        reply = ''
        if isinstance(first, dict):
            msg = first.get('message') or {}
            reply = msg.get('content') or first.get('text') or ''

        return {"reply": reply}
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f'API request error: {str(e)}')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LexIQ Deployment Guide

This guide covers everything required to deploy LexIQ (Frontend and Backend) to a production environment.

## Environment Variables Directory

### Backend Environment Variables (`server/.env`)
These must be set in your backend hosting environment (e.g., Railway, Render, Heroku).

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API Key for `gpt-4o` and embeddings. |
| `PINECONE_API_KEY` | API Key for the Pinecone Vector Database. |
| `TAVILY_API_KEY` | API Key for Tavily web search fallback. |
| `SUPABASE_URL` | Your Supabase project URL (e.g., `https://xyz.supabase.co`). |
| `SUPABASE_SERVICE_KEY` | The Supabase Service Role Key. **Never expose this to the frontend.** |
| `FRONTEND_URL` | The URL of your deployed Next.js application for CORS configuration (e.g., `https://lexiq.vercel.app`). |
| `MEMORY_SECRET_KEY` | A strong, random string used to HMAC sign the client-side memory. If omitted, defaults to a hardcoded string (Not recommended for production). |

### Frontend Environment Variables (`client/.env.local`)
These must be set in your frontend hosting environment (e.g., Vercel).

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (must have `NEXT_PUBLIC_` prefix). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The Supabase Anon/Public Key (must have `NEXT_PUBLIC_` prefix). |
| `SUPABASE_SERVICE_KEY` | The Supabase Service Role Key for server-side Next.js operations. |
| `FASTAPI_URL` | The deployed URL of your FastAPI backend (e.g., `https://lexiq-api.up.railway.app`). |

---

## 1. Supabase Setup

1. Create a new project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open a new query and paste the contents of `supabase_schema.sql` (found in the root of this repo).
4. Run the query. This will:
   - Create tables: `profiles`, `chat_sessions`, `messages`, `uploaded_files`.
   - Setup Row Level Security (RLS) policies.
   - Create triggers for automatic profile creation on user signup.
   - Create the `user-uploads` storage bucket.

---

## 2. Backend Deployment (e.g., Railway / Render)

### Option A: Railway (Recommended)
1. Link your GitHub repository to Railway.
2. Select the `server` folder as your root directory (or use a Procfile/Docker build if configured).
3. Ensure the start command is: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all the backend environment variables listed above in the Railway Variables dashboard.
5. Deploy.

### HMAC Secret Key Setup
Generate a strong cryptographic key for `MEMORY_SECRET_KEY` to secure client memory. You can generate one via Python:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Store this securely in your backend environment variables.

---

## 3. Frontend Deployment (e.g., Vercel)

1. Link your GitHub repository to [Vercel](https://vercel.com/).
2. Set the Root Directory to `client`.
3. Vercel will automatically detect the Next.js framework.
4. Add all the frontend environment variables in the Vercel Settings -> Environment Variables.
5. Deploy.

---

## Common Production Gotchas to Avoid

- **CORS Errors**: Ensure the `FRONTEND_URL` in the backend environment variables exactly matches the domain deployed on Vercel (without trailing slashes). The backend `CORSMiddleware` restricts access to this origin.
- **Service Key Leaks**: NEVER put the `SUPABASE_SERVICE_KEY` in variables prefixed with `NEXT_PUBLIC_`. Keep it strictly on the server side.
- **Engine Initialization Timeout**: The FastAPI backend loads heavy LangChain modules on startup (`lifespan` event). On constrained environments (like free tiers), this might cause a boot timeout. Increase the boot timeout limit on your hosting provider if necessary.
- **Missing HMAC Key**: If you forget to set `MEMORY_SECRET_KEY` in production, anyone could technically forge memory payloads if they discover the default local key. Always define a custom key in production.
- **Vector DB Index**: Ensure your Pinecone index matches the dimensions expected by your embedding model (e.g., 1536 for OpenAI `text-embedding-3-small`).

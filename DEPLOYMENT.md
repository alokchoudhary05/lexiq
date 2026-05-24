# LexIQ Deployment & Operations Manual

This document details the environment configuration, database provisioning, and deployment procedures for the LexIQ platform in a production environment.

## Environment Variables

### Backend Configuration (`server/.env`)
These variables must be securely injected into the backend hosting infrastructure (e.g., Railway, AWS, Render).

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Credentials for OpenAI platform (engine: `gpt-4o`, embeddings). |
| `PINECONE_API_KEY` | Authentication key for the Pinecone Vector Database. |
| `TAVILY_API_KEY` | Credentials for Tavily web search fallback API. |
| `SUPABASE_URL` | The endpoint URL of the Supabase PostgreSQL cluster. |
| `SUPABASE_SERVICE_KEY` | Supabase Service Role Key. **Critical: Do not expose to client applications.** |
| `FRONTEND_URL` | Target origin of the deployed Next.js UI, utilized for strict CORS policy enforcement. |
| `MEMORY_SECRET_KEY` | A cryptographically secure random string used for HMAC-SHA256 client memory signatures. |

### Frontend Configuration (`client/.env.local`)
These variables are required in the Next.js edge/hosting infrastructure (e.g., Vercel).

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public endpoint URL of the Supabase cluster. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key for Supabase Edge Functions and Auth. |
| `SUPABASE_SERVICE_KEY` | Service Role Key for server-side Next.js route handlers. |
| `FASTAPI_URL` | The production URL of the deployed FastAPI backend cluster. |

---

## Database Provisioning (Supabase)

LexIQ relies on Supabase for Auth, PostgreSQL, and Storage.

1. Access the **SQL Editor** within your Supabase project dashboard.
2. Execute the official `supabase_schema.sql` script located in the repository root.
3. **Execution Results:**
   - Provisions core tables: `profiles`, `chat_sessions`, `messages`, `uploaded_files`.
   - Bootstraps Row Level Security (RLS) policies.
   - Installs Postgres Triggers for automated user profile generation.
   - Provisions the `user-uploads` secure storage bucket.

---

## Infrastructure Deployment

### Backend Server
LexIQ's API is optimized for containerized environments or PaaS providers like Railway.

1. Configure your deployment provider to target the `server` directory.
2. **Startup Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Map all backend variables from the Environment Configuration section.
4. **Secret Key Generation**: Generate a cryptographically secure key for `MEMORY_SECRET_KEY` using the following command:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

### Frontend Server
The Next.js client is optimized for Vercel's edge network.

1. Connect the repository to Vercel and set the Root Directory to `client`.
2. Populate the environment variables exactly as outlined in the Frontend Configuration section.
3. Initiate the deployment build.

---

## Operational Guidelines

- **CORS Integrity**: Ensure the `FRONTEND_URL` mapped in the backend matches the exact origin (without trailing slashes) of the Vercel deployment. Misconfiguration will result in cross-origin preflight failures.
- **Engine Boot Times**: The FastAPI service initializes heavy computational libraries (LangChain) on the startup event. If deploying on constrained infrastructure, ensure the boot timeout window is appropriately extended to prevent health check failures.
- **Vector Space Dimensions**: Confirm that the Pinecone index dimensions match the embedding model in use (e.g., 1536 for `text-embedding-3-small`).

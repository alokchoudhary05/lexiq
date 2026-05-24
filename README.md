# LexIQ

**The Advanced Indian Legal RAG Assistant**

LexIQ is a state-of-the-art AI legal assistant designed to provide accurate, source-backed answers to queries regarding Indian Law. Built using an advanced Retrieval-Augmented Generation (RAG) architecture, LexIQ serves as a specialized tool for students, advocates, and citizens to navigate the complexities of the Bharatiya Nyaya Sanhita (BNS), Criminal Procedure Code (CRPC), Indian Penal Code (IPC), and the Income Tax Act & Rules.

## Who is it for?
- **Law Students & Researchers**: Quickly find relevant sections and understand legal concepts with cited sources.
- **Advocates & Legal Professionals**: Accelerate case research and cross-reference acts efficiently.
- **Citizens**: Understand legal rights and obligations under Indian law in plain language.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI & Styling**: React, Tailwind CSS, Lucide React
- **Markdown & Rendering**: React Markdown, Remark GFM
- **Auth & Database Client**: Supabase SSR & Supabase JS

### Backend
- **Framework**: FastAPI (Python)
- **AI Engine**: LangChain, OpenAI (`gpt-4o`)
- **Vector Database**: Pinecone
- **Web Search Fallback**: Tavily API
- **Database & Auth**: Supabase (PostgreSQL)

## Key Features
- **Intelligent RAG Pipeline**: Context-aware retrieval over specific Indian legal acts.
- **Agentic Tool-Calling**: The LLM autonomously decides whether to search the legal vector DB, search the web (for off-topic or general law), or update user memory.
- **Streaming Responses**: Real-time Server-Sent Events (SSE) streaming for a snappy conversational experience.
- **Secure Local Memory**: Client-side personalization using HMAC-signed `localStorage` memory to persist personal facts securely without database overhead.
- **Multi-lingual Support**: Automatically detects and responds in the user's preferred language.

## Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Accounts & API Keys for:
  - OpenAI
  - Pinecone
  - Tavily
  - Supabase

## Local Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/lexiq.git
cd lexiq_pod
```

### 2. Backend Setup
```bash
cd server
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `server` directory (or in the root) with the following:
```env
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
TAVILY_API_KEY=your_tavily_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
FRONTEND_URL=http://localhost:3000
MEMORY_SECRET_KEY=your_hmac_secret
```

Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```
The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd client
npm install
```

Copy the example production environment variables to `.env.local`:
```bash
cp .env.production.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
FASTAPI_URL=http://localhost:8000
```

Start the Next.js development server:
```bash
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## Environment Variables Overview
See `DEPLOYMENT.md` for a comprehensive list and explanation of all required environment variables for both the frontend and backend.

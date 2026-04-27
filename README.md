# EduNex AI Tutor

EduNex AI Tutor is a full-stack adaptive learning platform that explains topics through a learner's interests. The frontend is built with Next.js 14 and Tailwind CSS, and the backend is a FastAPI service with Groq-powered tutoring, MongoDB persistence, and optional Redis-backed short-term memory.

## Features

- Interest-based explanations tailored to topics like gaming, cricket, music, coding, and more
- Modern Next.js dashboard with onboarding, chat, profile, and progress views
- FastAPI backend with modular chat, user, and progress APIs
- MongoDB for long-term user and chat storage
- Redis support for short-term conversational memory and caching
- Groq LLM integration with graceful fallback behavior when the API key is missing

## Tech Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand, React Query, Recharts, Framer Motion
- Backend: FastAPI, Uvicorn, Pydantic v2, Loguru
- Data: MongoDB, Redis
- AI: Groq API

## Project Structure

```text
edunex-ai-tutor/
|-- src/                  # Next.js app, components, store, hooks, utilities
|-- backend/
|   |-- app/
|   |   |-- api/          # FastAPI route modules
|   |   |-- core/         # Settings and shared config
|   |   |-- db/           # MongoDB and Redis clients
|   |   |-- models/       # MongoDB document helpers
|   |   |-- schemas/      # Pydantic request/response schemas
|   |   |-- services/     # AI, interest detection, memory logic
|   |   `-- utils/        # Prompt builders and utilities
|   |-- requirements.txt
|   `-- .env.example
|-- package.json
`-- README.md
```

## Frontend Setup

Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Backend Setup

Create and activate a virtual environment, then install backend dependencies:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your values.

Start the backend:

```bash
venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend docs are available at `http://127.0.0.1:8000/docs`.

## Environment Variables

Backend uses these main variables:

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `MONGODB_URL`
- `MONGODB_DB_NAME`
- `REDIS_URL`
- `APP_NAME`
- `APP_VERSION`
- `DEBUG`
- `CORS_ORIGINS`
- `CHAT_MEMORY_TTL`
- `MAX_MEMORY_MESSAGES`

See [backend/.env.example](./backend/.env.example) for the full template.

## Notes

- MongoDB is expected for persistent storage.
- Redis is optional; if unavailable, the backend runs in degraded mode without cache.
- If `GROQ_API_KEY` is not configured, AI responses fall back to a local helper response.

## License

This project is currently unlicensed unless you add a license file to the repository.

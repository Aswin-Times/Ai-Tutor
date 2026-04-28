# 🎓 EduNex AI Tutor

![EduNex AI Tutor](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-blue)
![Python](https://img.shields.io/badge/Python-3.10+-blue)

EduNex AI Tutor is a revolutionary full-stack adaptive learning platform that fundamentally changes how students learn by explaining complex topics through the lens of a learner's personal interests. Whether a student loves gaming, cricket, music, or coding, EduNex dynamically adapts its teaching style to keep them engaged.

---

## 🚀 Key Features

### 🧠 Adaptive Learning Engine
- **Interest-Based Explanations**: Concepts are tailored to user interests (e.g., explaining physics using cricket).
- **Dynamic Pacing**: Adjusts difficulty based on user comprehension.
- **Context-Aware Interactions**: Uses memory to recall past conversations and build upon previously learned concepts.

### 💻 Modern Frontend Experience
- **Next.js 14 App Router**: Lightning-fast page loads and server-side rendering.
- **Tailwind CSS & Framer Motion**: Beautiful, responsive, and animated user interface.
- **Zustand State Management**: Efficient and seamless global state handling.
- **Interactive Dashboards**: Comprehensive views for onboarding, chat interactions, profile settings, and progress tracking.

### ⚙️ Robust Backend Architecture
- **FastAPI**: High-performance, asynchronous Python backend.
- **Groq LLM Integration**: Powered by blazing fast Groq AI models for real-time tutoring.
- **MongoDB**: Persistent and scalable storage for users, chat histories, and progress data.
- **Redis Integration**: Short-term memory caching and fast state retrieval for active sessions.
- **Modular APIs**: Cleanly separated endpoints for chat, users, and progress metrics.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query
- **Charts & Animations**: Recharts, Framer Motion

### Backend
- **Framework**: FastAPI, Uvicorn
- **Language**: Python 3.10+
- **Data Validation**: Pydantic v2
- **Logging**: Loguru

### Database & Caching
- **Primary Database**: MongoDB
- **In-Memory Store**: Redis

### AI Integrations
- **Provider**: Groq API
- **Fallback**: Graceful local fallback mechanism if API keys are missing.

---

## 📂 Project Structure

```text
edunex-ai-tutor/
|-- src/                  # Next.js frontend application
|   |-- app/              # Next.js App Router pages
|   |-- components/       # Reusable React components (UI, Chat, Dashboard)
|   |-- store/            # Zustand stores
|   |-- hooks/            # Custom React hooks
|   `-- lib/              # Utility functions
|-- backend/              # FastAPI backend application
|   |-- app/
|   |   |-- api/          # FastAPI route endpoints
|   |   |-- core/         # Settings, configuration, and security
|   |   |-- db/           # MongoDB and Redis connection managers
|   |   |-- models/       # Database models
|   |   |-- schemas/      # Pydantic schemas for data validation
|   |   |-- services/     # Core business logic (AI, memory, users)
|   |   `-- utils/        # Prompt engineering and helpers
|   |-- requirements.txt  # Python dependencies
|   `-- .env.example      # Environment variables template
|-- package.json          # Node.js dependencies
`-- README.md             # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)
- MongoDB running locally or a MongoDB Atlas URI
- Redis server (optional, but recommended for caching)
- Groq API Key

### 1️⃣ Frontend Setup

Navigate to the project root and install dependencies:

```bash
# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### 2️⃣ Backend Setup

Open a new terminal window and navigate to the backend directory:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt
```

### 3️⃣ Environment Variables Configuration

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

**Essential Environment Variables (`backend/.env`):**
```env
# AI Provider Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192

# Database Connections
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=edunex_db

# Redis Caching (Optional)
REDIS_URL=redis://localhost:6379

# Application Settings
APP_NAME="EduNex AI Backend"
APP_VERSION="1.0.0"
DEBUG=True
CORS_ORIGINS=["http://localhost:3000"]
```

### 4️⃣ Start the Backend Server

With the virtual environment activated, run:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend server will run at `http://127.0.0.1:8000`.
You can access the interactive API documentation (Swagger UI) at `http://127.0.0.1:8000/docs`.

---

## 📖 API Documentation

The FastAPI backend provides comprehensive, automatically generated API documentation. Here are the core endpoints:

### User Management
- `POST /api/users/` - Create a new user profile
- `GET /api/users/{user_id}` - Retrieve user details
- `PUT /api/users/{user_id}/interests` - Update user learning interests

### Chat & AI Tutoring
- `POST /api/chat/message` - Send a message to the AI tutor and receive an interest-based response
- `GET /api/chat/history/{user_id}` - Retrieve chat history for a specific user

### Progress Tracking
- `GET /api/progress/{user_id}` - Get user's learning progress and stats
- `POST /api/progress/update` - Update progress metrics after a study session

---

## 🔧 Troubleshooting

- **MongoDB Connection Error**: Ensure MongoDB is running on port 27017 or update the `MONGODB_URL` in your `.env` file.
- **AI Responses are Generic**: Check that your `GROQ_API_KEY` is set correctly. If missing, the app uses a fallback mode.
- **CORS Errors**: Verify that `CORS_ORIGINS` in `.env` includes the exact URL of your frontend (e.g., `http://localhost:3000`).
- **Redis Warning Logs**: If Redis is not installed, the backend will safely degrade to run without caching. This is normal behavior unless you explicitly require Redis.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Built with ❤️ for personalized education.*

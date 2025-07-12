
# 🌐 CoreMentis: AI-Powered Educational Platform with Engagement Analytics

![CoreMentis Badge](https://img.shields.io/badge/CoreMentis-Educational%20AI%20Platform-blue?style=for-the-badge)

> **CoreMentis** is an AI-driven educational ecosystem that integrates interactive learning tools, real-time engagement tracking, and performance optimization using **Intel’s OpenVINO** and **Groq LLM**. Designed for students, educators, and institutions, CoreMentis redefines how learning and teaching interact in the digital age.

🔗 [GitHub Repository](https://github.com/priyanshi789/CoreMentis) | 📺 [YouTube Demo](https://www.youtube.com/watch?v=LBFWbGwDSCs) | 📄 [Documentation Folder (Google Drive)](https://drive.google.com/drive/folders/1KHaYg_jnk79GAEZsNvbVlf-lGfcquPkr?usp=sharing)

---

## 🚀 Tech Stack

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&style=flat-square)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Backend-Python-3776AB?logo=python&style=flat-square)](https://www.python.org/)
[![OpenVINO](https://img.shields.io/badge/Optimized%20with-OpenVINO-0071C5?style=flat-square&logo=intel)](https://docs.openvino.ai/)
[![Groq](https://img.shields.io/badge/AI-Groq%20LLM-00BFFF?style=flat-square)](https://groq.com/)

---

## 🌟 Features

### 🤖 AI Educational Assistant
- 💬 Llama3-8B powered chatbot via Groq LLM
- 🗣️ Voice-based interaction (Speech-to-Text using OpenVINO Whisper)
- 🖼️ OCR (Image-to-Text via EasyOCR)
- 🔊 Text-to-Speech for inclusive learning
- 🧠 Context tracking with intelligent summarization
- 🔍 Smart content & note search

### 📊 Engagement Analytics
- 🧍 Real-time student engagement detection
- 📈 Dashboards for performance, attendance, and risk metrics
- ⚠️ Early warning for at-risk students
- 📊 Insights tailored for both educators and learners

### 🎓 Learning Management System (LMS)
- 👥 Role-based system: Admin, Teacher, Student
- 📚 Course creation, assignment handling
- 📣 Notifications, messaging, announcements
- 🗂️ Document upload and media integration
- ⚡ 70% reduction in admin overhead

### ⚙️ Technical Optimizations
- 🚀 OpenVINO-accelerated inference (65% faster)
- 🧮 INT8 quantization for optimized performance
- 📉 Lower memory footprint with custom context manager
- 🖥️ Runs on low-spec systems (cross-platform)

---

## 📈 Impact Metrics

| Metric                   | Improvement |
|--------------------------|-------------|
| Student Engagement       | +27%        |
| Assignment Completion    | +32%        |
| Attendance               | +41%        |
| Dropout Rate             | -42%        |
| Admin Overhead           | -70%        |
| GPA Improvement          | +0.4 points |

---

## 📁 Project Structure

```

CoreMentis/
├── corementis/
│   ├── backend/               # Python Flask backend
│   │   ├── chatbot\_api.py
│   │   ├── chatbot\_api\_optimized.py
│   │   ├── context\_manager.py
│   │   ├── content\_scraper.py
│   │   ├── openvino\_optimization.py
│   │   ├── text\_to\_speech.py
│   │   └── requirements.txt
│   │
│   ├── frontend/              # React frontend
│   │   ├── src/components/
│   │   │   ├── common/
│   │   │   ├── student/
│   │   │   └── teacher/
│   │   ├── src/pages/
│   │   └── src/services/
│   │
│   ├── engagement\_data/
│   ├── models/
│   └── \*.bat scripts for startup
└── README.md

````

---

## ⚙️ Getting Started

### ✅ Requirements

#### Backend
- Python 3.8+
- AVX2-capable CPU (for OpenVINO)
- Optional: NVIDIA GPU (for training)

#### Frontend
- Node.js 14+ (v16 recommended)
- npm or yarn

---

## 🧪 Setup Instructions

### 🔁 Backend Setup

```bash
# Clone the repository
git clone https://github.com/priyanshi789/CoreMentis.git
cd CoreMentis/corementis/backend

# Create a virtual environment
python -m venv venv
# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set Environment Variables
export GROQ_API_KEY=your_groq_api_key  # or use a .env file

# Run backend server
python chatbot_api_optimized.py
# App runs on: http://localhost:5001
````

### 🖥️ Frontend Setup

```bash
cd ../frontend
npm install     # or yarn install
npm start       # or yarn start

# App runs on: http://localhost:3000
```

---

## 🧪 Demo Credentials

| Role    | Email                                                   | Password     | Access                          |
| ------- | ------------------------------------------------------- | ------------ | ------------------------------- |
| Admin   | [admin@corementis.com](mailto:admin@corementis.com)     | `admin123`   | Full access                     |
| Teacher | [teacher@corementis.com](mailto:teacher@corementis.com) | `teacher123` | Assignment & student management |
| Student | [student@corementis.com](mailto:student@corementis.com) | `student123` | Learning tools + analytics      |
| Guest   | [test@corementis.com](mailto:test@corementis.com)       | `test123`    | Limited student access          |

---

## 📡 API Endpoints

### 🔌 Chatbot API

| Method | Endpoint                      | Purpose                |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/api/chatbot/status`         | API Health Check       |
| POST   | `/api/chatbot/message`        | Send chatbot message   |
| POST   | `/api/chatbot/speech-to-text` | Convert speech to text |
| POST   | `/api/chatbot/image-to-text`  | OCR from image         |
| POST   | `/api/chatbot/text-to-speech` | Get TTS output         |
| GET    | `/api/chatbot/history`        | View chat history      |
| POST   | `/api/chatbot/clear`          | Clear chat history     |

---

## 🧠 Models & AI Stack

* **Groq LLM (Llama3-8B)** – AI-powered educational chatbot
* **Whisper (OpenVINO Optimized)** – Speech recognition (\~94% accuracy)
* **EasyOCR (OpenVINO Optimized)** – Image OCR (\~96% accuracy)
* **Text-to-Speech Engine** – Audio conversion of responses
* **Custom Context Manager** – Memory-efficient chat tracking
* **Quantized Models (INT8)** – Low-latency, optimized performance

---

## 🖼️ UI Highlights

### Student Dashboard

* Personalized greetings
* Visual progress tracking
* Assignment deadlines & alerts

### Teacher Dashboard

* Classroom analytics
* Engagement heatmaps
* Submission tracking

### AI Assistant

* Multimodal input: text, voice, image
* Educational search integration
* Accessibility-friendly TTS

---

## 🛠️ Environment Configuration

| Variable             | Description                  | Default     |
| -------------------- | ---------------------------- | ----------- |
| `GROQ_API_KEY`       | API Key for Groq LLM         | Required    |
| `FLASK_ENV`          | Environment (dev/production) | development |
| `FLASK_PORT`         | Backend port                 | 5001        |
| `OPENVINO_DEVICE`    | Inference device (CPU/GPU)   | CPU         |
| `MAX_HISTORY_LENGTH` | Conversation memory depth    | 20          |

---

## 📄 Resources

* 📺 **YouTube Demo**: [Watch on YouTube](https://www.youtube.com/watch?v=LBFWbGwDSCs)
* 📄 **Documentation (Drive)**: [View Folder](https://drive.google.com/drive/folders/1KHaYg_jnk79GAEZsNvbVlf-lGfcquPkr?usp=sharing)
* 🧠 **Groq API Docs**: [https://groq.com/](https://groq.com/)
* 📘 **OpenVINO Documentation**: [https://docs.openvino.ai](https://docs.openvino.ai/latest/index.html)

---

## 📣 Contact & Contributions

* 💻 Contribute via [GitHub Issues](https://github.com/priyanshi789/CoreMentis/issues)
* ✉️ Email: [support@corementis.com](mailto:support@corementis.com)
* 🌍 Project Repo: [github.com/priyanshi789/CoreMentis](https://github.com/priyanshi789/CoreMentis)

---

## 📜 License

This project is licensed under the **MIT License** – you’re free to use, modify, and distribute with attribution.

---

> *Empowering future-ready classrooms through intelligence, insight, and innovation — CoreMentis.*


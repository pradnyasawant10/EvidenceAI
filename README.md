# EvidenceAI – Digital Evidence Management and AI Analysis System

EvidenceAI is an enterprise-grade digital forensic evidence management system paired with an automated multi-modal Artificial Intelligence analysis pipeline. Designed for law enforcement, digital forensics units, and judicial compliance, EvidenceAI ensures evidentiary integrity, immutable chain of custody, and multi-modal AI processing across digital media.

---

## 🚀 Key Features

- **Digital Evidence Lifecycle Management**: Comprehensive custody tracking, case association, and tamper-evident SHA-256 hashing on all evidence ingests.
- **Multi-Modal AI Analysis Pipeline**:
  - **Object Detection (YOLO11n)**: Scans images and video keyframes to detect forensic objects, persons, vehicles, weapons, and contraband.
  - **Face Detection (OpenCV Haar Cascade)**: Multi-frame facial detection for photographic and surveillance footage.
  - **Optical Character Recognition (OCR & PDF Extraction)**: Extracts textual data from scanned crime scene photographs, legal documents, and multi-page PDFs using Tesseract OCR and PyPDF.
  - **Audio & Video Speech-to-Text (Faster-Whisper)**: Accurate transcription of suspect interrogations, 911 calls, bodycam audio, and CCTV video audio streams.
- **Chain of Custody & Audit Trails**: Granular logging of every access, transfer, analysis, and report generation action.
- **Forensic PDF Report Generation**: Automated generation of court-admissible forensic case summaries via ReportLab.
- **Role-Based Access Control (RBAC)**: Secure access tailored for Administrators, Investigators, and Forensic Officers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3 (Modern Responsive UI), Vanilla JavaScript (ES6+), Fetch API |
| **Backend** | Python 3.10+, Flask RESTful API, Flask-CORS, Werkzeug |
| **Database** | MySQL / MariaDB (XAMPP / Standalone) |
| **AI / ML Models** | YOLO11n (Ultralytics), Faster-Whisper Tiny, OpenCV, Tesseract OCR, PyPDF |
| **Reporting** | ReportLab (Vector PDF Generation) |

---

## 📂 Project Structure

```text
EvidenceAI/
├── ai/                         # Multi-modal AI analysis modules
│   ├── face_detection.py       # OpenCV Haar Cascade face detection
│   ├── object_detection.py     # YOLO11n image & video object detection
│   ├── ocr.py                  # Tesseract & PyPDF document text extraction
│   └── speech_to_text.py       # Faster-Whisper speech-to-text
├── backend/                    # Python Flask backend
│   └── app.py                  # Core REST API endpoints & route handlers
├── database/                   # Database scripts
│   └── schema.sql              # MySQL schema & initial seed data
├── frontend/                   # Frontend user interface
│   ├── css/                    # Stylesheets
│   ├── js/                     # Client-side scripts & API integrations
│   ├── index.html              # Landing page
│   ├── login.html              # Officer / Admin authentication
│   ├── dashboard.html          # Central analytical dashboard
│   ├── cases.html              # Case management module
│   ├── evidence.html           # Evidence vault & custody module
│   ├── ai-analysis.html        # AI analysis workbench
│   ├── activity-logs.html      # Comprehensive audit trail
│   └── reports.html            # Forensic PDF report generator
├── reports/                    # Generated forensic PDF reports
├── uploads/                    # Securely stored digital evidence
├── requirements.txt            # Python dependencies
├── run_evidenceai.bat          # One-click startup script for Windows
└── yolo11n.pt                  # YOLO11n model weights
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Python**: Version 3.10 or higher.
- **MySQL / MariaDB**: XAMPP or standalone MySQL server.
- **Tesseract OCR** (Optional, for image OCR): Install from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki).

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/EvidenceAI.git
cd EvidenceAI
```

### 3. Set Up Virtual Environment & Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Database Setup
1. Start your **MySQL server** (e.g. via XAMPP Control Panel).
2. Open phpMyAdmin or your MySQL client.
3. Import `database/schema.sql` or run:
```bash
mysql -u root -p < database/schema.sql
```

### 5. Run the Application
```bash
# Run Flask Backend (Runs on http://127.0.0.1:5000)
python backend/app.py
```
Or simply double-click `run_evidenceai.bat` on Windows.

Open your web browser and navigate to:
```text
http://127.0.0.1:5000/index.html
```

---

## 🔐 Default Credentials

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@evidenceai.com` | `Admin@123` |
| **Lead Admin** | `pradnyasawant555@gmail.com` | `Admin@123` |
| **Investigator** | `tukaram.munde@evidenceai.com` | `Admin@123` |
| **Forensic Officer** | `sachin.bhosale@evidenceai.com` | `Admin@123` |

---

## 📄 License
This project is developed for educational and digital forensic research purposes.

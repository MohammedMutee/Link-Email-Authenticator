# Mail & Link Authenticator (ThreatScan)

## Overview
**Mail & Link Authenticator** is a robust, AI-powered cybersecurity tool designed to detect and analyze phishing threats in real-time. It utilizes a **Hybrid Detection Engine** that combines Machine Learning (Random Forest & Naive Bayes) with heuristic rule-based analysis to provide high-accuracy verdicts on suspicious Links (URLs) and Emails.

> **Status**: Active MVP  
> **Version**: 2.0 (Hybrid Engine)

---

## Key Features

### 1. Dual Scanning Modes
-   **URL Scanner**: Analyzes web links for malicious patterns, IP obfuscation, open redirects (`//`), and tycoon squatting.
    -   *New!* **Bulk Mode**: Verify lists of URLs simultaneously (one per line).
    -   *New!* **CSV Support**: Upload `.csv` files for batch analysis and Export detailed reports.
-   **Email Scanner**: Analyzes email body text using NLP (TF-IDF) to detect urgency, social engineering keywords, and spam patterns.

### 2. Hybrid ML Engine
The system uses a sophisticated "Split-Brain" architecture to prevent logic overlap:
-   **`URLAnalyzer`**: Specialized class for structural URL analysis (8+ features).
-   **`EmailAnalyzer`**: Specialized class for textual sentiment and keyword stacking analysis.
-   **Heuristics**: Rule-based overrides ensure known threats (like Raw IPs or "Urgent Password Reset") are never missed, even if the ML model is unsure.

### 3. Professional UI/UX
-   **Cyber-Security Theme**: Dark mode interface with Neon Red/Green indicators.
-   **Dynamic Feedback**: Real-time validation rejecting invalid inputs (e.g., "random text").
-   **Visual Reporting**: Detailed threat breakdown explaining *exactly* why an output was flagged (e.g., "High Risk: Open redirect pattern detected").

---

## Technology Stack

| Component | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Material UI (MUI), Framer Motion, Axios |
| **Backend** | Python (FastAPI) | Uvicorn, Scikit-Learn, Pandas, NumPy |
| **ML Models** | Scikit-Learn | Random Forest (URLs), MultinomialNB (Emails) |
| **Database** | None | Stateless architecture (No persistent storage required) |

---

## Installation & Setup

### Prerequisites
**Option A: Docker (Recommended)**
-   Docker Desktop / Engine
-   Docker Compose

**Option B: Local Development**
-   Node.js & npm
-   Python 3.9+

### 1. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd MailLinkAuth/backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Server
uvicorn main:app --reload
```
*Server runs on: `http://127.0.0.1:8000`*

### 2. Frontend Setup
Navigate to the frontend directory and install node modules.

```bash
cd MailLinkAuth/frontend

# Install dependencies
npm install

# Run the Development Server
npm run dev
```
*Client runs on: `http://localhost:5173`*

### 3. Docker Deployment (Recommended)
You can run the entire application stack with a single command, without installing Python or Node.js locally.

**Steps:**
1.  Open a terminal in the project root (`MailLinkAuth/`).
2.  Run the composition command:
    ```bash
    docker-compose up --build
    ```
3.  Wait for the build to finish. access the app:
    -   **Frontend (App)**: [http://localhost:3000](http://localhost:3000)
    -   **Backend (Docs)**: [http://localhost:8000/docs](http://localhost:8000/docs)
4.  To stop the application, press `Ctrl+C` or run:
    ```bash
    docker-compose down
    ```

---

## Usage Guide

1.  **Select Mode**: Toggle between **SCAN URL** and **SCAN EMAIL** using the buttons at the top.
2.  **Input Data**:
    *   *URL*: Paste the full link (must include `http://` or `domain.com`).
    *   *Email*: Paste the body content of the email.
3.  **Analyze**: Click **INITIATE ANALYSIS**.
4.  **Interpret Results**:
    *   **Invalid**: (Red Alert) Input format is wrong.
    *   **Safe**: (Green Shield) No threats found. Score < 50%.
    *   **Suspicious**: (Red Warning) Potential threat. Score 50-74%.
    *   **Malicious**: (Red Warning) Critical threat. Score 75%+.

---

## AI Logic & Heuristics

The engine penalizes inputs based on weighted risk factors:

| Trigger Pattern | Penalty Score | Context |
| :--- | :--- | :--- |
| **Open Redirect (`//`)** | +60 Points | High Risk (URL) |
| **Raw IP Address** | +60 Points | High Risk (URL) |
| **Sensitive Keywords** | +30-40 Points | "Login", "Bank", "Secure" |
| **Urgency Indicators** | +20 Points | "ACT NOW", "SUSPENDED" |
| **Keyword Stacking** | +10 Points/Word| Cumulative penalty for spammy emails |

### False Positive Prevention (Whitelist)
To ensure legitimate business tools are never flagged, the engine implements a **Strict Hostname Whitelist**.
-   **Trusted Domains**: `outlook.office.com`, `google.com`, `microsoft.com`, `apple.com`, etc.
-   **Protection**: Bypasses AI noise and instantly returns **Safe (0%)**.
-   **Anti-Bypass**: Uses strict hostname parsing to block subdomain attacks (e.g., `outlook.office.com.evil.com` is BLOCKED).

---

## License & Credits
**Developed by Mohammed Mutee.**  
© 2026. All Rights Reserved.

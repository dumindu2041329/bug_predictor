# CrossBugSense — Cross-Language Bug Predictor
**Research Project: A.U.Santhusha sliate**

A machine-learning web application that predicts whether C# and JavaScript source files
are bug-prone, using models trained on source code metrics and code smell metrics.

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind%20CSS](https://img.shields.io/badge/Tailwind-4.3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-REST%20API-000000?style=flat-square&logo=flask&logoColor=white)
![scikit--learn](https://img.shields.io/badge/scikit--learn-1.3-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-2.0-FF7F00?style=flat-square)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Status](https://img.shields.io/badge/status-research-brightgreen?style=flat-square)

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Python (Flask REST API)

---

## Project Structure

```
bug_predictor/
├── backend/                  # Python Flask API
│   ├── app.py                # API server (CORS enabled for the dev frontend)
│   ├── train_models.py       # Script to (re)train models from dataset
│   ├── requirements.txt      # Python dependencies
│   ├── dataset.csv           # Training dataset
│   └── models/               # Pre-trained ML models (.pkl)
│       ├── random_forest.pkl
│       ├── knn.pkl
│       ├── logistic_regression.pkl
│       ├── naive_bayes.pkl
│       └── xgboost.pkl
└── frontend/                 # React + Vite + Tailwind SPA
    ├── vite.config.ts        # Dev proxy: /api → http://localhost:5000
    └── src/
        ├── App.tsx           # Main page
        ├── api.ts            # API client
        ├── types.ts          # Shared types (24 metric names, responses)
        └── components/
            ├── FileDropzone.tsx   # Drag & drop source file upload
            ├── ModelSelector.tsx  # ML model picker
            └── ResultCard.tsx     # Prediction + metrics breakdown
```

---

## Setup & Run

### 1. Backend (Python)
```bash
cd backend
pip install -r requirements.txt
python app.py                 # API on http://localhost:5000
```

Optional — retrain models if `backend/models/` is missing:
```bash
python train_models.py        # uses backend/dataset.csv by default
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev                   # UI on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to Flask, so no extra
configuration is needed. For production builds, run `npm run build`
(output in `frontend/dist/`), or set `VITE_API_URL` to the backend URL.

---

## API Endpoints

| Method | Endpoint           | Description                                        |
|--------|--------------------|----------------------------------------------------|
| POST   | `/api/auth/register`| Name + email + password → JWT + user (auto sign-in) |
| POST   | `/api/auth/login`  | Email + password → JWT + user                      |
| GET    | `/api/auth/me`     | Current user for the stored JWT (session restore)  |
| GET    | `/api/chats`       | List saved analysis chats, pinned first (auth required) |
| POST   | `/api/chats`       | Save an analysis run as a chat `{title, model, payload}` |
| GET    | `/api/chats/<id>`  | One chat with its full prediction payload          |
| PATCH  | `/api/chats/<id>`  | Pin/unpin a chat `{pinned: boolean}`               |
| DELETE | `/api/chats/<id>`  | Delete a chat                                      |
| GET    | `/api/models`      | List available models with test accuracy (auth required) |
| POST   | `/api/predict`     | Multipart form: `file1`, `file2`, `model` → JSON predictions (auth required) |

---

## How It Works

1. **Upload 2 source files** — any combination of `.cs` and `.js` files
2. **Select a model** — Random Forest, KNN, Logistic Regression, Naïve Bayes, or XGBoost
3. **Click Analyse & Predict**
4. The backend extracts 24 metrics from each file (WMC, DIT, LOC, CBO, Intensity, etc.)
5. The selected model predicts: **Buggy** or **Clean**, with a probability score

---

## Features (24 metrics used)
WMC, DIT, NOC, CBO, RFC, LCOM, Ca, Ce, NPM, LOC,
DAM, MOA, MFA, CAM, IC, CBM, AMC, MCC, ACC,
Intensity, ANA, ARL, ACPD, ACM

---

## Model Performance (on test dataset)
| Model              | Accuracy | Precision | Recall | F1-Score |
|--------------------|----------|-----------|--------|----------|
| Random Forest      | 92.59%   | 0.9189    | 1.0000 | 0.9577   |
| KNN                | 92.59%   | 0.9306    | 0.9853 | 0.9571   |
| Logistic Regression| 91.36%   | 0.9178    | 0.9853 | 0.9504   |
| Naïve Bayes        | 92.59%   | 0.9189    | 1.0000 | 0.9577   |
| XGBoost            | 91.36%   | 0.9178    | 0.9853 | 0.9504   |

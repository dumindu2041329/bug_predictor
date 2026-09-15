# CrossBugSense — Cross-Language Bug Predictor
**Research Project: A.U.Santhusha sliate**

A Flask web application that predicts whether C# and JavaScript source files are bug-prone,
using machine learning models trained on source code metrics and code smell metrics.

---

## Project Structure

```
bug_predictor/
├── app.py                  # Flask backend
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Frontend UI
├── models/                 # Pre-trained ML models (auto-generated)
│   ├── random_forest.pkl
│   ├── knn.pkl
│   ├── logistic_regression.pkl
│   ├── naive_bayes.pkl
│   └── xgboost.pkl
└── train_models.py         # Script to (re)train models from dataset
```

---

## Setup & Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Train models (if models/ folder is empty)
```bash
python train_models.py
```

### 3. Start the web app
```bash
python app.py
```

### 4. Open in browser
```
http://localhost:5000
```

---

## How It Works

1. **Upload 2 source files** — any combination of `.cs` and `.js` files
2. **Select a model** — Random Forest, KNN, Logistic Regression, Naïve Bayes, or XGBoost
3. **Click Analyse & Predict**
4. The app extracts 24 metrics from each file (WMC, DIT, LOC, CBO, Intensity, etc.)
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

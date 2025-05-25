# PokeVerse

A Pokémon Team Recommender web application built with Python and React. It lets you explore Pokémon, view stats, and get recommendations for complementary team members using a k-NN-based machine learning model.

## Features

* **Browse & Search**: Filter Pokémon by name or type.
* **Infinite Scroll**: Loads Pokémon in batches for smooth scrolling.
* **Stats Modal**: View detailed stats (Attack, Defense, etc.) for any Pokémon.
* **Recommendations**:

  * **Backend mode**: FastAPI serving a scikit-learn k-NN model (joblib).
  * **Client-only mode**: ONNX preprocessor + JavaScript k-NN for zero backend.

## Project Structure

```
/
├── poke_trainer/             # Python ML scripts & optional API
│   ├── train_sixth_model.py  # Train and save the k-NN pipeline
│   ├── export_to_onnx.py     # Export preprocessor to ONNX
│   ├── server.py             # FastAPI server for recommendations
│   ├── requirements.txt      # Python dependencies
│   └── poke_team_recommender.joblib  # Saved model (if checked in)
├── public/                   # Public assets for React
│   ├── index.html
│   ├── poke_data.json        # JSON data for client-only mode
│   └── ...
├── src/                      # React source code
│   ├── App.js                # Main React component
│   ├── onnxClient.js         # ONNX runtime helper
│   ├── utils/knn.js          # JS k-NN implementation
│   └── hooks/usePokeData.js  # Data loader hook
├── .gitignore
├── LICENSE                   # Apache-2.0 License
├── package.json
└── README.md                 # This file
```

## Prerequisites

* **Node.js** v14+
* **npm** or **yarn**
* **Python** 3.8+
* **pip** for Python packages

## Setup & Usage

### 1. Backend (Optional)

```bash
cd poke_trainer
python -m venv .venv
source .venv/bin/activate    # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt

# Train the model and optionally save to joblib
python train_sixth_model.py

# Export the preprocessor to ONNX (for client-only mode)
python export_to_onnx.py

# Start the FastAPI server
uvicorn server:app --reload --port 8000
```

### 2. Frontend

```bash
npm install
npm start
```

* **Backend mode**: In `src/App.js`, ensure the recommendation fetch URL is `http://localhost:8000/recommend`.
* **Client-only mode**: Ensure `public/poke_data.json` is generated and available; the app will use ONNX + JS k-NN automatically.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Recommendation Modes

* **Backend**: Sends your team array to FastAPI, returns top-k similar Pokémon.
* **Client-only**: Transforms features in-browser with ONNX, computes k-NN in JavaScript.

## License

Apache-2.0 © 2025 Rishab RK

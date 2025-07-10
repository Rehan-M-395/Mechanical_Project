from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from any frontend (like React)

# Load your model
model = joblib.load("best_model.joblib")

# Root route
@app.route('/')
def home():
    return "✅ Backend is running! Use /api/predict to send CSV data."

# Predict route
@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        df = pd.read_csv(file)

        if df.empty:
            return jsonify({"error": "Uploaded file is empty"}), 400

        # Predict
        predictions = model.predict(df)
        label = predictions[0]

        # Calculate basic features (you can customize more)
        features = {
            "Mean": float(df.mean().mean()),
            "Median": float(df.median().mean()),
            "Variance": float(df.var().mean()),
            "Standard Deviation": float(df.std().mean()),
            "Maximum": float(df.max().max()),
            "Minimum": float(df.min().min()),
            "Kurtosis": float(df.kurtosis().mean()),
            "Skewness": float(df.skew().mean())
        }

        return jsonify({
            "label": label,
            "features": features
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

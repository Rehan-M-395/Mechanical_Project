from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load your trained model
model = joblib.load("best_model.joblib")

@app.route('/')
def home():
    return "✅ Backend is running! Use /api/predict to send CSV data."

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        print("📥 Received request at /api/predict")
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        # Read CSV with no header
        df = pd.read_csv(file, header=None)

        # Assign dummy column names
        df.columns = [f"col_{i}" for i in range(df.shape[1])]

        print("✅ DataFrame loaded:", df.shape)
        print(df.head())

        if df.empty:
            return jsonify({"error": "Uploaded file is empty"}), 400

        # Predict
        predictions = model.predict(df)
        label = predictions[0]

        # Extract basic statistical features
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
        print("❌ Exception:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

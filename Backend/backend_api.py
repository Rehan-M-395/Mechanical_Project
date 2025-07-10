from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from any frontend (like React)

# Load your model (make sure the file exists)
model = joblib.load("best_model.joblib")

# Root route to confirm backend is running
@app.route('/')
def home():
    return "✅ Backend is running! Use /api/predict to send CSV data."

# Prediction route
@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Get the uploaded file from the form-data
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        # Read CSV data
        df = pd.read_csv(file)

        # Validate data
        if df.empty:
            return jsonify({"error": "Uploaded file is empty"}), 400

        # Make predictions using the loaded model
        predictions = model.predict(df)

        return jsonify({"predictions": predictions.tolist()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run locally (not used in Render deployment)
if __name__ == '__main__':
    app.run(debug=True)

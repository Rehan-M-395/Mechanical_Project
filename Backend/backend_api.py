from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained model
model = joblib.load("best_model.joblib")

# Correct feature order used during training (no 'Mode')
required_feature_order = [
    'Kurtosis',
    'Standard Error',
    'Maximum value',
    'Skewness',
    'Minimum value',
    'Range',
    'Count',
    'Summation',
    'Variance',
    'Standard Deviation',
    'Median',
    'Mean'
]

@app.route('/')
def home():
    return "✅ Backend is running! Use /api/predict to send CSV data."

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        df = pd.read_csv(file, header=None)
        if df.empty:
            return jsonify({"error": "Uploaded file is empty"}), 400

        # Flatten to 1D array
        data_series = pd.Series(df.values.flatten()).dropna()
        if data_series.empty:
            return jsonify({"error": "Data contains only NaNs"}), 400

        # Compute only the 12 required features
        features_dict = {
            'Kurtosis': float(data_series.kurtosis()),
            'Standard Error': float(data_series.std() / np.sqrt(data_series.count())),
            'Maximum value': float(data_series.max()),
            'Skewness': float(data_series.skew()),
            'Minimum value': float(data_series.min()),
            'Range': float(data_series.max() - data_series.min()),
            'Count': int(data_series.count()),
            'Summation': float(data_series.sum()),
            'Variance': float(data_series.var()),
            'Standard Deviation': float(data_series.std()),
            'Median': float(data_series.median()),
            'Mean': float(data_series.mean())
        }

        # Format as DataFrame with correct column order
        input_df = pd.DataFrame([features_dict])[required_feature_order]

        # Predict
        prediction = model.predict(input_df)
        label = prediction[0]

        return jsonify({
            "label": label,
            "features": features_dict
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

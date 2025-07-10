from flask import Flask, request, jsonify
import numpy as np
import joblib
import pandas as pd
from flask_cors import CORS, cross_origin
from scipy.stats import kurtosis, skew, sem

app = Flask(__name__)

# Allow only the frontend origin for CORS
cors = CORS(app, supports_credentials=True, origins=["https://mechanical-project.vercel.app"])

# Load the trained model
model = joblib.load('best_model.joblib')

def calculate_statistics(points):
    data_np = np.array(points)
    return {
        'Kurtosis': kurtosis(data_np),
        'Standard Error': sem(data_np),
        'Maximum value': np.max(data_np),
        'Skewness': skew(data_np),
        'Minimum value': np.min(data_np),
        'Range': np.ptp(data_np),
        'Count': len(data_np),
        'Summation': np.sum(data_np),
        'Variance': np.var(data_np, ddof=0),
        'Standard Deviation': np.std(data_np, ddof=0),
        'Median': np.median(data_np),
        'Mean': np.mean(data_np)
    }

@app.route('/api/predict', methods=['POST', 'OPTIONS'])
@cross_origin(origin="https://mechanical-project.vercel.app", supports_credentials=True)
def predict():
    # Handle preflight request
    if request.method == 'OPTIONS':
        return jsonify({'status': 'CORS preflight successful'}), 200

    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in request"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Read the CSV file into a DataFrame
        df = pd.read_csv(file)

        points = df.iloc[:, 0].dropna().values

        if len(points) == 0:
            return jsonify({"error": "Uploaded file is empty or has no valid data."}), 400

        features = calculate_statistics(points)
        feature_vector = np.array(list(features.values())).reshape(1, -1)
        label = model.predict(feature_vector)[0]

        if isinstance(label, (np.integer, np.floating)):
            label = label.item()
        else:
            label = str(label)

        return jsonify({"features": features, "label": label})

    except Exception as e:
        print("🔥 ERROR in /api/predict:", e)
        return jsonify({"error": str(e)}), 500

# Do NOT include app.run() block for production with Gunicorn
# Gunicorn will serve the app using: gunicorn backend_api:app


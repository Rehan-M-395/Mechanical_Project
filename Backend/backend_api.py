from flask import Flask, request, jsonify
import numpy as np
import joblib
import pandas as pd
from flask_cors import CORS
from scipy.stats import kurtosis, skew, sem

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

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

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in request"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Read the CSV file into a DataFrame
        df = pd.read_csv(file)

        # Assume the first column contains the signal/points
        # Modify this if your target column has a specific name
        points = df.iloc[:, 0].dropna().values

        features = calculate_statistics(points)
        feature_vector = np.array(list(features.values())).reshape(1, -1)
        label = model.predict(feature_vector)[0]

        # Convert label to native type
        if isinstance(label, (np.integer, np.floating)):
            label = label.item()
        else:
            label = str(label)

        return jsonify({"features": features, "label": label})
    
    except Exception as e:
        print("🔥 ERROR in /api/predict:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

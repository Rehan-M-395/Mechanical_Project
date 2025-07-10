import pandas as pd
import numpy as np
from scipy.stats import kurtosis, skew, mode, sem

# Function to calculate statistics for each row
def calculate_statistics(row):
    # Convert the row to a list of values
    data = row.dropna().tolist()  # Remove NaNs
    
    if not data:  # Check if data is empty after removing NaNs
        return {
            'Kurtosis': np.nan,
            'Standard Error': np.nan,
            'Maximum value': np.nan,
            'Skewness': np.nan,
            'Minimum value': np.nan,
            'Range': np.nan,
            'Count': 0,
            'Summation': np.nan,
            'Variance': np.nan,
            'Standard Deviation': np.nan,
            'Mode': np.nan,
            'Median': np.nan,
            'Mean': np.nan
        }
    
    # Convert to a numpy array for statistical calculations
    data_np = np.array(data)
    
    # Calculate the required statistics
    stats = {
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
    
    return stats

# Load the CSV file into a DataFrame
file_path = 'vibration_fault_diagnosis_full_dataset_horizontal.csv'  # Replace with your CSV file path
df = pd.read_csv(file_path)

# Extract header and index column
header = df.iloc[0]  # First row as header
df = df[1:]  # Remove the header row

# Remove the header column
index_col = df.iloc[:, 0]  # First column as index
df_cleaned = df.iloc[:, 1:]  # Remove the first column

# Set the first column as the index for df_cleaned
df_cleaned.index = index_col

# Calculate statistics for each row
stats_df = df_cleaned.apply(calculate_statistics, axis=1)

# Convert the result to a DataFrame
stats_df = pd.DataFrame(stats_df.tolist(), index=df_cleaned.index)

# Re-add the header column
stats_df.insert(0, 'Header', df_cleaned.index)

# Save the statistics to a new CSV file
stats_df.to_csv('row_statistics_with_header_column1.csv', index=False)

# Download the output to PC
# from google.colab import files
# files.download("row_statistics_with_header_column.csv")

print('Statistics have been calculated and saved to row_statistics_with_header_column.csv')
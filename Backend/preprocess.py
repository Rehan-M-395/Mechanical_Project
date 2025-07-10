import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Load the CSV file into a DataFrame
file_path = 'data.csv'  # Replace with your CSV file path
df = pd.read_csv(file_path)

# Shift the first column to the last
first_column = df.iloc[:, 0]  # Extract the first column
df_shifted = df.iloc[:, 1:]  # Remove the first column
df_shifted[first_column.name] = first_column  # Add the first column to the end

# Encode the last column (categorical column)
# First, identify the last column in the shifted DataFrame
last_column_name = df_shifted.columns[-1]

# Apply Label Encoding
label_encoder = LabelEncoder()
df_shifted[last_column_name] = label_encoder.fit_transform(df_shifted[last_column_name])

# Save the modified DataFrame to a new CSV file
output_file_path = 'modified_data.csv'
df_shifted.to_csv(output_file_path, index=False)

# Download the output to PC
from google.colab import files
files.download("row_statistics_with_header_column.csv")

print(f'Column shifted and categorical data encoded. Saved to {output_file_path}')
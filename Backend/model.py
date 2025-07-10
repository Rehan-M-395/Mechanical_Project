import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load the dataset
def load_data(filepath):
    df = pd.read_csv(filepath)
    return df

# Prepare the data
def prepare_data(df, target_column):
    X = df.drop(columns=[target_column])
    y = df[target_column]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    return X_train, X_test, y_train, y_test

# Train models and evaluate accuracy
def evaluate_models(X_train, X_test, y_train, y_test):
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000),
        'Decision Tree': DecisionTreeClassifier(),
        'Random Forest': RandomForestClassifier(),
        'SVM': SVC(),
        'Naive Bayes': GaussianNB(),
        'kNN': KNeighborsClassifier(),
        'Gradient Boosting': GradientBoostingClassifier()
    }
    
    accuracies = {}
    best_model = None
    best_score = -1
    best_model_name = None
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        accuracies[name] = accuracy
        if accuracy > best_score:
            best_score = accuracy
            best_model = model
            best_model_name = name
    
    return accuracies, best_model, best_model_name

# Save the results to a CSV file
def save_results_to_csv(results, output_filepath):
    df_results = pd.DataFrame(list(results.items()), columns=['Model', 'Accuracy'])
    df_results.to_csv(output_filepath, index=False)

def main(input_filepath, target_column, output_filepath):
    df = load_data(input_filepath)
    X_train, X_test, y_train, y_test = prepare_data(df, target_column)
    accuracies, best_model, best_model_name = evaluate_models(X_train, X_test, y_train, y_test)
    save_results_to_csv(accuracies, output_filepath)
    print("Model accuracies saved to", output_filepath)
    # Save the best model
    joblib.dump(best_model, 'best_model.joblib')
    print(f"Best model '{best_model_name}' saved as best_model.joblib with accuracy {accuracies[best_model_name]:.4f}")

if __name__ == "__main__":
    input_filepath = 'row_statistics_with_header_column1.csv'  # Replace with your input CSV file path
    target_column = 'Header'     # Replace with the name of your target column
    output_filepath = 'model_accuracies.csv'  # Replace with your desired output file path
    main(input_filepath, target_column, output_filepath)

from google.colab import files
# files.download("model_accuracies.csv")
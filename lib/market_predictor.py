import sys
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from pathlib import Path

def load_and_train_model():
    """
    Load data and train the prediction model
    """
    # Get the absolute path to the CSV file
    file_path = Path(__file__).parent.parent / "Dinosaur_Fossil_Transactions.csv"
    
    # Load and preprocess the dataset
    df = pd.read_csv(file_path)
    print(f"Loaded {len(df)} records") # Debug log
    
    # Clean the cost columns
    df["Original Cost"] = df["Original Cost"].str.replace('$', '').str.replace(',', '').astype(float)
    df["Adjusted Cost"] = df["Adjusted Cost"].str.replace('$', '').str.replace(',', '').astype(float)

    # Define features and target
    X = df[["Fossil Family", "Body part"]]
    y = df["Adjusted Cost"]

    # Create preprocessing pipeline with improved handling
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse=False), ["Fossil Family", "Body part"])
        ]
    )

    # Create and train pipeline with better parameters
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            n_jobs=-1,  # Use all CPU cores
            random_state=42
        ))
    ])

    # Train the model on all data
    pipeline.fit(X, y)
    
    # Get unique values for dropdowns
    families = sorted(df["Fossil Family"].unique().tolist())
    parts = sorted(df["Body part"].unique().tolist())
    
    return pipeline, families, parts

def estimate_fossil_value_range(pipeline, fossil_family: str, body_part: str):
    """
    Estimate value range for a fossil
    """
    input_data = pd.DataFrame({
        "Fossil Family": [fossil_family],
        "Body part": [body_part]
    })
    
    # Transform input data
    transformed_data = pipeline.named_steps['preprocessor'].transform(input_data)
    
    # Get predictions from all trees
    predictions = [
        estimator.predict(transformed_data)[0]
        for estimator in pipeline.named_steps['regressor'].estimators_
    ]
    
    # Calculate statistics
    median = np.median(predictions)
    lower = np.percentile(predictions, 10)
    upper = np.percentile(predictions, 90)
    
    return float(median), float(lower), float(upper)

def main():
    """
    Main function to handle prediction requests
    """
    try:
        # Validate arguments
        if len(sys.argv) != 3:
            raise ValueError("Invalid number of arguments")
        
        fossil_family = sys.argv[1]
        body_part = sys.argv[2]
        
        # Load model and make prediction
        pipeline, families, parts = load_and_train_model()
        
        # If empty inputs, just return available options
        if not fossil_family or not body_part:
            result = {
                "median": 0,
                "lowerBound": 0,
                "upperBound": 0,
                "availableFamilies": families,
                "availableBodyParts": parts
            }
            print(json.dumps(result))
            return 0
        
        # Validate inputs
        if fossil_family not in families:
            raise ValueError(f"Unknown fossil family: {fossil_family}")
        if body_part not in parts:
            raise ValueError(f"Unknown body part: {body_part}")
        
        try:
            # Get prediction
            median, lower, upper = estimate_fossil_value_range(pipeline, fossil_family, body_part)
            
            # Return results
            result = {
                "median": median,
                "lowerBound": lower,
                "upperBound": upper,
                "availableFamilies": families,
                "availableBodyParts": parts
            }
            print(json.dumps(result))
            return 0
        except Exception as e:
            print(json.dumps({"error": f"Prediction failed: {str(e)}"}), file=sys.stderr)
            return 1
            
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main()) 
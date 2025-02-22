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
    try:
        input_data = pd.DataFrame({
            "Fossil Family": [fossil_family],
            "Body part": [body_part]
        })
        
        # Transform input data
        transformed_data = pipeline.named_steps['preprocessor'].transform(input_data)
        
        # Get predictions from all trees
        predictions = [
            float(estimator.predict(transformed_data)[0])  # Ensure float values
            for estimator in pipeline.named_steps['regressor'].estimators_
        ]
        
        # Calculate statistics
        median = float(np.median(predictions))
        lower = float(np.percentile(predictions, 10))
        upper = float(np.percentile(predictions, 90))
        
        return median, lower, upper
    except Exception as e:
        print(f"Debug: Value range error: {str(e)}", file=sys.stderr)
        raise

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
        
        print("Debug: Starting prediction for", fossil_family, body_part, file=sys.stderr)
        
        # Load model and make prediction
        pipeline, families, parts = load_and_train_model()
        
        print("Debug: Model loaded successfully", file=sys.stderr)
        
        # Validate inputs
        if fossil_family not in families:
            raise ValueError(f"Unknown fossil family: {fossil_family}")
        if body_part not in parts:
            raise ValueError(f"Unknown body part: {body_part}")
        
        try:
            # Get prediction
            print("Debug: Making prediction...", file=sys.stderr)
            median, lower, upper = estimate_fossil_value_range(pipeline, fossil_family, body_part)
            
            # Return results
            result = {
                "median": float(median),
                "lowerBound": float(lower),
                "upperBound": float(upper),
                "availableFamilies": families,
                "availableBodyParts": parts
            }
            
            # Ensure we're printing valid JSON
            json_output = json.dumps(result)
            print("Debug: JSON output:", json_output, file=sys.stderr)
            print(json_output)  # Print to stdout for the API
            return 0
            
        except Exception as e:
            print(f"Debug: Prediction error: {str(e)}", file=sys.stderr)
            error_json = json.dumps({"error": f"Prediction failed: {str(e)}"})
            print("Debug: Error JSON:", error_json, file=sys.stderr)
            print(error_json, file=sys.stderr)
            return 1
            
    except Exception as e:
        print(f"Debug: Main error: {str(e)}", file=sys.stderr)
        error_json = json.dumps({"error": str(e)})
        print("Debug: Error JSON:", error_json, file=sys.stderr)
        print(error_json, file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main()) 
import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from pathlib import Path

def load_and_train_model():
    """Load data and train the prediction model"""
    try:
        # Get the absolute path to the CSV file
        file_path = Path(__file__).parent.parent / "Dinosaur_Fossil_Transactions.csv"
        
        # Load and preprocess the dataset
        df = pd.read_csv(file_path)
        
        # Clean the cost columns
        df["Original Cost"] = df["Original Cost"].str.replace('$', '').str.replace(',', '').astype(float)
        df["Adjusted Cost"] = df["Adjusted Cost"].str.replace('$', '').str.replace(',', '').astype(float)

        # Define features and target
        X = df[["Fossil Family", "Body part"]]
        y = df["Adjusted Cost"]

        # Create preprocessing pipeline
        preprocessor = ColumnTransformer(
            transformers=[
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse=False), ["Fossil Family", "Body part"])
            ]
        )

        # Create and train pipeline
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', RandomForestRegressor(
                n_estimators=200,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                n_jobs=-1,
                random_state=42
            ))
        ])

        # Train the model
        pipeline.fit(X, y)
        
        return pipeline, df["Fossil Family"].unique().tolist(), df["Body part"].unique().tolist()
    except Exception as e:
        raise Exception(f"Model training failed: {str(e)}")

def predict_value(pipeline, fossil_family: str, body_part: str):
    """Make a prediction for a given fossil"""
    try:
        input_data = pd.DataFrame({
            "Fossil Family": [fossil_family],
            "Body part": [body_part]
        })
        
        transformed_data = pipeline.named_steps['preprocessor'].transform(input_data)
        predictions = [
            float(tree.predict(transformed_data)[0])
            for tree in pipeline.named_steps['regressor'].estimators_
        ]
        
        return {
            "median": float(np.median(predictions)),
            "lowerBound": float(np.percentile(predictions, 10)),
            "upperBound": float(np.percentile(predictions, 90))
        }
    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")

def main():
    try:
        # Get command line arguments
        if len(sys.argv) != 3:
            raise ValueError("Expected 2 arguments: fossil_family and body_part")
        
        fossil_family = sys.argv[1]
        body_part = sys.argv[2]
        
        # Load model and get available options
        pipeline, families, parts = load_and_train_model()
        
        # Validate inputs
        if fossil_family not in families:
            raise ValueError(f"Unknown fossil family: {fossil_family}")
        if body_part not in parts:
            raise ValueError(f"Unknown body part: {body_part}")
        
        # Make prediction
        prediction = predict_value(pipeline, fossil_family, body_part)
        
        # Prepare response
        response = {
            **prediction,
            "availableFamilies": families,
            "availableBodyParts": parts
        }
        
        # Output JSON response
        print(json.dumps(response))
        
    except Exception as e:
        # Output error as JSON
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main() 
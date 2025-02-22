import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from pathlib import Path

def load_data():
    """Load and preprocess the dataset"""
    file_path = Path(__file__).parent.parent / "Dinosaur_Fossil_Transactions.csv"
    df = pd.read_csv(file_path)
    df["Original Cost"] = df["Original Cost"].str.replace('$', '').str.replace(',', '').astype(float)
    df["Adjusted Cost"] = df["Adjusted Cost"].str.replace('$', '').str.replace(',', '').astype(float)
    return df

def get_options():
    """Get available fossil families and body parts"""
    df = load_data()
    return {
        "families": sorted(df["Fossil Family"].unique().tolist()),
        "bodyParts": sorted(df["Body part"].unique().tolist())
    }

def train_model(df):
    """Train the prediction model"""
    X = df[["Fossil Family", "Body part"]]
    y = df["Adjusted Cost"]

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ["Fossil Family", "Body part"])
        ]
    )

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        ))
    ])

    pipeline.fit(X, y)
    return pipeline

def predict_value(pipeline, fossil_family: str, body_part: str):
    """Make a prediction for a specific fossil"""
    input_data = pd.DataFrame({
        "Fossil Family": [fossil_family],
        "Body part": [body_part]
    })
    
    transformed_data = pipeline.named_steps['preprocessor'].transform(input_data)
    predictions = [
        estimator.predict(transformed_data)[0]
        for estimator in pipeline.named_steps['regressor'].estimators_
    ]
    
    median = float(np.median(predictions))
    lower = float(np.percentile(predictions, 10))
    upper = float(np.percentile(predictions, 90))
    
    return median, lower, upper

def main():
    """Main function to handle requests"""
    try:
        # Check if we're just getting options
        if len(sys.argv) == 2 and sys.argv[1] == '--get-options':
            options = get_options()
            print(json.dumps(options))
            return 0

        # Otherwise, handle prediction request
        if len(sys.argv) != 3:
            raise ValueError("Invalid arguments")
        
        fossil_family = sys.argv[1]
        body_part = sys.argv[2]
        
        # Load data and validate inputs
        df = load_data()
        valid_families = df["Fossil Family"].unique()
        valid_parts = df["Body part"].unique()
        
        if fossil_family not in valid_families:
            raise ValueError(f"Unknown fossil family: {fossil_family}")
        if body_part not in valid_parts:
            raise ValueError(f"Unknown body part: {body_part}")
        
        # Train model and make prediction
        pipeline = train_model(df)
        median, lower, upper = predict_value(pipeline, fossil_family, body_part)
        
        result = {
            "median": median,
            "lowerBound": lower,
            "upperBound": upper
        }
        print(json.dumps(result))
        return 0
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main()) 
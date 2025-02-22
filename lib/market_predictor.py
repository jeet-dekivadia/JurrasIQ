import sys
import json
from typing import Tuple, Dict
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder

# Your existing model code here...

def main(fossil_family: str, body_part: str) -> Dict:
    """
    Main function to handle prediction requests.
    Returns JSON-formatted prediction results.
    """
    try:
        median, lower, upper = estimate_fossil_value_range(fossil_family, body_part)
        result = {
            "median": float(median),
            "lowerBound": float(lower),
            "upperBound": float(upper)
        }
        print(json.dumps(result))
        return 0
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid arguments"}), file=sys.stderr)
        sys.exit(1)
    
    fossil_family = sys.argv[1]
    body_part = sys.argv[2]
    sys.exit(main(fossil_family, body_part)) 
import requests
import pandas as pd

# API Endpoint
PBDB_API = "https://paleobiodb.org/data1.2/occs/list.json"

# Parameters
params = {
    "base_name": "Dinosauria",
    "interval": "Cretaceous,Jurassic,Triassic",
    "show": "coords,loc,time,strat,lith,geo,paleoloc,env,methods",
    "limit": 20000
}

# API Request
response = requests.get(PBDB_API, params=params)

if response.status_code == 200:
    data = response.json()
    records = data.get("records", [])

    if records:
        df = pd.DataFrame(records)
        df.to_csv("fossil_data.csv", index=False)
        print("Data successfully saved to 'fossil_data.csv'.")
    else:
        print("No records found.")
else:
    print(f"API request failed with status code {response.status_code}.")

# CLEANING DATASET
# Define corrected columns to keep
columns_to_keep = ["lat", "lng", "tna", "eag", "lag", "env", "cc2"]
df_cleaned = df[columns_to_keep].dropna()

# Rename columns for clarity
df_cleaned.columns = ["Latitude", "Longitude", "Fossil_Name", "Early_Age", "Late_Age", "Environment", "Country_Code"]

df_cleaned.to_csv("fossil_data_cleaned.csv", index=False)

# CREATING THE HEATMAP
import folium
from folium.plugins import HeatMap

# Load cleaned dataset (Ensure the path is correct)
df_cleaned = pd.read_csv("fossil_data_cleaned.csv")

# Create a map centered around the median fossil location
map_center = [df_cleaned["Latitude"].median(), df_cleaned["Longitude"].median()]
fossil_map = folium.Map(location=map_center, zoom_start=2)

# Add a heatmap layer
heat_data = df_cleaned[["Latitude", "Longitude"]].values.tolist()
HeatMap(heat_data, radius=8, blur=5, max_zoom=1).add_to(fossil_map)

# Save the heatmap
fossil_map.save("fossil_heatmap2.html")
print("✅ Fossil heatmap saved as 'fossil_heatmap.html'!")

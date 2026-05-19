import os
import pandas as pd

def combine_and_populate():
    ml_models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml_models"))
    
    retail_path = os.path.join(ml_models_dir, "retail_rules.csv")
    internet_path = os.path.join(ml_models_dir, "internet_trained_rules.csv")
    
    print(f"Reading rules from {retail_path} and {internet_path}...")
    
    if not os.path.exists(retail_path):
        print(f"Error: {retail_path} does not exist!")
        return
    if not os.path.exists(internet_path):
        print(f"Error: {internet_path} does not exist!")
        return
        
    df_retail = pd.read_csv(retail_path)
    df_internet = pd.read_csv(internet_path)
    
    print(f"Retail rules count: {len(df_retail)}")
    print(f"Internet rules count: {len(df_internet)}")
    
    # Combine the dataframes
    df_combined = pd.concat([df_retail, df_internet], ignore_index=True)
    
    # Sort by lift descending as expected by the ML engine
    df_combined = df_combined.sort_values(by="lift", ascending=False)
    
    print(f"Combined rules count: {len(df_combined)}")
    
    # Target files to overwrite
    targets = [
        "trained_rules.csv",
        "massive_trained_rules.csv",
        "retail_rules.csv",
        "internet_trained_rules.csv"
    ]
    
    for filename in targets:
        target_path = os.path.join(ml_models_dir, filename)
        df_combined.to_csv(target_path, index=False)
        print(f"Successfully populated {target_path}")

if __name__ == "__main__":
    combine_and_populate()

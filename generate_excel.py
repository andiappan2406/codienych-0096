import os
import sys

# Add backend to path so we can import from ai_engine
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import pandas as pd
from main import generate_training_data

def main():
    asset_types = ['PUMP', 'HVAC', 'ELEVATOR', 'GENERATOR', 'CHILLER']
    all_data = []

    for atype in asset_types:
        # Generate smaller sample size for the report
        X, y_fail, y_rul = generate_training_data(atype, n_samples=100)
        
        # Add labels and asset type
        X['asset_type'] = atype
        X['is_failure'] = y_fail
        X['remaining_useful_life'] = y_rul
        all_data.append(X)

    # Combine all and save
    final_df = pd.concat(all_data, ignore_index=True)
    
    output_file = 'products_dataset.xlsx'
    final_df.to_excel(output_file, index=False)
    print(f"Dataset successfully saved to {output_file}")

if __name__ == '__main__':
    main()

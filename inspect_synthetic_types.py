from datasets import load_dataset
import pandas as pd

ds = load_dataset("filnow/furniture-synthetic-dataset")

train_types = ds['train']['type']
test_types = ds['test']['type']

print("=== TRAIN TYPE COUNTS (Synthetic Train) ===")
print(pd.Series(train_types).value_counts().to_string())

print("\n=== TEST TYPE COUNTS (Real Test) ===")
print(pd.Series(test_types).value_counts().to_string())

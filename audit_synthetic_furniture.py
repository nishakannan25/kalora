import sys
try:
    from datasets import load_dataset
    print("datasets library imported successfully.")
    
    ds = load_dataset("filnow/furniture-synthetic-dataset")
    print("Dataset keys:", ds.keys())
    for split in ds.keys():
        print(f"Split '{split}' count: {len(ds[split])}")
        print(f"Split '{split}' features:", ds[split].features)
        print(f"Sample 0 in '{split}':", {k: type(v) for k, v in ds[split][0].items()})
except Exception as e:
    print("Error loading dataset:", str(e))

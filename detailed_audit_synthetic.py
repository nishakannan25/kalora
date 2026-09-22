from datasets import load_dataset

ds = load_dataset("filnow/furniture-synthetic-dataset")

print("=== DATASET SPLITS ===")
for split in ds.keys():
    print(f"Split '{split}': {len(ds[split])} samples")

train_ds = ds['train']
test_ds = ds['test']

print("\n=== TRAIN FEATURES ===")
print(train_ds.features)
print("Train column names:", train_ds.column_names)

print("\n=== TEST FEATURES ===")
print(test_ds.features)
print("Test column names:", test_ds.column_names)

print("\n=== SAMPLE TRAIN RECORD (excluding raw image) ===")
sample_train = {k: v for k, v in train_ds[0].items() if k != 'image'}
print(sample_train)

print("\n=== SAMPLE TEST RECORD (excluding raw image) ===")
sample_test = {k: v for k, v in test_ds[0].items() if k != 'image'}
print(sample_test)

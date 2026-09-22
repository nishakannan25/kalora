import os
import json
import glob
import pandas as pd
import numpy as np
from PIL import Image

BASE_DIR = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora"
CSV_PATH = os.path.join(BASE_DIR, "indiahandmade.csv")
IMAGES_DIR = os.path.join(BASE_DIR, "downloaded_images")

print(f"Reading CSV: {CSV_PATH}")
df = pd.read_csv(CSV_PATH)

print(f"\nTotal Records: {len(df)}")
print(f"Columns ({len(df.columns)}): {list(df.columns)}")

print("\n--- DATA TYPES & MISSING VALUES ---")
print(df.isna().sum())

print("\n--- SAMPLE RECORD ---")
print(df.head(2).to_dict(orient="records"))

# Inspect Images Directory
img_files = glob.glob(os.path.join(IMAGES_DIR, "*"))
print(f"\nTotal Image Files Found in downloaded_images: {len(img_files)}")

# Match CSV to Images
missing_images = []
valid_images = []
dims_list = []

for idx, row in df.iterrows():
    # Check potential image column names
    img_ref = None
    for col in ["image_path", "image_name", "image_url", "image", "file_name"]:
        if col in row and pd.notna(row[col]):
            img_ref = str(row[col])
            break
            
    # Try finding file
    matched_file = None
    if img_ref:
        target_name = os.path.basename(img_ref)
        target_path = os.path.join(IMAGES_DIR, target_name)
        if os.path.exists(target_path):
            matched_file = target_path
            
    if not matched_file:
        # Fallback to index matching (e.g. image_0.jpg or index)
        possible_matches = [f for f in img_files if f"_{idx}" in f or f"_{idx}." in f or f"item_{idx}" in f]
        if possible_matches:
            matched_file = possible_matches[0]
            
    if matched_file and os.path.exists(matched_file):
        try:
            with Image.open(matched_file) as im:
                valid_images.append((idx, matched_file, im.size, im.format))
        except Exception as e:
            missing_images.append((idx, img_ref, f"Corrupted: {e}"))
    else:
        missing_images.append((idx, img_ref, "File not found"))

print(f"\nMatched & Valid Images: {len(valid_images)} / {len(df)}")
print(f"Missing or Unmatched Images: {len(missing_images)}")

if missing_images:
    print("Sample missing image refs:", missing_images[:5])

# Print Candidate Label Columns & Unique Values
print("\n--- CANDIDATE TARGET LABEL DISTRIBUTIONS ---")
for col in df.columns:
    if df[col].nunique() < len(df) and df[col].nunique() > 1:
        print(f"\nColumn '{col}' (Unique: {df[col].nunique()}):")
        print(df[col].value_counts())

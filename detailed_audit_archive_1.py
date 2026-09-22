import os
import pandas as pd
from PIL import Image

archive_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\archive"
archive1_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\archive (1)"

print("=== Checking archive folder ===")
if os.path.exists(archive_dir):
    print("Items in archive:", os.listdir(archive_dir)[:10])

print("\n=== Checking archive (1) folder ===")
if os.path.exists(archive1_dir):
    files = os.listdir(archive1_dir)
    print(f"Total items in archive (1): {len(files)}")
    print("Sample items:", files[:10])

csv_path = None
if os.path.exists(os.path.join(archive1_dir, "Furniture.csv")):
    csv_path = os.path.join(archive1_dir, "Furniture.csv")
elif os.path.exists(os.path.join(archive_dir, "Furniture.csv")):
    csv_path = os.path.join(archive_dir, "Furniture.csv")

if csv_path:
    print(f"\nFound CSV at: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"CSV Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print("\nCSV Head:")
    print(df.head(5))
    
    # Check matching with images in archive and archive (1)
    # Check if there are subfolders or image filenames in CSV
    img_dir_candidates = [archive1_dir, archive_dir]
    for candidate in img_dir_candidates:
        if os.path.exists(candidate):
            imgs = [f for f in os.listdir(candidate) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
            print(f"\nImages in {os.path.basename(candidate)}: {len(imgs)}")
            if len(imgs) > 0:
                print("Sample image filenames:", imgs[:5])

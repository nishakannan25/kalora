import os
import zipfile
import pandas as pd

csv_path = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\furniture_full.csv"
img_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\downloaded_images_furniture"
zip_path = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\downloaded_images_furniture.zip"

print(f"CSV exists: {os.path.exists(csv_path)}")
print(f"Dir exists: {os.path.exists(img_dir)}")
print(f"Zip exists: {os.path.exists(zip_path)}")

if os.path.exists(csv_path):
    df = pd.read_csv(csv_path)
    print(f"CSV Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print("Head:")
    print(df.head(3))

# Check directory contents
if os.path.exists(img_dir):
    files = os.listdir(img_dir)
    print(f"Files in image dir: {len(files)}")
    if len(files) > 0:
        print("Sample files in dir:", files[:5])

# Check zip contents if zip exists
if os.path.exists(zip_path):
    with zipfile.ZipFile(zip_path, 'r') as z:
        print(f"Files in zip: {len(z.namelist())}")

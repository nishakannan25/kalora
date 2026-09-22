import os
import pandas as pd
from PIL import Image

csv_path = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\furniture_full.csv"
img_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\downloaded_images_furniture"

df = pd.read_csv(csv_path)

print(f"Total CSV records: {len(df)}")
print("Columns:", df.columns.tolist())

# Check how images are named in downloaded_images_furniture
img_files = os.listdir(img_dir)
print(f"Total files in downloaded_images_furniture: {len(img_files)}")
print("Sample image files:", img_files[:10])

# Match check
# Check if image_path column exists or if images are product_0001.png / jpg etc.
if 'image_path' in df.columns:
    df['image_exists'] = df['image_path'].apply(lambda x: os.path.exists(os.path.join(img_dir, str(x))))
    print("Matched via image_path column:", df['image_exists'].sum())
else:
    # Try mapping by product_0001, product_0002...
    print("Checking index-based or product_XXXX filenames...")

# Verify readability of images in folder
corrupt_files = []
valid_files = []
for f in img_files:
    p = os.path.join(img_dir, f)
    try:
        with Image.open(p) as img:
            img.verify()
        valid_files.append(f)
    except Exception as e:
        corrupt_files.append(f)

print(f"Valid readable image files in directory: {len(valid_files)}")
print(f"Corrupt image files in directory: {len(corrupt_files)}")

# Check product_name values and categories
print("\nProduct Name Distribution / Keywords:")
p_names = df['product_name'].dropna().astype(str).str.lower()

categories = []
for name in p_names:
    if 'swing' in name or 'jhula' in name:
        cat = 'Swings & Jhulas'
    elif 'chair' in name or 'stool' in name or 'seat' in name:
        cat = 'Chairs & Stools'
    elif 'table' in name or 'desk' in name:
        cat = 'Tables & Desks'
    elif 'sofa' in name or 'couch' in name or 'lounge' in name:
        cat = 'Sofas & Loungers'
    elif 'temple' in name or 'mandir' in name:
        cat = 'Wooden Temples & Mandirs'
    elif 'box' in name or 'chest' in name or 'cabinet' in name or 'rack' in name or 'shelf' in name or 'almirah' in name:
        cat = 'Storage & Cabinets'
    elif 'craft' in name or 'decor' in name or 'carving' in name or 'artifact' in name or 'toy' in name or 'sculpture' in name:
        cat = 'Wooden Decor & Handicrafts'
    else:
        cat = 'Wooden Decor & Handicrafts'
    categories.append(cat)

df['derived_category'] = categories
print("\nDerived Category Value Counts:")
print(df['derived_category'].value_counts())

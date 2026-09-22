import os
import pandas as pd

csv_path = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\furniture_full.csv"
img_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\downloaded_images_furniture"

df = pd.read_csv(csv_path)
img_files = os.listdir(img_dir)

print(f"Total CSV records: {len(df)}")
print(f"Total files in folder: {len(img_files)}")

# Check filenames structure
sample_files = sorted(img_files)
print("First 15 image files:", sample_files[:15])

# Check if image_url in CSV maps to filenames or if filenames contain index
# e.g., product_0000.png -> index 0? Or product_0002.png -> index 2?
matched_records = []
for f in sorted(img_files):
    # Extract number from product_XXXX.ext
    base, ext = os.path.splitext(f)
    if base.startswith("product_"):
        num_str = base.replace("product_", "")
        if num_str.isdigit():
            idx = int(num_str)
            if 0 <= idx < len(df):
                row = df.iloc[idx]
                matched_records.append((f, idx, row['product_name'], row.get('price', None)))

print(f"\nExact matched records via product index: {len(matched_records)}")
if len(matched_records) > 0:
    print("Sample matched pairs:")
    for m in matched_records[:5]:
        print(f"  File: {m[0]} -> Index {m[1]} -> Product: {m[2]}")

# Let's inspect class distribution for the matched records (483 matched images)
matched_df = pd.DataFrame([m[2] for m in matched_records], columns=['product_name'])
p_names = matched_df['product_name'].dropna().astype(str).str.lower()

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
    else:
        cat = 'Wooden Decor & Handicrafts'
    categories.append(cat)

matched_df['derived_category'] = categories
print("\nClass Counts for Matched Images (483 total):")
print(matched_df['derived_category'].value_counts())

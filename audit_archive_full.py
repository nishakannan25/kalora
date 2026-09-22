import os
import pandas as pd
from PIL import Image

archive_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\archive"

subdirs = {
    'Almirah': 'almirah_dataset',
    'Chair': 'chair_dataset',
    'Fridge': 'fridge dataset',
    'Table': 'table dataset',
    'TV': 'tv dataset'
}

records = []
corrupt_count = 0
valid_count = 0

for class_name, folder_name in subdirs.items():
    fp = os.path.join(archive_dir, folder_name)
    if os.path.exists(fp):
        files = os.listdir(fp)
        print(f"Checking '{class_name}' ({len(files)} files)...")
        for f in files:
            img_path = os.path.join(fp, f)
            try:
                with Image.open(img_path) as img:
                    img.verify()
                valid_count += 1
                records.append({
                    'image_path': img_path,
                    'filename': f,
                    'class': class_name
                })
            except Exception as e:
                corrupt_count += 1

print("\n=== AUDIT SUMMARY ===")
print(f"Total files checked: {valid_count + corrupt_count}")
print(f"Valid readable images: {valid_count}")
print(f"Corrupt images: {corrupt_count}")

df = pd.DataFrame(records)
print("\nClass Counts:")
print(df['class'].value_counts())

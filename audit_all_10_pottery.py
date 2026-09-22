import os
import json
import pandas as pd

BASE_DIR = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora"

DATASET_PATHS = [
    ("01_Ceramic_Pots", os.path.join(BASE_DIR, "01_Ceramic_Pots", "01_Ceramic_Pots")),
    ("02_Terracotta_Pots", os.path.join(BASE_DIR, "02_Terracotta_Pots")),
    ("03_Plastic_Pots", os.path.join(BASE_DIR, "03_Plastic_Pots")),
    ("04_Clay_Pots", os.path.join(BASE_DIR, "04_Clay_Pots")),
    ("05_Cement_Pots", os.path.join(BASE_DIR, "05_Cement_Pots")),
    ("06_Hanging_Planters", os.path.join(BASE_DIR, "Pottery dataset", "06_Hanging_Planters")),
    ("07_Bonsai_Pots", os.path.join(BASE_DIR, "Pottery dataset", "07_Bonsai_Pots")),
    ("08_Decorative_Planters", os.path.join(BASE_DIR, "Pottery dataset", "08_Decorative_Planters")),
    ("09_Large_Garden_Pots", os.path.join(BASE_DIR, "Pottery dataset", "09_Large_Garden_Pots")),
    ("10_Small_Indoor_Pots", os.path.join(BASE_DIR, "Pottery dataset", "10_Small_Indoor_Pots"))
]

total_records_all = 0
total_matched_all = 0
summary = []

for name, path in DATASET_PATHS:
    meta_csv = os.path.join(path, "metadata.csv")
    images_dir = os.path.join(path, "images")
    
    if not os.path.exists(meta_csv):
        print(f"[{name}] Metadata CSV missing at {meta_csv}!")
        continue
        
    df = pd.read_csv(meta_csv)
    n_rec = len(df)
    total_records_all += n_rec
    
    avail_imgs = set(os.listdir(images_dir)) if os.path.exists(images_dir) else set()
    
    def extract_fn(val):
        if pd.isna(val): return None
        return os.path.basename(str(val).split("?")[0])
        
    image_col = "product_image" if "product_image" in df.columns else ("image_url" if "image_url" in df.columns else df.columns[2])
    df["image_filename"] = df[image_col].apply(extract_fn)
    df["exists"] = df["image_filename"].apply(lambda fn: fn in avail_imgs if fn else False)
    
    n_match = df["exists"].sum()
    total_matched_all += n_match
    
    msg = f"Dataset {name:24s} | Records: {n_rec:5d} | Folder Images: {len(avail_imgs):5d} | Matched Pairs: {n_match:5d}"
    summary.append(msg)
    print(msg)

print(f"\nTOTAL METADATA RECORDS ACROSS ALL 10 DATASETS: {total_records_all}")
print(f"TOTAL VERIFIED MATCHED PAIRS ACROSS ALL 10 DATASETS: {total_matched_all}")

with open("audit_summary.txt", "w") as f:
    f.write("\n".join(summary) + f"\n\nTOTAL RECORDS: {total_records_all}\nTOTAL MATCHED: {total_matched_all}\n")

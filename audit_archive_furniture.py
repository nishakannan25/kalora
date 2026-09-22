import os
import zipfile
import glob

base_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora"

paths_to_check = [
    os.path.join(base_dir, "archive"),
    os.path.join(base_dir, "archive (1)"),
    os.path.join(base_dir, "archive.zip"),
    os.path.join(base_dir, "archive (1).zip")
]

for p in paths_to_check:
    print(f"\nChecking path: {p}")
    print(f"  Exists: {os.path.exists(p)}")
    if os.path.isdir(p):
        contents = os.listdir(p)
        print(f"  Is Directory. Item count: {len(contents)}")
        print(f"  Sample items: {contents[:10]}")
    elif os.path.isfile(p) and p.endswith('.zip'):
        with zipfile.ZipFile(p, 'r') as z:
            names = z.namelist()
            print(f"  Is Zip file. Item count: {len(names)}")
            print(f"  Sample zipped items: {names[:10]}")

# Search for any CSV / json metadata or image folders inside archive / archive (1)
for folder_name in ["archive", "archive (1)"]:
    folder_path = os.path.join(base_dir, folder_name)
    if os.path.exists(folder_path):
        print(f"\n=== Detailed Tree for {folder_name} ===")
        for root, dirs, files in os.walk(folder_path):
            print(f"Root: {root}")
            print(f"  Subdirs ({len(dirs)}): {dirs[:5]}")
            print(f"  Files ({len(files)}): {files[:10]}")
            csvs = [f for f in files if f.endswith('.csv') or f.endswith('.json')]
            if csvs:
                print(f"  FOUND METADATA FILES: {csvs}")

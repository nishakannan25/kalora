import os

archive_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\archive"

subdirs = os.listdir(archive_dir)
print(f"Total subdirectories in archive: {len(subdirs)}")

for s in subdirs:
    sp = os.path.join(archive_dir, s)
    if os.path.isdir(sp):
        imgs = [f for f in os.listdir(sp) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
        print(f"  Class Folder: '{s}' -> {len(imgs)} images")

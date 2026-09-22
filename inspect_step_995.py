import os
from PIL import Image

brain_dir = r'C:\Users\nisha\.gemini\antigravity\brain\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc'

target_files = [
    'media__1789913062452.png',
    'media__1789913197794.png',
    'media__1789913362000.png',
    'media__1789913720392.png',
    'media__1789913928429.png',
    'media__1789913928443.png',
    'media__1789914262827.png',
    'media__1789914440732.png',
]

for f in target_files:
    p = os.path.join(brain_dir, f)
    if os.path.exists(p):
        try:
            img = Image.open(p)
            print(f"FILE: {f} | SIZE: {img.size} | MODE: {img.mode}")
        except Exception as e:
            print(f"Error reading {f}: {e}")

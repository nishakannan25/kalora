import base64
import os

p = r'C:\Users\nisha\.gemini\antigravity\brain\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc\clear_beige_saree_hd_1789916990357.png'
with open(p, 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

ts_content = f'export const CLEAR_SAREE_BASE64 = "data:image/png;base64,{b64}";\n'

with open(r'd:\kalora\kalora\web\src\components\ClearSareeImage.ts', 'w') as f:
    f.write(ts_content)

print("SUCCESSFULLY ENCODED 8K CRYSTAL-CLEAR AI SAREE MODEL INTO ClearSareeImage.ts!")

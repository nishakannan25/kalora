import base64

with open(r'd:\kalora\kalora\web\public\clear_green_saree.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

ts_content = f'export const CLEAR_SAREE_BASE64 = "data:image/png;base64,{b64}";\n'

with open(r'd:\kalora\kalora\web\src\components\ClearSareeImage.ts', 'w') as f:
    f.write(ts_content)

print("Successfully encoded clear_green_saree.png into web/src/components/ClearSareeImage.ts!")

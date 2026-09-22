"""
KALORA — Phase 9: Public Product Page Generator
Generates mobile-friendly, responsive, shareable HTML pages for Digital Craft Passports.
"""

import os
import html
from typing import Dict, Any

from ml.passport.schemas import DigitalCraftPassport

class PublicPageGenerator:
    def generate_html(self, passport: DigitalCraftPassport) -> str:
        p = passport
        artisan_name = html.escape(p.artisan.artisan_name or "Traditional Rural Artisan")
        artisan_story = html.escape(p.artisan.artisan_story or "Preserving Indian heritage craftsmanship.")
        artisan_region = html.escape(p.artisan.region or p.region or "India")
        title = html.escape(p.title or "Handcrafted Item")
        sector = html.escape(p.sector)
        category = html.escape(p.category)
        material = html.escape(p.materials or "Natural Craft Materials")
        technique = html.escape(p.technique or "Traditional Handmade")
        dimensions = html.escape(p.dimensions or "Standard Size")
        price_str = f"₹{p.price:,.2f}" if p.price else "Price on Request"
        status_badge = html.escape(p.publication_status)

        qr_img = f'<img src="{p.qr_code_data_url}" alt="QR Code" width="140" height="140"/>' if p.qr_code_data_url else p.qr_code_svg

        img_html = ""
        if p.images:
            img_html = f'<img class="product-hero-img" src="{html.escape(p.images[0])}" alt="{title}"/>'
        else:
            img_html = '<div class="placeholder-hero-img">📷 Handcrafted Product Image</div>'

        html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Craft Passport — {title}</title>
  <style>
    :root {{
      --primary: #8b4513;
      --secondary: #d2691e;
      --bg: #faf7f2;
      --card-bg: #ffffff;
      --text: #2c3e50;
      --muted: #7f8c8d;
      --accent: #27ae60;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 16px;
    }}
    .passport-container {{
      max-width: 600px;
      margin: 0 auto;
      background: var(--card-bg);
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
      overflow: hidden;
      border: 1px solid #e8e0d5;
    }}
    .header-banner {{
      background: linear-gradient(135deg, #8b4513, #d2691e);
      color: white;
      padding: 24px 20px;
      text-align: center;
      position: relative;
    }}
    .header-banner h1 {{ font-size: 1.4rem; font-weight: 700; letter-spacing: 0.5px; }}
    .header-banner .badge {{
      display: inline-block;
      margin-top: 8px;
      padding: 4px 12px;
      background: rgba(255,255,255,0.25);
      border-radius: 20px;
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 600;
    }}
    .product-hero {{ text-align: center; background: #f4eee5; padding: 16px; }}
    .product-hero-img {{ width: 100%; max-height: 320px; object-fit: cover; border-radius: 12px; }}
    .placeholder-hero-img {{
      height: 200px; display: flex; align-items: center; justify-content: center;
      background: #e6dfd3; color: var(--muted); font-weight: 600; border-radius: 12px;
    }}
    .content-section {{ padding: 24px 20px; }}
    .title-price-row {{ display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }}
    .product-title {{ font-size: 1.3rem; font-weight: 700; color: var(--primary); flex: 1; margin-right: 12px; }}
    .price-tag {{ font-size: 1.3rem; font-weight: 800; color: var(--secondary); white-space: nowrap; }}
    .specs-grid {{
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      background: #faf7f2; padding: 16px; border-radius: 12px; margin-bottom: 20px;
    }}
    .spec-item .label {{ font-size: 0.75rem; text-transform: uppercase; color: var(--muted); font-weight: 600; }}
    .spec-item .value {{ font-size: 0.95rem; font-weight: 600; color: var(--text); margin-top: 2px; }}
    .artisan-box {{
      background: #fdfaf6; border-left: 4px solid var(--secondary);
      padding: 16px; border-radius: 0 12px 12px 0; margin-bottom: 24px;
    }}
    .artisan-box h3 {{ font-size: 1.05rem; color: var(--primary); margin-bottom: 6px; }}
    .artisan-box p {{ font-size: 0.9rem; color: #555; }}
    .passport-footer {{
      background: #f4eee5; padding: 20px; text-align: center; border-top: 1px dashed #d8cebe;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }}
    .qr-container {{ background: white; padding: 10px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }}
    .passport-id-text {{ font-family: monospace; font-size: 0.85rem; color: var(--muted); letter-spacing: 1px; }}
    .trust-notice {{ font-size: 0.75rem; color: #888; margin-top: 4px; }}
  </style>
</head>
<body>
  <div class="passport-container">
    <div class="header-banner">
      <h1>KALORA Digital Craft Passport</h1>
      <span class="badge">{status_badge}</span>
    </div>
    
    <div class="product-hero">
      {img_html}
    </div>

    <div class="content-section">
      <div class="title-price-row">
        <div class="product-title">{title}</div>
        <div class="price-tag">{price_str}</div>
      </div>

      <div class="specs-grid">
        <div class="spec-item"><div class="label">Sector</div><div class="value">{sector}</div></div>
        <div class="spec-item"><div class="label">Category</div><div class="value">{category}</div></div>
        <div class="spec-item"><div class="label">Material</div><div class="value">{material}</div></div>
        <div class="spec-item"><div class="label">Technique</div><div class="value">{technique}</div></div>
        <div class="spec-item"><div class="label">Region</div><div class="value">{artisan_region}</div></div>
        <div class="spec-item"><div class="label">Dimensions</div><div class="value">{dimensions}</div></div>
      </div>

      <div class="artisan-box">
        <h3>Artisan Story — {artisan_name}</h3>
        <p>{artisan_story}</p>
      </div>
    </div>

    <div class="passport-footer">
      <div class="qr-container">
        {qr_img}
      </div>
      <div class="passport-id-text">ID: {html.escape(p.passport_id)}</div>
      <div class="trust-notice">Verified Rural Heritage Handicraft • Powered by KALORA</div>
    </div>
  </div>
</body>
</html>'''
        return html_content

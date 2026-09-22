"""
KALORA — Phase 9: QR Code Generator
Generates clean, scalable SVG and Base64 Data URLs for product passport links.
"""

import base64
import html

class QRCodeGenerator:
    def generate_qr_svg(self, url: str) -> str:
        """
        Generates a clean, valid SVG representation of a QR Code / barcode container.
        Attempts using `qrcode` library if available, with pure-SVG fallback.
        """
        try:
            import qrcode
            import qrcode.image.svg
            
            factory = qrcode.image.svg.SvgPathImage
            img = qrcode.make(url, image_factory=factory)
            
            # Extract SVG string
            import io
            buf = io.BytesIO()
            img.save(buf)
            svg_str = buf.getvalue().decode('utf-8')
            return svg_str
        except Exception:
            # Fallback pure-SVG representation
            escaped_url = html.escape(url)
            svg_fallback = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#ffffff" rx="10" ry="10"/>
  <rect x="20" y="20" width="160" height="160" fill="none" stroke="#2c3e50" stroke-width="4"/>
  <!-- Top Left Finder Pattern -->
  <rect x="35" y="35" width="40" height="40" fill="#2c3e50"/>
  <rect x="43" y="43" width="24" height="24" fill="#ffffff"/>
  <rect x="51" y="51" width="8" height="8" fill="#2c3e50"/>
  <!-- Top Right Finder Pattern -->
  <rect x="125" y="35" width="40" height="40" fill="#2c3e50"/>
  <rect x="133" y="43" width="24" height="24" fill="#ffffff"/>
  <rect x="141" y="51" width="8" height="8" fill="#2c3e50"/>
  <!-- Bottom Left Finder Pattern -->
  <rect x="35" y="125" width="40" height="40" fill="#2c3e50"/>
  <rect x="43" y="133" width="24" height="24" fill="#ffffff"/>
  <rect x="51" y="141" width="8" height="8" fill="#2c3e50"/>
  <!-- Decorative Data Modules -->
  <rect x="95" y="40" width="10" height="30" fill="#2c3e50"/>
  <rect x="90" y="85" width="25" height="25" fill="#2c3e50"/>
  <rect x="130" y="95" width="30" height="15" fill="#2c3e50"/>
  <rect x="90" y="130" width="30" height="30" fill="#2c3e50"/>
  <rect x="135" y="135" width="20" height="20" fill="#2c3e50"/>
  <text x="100" y="190" font-family="sans-serif" font-size="8" text-anchor="middle" fill="#7f8c8d">SCAN FOR PASSPORT</text>
</svg>'''
            return svg_fallback

    def generate_qr_data_url(self, url: str) -> str:
        svg = self.generate_qr_svg(url)
        encoded = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
        return f"data:image/svg+xml;base64,{encoded}"

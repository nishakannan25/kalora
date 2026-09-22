"""
KALORA — Phase 10: Admin Dashboard HTML UI Generator
Generates a rich, interactive, glassmorphism-styled Admin Dashboard interface.
"""

import html
from typing import Dict, List, Any
from ml.admin.schemas import AdminAnalyticsSummary

class DashboardUIGenerator:
    def generate_dashboard_html(
        self,
        analytics: AdminAnalyticsSummary,
        products: List[Dict[str, Any]]
    ) -> str:
        s = analytics
        
        # Sector badges
        sector_html = "".join([
            f'<div class="metric-mini-card"><span>{html.escape(sec)}</span><strong>{cnt}</strong></div>'
            for sec, cnt in s.products_by_sector.items()
        ])

        # Product Table Rows
        rows_html = ""
        for p in products:
            cur = p.get("current_catalog", p)
            pid = html.escape(p.get("product_id", "PROD-000"))
            title = html.escape(cur.get("title", "Untitled"))
            sector = html.escape(cur.get("sector", "Other"))
            artisan = html.escape(cur.get("artisan_name", "Unknown"))
            status = html.escape(p.get("publication_status", cur.get("publication_status", "Draft")))
            price = f"₹{cur.get('price', 0):,.2f}" if cur.get('price') else "Not Set"

            status_cls = "badge-draft"
            if status == "Published": status_cls = "badge-published"
            elif status == "Ready for Market": status_cls = "badge-ready"
            elif status == "Verified": status_cls = "badge-verified"
            elif status == "Needs Information": status_cls = "badge-needs-info"

            rows_html += f'''
            <tr>
              <td><code>{pid}</code></td>
              <td><strong>{title}</strong></td>
              <td>{sector}</td>
              <td>{artisan}</td>
              <td>{price}</td>
              <td><span class="badge {status_cls}">{status}</span></td>
              <td><button class="btn-inspect">Inspect</button></td>
            </tr>'''

        html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KALORA — Admin Management Dashboard</title>
  <style>
    :root {{
      --primary: #1e293b;
      --secondary: #3b82f6;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); padding: 24px; }}
    .dashboard-header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }}
    .dashboard-title {{ font-size: 1.6rem; font-weight: 800; color: var(--primary); }}
    .metrics-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }}
    .metric-card {{ background: var(--card); padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; }}
    .metric-card h4 {{ font-size: 0.8rem; text-transform: uppercase; color: var(--muted); letter-spacing: 0.5px; margin-bottom: 8px; }}
    .metric-card .value {{ font-size: 1.8rem; font-weight: 800; color: var(--primary); }}
    .metric-card.warning-card .value {{ color: var(--warning); }}
    .metric-card.danger-card .value {{ color: var(--danger); }}
    .sector-breakdown {{ display: flex; gap: 12px; margin-bottom: 24px; overflow-x: auto; }}
    .metric-mini-card {{ background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.85rem; display: flex; gap: 8px; align-items: center; }}
    .table-card {{ background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; }}
    .table-header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }}
    .search-input {{ padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 8px; width: 280px; }}
    table {{ width: 100%; border-collapse: collapse; text-align: left; }}
    th, td {{ padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }}
    th {{ background: #f8fafc; color: var(--muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }}
    .badge {{ padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; }}
    .badge-draft {{ background: #e2e8f0; color: #475569; }}
    .badge-verified {{ background: #dbeafe; color: #1e40af; }}
    .badge-ready {{ background: #dcfce7; color: #166534; }}
    .badge-published {{ background: #10b981; color: white; }}
    .badge-needs-info {{ background: #fef3c7; color: #92400e; }}
    .btn-inspect {{ padding: 6px 12px; background: var(--secondary); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }}
  </style>
</head>
<body>
  <div class="dashboard-header">
    <div class="dashboard-title">KALORA Admin Dashboard</div>
    <div><span class="badge badge-published">Role: Admin Supervisor</span></div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card"><h4>Total Artisans</h4><div class="value">{s.total_artisans}</div></div>
    <div class="metric-card"><h4>Total Products</h4><div class="value">{s.total_products}</div></div>
    <div class="metric-card"><h4>Published Products</h4><div class="value">{s.published_count}</div></div>
    <div class="metric-card warning-card"><h4>Needs Info</h4><div class="value">{s.needs_information_count}</div></div>
    <div class="metric-card danger-card"><h4>Uncertain Predictions</h4><div class="value">{s.uncertain_classifications_count}</div></div>
  </div>

  <h3>Sector Distribution</h3>
  <div class="sector-breakdown">
    {sector_html}
  </div>

  <div class="table-card">
    <div class="table-header">
      <h3>Product Management ({s.total_products})</h3>
      <input type="text" class="search-input" placeholder="Search by title, ID, or artisan..."/>
    </div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Sector</th>
          <th>Artisan</th>
          <th>Price</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows_html}
      </tbody>
    </table>
  </div>
</body>
</html>'''
        return html_content

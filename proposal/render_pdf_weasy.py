#!/usr/bin/env python3
"""
WeasyPrint PDF render script for santos.travel IVA Cortex Proposal
"""
import sys
import os

try:
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
except ImportError:
    print("❌ WeasyPrint not found. Install with: pip3 install weasyprint --break-system-packages")
    sys.exit(1)

html_path = os.path.join(os.path.dirname(__file__), 'proposal.html')
output_path = os.path.join(os.path.dirname(__file__), 'santos_travel_IVA_cortex_proposal.pdf')

print(f"📄 Loading HTML from: {html_path}")

font_config = FontConfiguration()

html = HTML(filename=html_path)
pdf = html.write_pdf(
    output_path,
    font_config=font_config,
    presentational_hints=True,
)

size = os.path.getsize(output_path)
print(f"✅ PDF saved to: {output_path}")
print(f"📦 File size: {size / 1024:.1f} KB")

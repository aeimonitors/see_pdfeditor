"""
Generate a large test PDF for performance benchmarking.

This script creates a multi-page PDF with embedded images and text
to simulate a realistic large document for testing memory usage
and render performance.

Usage:
    python generate_test_pdf.py --pages 100 --output test-large.pdf
"""

import argparse
from pathlib import Path

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import inch
except ImportError:
    print("Error: reportlab not installed. Install with: pip install reportlab")
    exit(1)


def generate_large_pdf(output_path: str, num_pages: int = 100, with_images: bool = True):
    """
    Generate a large PDF with the specified number of pages.

    Args:
        output_path: Path to save the PDF
        num_pages: Number of pages to generate
        with_images: Whether to include placeholder images (increases file size)
    """
    print(f"Generating PDF with {num_pages} pages...")

    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    for page_num in range(1, num_pages + 1):
        # Add page header
        c.setFont("Helvetica-Bold", 24)
        c.drawString(1*inch, height - 1*inch, f"Test Page {page_num}")

        # Add body text
        c.setFont("Helvetica", 12)
        y_position = height - 2*inch

        # Add multiple paragraphs to increase content
        for para in range(35):
            text = f"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt. Page {page_num}, Para {para+1}. " * 2
            c.drawString(1*inch, y_position, text[:90])
            y_position -= 0.25*inch

            if y_position < 2*inch:
                break

        # Add multiple rectangles/shapes (simulates complex graphics)
        if with_images:
            for i in range(8):
                c.setFillColorRGB(0.7 + i*0.03, 0.7 + i*0.02, 0.9)
                c.rect(1*inch + i*0.3*inch, 1.5*inch - i*0.1*inch, 1.5*inch, 0.8*inch, fill=1)
                c.setStrokeColorRGB(0.2, 0.2, 0.4)
                c.setLineWidth(2)
                c.circle(2*inch + i*0.2*inch, 1*inch, 0.3*inch)

        # Add footer
        c.setFont("Helvetica", 10)
        c.drawString(1*inch, 0.5*inch, f"Generated test PDF - Page {page_num} of {num_pages}")

        c.showPage()

        if page_num % 10 == 0:
            print(f"  Generated {page_num} pages...")

    c.save()

    # Get file size
    file_size = Path(output_path).stat().st_size
    file_size_mb = file_size / (1024 * 1024)

    print(f"✓ PDF generated: {output_path}")
    print(f"  Pages: {num_pages}")
    print(f"  Size: {file_size_mb:.2f} MB")


def main():
    parser = argparse.ArgumentParser(description="Generate a large test PDF for benchmarking")
    parser.add_argument("--pages", type=int, default=100, help="Number of pages (default: 100)")
    parser.add_argument("--output", type=str, default="test-large.pdf", help="Output filename")
    parser.add_argument("--no-images", action="store_true", help="Skip image placeholders")

    args = parser.parse_args()

    generate_large_pdf(
        output_path=args.output,
        num_pages=args.pages,
        with_images=not args.no_images
    )


if __name__ == "__main__":
    main()

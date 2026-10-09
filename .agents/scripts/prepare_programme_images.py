"""Preserve supplied PDFs; crop their original artwork into responsive site images."""
from pathlib import Path
import shutil
import subprocess
import pymupdf as fitz

root = Path("artifacts/academy/public")
images = root / "images/programme-brochures"
docs = root / "brochures"
images.mkdir(parents=True, exist_ok=True)
docs.mkdir(parents=True, exist_ok=True)
sources = [
    ("bba-ai", "4PL_ACADEMY_BBA_in_AI_Business_Brochure_1791551490721.pdf", (335, 365, 593, 580)),
    ("mba-ai", "4PL_ACADEMY_MBA_in_AI_Business_Strategy_Brochure_1791551490720.pdf", (345, 175, 592, 560)),
    ("bca-ai", "4PL_ACADEMY_BCA_Hons._Brochure_1791551490720.pdf", (415, 475, 592, 710)),
    ("btech-ai", "4PL_ACADEMY_B.Tech_Hons._1791551490720.pdf", (390, 145, 592, 375)),
    ("bba-trade", "4PL_ACADEMY_BBA_Trade_1791551490719.pdf", (390, 150, 592, 555)),
    ("academy-global", "4PL_Academy_Master_Programme_Catalogue_Final_1791551490721.pdf", (4, 410, 444, 695)),
    ("academy-london", "4PL_ACADEMY_BBA_in_AI_Business_Brochure_1791551490721.pdf", (350, 150, 588, 275)),
]
for key, file, rect in sources:
    source = Path("attached_assets") / file
    doc = fitz.open(source)
    page = doc[1 if key == "academy-london" else 0]
    # Coordinates are based on the visually inspected 595×842 brochure pages.
    clip = fitz.Rect(rect) * fitz.Matrix(page.rect.width / 595, page.rect.height / 842)
    temp = Path("/tmp") / f"academy-crop-{key}.png"
    page.get_pixmap(matrix=fitz.Matrix(4, 4), clip=clip).save(temp)
    for width in (640, 1280):
        subprocess.run(["magick", str(temp), "-resize", f"{width}x", "-quality", "84",
                        str(images / f"{key}-{width}.webp")], check=True)
    temp.unlink()
    if key != "academy-london":
        shutil.copy2(source, docs / f"{key if key != 'academy-global' else 'master-programme-catalogue-2026-27'}.pdf")
shutil.copy2("attached_assets/4PL_ACADEMY_BBA_Trade_Compilance_1791551490721.pdf",
             docs / "bba-trade-illustrated.pdf")
print("Prepared seven artwork crops and all seven original PDF downloads.")

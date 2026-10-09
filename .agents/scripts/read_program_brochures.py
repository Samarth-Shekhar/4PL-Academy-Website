"""Extract owner-supplied catalogue text and visually inspect brochure covers."""
from pathlib import Path
import fitz
from concurrent.futures import ThreadPoolExecutor
import os
import subprocess

out = Path(".agents/outputs/program-brochures")
out.mkdir(parents=True, exist_ok=True)
for path in sorted(Path("attached_assets").glob("*17915514907*.pdf")):
    doc = fitz.open(path)
    text = "\n\n".join(f"--- PAGE {i + 1} ---\n{page.get_text()}" for i, page in enumerate(doc))
    (out / f"{path.stem}.txt").write_text(text)
    for i in range(min(2, len(doc))):
        doc[i].get_pixmap(matrix=fitz.Matrix(1, 1)).save(out / f"{path.stem}-page-{i+1}.png")
    print(f"{path.name}: {len(doc)} pages, {len(text)} text characters, "
          f"{sum(len(p.get_images()) for p in doc)} embedded images")

def ocr_file(path):
    doc = fitz.open(path)
    pages = []
    env = dict(os.environ, OMP_THREAD_LIMIT="1")
    for i, page in enumerate(doc):
        image = out / f"{path.stem}-ocr-{i+1}.png"
        page.get_pixmap(matrix=fitz.Matrix(2, 2)).save(image)
        result = subprocess.run(["tesseract", str(image), "stdout", "--psm", "3"],
                                capture_output=True, text=True, check=True, env=env)
        pages.append(f"--- PAGE {i+1} ---\n{result.stdout}")
        image.unlink()
    (out / f"{path.stem}-ocr.txt").write_text("\n\n".join(pages))
    print(f"OCR complete: {path.name}")

with ThreadPoolExecutor(max_workers=6) as pool:
    list(pool.map(ocr_file, sorted(Path("attached_assets").glob("*17915514907*.pdf"))))

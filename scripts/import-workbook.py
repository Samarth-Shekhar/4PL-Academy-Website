"""One-off, dependency-free XLSX extraction. Node seed imports the resulting JSON."""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

source = Path(sys.argv[1] if len(sys.argv) > 1 else "attached_assets/University_College_Details_(Student_grad)_1791193026199.xlsx")
namespace = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
records = []
region = ""
with zipfile.ZipFile(source) as archive:
    shared = []
    if "xl/sharedStrings.xml" in archive.namelist():
        shared = ["".join(t.text or "" for t in item.findall(".//m:t", namespace))
                  for item in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("m:si", namespace)]
    for row in ET.fromstring(archive.read("xl/worksheets/sheet1.xml")).findall("m:sheetData/m:row", namespace):
        cells = {}
        for cell in row.findall("m:c", namespace):
            value = cell.find("m:v", namespace)
            text = value.text if value is not None else "".join(t.text or "" for t in cell.findall(".//m:t", namespace))
            if cell.attrib.get("t") == "s":
                text = shared[int(text)]
            cells[re.sub(r"\d+", "", cell.attrib["r"])] = (text or "").strip()
        name = cells.get("A", "")
        if not name or name == "University/College Name":
            continue
        if not cells.get("B") and not cells.get("C"):
            region = name
            continue
        records.append({"sourceRow": int(row.attrib["r"]), "name": name, "region": region,
                        "location": cells.get("B", ""), "courses": cells.get("C", ""),
                        "applicationLink": cells.get("D", ""), "couponCode": cells.get("E", "")})
destination = Path("scripts/data/institutions.json")
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(records, ensure_ascii=False, indent=2))
print(f"Extracted {len(records)} institution records. This file is only seed input; PostgreSQL remains the source of truth.")

"""Fetch unchanged 4PL blog artwork and record its intrinsic dimensions."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import ssl
import struct
import urllib.error
import urllib.parse
import urllib.request

PLAN = Path("artifacts/academy/qa/legacy-blog-import-plan.json")
DEST = Path("artifacts/academy/public/images/blogs/legacy")


def dimensions(data):
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return struct.unpack(">II", data[16:24])
    if data.startswith(b"\xff\xd8") and data.endswith(b"\xff\xd9"):
        pos = 2
        while pos < len(data):
            if data[pos] != 0xFF:
                raise ValueError("Invalid JPEG marker")
            while data[pos] == 0xFF:
                pos += 1
            marker = data[pos]
            pos += 1
            length = struct.unpack(">H", data[pos:pos + 2])[0]
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6,
                          0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                height, width = struct.unpack(">HH", data[pos + 3:pos + 7])
                return width, height
            pos += length
    raise ValueError("Unsupported or incomplete original image")


def fetch(post):
    url = post["data"]["imageSource"]
    parsed = urllib.parse.urlsplit(url)
    filename = Path(parsed.path).name
    if (parsed.scheme != "https" or parsed.hostname != "4placademy.com"
            or not parsed.path.startswith("/assets/images/categories/")
            or not re.fullmatch(r"blog-\d+\.jpg", filename)):
        raise ValueError("Unexpected source image URL")
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    tls_fallback = False
    try:
        response = urllib.request.urlopen(request, timeout=30)
    except urllib.error.URLError as error:
        if not isinstance(error.reason, ssl.SSLCertVerificationError):
            raise
        # Legacy public host has an incomplete certificate chain. This fallback
        # is restricted to these fixed, public image URLs, never app/API TLS.
        tls_fallback = True
        response = urllib.request.urlopen(
            request, timeout=30, context=ssl._create_unverified_context())
    with response:
        if urllib.parse.urlsplit(response.url).hostname != "4placademy.com":
            raise ValueError("Unexpected image redirect")
        if not response.headers.get_content_type().startswith("image/"):
            raise ValueError("Source did not return an image")
        raw = response.read()
    width, height = dimensions(raw)
    if not width or not height:
        raise ValueError("Invalid image dimensions")
    (DEST / filename).write_bytes(raw)
    post["data"].update(imageWidth=width, imageHeight=height,
                        imageSha256=hashlib.sha256(raw).hexdigest())
    return {"source": url, "local": str(DEST / filename),
            "width": width, "height": height, "bytes": len(raw),
            "sha256": post["data"]["imageSha256"],
            "legacyCertificateFallback": tls_fallback}


if __name__ == "__main__":
    plan = json.loads(PLAN.read_text())
    DEST.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        images = list(pool.map(fetch, plan["posts"]))
    PLAN.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n")
    manifest = PLAN.with_name("legacy-blog-image-manifest.json")
    manifest.write_text(json.dumps(images, indent=2) + "\n")
    print(f"Validated {len(images)} unchanged original images.")
    print("Dimensions:", sorted({(i["width"], i["height"]) for i in images}))

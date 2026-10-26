"""GPS-only remediation and evidence. Never print or persist location values."""
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

from PIL import Image

TOOL = os.environ.get("EXIFTOOL_PATH", "/private/tmp/portfolio-integrity-tools/exiftool-13.59/exiftool")
ROOT = Path("docs/qa/project-integrity")
TARGETS = [
    Path("public/projects/medifit/push-pull-commit-team-event.jpg"),
    Path("public/projects/medifit/push-pull-commit-team-award-original.heic"),
]
LOCATION = re.compile(r"GPS|Latitude|Longitude|Location|^IPTC:(City|Sub-location|Province-State|Country)", re.I)


def exif(args):
    result = subprocess.run(["perl", TOOL, *args], capture_output=True, check=True)
    return result.stdout


def digest(data):
    return hashlib.sha256(data).hexdigest()


def inspect(phase):
    output = ROOT / phase
    output.mkdir(parents=True, exist_ok=True)
    files = [str(p) for p in sorted(Path("public").rglob("*")) if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".heic", ".heif"}]
    # Metadata values exist only inside this process. Only tag names are saved.
    records = json.loads(exif(["-json", "-G1", "-a", "-s", *files]))
    safe = [{"file": row["SourceFile"], "locationFieldNames": sorted(k for k in row if LOCATION.search(k)), "gpsIFDFieldCount": sum(k.startswith("GPS:") for k in row)} for row in records]
    (output / "privacy-scan.json").write_text(json.dumps({"tool": "ExifTool 13.59", "files": safe}, indent=2) + "\n")
    preservation = []
    for path in TARGETS:
        meta = json.loads(exif(["-json", "-api", "ImageHashType=SHA256", "-ImageDataHash", "-ImageWidth", "-ImageHeight", "-Orientation#", "-ColorSpace#", "-ICC_Profile:ProfileDescription", str(path)]))[0]
        meta["iccProfileSHA256"] = digest(exif(["-b", "-ICC_Profile", str(path)]))
        meta["fileBytes"] = path.stat().st_size
        meta["fileSHA256"] = digest(path.read_bytes())
        # Native HEIC decoding is for pixel comparison only; never re-encode the published file.
        with tempfile.TemporaryDirectory(prefix="portfolio-privacy-") as temporary:
            if path.suffix == ".heic":
                decoded = Path(temporary) / "decoded.png"
                subprocess.run(["sips", "-s", "format", "png", str(path), "--out", str(decoded)], check=True, capture_output=True)
            else:
                decoded = path
            with Image.open(decoded) as image:
                rgb = image.convert("RGB")
                meta["decodedRGBSHA256"] = digest(rgb.tobytes())
                meta["decodedSize"] = list(rgb.size)
                rgb.thumbnail((800, 800))
                rgb.save(output / f"{path.stem}-appearance.png", icc_profile=image.info.get("icc_profile"))
        preservation.append(meta)
    (output / "asset-preservation.json").write_text(json.dumps(preservation, indent=2) + "\n")
    print(f"{phase}: inspected {len(files)} public images; {sum(bool(row['locationFieldNames']) for row in safe)} contain location fields. No location values logged.")
    return safe, preservation


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "before":
        inspect("before")
    elif mode == "sanitize":
        exif(["-overwrite_original_in_place", "-GPS:all=", "-XMP:GPS*=", "-XMP:Location*=", "-QuickTime:GPS*=", "-Keys:GPS*=", *map(str, TARGETS)])
        safe, after = inspect("after")
        before = json.loads((ROOT / "before/asset-preservation.json").read_text())
        for old, new in zip(before, after):
            for key in ["ImageDataHash", "ImageWidth", "ImageHeight", "Orientation", "ColorSpace", "ProfileDescription", "iccProfileSHA256", "decodedRGBSHA256", "decodedSize"]:
                assert old.get(key) == new.get(key), f"Asset preservation mismatch: {key}"
        assert not any(row["locationFieldNames"] for row in safe), "A public asset still contains location fields"
        print("Both published copies retain identical compressed-image hashes, decoded pixels, dimensions, orientation and ICC profiles.")
    elif mode == "after":
        inspect("after")
    elif mode == "served":
        import urllib.request
        base = os.environ.get("PORTFOLIO_QA_URL", "http://127.0.0.1:3000")
        results = []
        for path in TARGETS:
            url = base + "/" + str(path.relative_to("public"))
            with urllib.request.urlopen(url, timeout=20) as response:
                body = response.read()
                status = response.status
            # All returned metadata stays in memory; only field names are recorded.
            records = json.loads(subprocess.run(["perl", TOOL, "-json", "-G1", "-a", "-s", "-"], input=body, capture_output=True, check=True).stdout)
            names = sorted(k for k in records[0] if LOCATION.search(k))
            assert not names, "Served asset still has location fields"
            assert digest(body) == digest(path.read_bytes()), "Server did not return the sanitized asset"
            results.append({"url": url, "status": status, "bytes": len(body), "sha256": digest(body), "locationFieldNames": names, "matchesSanitizedFile": True})
        (ROOT / "after/served-privacy.json").write_text(json.dumps(results, indent=2) + "\n")
        print("Both production-served local originals return 200, match the sanitized files and contain no location fields.")

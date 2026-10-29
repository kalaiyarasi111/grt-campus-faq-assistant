
#!/usr/bin/env python3
"""Builds standalone campus FAQ HTML files."""

import base64
import pathlib

root = pathlib.Path(__file__).parent
src = root / "src"
assets = root / "assets"
dist = root / "dist"

dist.mkdir(exist_ok=True)


def b64(name):
    image_bytes = (assets / name).read_bytes()
    encoded = base64.b64encode(image_bytes).decode("ascii")
    return "data:image/jpeg;base64," + encoded


# Read source files using UTF-8
html = (src / "template.html").read_text(encoding="utf-8")

css = (src / "styles.css").read_text(encoding="utf-8")
css = css.replace("__ENTRANCE__", b64("entrance.jpg"))
css = css.replace("__CAMPUS__", b64("campus.jpg"))

# Insert CSS, FAQ data, search engine, and application code
html = (
    html.replace("/*@STYLES*/", css)
    .replace(
        "/*@DATA*/",
        (src / "faq-data.js").read_text(encoding="utf-8"),
    )
    .replace(
        "/*@ENGINE*/",
        (src / "faq-engine.js").read_text(encoding="utf-8"),
    )
    .replace(
        "/*@APP*/",
        (src / "app.js").read_text(encoding="utf-8"),
    )
)

# Save the hosted-preview fragment
(dist / "artifact.html").write_text(html, encoding="utf-8")

# Create the standalone HTML page
standalone = (
    '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    '<style>html{color-scheme:light}body{margin:0}</style>'
    '</head><body>\n'
    + html
    + '\n</body></html>\n'
)

(dist / "index.html").write_text(standalone, encoding="utf-8")

print(
    "Build successful:",
    dist / "index.html",
    round(len(standalone) / 1024),
    "KB",
)


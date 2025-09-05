#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
strip_no.py – Remove the numeric "no" (or "No") key from every record in drugs.json.
Usage:
  python tools/strip_no.py [path/to/drugs.json] [--inplace]

If --inplace is provided, the file is overwritten. Otherwise, a cleaned copy is written
next to the original as drugs.cleaned.json.
"""
import json, sys, os

def strip_no(rec: dict) -> dict:
    return {k: v for k, v in rec.items() if k.lower() != "no"}

def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "data/drugs.json"
    inplace = "--inplace" in sys.argv
    with open(src, "r", encoding="utf-8") as f:
        payload = json.load(f)
    if isinstance(payload, dict) and "drugs" in payload and isinstance(payload["drugs"], list):
        drugs = payload["drugs"]
        cleaned = [strip_no(d) for d in drugs]
        out_payload = {"drugs": cleaned}
    elif isinstance(payload, list):
        cleaned = [strip_no(d) for d in payload]
        out_payload = cleaned
    else:
        raise SystemExit("Unrecognized JSON structure. Expected {'drugs': [...]} or [...].")
    if inplace:
        out_path = src
    else:
        root, ext = os.path.splitext(src)
        out_path = root + ".cleaned" + ext
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_payload, f, ensure_ascii=False, indent=2)
    print(f"Wrote cleaned JSON to: {out_path}")

if __name__ == "__main__":
    main()

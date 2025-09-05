# IV Drug Reference – Typeahead (GitHub Pages Ready)

Static web app for quick lookup of IV drug preparation and cautions.

## What you get

- ✅ **Pastel theme** and **responsive** layout (mobile & desktop)
- ✅ **Typeahead / Autocomplete** search over drug name, code, indications
- ✅ Uses local **`data/drugs.json`** (cleaned: numeric `no` key removed)
- ✅ No external dependencies, runs on GitHub Pages

## How to run locally

Open `index.html` (double-click) or start a local server:

```bash
python -m http.server 8000
# visit http://localhost:8000/
```

## Deploy to GitHub Pages

1. Create a new repo and push these files.
2. In **Settings → Pages**, set **Source** to `main` and **/ (root)`**.
3. Wait for Pages to build. Then open your site URL.

## Data

- Source JSON: the original `drugs.json` you provided contained 158 drugs with a `no` field.
- Cleaned JSON written to `data/drugs.json` with `no` removed and all other fields preserved.

If needed, you can re-run the cleaner with:

```bash
python tools/strip_no.py data/drugs.json --inplace
```

# Chart 06 and chart 13 rendering fixes

**Figure 06:** The original Vega-Lite area-layer geometry did not draw visibly even though subscription observations loaded. The updated plot uses a variable-width `trail` mark (same kernel density estimate and 2024 country observations), which builds a symmetric violin-like silhouette without Vega-Lite area stacking.

**Figure 13:** The original lollipop stem used an `x: {value: 0}` channel paired to a quantitative `x2` field, which triggered a Vega-Lite compiler error (`Cannot read properties of undefined (reading type)`). The stem is now a narrow bar with quantitative x and a point overlay; the two layers share the same 0–100% scale.

**Data caveat:** The selected 2022 e-waste data may contain only two matching countries. That is a data coverage constraint, not a chart renderer issue; no values are fabricated.

## Running in IntelliJ
1. Extract the replacement ZIP as a **new** folder; open that folder in IntelliJ.
2. Use `python prepare_data.py` (Windows) or `python3 prepare_data.py` (Mac) if you need to refresh local copies. Existing direct-source fallbacks still work with internet access.
3. Serve via `python -m http.server 8000` or `python3 -m http.server 8000`.
4. Reload the page with Ctrl+Shift+R / Cmd+Shift+R to avoid cached files.
5. If still broken, check browser Developer Tools -> Console for Vega-Lite messages.

The chart fixes were statically reviewed, not end-to-end rendered against the live publisher CSVs in this environment. Please visually verify the charts and figures before submitting.

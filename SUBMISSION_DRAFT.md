# Submission template draft — replace placeholders and verify before final upload

**Name:** [your name]

**Student ID:** [your student ID]

**Studio session:** [your studio session]

## Part A — URL of visualisation

[PASTE YOUR PUBLIC, VERIFIED GITHUB PAGES URL HERE]

## Part B — Domain description

**Domain:** My assigned domain is consumer electronics, with a focus on internet-connected devices and their societal and environmental implications. The visualisation examines three complementary dimensions: country-level internet access, cellular service subscriptions and mobile vendor visibility, and formally recycled electronic waste.

**Why and Who:** The intended audience is a general Malaysian reader who uses consumer technology but may not know how connectivity and mobile vendor visibility vary internationally. The goal is to explain how device-enabled internet access has spread unevenly, why subscriptions should not be mistaken for unique smartphone owners, how mobile browsing patterns differ by vendor and market, and how the formal recycling of end-of-life electronics remains uneven. The visualisation is a narrative presentation, not an expert analytics tool.

**What:** Public real-world data are sourced from the ITU via the World Bank (internet use; cellular subscriptions); UN Statistics Division and UNEP (e-waste recycling); UN population estimates; and Statcounter Global Stats (mobile vendor shares in web usage). The original source datasets and links are identified on the webpage. Years differ where source publication schedules differ: connectivity uses a primarily 2024 snapshot, the treemap uses compatible 2023 observations, formal e-waste figures use 2022, and the Statcounter cross-market snapshot uses September 2026. Missing observations are not fabricated. The derived treemap explicitly estimates internet users as population multiplied by the internet-use share. The publisher CSVs can be frozen to compact local copies using `prepare_data.py`.

**How:** Three map idioms communicate distinct geographic comparisons: an Equal Earth choropleth encodes national internet-use percentage using colour luminance; a graduated circle map uses geographic position for country reference locations and circle area for subscriptions per 100 residents; a schematic regional tile-grid map uses equal-sized spatially arranged tiles and colour luminance to compare 2022 formal e-waste recycling rates without implying territorial area. The country-year heatmap enables temporal comparisons; the dumbbell plot reveals change between 2010 and 2024; the violin plot displays country-level distributions by continent; the bump chart focuses on ordinal rank movement; and a treemap shows estimated connected-population magnitudes using area. A vendor–market matrix reveals leading browser-observed brands while preserving missing/not-in-top-six values. A waffle chart translates the documented recycling fraction into 100 units, while a simple relationship chart and annotated line trajectories provide familiar points of reference. Vega-Lite is used for the maps and diagrams, and restrained colour and typography keep attention on interpretable comparisons. Hover tooltips are used only where they help clarify exact figures. The optional year selector is limited to the choropleth map.

**AI disclosure:** Generative AI assistance was used for technical implementation, layout prototyping, code generation, research assistance and language editing; all datasets are attributed to their published providers. [Verify against your unit's required AI disclosure wording before submission.]

## Part C — Sketch

**Sketch PDF public URL:** [LINK TO A PDF PHOTO/SCAN OF YOUR OWN HAND-DRAWN A4 SKETCH ON GITHUB]

[PASTE YOUR OWN CLEAR PHOTO / SCREENSHOT HERE]

## Part D — Full-size screenshot

[INSERT A REAL SCREENSHOT OF YOUR DEPLOYED, WORKING WEB PAGE]

**Do not submit this draft as final until the GitHub page loads in incognito, all 13 charts show actual data, source links work and your tutor confirms that the third map idiom is acceptable.**

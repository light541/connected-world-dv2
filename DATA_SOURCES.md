# Dataset register and documentation

These are real-world public sources. Direct CSV links are included so the user can inspect or download them independently. Data is not fabricated or estimated to fill source gaps.

| ID | Original publisher | Data source | Years in presentation | Measurement |
|---|---|---|---|---|
| D1 | International Telecommunication Union / World Bank | [Internet use (OWID)](https://ourworldindata.org/grapher/share-of-individuals-using-the-internet) | 2005–2024 | % of individuals accessing the internet |
| D2 | International Telecommunication Union / World Bank | [Cellular subscriptions per 100 (OWID)](https://ourworldindata.org/grapher/mobile-cellular-subscriptions-per-100-people) | 2024 | Number of active mobile cellular accounts / 100 residents |
| D3 | UN Statistics Division and UNEP | [E-waste recycling rate (OWID)](https://ourworldindata.org/grapher/electronic-waste-recycling-rate) | 2022 | % of electronic waste formally recycled |
| D4 | UN World Population Prospects | [Country population (OWID)](https://ourworldindata.org/grapher/population-unwpp) | 2023 | People (estimated population) |
| D5 | Statcounter Global Stats | [Worldwide](https://gs.statcounter.com/vendor-market-share/mobile/worldwide), [Malaysia](https://gs.statcounter.com/vendor-market-share/mobile/malaysia), [Asia](https://gs.statcounter.com/vendor-market-share/mobile/asia), [Europe](https://gs.statcounter.com/vendor-market-share/mobile/europe), [India](https://gs.statcounter.com/vendor-market-share/mobile/india), [United States](https://gs.statcounter.com/vendor-market-share/mobile/united-states-of-america) | September 2026 | Share of measured mobile browsing by top six device vendors |

## CSV download endpoints

```
https://ourworldindata.org/grapher/share-of-individuals-using-the-internet.csv?v=1&csvType=full&useColumnShortNames=false
https://ourworldindata.org/grapher/mobile-cellular-subscriptions-per-100-people.csv?v=1&csvType=full&useColumnShortNames=false
https://ourworldindata.org/grapher/electronic-waste-recycling-rate.csv?v=1&csvType=full&useColumnShortNames=false
https://ourworldindata.org/grapher/population-unwpp.csv?v=1&csvType=full&useColumnShortNames=false
```

`data/vendors_2026_09.csv` contains 36 exact values manually transcribed from the six Statcounter mobile vendor market-share pages above, as displayed on 13 October 2026. Pages are cited row by row in the CSV. For transparency, these are the **top six displayed entries**, not a complete cross-vendor census: do **not** sum or infer unreported brands as zero. This is traffic-based observational market share, **not** evidence of sales, sentiment, product quality or brand preference reasons.

The World map comes from [Vega Datasets (world-110m TopoJSON)](https://github.com/vega/vega-datasets/blob/master/data/world-110m.json). ISO-code crosswalk, approximate country reference coordinates and continents are from `pycountry`, `CountryInfo` and the Plotly Gapminder reference listing. All geometry is background context, not a statistical source.

## Data-processing summary

`prepare_data.py` reproduces publisher data, filters to years used in charts, retains original country/code and values, and does **not** interpolate any absent observations. Source datasets may be revised. Country entries in the visualisation use actual published country-year figures; absent data remain missing.

The four OWID CSVs were *not physically downloaded in the build environment* because direct outbound downloads were unavailable; their URLs and source pages were independently checked, and `prepare_data.py` allows reproducible retrieval and smaller website payloads.

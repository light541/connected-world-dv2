#!/usr/bin/env python3
"""Fetch the authentic publisher CSVs and save compact, auditable local files.
Run in a network-connected Python environment before publishing. No imputation."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError
import csv
import io
import sys

ROOT=Path(__file__).parent
SOURCES={
    'access':('https://ourworldindata.org/grapher/share-of-individuals-using-the-internet.csv?v=1&csvType=full&useColumnShortNames=false',lambda y:2005<=y<=2024),
    'subs':('https://ourworldindata.org/grapher/mobile-cellular-subscriptions-per-100-people.csv?v=1&csvType=full&useColumnShortNames=false',lambda y:y==2024),
    'waste':('https://ourworldindata.org/grapher/electronic-waste-recycling-rate.csv?v=1&csvType=full&useColumnShortNames=false',lambda y:y==2022),
    'population':('https://ourworldindata.org/grapher/population-unwpp.csv?v=1&csvType=full&useColumnShortNames=false',lambda y:y==2023)
}
def run():
    output=ROOT/'data'
    output.mkdir(parents=True,exist_ok=True)
    for name,(url,test) in SOURCES.items():
        print('Fetching',name,flush=True)
        request=Request(url,headers={'User-Agent':'Mozilla/5.0 (data visualisation project; academic data citation)'})
        with urlopen(request,timeout=45) as r:
            raw=r.read().decode('utf-8-sig')
        reader=csv.DictReader(io.StringIO(raw))
        headers=reader.fieldnames
        if not headers or not {'Entity','Code','Year'}.issubset(headers):
            raise ValueError(f'{name}: unrecognised OWID CSV schema {headers}')
        value_names=[h for h in headers if h not in {'Entity','Code','Year'}]
        if len(value_names)!=1:raise ValueError(f'{name}: expected one metric, got {value_names}')
        rows=[]
        for row in reader:
            try:y=int(row['Year'])
            except (ValueError,TypeError):continue
            if test(y) and row[value_names[0]].strip():rows.append(row)
        if not rows:raise ValueError(f'{name}: no matching rows; source may have changed')
        buffer=io.StringIO()
        writer=csv.DictWriter(buffer,fieldnames=headers,lineterminator='\n')
        writer.writeheader();writer.writerows(rows)
        out=output/(name+'.csv');out.write_text(buffer.getvalue(),encoding='utf-8')
        print(f'  wrote {len(rows):,} actual observations, {out.stat().st_size/1024:.1f} KiB -> {out.relative_to(ROOT)}')
    print('The original vendor snapshot remains at data/vendors_2026_09.csv.')
    print('Validate observations and test all 13 charts before publishing.')
if __name__=='__main__':
    try:run()
    except (URLError,OSError,ValueError) as e:
        print('Fetch failed:',e,file=sys.stderr);sys.exit(1)

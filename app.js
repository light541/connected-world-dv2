/* FIT3179 / Consumer electronics.
   Published indicators load from local snapshots when present, with OWID as fallback.
   CSVs are never imputed; missing country-years remain missing.
   The approximate map point locations come from the bundled country metadata. */
const DATA = {
  access: 'https://ourworldindata.org/grapher/share-of-individuals-using-the-internet.csv?v=1&csvType=full&useColumnShortNames=false',
  subs: 'https://ourworldindata.org/grapher/mobile-cellular-subscriptions-per-100-people.csv?v=1&csvType=full&useColumnShortNames=false',
  waste: 'https://ourworldindata.org/grapher/electronic-waste-recycling-rate.csv?v=1&csvType=full&useColumnShortNames=false',
  population: 'https://ourworldindata.org/grapher/population-unwpp.csv?v=1&csvType=full&useColumnShortNames=false'
};
const SEA = {SGP:'Singapore',MYS:'Malaysia',THA:'Thailand',VNM:'Vietnam',IDN:'Indonesia',PHL:'Philippines',KHM:'Cambodia',LAO:'Laos',MMR:'Myanmar',BRN:'Brunei',TLS:'Timor-Leste'};
const SEA_CODES = Object.keys(SEA);
const YEARS = [2005,2010,2015,2020,2024];
const COLORS = ['#9bb7b9','#2b7880','#b1a5a3','#d4a786','#567c91'];
const state = {access:[],subs:[],waste:[],population:[],vendors:[],meta:{},year:2024};
const fmt = v => v==null || !Number.isFinite(v) ? '—' : new Intl.NumberFormat('en-MY',{maximumFractionDigits:1}).format(v);
const field = row => Object.keys(row).find(k=>!['Entity','Code','Year'].includes(k));
function parseDataset(text){
  const parsed = d3.csvParse(text);
  const k = parsed.columns.find(k=>!['Entity','Code','Year'].includes(k));
  if(!k)throw Error('Dataset has no value column.');
  return parsed.map(r=>({country:r.Entity, iso:r.Code, year:+r.Year, value:r[k]===''||r[k]==null?null:+r[k]}))
    .filter(r=>r.iso && Number.isFinite(r.year) && Number.isFinite(r.value) && r.value>=0);
}
async function getText(url){let res=await fetch(url);if(!res.ok)throw Error(`${res.status} ${url}`);return res.text();}
async function getSource(name){try{return await getText('data/'+name+'.csv');}catch(err){return getText(DATA[name]);}}
const pick=(arr,year)=>arr.filter(r=>r.year===year);
const pickCode=(arr,year,iso)=>arr.find(r=>r.year===year&&r.iso===iso);
const pickCountry=(arr,year,name)=>arr.find(r=>r.year===year&&r.country===name);
const mapBy=(arr,key)=>new Map(arr.map(r=>[r[key],r]));
const latestValue=(arr, year, code)=>pickCode(arr,year,code)?.value;
const present=(arr)=>arr.length>0;
const normalizeContinent = region => ['Americas','North America','South America'].includes(region) ? 'Americas' : region;
const median = values => {
  const sorted=values.filter(Number.isFinite).slice().sort((a,b)=>a-b);
  if(!sorted.length)return null;
  const m=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2;
};
function insight(id, message){setText(id,message);}
function vendorPairs(rows){
  const malaysia=new Map(rows.filter(r=>r.Market==='Malaysia').map(r=>[r.Vendor,r.Share]));
  return rows.filter(r=>r.Market==='Worldwide'&&r.Vendor!=='Unknown'&&malaysia.has(r.Vendor))
    .map(r=>({vendor:r.Vendor, malaysia:malaysia.get(r.Vendor), worldwide:r.Share,
      gap:malaysia.get(r.Vendor)-r.Share})).sort((a,b)=>b.malaysia-a.malaysia);
}

async function embed(chartId, specId, change) {
  const div=document.getElementById(chartId);
  if(!div)return;
  try{
    const template=await (await fetch('specs/'+specId+'.json')).json();
    const spec=JSON.parse(JSON.stringify(template));
    change(spec);
    const view = await vegaEmbed('#'+chartId,spec,{actions:{export:true,source:false,compiled:false,editor:false},renderer:'svg',tooltip:{theme:'light'}});
    return view;
  }catch(e){console.warn('Chart',chartId,e); div.innerHTML='<p class="error">Chart could not load. Check the data connection and reload. <small>'+String(e.message).replace(/</g,'&lt;')+'</small></p>';}
}
function sectionError(){document.querySelectorAll('.visual').forEach(el=>el.innerHTML='<p class="error">Live source data could not be loaded. Please open through a local web server or GitHub Pages, with internet access.</p>')}
function filterIso(rows,year){return pick(rows,year).filter(d=>d.iso.length===3&&state.meta[d.iso]?.geo_id!=null)}
function setText(id,text){let el=document.getElementById(id);if(el)el.textContent=text;}
function appendSub(id, text){let el=document.getElementById(id);if(el)el.textContent=text;}
function labelData(id, count){let el=document.querySelector(`[data-count="${id}"]`);if(el)el.textContent=`${count} observed records`}

async function draw(){
 const y=state.year, {access,subs,waste,population,meta}=state;
 const net=filterIso(access,y).map(r=>({geo_id:meta[r.iso].geo_id,metric:r.value,country:r.country,year:r.year}));
 await embed('map-access','01_internet_choropleth',s=>{s.transform[0].from.data.values=net;});
 labelData('access',net.length);
 const myUse=pickCode(access,y,'MYS')?.value, globalUse=pickCountry(access,y,'World')?.value;
 if(Number.isFinite(myUse)&&Number.isFinite(globalUse))
   insight('insight-map-access',`In ${y}, Malaysia reported ${fmt(myUse)}% internet use compared with ${fmt(globalUse)}% worldwide — a difference of ${fmt(myUse-globalUse)} percentage points. The map measures access, not phone sales.`);
 else insight('insight-map-access',`The selected year includes ${net.length} mapped country observations; blank regions have no reported match.`);
 const point=pick(subs,2024).filter(r=>meta[r.iso]?.lat!=null&&meta[r.iso]?.lon!=null &&r.iso.length===3&&r.value<=400)
   .map(r=>({...r,metric:r.value,lat:meta[r.iso].lat,lon:meta[r.iso].lon}));
 await embed('map-subs','02_mobile_symbols',s=>{s.layer[1].data.values=point;});
 labelData('subs',point.length);
 const highSubs=point.filter(r=>r.metric>100).length;
 insight('insight-map-subs',`${highSubs} of ${point.length} mapped countries had more than 100 mobile subscriptions per 100 residents in 2024. This can reflect multiple SIM subscriptions, not necessarily more devices than people.`);
 const regionRows={
   'North America':['Northern America (UN)','Northern America'],
   'Latin America & Caribbean':['Latin America and the Caribbean (UN)','Latin America and the Caribbean'],
   'Europe':['Europe (UN)','Europe'], 'Africa':['Africa (UN)','Africa'],
   'Asia':['Asia (UN)','Asia'], 'Oceania':['Oceania (UN)','Oceania']
 };
 const tileLoc={'North America':[0,0],'Latin America & Caribbean':[1,0],'Europe':[0,1],'Africa':[1,1],'Asia':[0,2],'Oceania':[1,3]};
 const tileData=Object.entries(regionRows).map(([region,aliases])=>{
   const match=pick(waste,2022).find(r=>aliases.includes(r.country));
   return match?{region,col:tileLoc[region][1],row:tileLoc[region][0],rate:match.value,year:2022}:null;
 }).filter(Boolean);
 // Render 6 regional tiles; this is a schematic map, not an equal-area geographic map.
 await embed('map-waste','03_recycling_tilemap',s=>{
   s.data.values=tileData;
   s.layer=[{data:{values:tileData},mark:s.mark,encoding:s.encoding},
     {data:{values:tileData},mark:{type:'text',color:'#173342',fontSize:13,fontWeight:700,dy:-13},encoding:{x:{field:'col',type:'ordinal',axis:null},y:{field:'row',type:'ordinal',sort:'ascending',axis:null},text:{field:'region'}}},
     {data:{values:tileData},mark:{type:'text',color:'#173342',fontSize:15,dy:12},encoding:{x:{field:'col',type:'ordinal',axis:null},y:{field:'row',type:'ordinal',sort:'ascending',axis:null},text:{field:'rate',type:'quantitative',format:'.1f'}}}];
   delete s.data;delete s.mark;delete s.encoding;
 });
 labelData('waste',tileData.length);
 const north=tileData.find(r=>r.region==='North America')?.rate, africa=tileData.find(r=>r.region==='Africa')?.rate;
 if(Number.isFinite(north)&&Number.isFinite(africa))
   insight('insight-map-waste',`In the published 2022 regional indicator, North America reported ${fmt(north)}% formal e-waste recycling and Africa ${fmt(africa)}%, a gap of ${fmt(north-africa)} percentage points. Regional rates do not describe total waste tonnage.`);
 const old = mapBy(pick(access,2010),'iso'), now=mapBy(pick(access,2024),'iso');
 const dumb=SEA_CODES.filter(iso=>old.has(iso)&&now.has(iso)).map(iso=>({country:SEA[iso],start:old.get(iso).value,end:now.get(iso).value,gain:now.get(iso).value-old.get(iso).value}));
 await embed('dumbbell','04_asean_dumbbell',s=>s.data.values=dumb);
 if(dumb.length){
  const leader=dumb.slice().sort((a,b)=>b.gain-a.gain)[0];
  insight('insight-dumbbell',`Among the ${dumb.length} Southeast Asian countries with observations for both years, ${leader.country} recorded the largest change: +${fmt(leader.gain)} percentage points between 2010 and 2024.`);
 }
 const matrix=access.filter(r=>SEA[r.iso] && YEARS.includes(r.year)).map(r=>({country:SEA[r.iso],metric:r.value,year:r.year}));
 await embed('heatmap','05_asean_heatmap',s=>s.data.values=matrix);
 insight('insight-heatmap',`These are five benchmark years (2005, 2010, 2015, 2020 and 2024), not annual data. Compare rows to see whether countries' reported internet-use shares become closer over time.`);
 const densityData=[];
 let cats=['Africa','Americas','Asia','Europe','Oceania'];
 const sampled=pick(subs,2024).filter(r=>r.value<=210&&r.value>=0&&meta[r.iso]&&cats.includes(normalizeContinent(meta[r.iso].continent)));
 const kern=(u)=>Math.exp(-.5*u*u)/Math.sqrt(2*Math.PI);
 for(let i=0;i<cats.length;i++){
  const arr=sampled.filter(r=>normalizeContinent(meta[r.iso].continent)===cats[i]).map(r=>r.value);
  if(arr.length<4)continue;
  // Vega-Lite trail marks form the two-sided density silhouette without
  // relying on an area mark's baseline / stacking inference.
  for(let x=0;x<=210;x+=3){
    const density=arr.reduce((sum,v)=>sum+kern((x-v)/13),0)/(arr.length*13);
    densityData.push({continent:cats[i],value:x,row:i,thickness:Math.min(38,density*1500)});
  }
 }
 await embed('violin','06_subscription_violin',s=>{s.data.values=densityData;});
 appendSub('density-count',`${sampled.length} reporting countries, each weighted equally`);
 const groupMedians=cats.map(name=>({name,m:median(sampled.filter(r=>normalizeContinent(meta[r.iso].continent)===name).map(r=>r.value))})).filter(x=>x.m!=null);
 if(groupMedians.length){const upper=groupMedians.slice().sort((a,b)=>b.m-a.m)[0];
  insight('insight-violin',`${upper.name} has the highest median subscription rate in this plotted sample (${fmt(upper.m)} per 100 people). The density excludes values above 210 and is smoothed with a Gaussian kernel (bandwidth 13); country observations carry equal weight.`);
 }
 const bump=[];
 const completeSEA=SEA_CODES.filter(iso=>YEARS.every(yy=>Number.isFinite(pickCode(access,yy,iso)?.value)));
 for(let yy of YEARS){const available=completeSEA.map(iso=>pickCode(access,yy,iso)).sort((a,b)=>b.value-a.value);available.forEach((r,i)=>bump.push({year:yy,country:SEA[r.iso],rank:i+1,metric:r.value}));}
 await embed('bump','07_asean_bump',s=>{s.data.values=bump; s.encoding.y.scale.domain=[Math.max(completeSEA.length,1)+0.5,0.5];});
 insight('insight-bump',`Rankings compare the same ${completeSEA.length} countries with valid observations in all five benchmark years. Rank 1 means the highest internet-use share within that fixed group, not worldwide.`);
 // A self-contained 2023 treemap: internet-user estimate = 2023 population x 2023 internet share.
 const ip=mapBy(pick(access,2023),'iso');
 const pop=pick(population,2023).filter(r=>r.iso.length===3 && ip.has(r.iso) && r.value>0 && meta[r.iso] && meta[r.iso].continent);
 const countryP=pop.map(r=>({country:r.country,continent:normalizeContinent(meta[r.iso].continent),connected:Math.round(r.value*ip.get(r.iso).value/100),penetration:ip.get(r.iso).value})).filter(r=>r.connected>0).sort((a,b)=>b.connected-a.connected).slice(0,32);
 if(countryP.length){
    const grouped=d3.group(countryP,d=>d.continent);
    const tree=d3.hierarchy({name:'Connected populations',children:[...grouped].map(([name,values])=>({name,children:values}))}).sum(d=>d.connected||0);
    d3.treemap().size([100,100]).paddingInner(0.6).paddingOuter(0.35).tile(d3.treemapSquarify)(tree);
    const treedata=tree.leaves().map(n=>({...n.data,x0:n.x0,x1:n.x1,y0:n.y0,y1:n.y1}));
    await embed('treemap','08_connected_treemap',s=>s.data.values=treedata);
 } else await embed('treemap','08_connected_treemap',s=>s.data.values=[]);
 appendSub('treemap-count',`${countryP.length} countries with paired 2023 observations`);
 if(countryP.length){
  const top=countryP[0];
  insight('insight-treemap',`${top.country} has the largest estimated connected population among the 32 countries shown (approximately ${fmt(top.connected/1e6)} million in 2023). Rectangle sizes are estimates based on population multiplied by internet-use percentage.`);
 }
 const subsMap=mapBy(pick(subs,2024),'iso');
 const scatter=pick(access,2024).filter(r=>subsMap.has(r.iso)&&meta[r.iso]?.geo_id && r.iso.length===3 && subsMap.get(r.iso).value<250)
 .map(r=>({country:r.country,iso:r.iso,internet:r.value,subscriptions:subsMap.get(r.iso).value}));
 await embed('scatter','09_subscriptions_vs_access',s=>s.data.values=scatter);
 appendSub('scatter-count',`${scatter.length} countries with both indicators`);
 const myScatter=scatter.find(r=>r.iso==='MYS');
 if(myScatter)insight('insight-scatter',`Malaysia appears at ${fmt(myScatter.subscriptions)} mobile subscriptions per 100 people and ${fmt(myScatter.internet)}% internet use in 2024. The two measurements have different denominators and are not interchangeable.`);
 await embed('vendors','13_vendor_matrix',s=>{s.data.values=state.vendors;});
 const vendorMatch=vendorPairs(state.vendors);
 await embed('vendor-contrast','14_vendor_slope',s=>{s.data.values=vendorMatch.flatMap(r=>[
   {vendor:r.vendor,market:'Malaysia',share:r.malaysia},
   {vendor:r.vendor,market:'Worldwide',share:r.worldwide}
 ]);});
 appendSub('vendor-pair-count',`${vendorMatch.length} vendors reported in both top-six lists`);
 const apple=vendorMatch.find(r=>r.vendor==='Apple');
 if(apple)insight('insight-vendors',`Apple accounted for ${fmt(apple.malaysia)}% of measured mobile browsing in Malaysia versus ${fmt(apple.worldwide)}% worldwide in September 2026, a gap of ${fmt(apple.gap)} percentage points. This is browsing share, not shipment share or buying preferences.`);
 insight('insight-vendor-contrast',`Only vendors appearing in BOTH published top-six lists are paired. A missing vendor is not assigned zero. The slope connects two markets in the same month; it does not represent a change over time.`);
 let worldWaste=pickCountry(waste,2022,'World')?.value;
 let waffle=[];
 if(Number.isFinite(worldWaste)){
    for(let i=0;i<100;i++)waffle.push({column:i%10,row:Math.floor(i/10),state:i<Math.round(worldWaste)?'Recycled':'Not documented as recycled'});
 }
 await embed('waffle','10_recycling_waffle',s=>s.data.values=waffle);
 setText('waffle-note',Number.isFinite(worldWaste)?`The tiles round ${fmt(worldWaste)}% to the nearest whole tile; the original figure is shown above. The remainder does not necessarily mean landfill disposal.`:'World total is unavailable from the source.');
 // Show every country with a reported observation, up to 14, rather than a predefined shortlist.
 // The source's sparse coverage is clearly disclosed below the ranking.
 const wasteCountries=pick(waste,2022).filter(r=>r.iso.length===3&&meta[r.iso]?.geo_id!=null&&r.value<=100)
   .map(r=>({country:r.country,rate:r.value})).sort((a,b)=>b.rate-a.rate).slice(0,14);
 await embed('waste-ranking','11_waste_country_ranking',s=>s.data.values=wasteCountries);
 appendSub('waste-country-count',`${wasteCountries.length} reporting countries shown (2022); incomplete coverage`);
 insight('insight-waste-ranking',`Only ${wasteCountries.length} reporting countries appear in this view; missing countries are omitted, not assigned zero. A reported 100% value refers to the published indicator and should not be interpreted as independently verified recovery of every discarded device.`);
 const trajCodes=['MYS','SGP','IDN','VNM','PHL'];
 const trajectories=access.filter(r=>r.year>=2005&&r.year<=2024&&(trajCodes.includes(r.iso)||r.country==='World'))
 .map(r=>({country:r.country==='World'?'World':SEA[r.iso],year:r.year,metric:r.value}));
 await embed('trajectories','12_access_trajectories',s=>s.data.values=trajectories);
 {const v=pickCountry(access,2024,'World')?.value;setText('kpi-access',Number.isFinite(v)?fmt(v)+'%':'—');}
 {const v=pickCountry(subs,2024,'World')?.value;setText('kpi-mobile',Number.isFinite(v)?fmt(v):'—');}
 setText('kpi-waste',Number.isFinite(worldWaste)?fmt(worldWaste)+'%':'—');
 const m2010=latestValue(access,2010,'MYS'),m2024=latestValue(access,2024,'MYS');
 setText('malaysia-insight',Number.isFinite(m2010)&&Number.isFinite(m2024)
  ?`Malaysia's share of internet users increased from ${fmt(m2010)}% in 2010 to ${fmt(m2024)}% in 2024 — an increase of ${fmt(m2024-m2010)} percentage points.`
  :'Malaysia’s change is displayed when both years are available.');
 setText('status',`Source datasets loaded · ${net.length} countries on access map · ${tileData.length} regions on waste map`);
}
async function boot(){
 try {
   setText('status','Loading published data from source organisations…');
   const [accessText,subsText,wasteText,popText,meta,vendorCSV]=await Promise.all([getSource('access'),getSource('subs'),getSource('waste'),getSource('population'),fetch('data/country_meta.json').then(r=>r.json()),getText('data/vendors_2026_09.csv')]);
   state.access=parseDataset(accessText);state.subs=parseDataset(subsText);state.waste=parseDataset(wasteText);state.population=parseDataset(popText);state.vendors=d3.csvParse(vendorCSV).map(d=>({...d,Share:+d.Share}));state.meta=meta;
   if(!state.access.length || !state.subs.length || !state.waste.length)throw Error('At least one source returned zero valid observations');
   const picker=document.getElementById('year-picker');
   picker.onchange=async ev=>{
     state.year=Number(ev.target.value);setText('access-year',state.year);
     const mapped=filterIso(state.access,state.year).map(r=>({geo_id:meta[r.iso].geo_id,metric:r.value,country:r.country,year:r.year}));
     document.getElementById('map-access').innerHTML='<span class="loading">Updating map…</span>';
     await embed('map-access','01_internet_choropleth',s=>{s.transform[0].from.data.values=mapped;});
     labelData('access',mapped.length);
     const local=pickCode(state.access,state.year,'MYS')?.value;
     const worldwide=pickCountry(state.access,state.year,'World')?.value;
     insight('insight-map-access',Number.isFinite(local)&&Number.isFinite(worldwide)
        ?`In ${state.year}, Malaysia reported ${fmt(local)}% internet use compared with ${fmt(worldwide)}% worldwide — a difference of ${fmt(local-worldwide)} percentage points. The map measures access, not phone sales.`
        :`${mapped.length} countries have mapped observations for ${state.year}; uncoloured countries have no reported match.`);
   };
   await draw();
 } catch(err){console.error(err);setText('status','Dataset connection failed: '+err.message);sectionError();try{const t=await getText('data/vendors_2026_09.csv');await embed('vendors','13_vendor_matrix',s=>{s.data.values=d3.csvParse(t).map(r=>({...r,Share:+r.Share}));});}catch(_){} }
}
document.addEventListener('DOMContentLoaded',boot);

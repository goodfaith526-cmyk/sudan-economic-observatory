// ══ NUMBER FORMATTING ══
function fmt(v){
  const a=Math.abs(v),s=v<0?'-':'';
  if(a>=1000000) return s+'$'+(a/1000000).toFixed(2)+'B';
  if(a>=1000) return s+'$'+(a/1000).toFixed(0)+'M';
  return s+'$'+Math.round(a).toLocaleString()+'K';
}
function fmtBal(v){
  const a=Math.abs(v)/1000000,s=v<0?'-':'+';
  return s+'$'+a.toFixed(2)+'B';
}

// ══ DATABASE ══
const DB_KEY='seo_obs_v2';
const MN=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const QN=['Q1 يناير–مارس','Q2 أبريل–يونيو','Q3 يوليو–سبتمبر','Q4 أكتوبر–ديسمبر'];
const CLRS=['#1b3a6b','#2952a3','#0a7c4e','#b91c1c','#b5640a','#6b21a8','#0e7490','#be185d','#4d7c0f','#0369a1','#92400e','#1e40af'];
const RBDG={'عربي':'r-arab','إفريقيا':'r-afr','آسيا':'r-asia','أوروبا':'r-eur','صناعي':'r-ind'};

const SEED = window.SEO_DATA.SEED;
// pending xlsx import result (set by teXlsxFileSelected, consumed by teApproveXlsxBatch)
window._pendingXlsxImport = null;

function loadDB(){
  return window.SEO_SERVICES.trade.loadDatabase(SEED);
}
function saveDB(){
  window.SEO_SERVICES.trade.saveDatabase(DB,SEED);
}
let DB=loadDB();
function cleanupTradeDebugStorage(){
  const saved=window.SEO_SERVICES.storage.getJSON(DB_KEY,null);
  if(!saved) return {changed:false};
  const normalized=window.SEO_SERVICES.trade.ensureNormalizedShape({
    sourceFiles:saved.sourceFiles,
    importBatches:saved.importBatches,
    draftObservations:saved.draftObservations,
    observations:saved.observations,
    publishedTotals:saved.publishedTotals,
    validationResults:saved.validationResults,
    extractionRules:saved.extractionRules,
    activeYearBatches:saved.activeYearBatches,
    activeYearRuleBatches:saved.activeYearRuleBatches,
  });
  const hadPageText=(normalized.importBatches||[]).some(batch=>Array.isArray(batch.debugPreviewPages)&&batch.debugPreviewPages.length);
  const compact=window.SEO_SERVICES.trade.compactNormalizedForStorage(normalized);
  saved.sourceFiles=compact.sourceFiles;
  saved.importBatches=compact.importBatches;
  saved.draftObservations=compact.draftObservations;
  saved.observations=compact.observations;
  saved.publishedTotals=compact.publishedTotals;
  saved.validationResults=compact.validationResults;
  saved.extractionRules=compact.extractionRules;
  saved.activeYearBatches=compact.activeYearBatches;
  saved.activeYearRuleBatches=compact.activeYearRuleBatches;
  window.SEO_SERVICES.storage.setJSON(DB_KEY,saved);
  return {changed:hadPageText};
}
try{cleanupTradeDebugStorage();}catch(err){console.warn('Trade debug cleanup skipped:',err.message);}
function ensureTradeStorageShape(){
  const saved=window.SEO_SERVICES.storage.getJSON(DB_KEY,{});
  if(!Array.isArray(saved.sourceFiles)||!Array.isArray(saved.importBatches)||!Array.isArray(saved.observations)||!Array.isArray(saved.draftObservations)||!Array.isArray(saved.validationResults)||!Array.isArray(saved.extractionRules)) saveDB();
}
ensureTradeStorageShape();
function migrate2013CommodityNormalization(){
  const normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{});
  const normalize=window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation?.bind(window.SEO_SERVICES.commodity);
  if(!normalize) return {normalizedCount:0,unmappedCount:0,duplicateGroupsResolved:0};
  const targetRule='cbos-2013-exports-summary-v1';
  let normalizedCount=0,unmappedCount=0;
  let periodMetadataCount=0;
  const beforeGroups=new Set();
  const afterGroups=new Set();
  const apply=(row)=>{
    if(row.extractionRuleId!==targetRule) return row;
    beforeGroups.add(row.commodityName||row.rawCommodityName||'');
    const next=normalize(row);
    let rowPeriodChanged=false;
    if(!next.publicationIssue){
      next.publicationIssue={
        source:'CBOS Foreign Trade Statistical Digest',
        issueYear:2013,
        issuePeriod:'Q4',
        issueLabel:'Q4 2013',
      };
      periodMetadataCount+=1;
      rowPeriodChanged=true;
    }
    if(!next.coveredEconomicPeriod){
      next.coveredEconomicPeriod={
        year:2013,
        periodType:'annual',
        startMonth:1,
        endMonth:12,
        label:'Annual 2013 Jan-Dec',
      };
      periodMetadataCount+=1;
      rowPeriodChanged=true;
    }
    next.periodType='annual';
    next.quarter=null;
    next.month=null;
    afterGroups.add(next.commodityId||next.commodityName||'');
    if(next.commodityNormalizationStatus==='unmapped') unmappedCount+=1;
    const changed=next.commodityId!==row.commodityId||next.commodityName!==row.commodityName||next.rawCommodityName!==row.rawCommodityName||rowPeriodChanged;
    if(changed) normalizedCount+=1;
    return next;
  };
  normalized.observations=(normalized.observations||[]).map(apply);
  normalized.draftObservations=(normalized.draftObservations||[]).map(apply);
  DB.normalized=normalized;
  const approvedRows=normalized.observations.filter(row=>row.extractionRuleId===targetRule&&String(row.year)==='2013'&&row.isPublished);
  if(approvedRows.length){
    const total=approvedRows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
    teApply2013ExportSummaryLegacyAdapter(approvedRows,total);
  }
  if(normalizedCount||periodMetadataCount||approvedRows.length) saveDB();
  return {normalizedCount,unmappedCount,periodMetadataCount,duplicateGroupsResolved:Math.max(0,beforeGroups.size-afterGroups.size)};
}
let commodityMigrationResult=migrate2013CommodityNormalization();
function migrate2013RuleApprovalRegistry(){
  const normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{});
  const rules=[
    {ruleId:'cbos-2013-exports-summary-v1',flow:'export'},
    {ruleId:'cbos-2013-imports-summary-v1',flow:'import'},
  ];
  let backfilledCount=0;
  normalized.activeYearRuleBatches={...(normalized.activeYearRuleBatches||{})};
  rules.forEach(({ruleId,flow})=>{
    const approvedRows=(normalized.observations||[]).filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow===flow&&row.extractionRuleId===ruleId&&row.approvedBatchId);
    if(!approvedRows.length) return;
    const batchIds=[...new Set(approvedRows.map(row=>row.approvedBatchId))];
    batchIds.forEach(batchId=>{
      const batch=normalized.importBatches.find(item=>item.id===batchId);
      if(!batch) return;
      batch.ruleApprovals={...(batch.ruleApprovals||{})};
      if(batch.ruleApprovals[ruleId]?.status==='approved') return;
      const rowsForBatch=approvedRows.filter(row=>row.approvedBatchId===batchId);
      const total=(normalized.publishedTotals||[])
        .filter(total=>total.importBatchId===batchId&&String(total.year)==='2013'&&total.flow===flow&&total.extractionRuleId===ruleId)
        .reduce((sum,total)=>sum+(Number(total.valueUsdThousand)||0),0) || rowsForBatch.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
      const approvedAt=rowsForBatch.map(row=>row.publishedAt).filter(Boolean).sort().slice(-1)[0]||batch.approvedAt||new Date().toISOString();
      batch.ruleApprovals[ruleId]={
        status:'approved',
        flow,
        approvedAt,
        approvedRowsCount:rowsForBatch.length,
        approvedTotalValueUsdThousand:total,
        year:2013,
        backfilledAt:new Date().toISOString(),
      };
      batch.status='approved';
      batch.approvedYear=2013;
      batch.approvedAt=batch.approvedAt||approvedAt;
      batch.approvedRuleId=batch.approvedRuleId||ruleId;
      normalized.activeYearRuleBatches[`2013:${ruleId}`]=batchId;
      if(ruleId==='cbos-2013-exports-summary-v1'){
        normalized.activeYearBatches={...(normalized.activeYearBatches||{}),2013:normalized.activeYearBatches?.['2013']||batchId};
      }
      backfilledCount+=1;
    });
  });
  DB.normalized=normalized;
  if(backfilledCount) saveDB();
  return {backfilledCount};
}
let ruleApprovalMigrationResult=migrate2013RuleApprovalRegistry();

// ══ NAV ══
let isAdmin=false;
function nav(pg){
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nt').forEach(n=>n.classList.remove('on'));
  document.getElementById('pg-'+pg).classList.add('on');
  document.querySelectorAll('.nt').forEach(n=>{if(n.getAttribute('onclick')?.includes("'"+pg+"'"))n.classList.add('on');});
  window.scrollTo({top:0,behavior:'smooth'});
  if(pg==='trade'){teInit();setTimeout(()=>teRun(),50);}
  if(pg==='market') mpInit();
  if(pg==='macro') macroInit();
  if(pg==='forum') fRender();
  if(pg==='library') libRender();
  if(pg==='gaps') gapsRender();
}
function toggleAdmin(){
  if(isAdmin){isAdmin=false;document.querySelectorAll('.admin-upload').forEach(el=>el.classList.remove('show'));return;}
  openAdminLogin();
}
function openAdminLogin(){
  const msg=document.getElementById('admin-login-msg'),pass=document.getElementById('admin-pass');
  if(msg){msg.style.display='none';msg.textContent='';}
  if(pass) pass.value='';
  openModal('admin-modal');
  setTimeout(()=>pass?.focus(),50);
}
function closeAdminLogin(){closeModal('admin-modal');}
function adminLoginConfirm(){
  const pass=document.getElementById('admin-pass')?.value||'';
  const msg=document.getElementById('admin-login-msg');
  if(pass==='cbos2025'){
    isAdmin=true;document.querySelectorAll('.admin-upload').forEach(el=>el.classList.add('show'));
    if(msg){msg.style.display='flex';msg.style.color='var(--exp)';msg.textContent='✅ وضع الإدارة مفعّل';}
    setTimeout(()=>closeAdminLogin(),350);
  }else if(msg){
    msg.style.display='flex';msg.style.color='var(--imp)';msg.textContent='كلمة المرور غير صحيحة';
  }
}

// ══ TRADE EXPLORER ══
let TS={type:'exp',view:'commodity',yr:'2025',per:'monthly',chart:'table'};
let TCHART=null,tLL=[],tLD=[],tLD2=[],TE_LAST_EXPORT=null;

function teInit(){
  const sc=document.getElementById('s-com');
  const yrMode=document.getElementById('s-year-mode')?.value||'single';
  const yr=TS.yr==='annual'?'2025':TS.yr;
  const yrD=DB.years[yr]||DB.years['2025'];
  const yearPool=yrMode==='single'?[yrD]:Object.keys(DB.years).map(y=>DB.years[y]);
  const allC=[...new Map(yearPool.flatMap(y=>[...(y.exp_com||[]),...(y.imp_com||[])]).map(x=>[x.n,x])).values()];
  sc.innerHTML='<option value="all">— كل السلع —</option>';
  allC.forEach(c=>sc.innerHTML+=`<option value="${c.n}">${c.n}</option>`);
  const sct=document.getElementById('s-ctr');
  const allCtrs=[...new Map(yearPool.flatMap(y=>[...(y.exp_ctr||[]),...(y.imp_ctr||[])]).map(x=>[x.n,x])).values()].sort((a,b)=>a.n.localeCompare(b.n,'ar'));
  sct.innerHTML='<option value="all">— كل الدول —</option>';
  allCtrs.forEach(c=>sct.innerHTML+=`<option value="${c.n}">${c.n}</option>`);
  // Year select
  const yrs=Object.keys(DB.years).sort((a,b)=>b-a);
  document.getElementById('s-yr').innerHTML=yrs.map(y=>`<option value="${y}">${y}</option>`).join('')+'<option value="annual">2015–2025 سنوي</option>';
  const ascYears=yrs.slice().sort((a,b)=>a-b);
  const rangeOpts=ascYears.map(y=>`<option value="${y}">${y}</option>`).join('');
  const fromSel=document.getElementById('s-from-yr'),toSel=document.getElementById('s-to-yr');
  const fromCur=fromSel?.value,toCur=toSel?.value;
  if(fromSel){fromSel.innerHTML=rangeOpts;fromSel.value=ascYears.includes(fromCur)?fromCur:(ascYears[0]||'2024');}
  if(toSel){toSel.innerHTML=rangeOpts;toSel.value=ascYears.includes(toCur)?toCur:(ascYears[ascYears.length-1]||'2025');}
  teUpdateYearModeUI();
  teUpdateDB();
}
function teYearModeChanged(){teUpdateYearModeUI();teInit();teRun();}
function teUpdateYearModeUI(){
  const mode=document.getElementById('s-year-mode')?.value||'single';
  const yearWrap=document.getElementById('s-yr')?.closest('.fg');
  const fromWrap=document.getElementById('fg-from-yr'),toWrap=document.getElementById('fg-to-yr');
  if(yearWrap) yearWrap.style.display=mode==='single'?'':'none';
  if(fromWrap) fromWrap.style.display=mode==='range'?'':'none';
  if(toWrap) toWrap.style.display=mode==='range'?'':'none';
  const per=document.getElementById('s-per');
  if(per){
    [...per.options].forEach(opt=>{opt.disabled=mode!=='single'&&opt.value!=='annual';});
    if(mode!=='single'&&per.value!=='annual') per.value='annual';
  }
  const period=per?.value||'monthly';
  const qWrap=document.getElementById('fg-quarter'),mWrap=document.getElementById('fg-month');
  if(qWrap) qWrap.style.display=mode==='single'&&period==='quarterly'?'':'none';
  if(mWrap) mWrap.style.display=mode==='single'&&period==='monthly'?'':'none';
}
function teUpdateDB(){
  const yrs=Object.keys(DB.years);
  document.getElementById('te-years-count').textContent=yrs.length;
  document.getElementById('te-records').textContent=yrs.reduce((s,y)=>s+(DB.years[y].exp_com?.length||0)+(DB.years[y].imp_com?.length||0)+(DB.years[y].exp_ctr?.length||0)+(DB.years[y].imp_ctr?.length||0)+24,0);
  document.getElementById('te-last-update').textContent=DB.sources.slice(-1)[0]?.added?.slice(0,7)||'—';
  document.getElementById('te-year-chips').innerHTML=yrs.map(y=>`<span class="ychip on">${y}</span>`).join('');
  tePdfDebugLoadLatest();
}
function setT(t,btn){
  TS.type=t;
  document.querySelectorAll('#seg-t button').forEach(b=>b.className='');
  btn.className='on-'+t[0];
  TS.yr=document.getElementById('s-yr')?.value||'2025';
  TS.per=document.getElementById('s-per')?.value||'monthly';
  teRun();
}
function setV(v,btn){
  TS.view=v;
  document.querySelectorAll('#seg-v button').forEach(b=>b.className='');
  btn.className='on';
  TS.yr=document.getElementById('s-yr')?.value||'2025';
  TS.per=document.getElementById('s-per')?.value||'monthly';
  teRun();
}
function teShowView(v){
  TS.chart=v;
  ['tbl','bar','line','pie'].forEach(x=>document.getElementById('vt-'+x).className='vt'+(x===v.replace('table','tbl')?' on':''));
  const tv=document.getElementById('te-tbl-view'),cv=document.getElementById('te-chart-view');
  if(v==='table'){tv.style.display='';cv.style.display='none';}
  else{tv.style.display='none';cv.style.display='block';if(TS.type==='bal') tDrawBal(v);else tDrawChart(v);}
}

function teBuildQuery(selC,selCtr){
  const yearMode=document.getElementById('s-year-mode')?.value||'single';
  let periodMode=document.getElementById('s-per')?.value||'monthly';
  if(yearMode!=='single') periodMode='annual';
  const year=document.getElementById('s-yr')?.value||TS.yr||'2025';
  const yrs=Object.keys(DB.years).sort((a,b)=>a-b);
  return {
    yearMode:year==='annual'?'all':yearMode,
    year:year==='annual'?(yrs[yrs.length-1]||'2025'):year,
    fromYear:document.getElementById('s-from-yr')?.value||yrs[0]||'2024',
    toYear:document.getElementById('s-to-yr')?.value||yrs[yrs.length-1]||'2025',
    periodMode,
    flow:TS.type==='exp'?'export':TS.type==='imp'?'import':'balance',
    view:TS.view,
    commodityName:selC||'all',
    countryName:selCtr||'all',
    region:'all',
    month:document.getElementById('s-month')?.value||'all',
    quarter:document.getElementById('s-quarter')?.value||'all',
  };
}
function teShouldUseNormalized(q){
  if(q.yearMode!=='single') return true;
  return q.periodMode==='annual'||q.periodMode==='monthly';
}
function teRenderQueryResult(result,isExp){
  if(!result) return false;
  document.getElementById('te-title').textContent=result.title;
  teUpdatePeriodLayerIndicator(result);
  tLL=result.labels;tLD=result.data;tLD2=result.data2||[];
  if(result.warning){
    document.getElementById('te-thead').innerHTML='';
    document.getElementById('te-tbody').innerHTML=`<tr><td colspan="5" style="padding:24px;color:var(--imp);text-align:center">${teEsc(result.warning)}</td></tr>`;
    TE_LAST_EXPORT={fn:'trade_period_layer_guard',rows:[['warning'],[result.warning]]};
    if(TCHART){TCHART.destroy();TCHART=null;}
    return true;
  }
  if(!result.rows.length){
    document.getElementById('te-thead').innerHTML='';
    document.getElementById('te-tbody').innerHTML='<tr><td colspan="4" style="padding:24px;color:var(--t3);text-align:center">لا توجد بيانات مطابقة للفلاتر الحالية</td></tr>';
    TE_LAST_EXPORT={fn:'trade_query_empty',rows:[['لا توجد بيانات']]};
    return true;
  }
  if(result.isBalance){
    tRenderBalTable(result.rows);
    TE_LAST_EXPORT={fn:'trade_balance_query',rows:[['الفترة','الصادرات (ألف $)','الواردات (ألف $)','الميزان (ألف $)'],...result.rows.map(r=>[r.lb,r.e,r.i,r.b])]};
    if(TS.chart!=='table') tDrawBal(TS.chart);
    return true;
  }
  tRenderTable(result.rows,isExp);
  TE_LAST_EXPORT={fn:'trade_query',rows:[['البند','القيمة (ألف $)'],...result.rows.map(r=>[r.lb,r.v])]};
  if(TS.chart!=='table') tDrawChart(TS.chart);
  return true;
}
function teUpdatePeriodLayerIndicator(resultOrLayer){
  const el=document.getElementById('te-period-layer');
  if(!el) return;
  const result=typeof resultOrLayer==='string'?{periodLayer:resultOrLayer,periodLayerLabel:resultOrLayer}:resultOrLayer||{};
  const label=result.periodLayerLabel||'annual summary layer';
  const suffix=result.warning?` · ⚠ ${result.warning}`:'';
  el.textContent=`القيمة بالمليار / المليون / الألف دولار | CBOS — بيانات أولية | ${label}${suffix}`;
}
function teUpdateCoverageNotice(q){
  const note=document.getElementById('te-coverage-note');
  if(!note) return;
  const is2013=q?.yearMode==='single'&&String(q.year)==='2013';
  note.style.display=is2013?'flex':'none';
  const readiness=teTradeBalanceReadiness();
  note.textContent=is2013
    ? readiness.balanceReady
      ? `2013 includes approved annual export and import summary data${teHasApproved2013MonthlyExports()?`, plus approved monthly export time-series data`:''}. Annual trade balance: ${readiness.balance.toLocaleString()} ألف دولار. Quarterly and country-level data are not yet available.`
      : '2013 currently includes approved export summary data only. Imports, monthly, quarterly, and country-level data are not yet available.'
    : '';
}
function teHasApproved2013MonthlyExports(){
  return (DB.normalized?.observations||[]).some(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='export'&&row.periodType==='monthly'&&row.extractionRuleId==='cbos-2013-monthly-exports-v1');
}
function teIsUnavailable2013View(q){
  if(q.yearMode!=='single'||String(q.year)!=='2013') return false;
  const readiness=teTradeBalanceReadiness();
  if(q.flow==='balance') return !readiness.balanceReady;
  if(q.flow==='import') return !(readiness.importApproved&&q.periodMode==='annual'&&q.view!=='country');
  if(q.flow!=='export') return true;
  if(q.periodMode==='monthly') return !teHasApproved2013MonthlyExports();
  if(q.periodMode!=='annual') return true;
  if(q.view==='country') return true;
  return false;
}
function teRenderUnavailable2013(q){
  const reason=q.flow==='balance'?'annual trade balance requires approved imports summary data.':q.flow==='import'?'imports summary is not approved yet, or the selected 2013 import view is not available.':q.flow!=='export'?'imports and trade balance are not yet available for 2013.':q.periodMode==='monthly'?'monthly 2013 exports are not approved yet.':q.periodMode!=='annual'?'quarterly 2013 data is not yet available.':'country-level 2013 data is not yet available.';
  document.getElementById('te-title').textContent='2013 partial coverage';
  teUpdatePeriodLayerIndicator(q.periodMode==='monthly'?'monthly time-series layer':q.periodMode==='annual'?'annual summary layer':'unavailable period layer');
  document.getElementById('te-thead').innerHTML='';
  document.getElementById('te-tbody').innerHTML=`<tr><td colspan="5" style="padding:24px;color:var(--t3);text-align:center">2013 currently includes export summary data only. ${reason}</td></tr>`;
  tLL=[];tLD=[];tLD2=[];
  TE_LAST_EXPORT={fn:'trade_2013_partial_coverage',rows:[['message'],[`2013 currently includes export summary data only. ${reason}`]]};
  if(TCHART){TCHART.destroy();TCHART=null;}
  return true;
}

function teRun(){
  TS.yr=document.getElementById('s-yr').value;
  TS.per=document.getElementById('s-per').value;
  const selC=document.getElementById('s-com').value;
  const selCtr=document.getElementById('s-ctr').value;
  teUpdateYearModeUI();
  const tradeQuery=teBuildQuery(selC,selCtr);
  teUpdateCoverageNotice(tradeQuery);
  if(teIsUnavailable2013View(tradeQuery)){
    teRenderUnavailable2013(tradeQuery);
    return;
  }
  if(teShouldUseNormalized(tradeQuery)){
    const result=window.SEO_SERVICES.trade.query(DB.normalized,tradeQuery);
    if(teRenderQueryResult(result,TS.type==='exp')) return;
  }
  const yrD=TS.yr==='annual'?null:DB.years[TS.yr];
  const isExp=TS.type==='exp';let L=[],D=[],D2=[],rows=[],title='';

  if(TS.type==='bal'){
    if(TS.yr==='annual'){title='الميزان التجاري 2015–2025';L=DB.annual.map(r=>r.y);D=DB.annual.map(r=>r.e);D2=DB.annual.map(r=>r.i);rows=DB.annual.map(r=>({type:'bal',lb:r.y,e:r.e,i:r.i,b:r.e-r.i}));}
    else{const src=TS.per==='monthly'?yrD.monthly_e:yrD.quarterly_e,srcI=TS.per==='monthly'?yrD.monthly_i:yrD.quarterly_i,lbs=TS.per==='monthly'?MN:QN;let idxs=src.map((_,i)=>i);if(TS.per==='monthly'){const m=document.getElementById('s-month')?.value||'all';if(m!=='all')idxs=[Number(m)-1];}else{const q=document.getElementById('s-quarter')?.value||'all';if(q!=='all')idxs=[Number(q)-1];}title=`الميزان التجاري ${TS.yr}`;L=idxs.map(i=>lbs[i]);D=idxs.map(i=>src[i]||0);D2=idxs.map(i=>srcI[i]||0);rows=idxs.map(i=>({type:'bal',lb:lbs[i],e:src[i]||0,i:srcI[i]||0,b:(src[i]||0)-(srcI[i]||0)}));}
    document.getElementById('te-title').textContent=title;teUpdatePeriodLayerIndicator('annual summary layer');tLL=L;tLD=D;tLD2=D2;
    TE_LAST_EXPORT={fn:'trade_balance',rows:[['الفترة','الصادرات (ألف $)','الواردات (ألف $)','الميزان (ألف $)'],...rows.map(r=>[r.lb,r.e,r.i,r.b])]};
    tRenderBalTable(rows);if(TS.chart!=='table') tDrawBal(TS.chart);return;
  }

  if(!yrD&&TS.yr!=='annual'){
    document.getElementById('te-title').textContent='لا توجد بيانات للسنة المختارة';teUpdatePeriodLayerIndicator(TS.per==='monthly'?'monthly time-series layer':TS.per==='annual'?'annual summary layer':'quarterly time-series layer');
    document.getElementById('te-thead').innerHTML='';
    document.getElementById('te-tbody').innerHTML='<tr><td colspan="4" style="padding:24px;color:var(--t3);text-align:center">لا توجد بيانات — ارفع ملف CBOS لهذه السنة من خلال قسم الإدارة</td></tr>';return;
  }

  const comSrc=isExp?(yrD?.exp_com||[]):(yrD?.imp_com||[]);
  const ctrSrc=isExp?(yrD?.exp_ctr||[]):(yrD?.imp_ctr||[]);

  if(TS.view==='commodity'){
    if(selC!=='all'&&yrD){
      const com=comSrc.find(c=>c.n===selC);
      if(com?.mon&&TS.per==='monthly'){const m=document.getElementById('s-month')?.value||'all';const idxs=m==='all'?MN.map((_,i)=>i):[Number(m)-1];title=`${isExp?'صادرات':'واردات'} ${selC} — ${TS.yr} شهري`;L=idxs.map(i=>MN[i]);D=idxs.map(i=>com.mon[i]||0);rows=L.map((l,i)=>({type:'single',lb:l,v:D[i]}));}
      else if(com?.mon&&TS.per==='quarterly'){const q=document.getElementById('s-quarter')?.value||'all';const allQ=QN.map((_,qi)=>(com.mon||[]).slice(qi*3,(qi+1)*3).reduce((s,v)=>s+v,0));const idxs=q==='all'?QN.map((_,i)=>i):[Number(q)-1];title=`${isExp?'صادرات':'واردات'} ${selC} — ${TS.yr} ربع سنوي`;L=idxs.map(i=>QN[i]);D=idxs.map(i=>allQ[i]||0);rows=L.map((l,i)=>({type:'single',lb:l,v:D[i]}));}
      else{title=`${isExp?'صادرات':'واردات'} ${selC} — ${TS.yr}`;L=[TS.yr];D=[com?.v||0];rows=[{type:'single',lb:TS.yr,v:com?.v||0}];}
    }else if(TS.yr==='annual'){title=`${isExp?'الصادرات':'الواردات'} السنوية 2015–2025`;L=DB.annual.map(r=>r.y);D=DB.annual.map(r=>isExp?r.e:r.i);rows=DB.annual.map(r=>({type:'single',lb:r.y,v:isExp?r.e:r.i}));}
    else{title=`${isExp?'الصادرات':'الواردات'} حسب السلعة — ${TS.yr}`;L=comSrc.map(c=>c.n);D=comSrc.map(c=>c.v);rows=comSrc.map((c,i)=>({type:'commodity',rank:i+1,lb:c.n,v:c.v,p:c.p}));}
  }else if(TS.view==='country'){
    if(TS.yr==='annual'){title=`${isExp?'الصادرات':'الواردات'} السنوية 2015–2025`;L=DB.annual.map(r=>r.y);D=DB.annual.map(r=>isExp?r.e:r.i);rows=DB.annual.map(r=>({type:'single',lb:r.y,v:isExp?r.e:r.i}));}
    else{const filtered=selCtr==='all'?ctrSrc.slice(0,15):ctrSrc.filter(c=>c.n===selCtr);const tot=comSrc.reduce((s,c)=>s+c.v,0);title=`${isExp?'أهم وجهات التصدير':'أهم مصادر الاستيراد'} — ${TS.yr}`;L=filtered.map(c=>c.n);D=filtered.map(c=>c.v);rows=filtered.map((c,i)=>({type:'country',rank:i+1,lb:c.n,v:c.v,r:c.r,pct:tot?(c.v/tot*100).toFixed(1):'—'}));}
  }else{
    if(TS.yr==='annual'){title=`${isExp?'الصادرات':'الواردات'} السنوية`;L=DB.annual.map(r=>r.y);D=DB.annual.map(r=>isExp?r.e:r.i);rows=DB.annual.map(r=>({type:'single',lb:r.y,v:isExp?r.e:r.i}));}
    else{const src=TS.per==='monthly'?(isExp?yrD.monthly_e:yrD.monthly_i):(isExp?yrD.quarterly_e:yrD.quarterly_i);const lbs=TS.per==='monthly'?MN:QN;let idxs=src.map((_,i)=>i);if(TS.per==='monthly'){const m=document.getElementById('s-month')?.value||'all';if(m!=='all')idxs=[Number(m)-1];}else{const q=document.getElementById('s-quarter')?.value||'all';if(q!=='all')idxs=[Number(q)-1];}title=`${isExp?'الصادرات':'الواردات'} ${TS.per==='monthly'?'الشهرية':'الفصلية'} — ${TS.yr}`;L=idxs.map(i=>lbs[i]);D=idxs.map(i=>src[i]||0);rows=idxs.map(i=>({type:'single',lb:lbs[i],v:src[i]||0}));}
  }

  document.getElementById('te-title').textContent=title;teUpdatePeriodLayerIndicator(TS.per==='monthly'?'monthly time-series layer':TS.per==='annual'?'annual summary layer':'quarterly time-series layer');tLL=L;tLD=D;tLD2=[];
  TE_LAST_EXPORT={fn:'trade_current_view',rows:[['البند','القيمة (ألف $)'],...rows.map(r=>[r.lb,r.v||r.e||0])]};
  tRenderTable(rows,isExp);if(TS.chart!=='table') tDrawChart(TS.chart);
}

function tRenderTable(rows,isExp){
  const head=document.getElementById('te-thead'),body=document.getElementById('te-tbody');
  if(!rows.length){
    head.innerHTML='';
    body.innerHTML='<tr><td colspan="5" style="padding:24px;color:var(--t3);text-align:center">لا توجد بيانات مطابقة للفلاتر الحالية</td></tr>';
    return;
  }
  const bc=isExp?'#0a7c4e':'#b91c1c',max=Math.max(...rows.map(r=>r.v||0)),type=rows[0]?.type||'single';
  if(type==='commodity'){
    head.innerHTML=`<tr><th>#</th><th>السلعة</th><th>القيمة</th><th>الحصة %</th></tr>`;
    body.innerHTML=rows.map(r=>`<tr><td class="rk">${r.rank}</td><td><strong>${r.lb}</strong></td><td class="n"><div class="bar-r"><span>${fmt(r.v)}</span><div class="bar-bg"><div class="bar-f" style="width:${max?(r.v/max*100).toFixed(0):0}%;background:${bc}"></div></div></div></td><td class="n">${r.p}%</td></tr>`).join('');
  }else if(type==='country'){
    head.innerHTML=`<tr><th>#</th><th>الدولة</th><th>القيمة</th><th>الحصة</th><th>المنطقة</th></tr>`;
    body.innerHTML=rows.map(r=>`<tr><td class="rk">${r.rank}</td><td><strong>${r.lb}</strong></td><td class="n"><div class="bar-r"><span>${fmt(r.v)}</span><div class="bar-bg"><div class="bar-f" style="width:${max?(r.v/max*100).toFixed(0):0}%;background:${bc}"></div></div></div></td><td class="n">${r.pct}%</td><td><span class="rbdg ${RBDG[r.r]||''}">${r.r||''}</span></td></tr>`).join('');
  }else{
    head.innerHTML=`<tr><th>الفترة</th><th>القيمة</th><th>التوزيع</th></tr>`;
    body.innerHTML=rows.map(r=>`<tr><td><strong>${r.lb}</strong></td><td class="n">${fmt(r.v)}</td><td><div class="bar-r"><div class="bar-bg"><div class="bar-f" style="width:${max?(r.v/max*100).toFixed(0):0}%;background:${bc}"></div></div><span style="font-size:10px;color:var(--t4)">${max?(r.v/max*100).toFixed(0):0}%</span></div></td></tr>`).join('');
  }
}
function tRenderBalTable(rows){
  document.getElementById('te-thead').innerHTML=`<tr><th>الفترة</th><th>الصادرات</th><th>الواردات</th><th>الميزان</th></tr>`;
  document.getElementById('te-tbody').innerHTML=rows.map(r=>`<tr><td><strong>${r.lb}</strong></td><td class="n" style="color:var(--exp)">${fmt(r.e)}</td><td class="n" style="color:var(--imp)">${fmt(r.i)}</td><td class="n" style="color:${r.b>=0?'var(--exp)':'var(--imp)'}">${fmtBal(r.b)}</td></tr>`).join('');
}
function tDrawChart(type){
  if(TCHART){TCHART.destroy();TCHART=null;}
  const ctx=document.getElementById('te-chart').getContext('2d');
  const isExp=TS.type==='exp',clr=isExp?'rgba(10,124,78,.7)':'rgba(185,28,28,.7)',ct=type==='pie'?'doughnut':type;
  const ds=ct==='doughnut'?[{data:tLD,backgroundColor:CLRS.slice(0,tLD.length),borderColor:'#fff',borderWidth:2,hoverOffset:6}]:[{label:'القيمة',data:tLD,backgroundColor:ct==='bar'?tLL.map((_,i)=>CLRS[i%CLRS.length]):clr,borderColor:ct==='line'?clr.replace('.7)',',1)'):undefined,borderWidth:ct==='line'?2:0,tension:.35,fill:ct==='line'?{target:'origin',above:clr.replace('.7)','.08)')}:false,pointRadius:ct==='line'?3:0,borderRadius:ct==='bar'?4:0}];
  const opts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:ct==='doughnut',position:'bottom',labels:{color:'#374151',font:{family:'IBM Plex Sans Arabic',size:10},padding:8,usePointStyle:true}},tooltip:{backgroundColor:'rgba(27,58,107,.95)',titleColor:'#fff',bodyColor:'rgba(255,255,255,.75)',padding:9,callbacks:{label:ctx=>`${ctx.label||''}: ${fmt(ctx.raw)}`}}},scales:ct==='doughnut'?{}:{x:{ticks:{color:'#6b7280',font:{size:9},maxRotation:35},grid:{color:'rgba(0,0,0,.04)'}},y:{ticks:{color:'#6b7280',font:{size:9},callback:v=>fmt(v)},grid:{color:'rgba(0,0,0,.04)'}}}};
  TCHART=new Chart(ctx,{type:ct,data:{labels:tLL,datasets:ds},options:opts});
}
function tDrawBal(type){
  if(TCHART){TCHART.destroy();TCHART=null;}
  const ctx=document.getElementById('te-chart').getContext('2d'),ct=type==='pie'?'bar':type;
  TCHART=new Chart(ctx,{type:ct,data:{labels:tLL,datasets:[{label:'الصادرات',data:tLD,backgroundColor:'rgba(10,124,78,.65)',borderColor:'rgba(10,124,78,1)',borderWidth:ct==='line'?2:0,tension:.35,fill:false,borderRadius:4,pointRadius:3},{label:'الواردات',data:tLD2,backgroundColor:'rgba(185,28,28,.65)',borderColor:'rgba(185,28,28,1)',borderWidth:ct==='line'?2:0,tension:.35,fill:false,borderRadius:4,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'top',labels:{color:'#374151',font:{family:'IBM Plex Sans Arabic',size:10},usePointStyle:true,padding:12}},tooltip:{backgroundColor:'rgba(27,58,107,.95)',titleColor:'#fff',bodyColor:'rgba(255,255,255,.75)',padding:9,callbacks:{label:ctx=>`${ctx.dataset.label}: ${fmt(ctx.raw)}`}}},scales:{x:{ticks:{color:'#6b7280',font:{size:9}},grid:{color:'rgba(0,0,0,.04)'}},y:{ticks:{color:'#6b7280',font:{size:9},callback:v=>fmt(v)},grid:{color:'rgba(0,0,0,.04)'}}}},});
}

function teQuick(v){
  const sT=document.getElementById('seg-t'),sV=document.getElementById('seg-v');
  const setBtn=(seg,idx,cls)=>{seg.querySelectorAll('button').forEach((b,i)=>{b.className=i===idx?cls:'';});};
  if(v==='top-exp'){TS.type='exp';TS.view='commodity';setBtn(sT,0,'on-e');setBtn(sV,0,'on');document.getElementById('s-yr').value='2025';document.getElementById('s-com').value='all';}
  else if(v==='top-imp'){TS.type='imp';TS.view='commodity';setBtn(sT,1,'on-i');setBtn(sV,0,'on');document.getElementById('s-yr').value='2025';document.getElementById('s-com').value='all';}
  else if(v==='exp-ctr'){TS.type='exp';TS.view='country';setBtn(sT,0,'on-e');setBtn(sV,1,'on');document.getElementById('s-yr').value='2025';document.getElementById('s-ctr').value='all';}
  else if(v==='imp-ctr'){TS.type='imp';TS.view='country';setBtn(sT,1,'on-i');setBtn(sV,1,'on');document.getElementById('s-yr').value='2025';document.getElementById('s-ctr').value='all';}
  else if(v==='balance'){TS.type='bal';TS.view='time';setBtn(sT,2,'on-b');setBtn(sV,2,'on');document.getElementById('s-yr').value='annual';}
  else if(v==='compare'){
    const y25=DB.years['2025'].exp_com,y24=DB.years['2024'].exp_com;
    document.getElementById('te-title').textContent='مقارنة الصادرات 2024 vs 2025';
    document.getElementById('te-thead').innerHTML=`<tr><th>السلعة</th><th>2024</th><th>2025</th><th>التغيير</th></tr>`;
    const allC=[...new Set([...y25.map(c=>c.n),...y24.map(c=>c.n)])];
    document.getElementById('te-tbody').innerHTML=allC.map(n=>{const v25=y25.find(c=>c.n===n)?.v||0,v24=y24.find(c=>c.n===n)?.v||0,chg=v24>0?((v25-v24)/v24*100).toFixed(0):'—';return`<tr><td><strong>${n}</strong></td><td class="n">${fmt(v24)}</td><td class="n">${fmt(v25)}</td><td class="n" style="color:${v25>=v24?'var(--exp)':'var(--imp)'}">${v25>=v24?'↑':'↓'}${Math.abs(chg)}%</td></tr>`;}).join('');return;
  }
  teRun();
}

// ── Excel (xlsx) import ──────────────────────────────────────────────────────

function dzOver(e,id){e.preventDefault();document.getElementById(id)?.classList.add('drag');}
function dzLeave(id){document.getElementById(id)?.classList.remove('drag');}

function teXlsxDzDrop(e){
  e.preventDefault();
  document.getElementById('te-dz').classList.remove('drag');
  const f=e.dataTransfer.files[0];
  if(f) _teReadXlsxFile(f);
}

function teXlsxFileSelected(e){
  const f=e.target.files[0];
  if(f) _teReadXlsxFile(f);
  e.target.value='';
}

function _teXlsxSetStatus(msg,color='var(--amber)'){
  const el=document.getElementById('te-xlsx-status');
  if(!el) return;
  el.style.display='flex';
  el.style.color=color;
  el.textContent=msg;
}

function _teReadXlsxFile(file){
  _teXlsxSetStatus('جاري قراءة الملف: '+file.name);
  document.getElementById('te-xlsx-summary').style.display='none';
  document.getElementById('te-xlsx-review-panel').style.display='none';
  window._pendingXlsxImport=null;

  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const result=window.SEO_SERVICES.xlsxImport.importWorkbook(e.target.result,file.name);
      if(!result.ok){
        _teXlsxSetStatus('❌ '+result.errors.join(' | '),'var(--imp)');
        return;
      }
      window._pendingXlsxImport=result;
      _teXlsxSetStatus('✅ تم قراءة الملف — راجع الملخص أدناه','var(--exp)');
      _teRenderXlsxSummary(result);
    }catch(err){
      _teXlsxSetStatus('❌ خطأ غير متوقع: '+err.message,'var(--imp)');
    }
  };
  reader.onerror=function(){_teXlsxSetStatus('❌ تعذرت قراءة الملف','var(--imp)');};
  reader.readAsArrayBuffer(file);
}

function _teRenderXlsxSummary(result){
  const s=result.importSummary;
  const meta=result.metadata||{};
  const lines=[
    `<strong>الملف:</strong> ${s.fileName}`,
    `<strong>السنة:</strong> ${s.coveredYear} · الجهة: ${s.sourceOrg}`,
    `<strong>الإصدار:</strong> العدد ${meta.issue||'—'} · المجلد ${meta.volume||'—'}`,
    `<strong>طريقة الاستخلاص:</strong> ${(meta.extraction_method||'').slice(0,80)}`,
    `<strong>إجمالي المشاهدات:</strong> ${s.totalObservations.toLocaleString()} سجل`,
    `<strong>إجماليات الميزان التجاري:</strong> ${s.publishedTotalsCount} سجل`,
    `<strong>صفوف تحتاج مراجعة (مستبعدة):</strong> ${s.reviewRequiredCount}`,
    `<hr style="border:none;border-top:1px solid var(--border);margin:6px 0">`,
  ];
  Object.entries(s.bySheet).forEach(([sheet,count])=>{
    lines.push(`<span style="color:var(--t3)">${sheet}:</span> ${count.toLocaleString()} سجل`);
  });
  document.getElementById('te-xlsx-summary-body').innerHTML=lines.join('<br>');

  const warn=document.getElementById('te-xlsx-review-warning');
  if(s.reviewRequiredCount>0){
    warn.style.display='block';
    warn.textContent=`⚠ ${s.reviewRequiredCount} صف مستبعد من الاستيراد (صفوف غامضة أو مكررة) — يمكن عرضها أدناه.`;
    _teRenderXlsxReviewRows(result.reviewRequired);
  } else {
    warn.style.display='none';
  }

  document.getElementById('te-xlsx-approve-confirm').value='';
  document.getElementById('te-xlsx-approve-status').textContent='';
  document.getElementById('te-xlsx-summary').style.display='block';
}

function _teRenderXlsxReviewRows(rows){
  const tbody=document.getElementById('te-xlsx-review-body');
  if(!tbody) return;
  tbody.innerHTML=rows.slice(0,200).map(r=>
    `<tr><td>${r.year||''}</td><td>${r.flow||''}</td><td>${r.period_type||''}</td><td>${r.source_page||''}</td><td style="color:var(--amber)">${r.issue_type||''}</td><td style="font-size:10px">${r.suggested_action||''}</td></tr>`
  ).join('');
  document.getElementById('te-xlsx-review-panel').style.display='block';
}

function teCancelXlsxImport(){
  window._pendingXlsxImport=null;
  document.getElementById('te-xlsx-summary').style.display='none';
  document.getElementById('te-xlsx-review-panel').style.display='none';
  _teXlsxSetStatus('تم إلغاء الاستيراد','var(--t3)');
}

function teApproveXlsxBatch(){
  const confirmVal=(document.getElementById('te-xlsx-approve-confirm')?.value||'').trim();
  const statusEl=document.getElementById('te-xlsx-approve-status');
  const result=window._pendingXlsxImport;

  if(!result){
    if(statusEl) statusEl.textContent='لا يوجد ملف محمّل.';
    return;
  }
  if(confirmVal!=='APPROVE XLSX BATCH'){
    if(statusEl){statusEl.style.color='var(--imp)';statusEl.textContent='اكتب APPROVE XLSX BATCH للتأكيد.';}
    return;
  }

  try{
    let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{});

    // Add source file
    const existingSource=normalized.sourceFiles.find(s=>s.id===result.sourceFile.id);
    if(!existingSource) normalized.sourceFiles.push(result.sourceFile);

    // Add import batch (mark approved immediately — validation already done externally)
    result.importBatch.status='approved';
    result.importBatch.approvedAt=new Date().toISOString();
    result.importBatch.approvedYear=result.importSummary.coveredYear;
    const existingBatch=normalized.importBatches.find(b=>b.id===result.importBatch.id);
    if(!existingBatch) normalized.importBatches.push(result.importBatch);

    // Add published totals
    const existingTotalIds=new Set(normalized.publishedTotals.map(t=>t.id));
    result.publishedTotals.forEach(t=>{ if(!existingTotalIds.has(t.id)) normalized.publishedTotals.push(t); });

    // Mark active year batch
    const year=String(result.importSummary.coveredYear);
    normalized.activeYearBatches=normalized.activeYearBatches||{};
    normalized.activeYearBatches[year]=result.importBatch.id;

    // Publish observations directly (validation already passed in Excel file)
    const publishedObs=result.draftObservations.map(obs=>({...obs,reviewStatus:'approved',isPublished:true}));
    const existingObsIds=new Set(normalized.observations.map(o=>o.id));
    publishedObs.forEach(o=>{ if(!existingObsIds.has(o.id)) normalized.observations.push(o); });

    DB.normalized=normalized;
    saveDB();
    DB=loadDB();
    teInit();
    teRun();

    window._pendingXlsxImport=null;
    document.getElementById('te-xlsx-summary').style.display='none';
    document.getElementById('te-xlsx-review-panel').style.display='none';
    _teXlsxSetStatus(`✅ تمت إضافة بيانات ${year} — ${result.importSummary.totalObservations.toLocaleString()} مشاهدة — ${result.importSummary.publishedTotalsCount} إجمالي ميزان`,'var(--exp)');
    addFileTag('te-loaded-files',result.sourceFile.originalFilename,`✅ ${year} · ${result.importSummary.totalObservations.toLocaleString()} سجل`);
    if(statusEl){statusEl.style.color='var(--exp)';statusEl.textContent='✅ تم الاعتماد بنجاح';}

  }catch(err){
    if(statusEl){statusEl.style.color='var(--imp)';statusEl.textContent='❌ خطأ: '+err.message;}
  }
}
function teDL(){if(TE_LAST_EXPORT){dlCSV(TE_LAST_EXPORT.rows,TE_LAST_EXPORT.fn);return;}const isExp=TS.type==='exp';let rows=[],fn='trade';
  if(TS.type==='bal'){rows=[['الفترة','الصادرات (ألف $)','الواردات (ألف $)','الميزان (ألف $)']];DB.annual.forEach(r=>rows.push([r.y,r.e,r.i,r.e-r.i]));fn='balance';}
  else if(TS.view==='commodity'){rows=[['السلعة','القيمة (ألف $)','النسبة %']];(isExp?DB.years[TS.yr]?.exp_com||[]:DB.years[TS.yr]?.imp_com||[]).forEach(r=>rows.push([r.n,r.v,r.p]));fn=(isExp?'exports':'imports')+'_commodity_'+TS.yr;}
  else if(TS.view==='country'){rows=[['الدولة','القيمة (ألف $)','المنطقة']];(isExp?DB.years[TS.yr]?.exp_ctr||[]:DB.years[TS.yr]?.imp_ctr||[]).forEach(r=>rows.push([r.n,r.v,r.r]));fn=(isExp?'exports':'imports')+'_country_'+TS.yr;}
  else{rows=[['الفترة','القيمة (ألف $)']];MN.forEach((m,i)=>rows.push([m,(isExp?DB.years[TS.yr]?.monthly_e||[]:DB.years[TS.yr]?.monthly_i||[])[i]||0]));fn=(isExp?'exports':'imports')+'_monthly_'+TS.yr;}
  dlCSV(rows,fn);
}
function teDLTemplate(){dlCSV([['year','type','commodity_name','commodity_value_kusd','country_name','country_value_kusd','region'],[2026,'exp','الذهب',0,'الإمارات',0,'عربي']],'cbos_template');}
function teDLAll(){const rows=[['النوع','البند','السنة','القيمة (ألف $)']];DB.annual.forEach(r=>{rows.push(['صادرات','إجمالي',r.y,r.e]);rows.push(['واردات','إجمالي',r.y,r.i]);});Object.keys(DB.years).forEach(yr=>{(DB.years[yr].exp_com||[]).forEach(c=>rows.push(['صادرات',c.n,yr,c.v]));(DB.years[yr].imp_com||[]).forEach(c=>rows.push(['واردات',c.n,yr,c.v]));});dlCSV(rows,'sudan_trade_full_cbos');}
function teExportDBBackup(){
  const payload={type:'sudan-economic-observatory.trade-db',version:1,exportedAt:new Date().toISOString(),db:DB};
  const json=JSON.stringify(payload,null,2);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([json],{type:'application/json;charset=utf-8'}));
  a.download='sudan_trade_db_backup_'+new Date().toISOString().slice(0,10)+'.json';
  a.click();
  URL.revokeObjectURL(a.href);
  addFileTag('te-loaded-files','نسخة احتياطية JSON','✅ تم التصدير');
}
function openTradeResetModal(){
  const input=document.getElementById('trade-reset-confirm'),msg=document.getElementById('trade-reset-msg');
  if(input) input.value='';
  if(msg){msg.style.display='none';msg.textContent='';msg.style.color='var(--amber)';}
  openModal('trade-reset-modal');
  setTimeout(()=>input?.focus(),50);
}
function confirmTradeReset(){
  const input=document.getElementById('trade-reset-confirm');
  const msg=document.getElementById('trade-reset-msg');
  if((input?.value||'')!=='DELETE TRADE DATA'){
    if(msg){msg.style.display='flex';msg.style.color='var(--imp)';msg.textContent='اكتب DELETE TRADE DATA للتأكيد.';}
    return;
  }
  teExportDBBackup();
  localStorage.removeItem(DB_KEY);
  DB=loadDB();
  saveDB();
  TS={type:'exp',view:'commodity',yr:'2025',per:'monthly',chart:TS.chart||'table'};
  const mode=document.getElementById('s-year-mode');if(mode) mode.value='single';
  const per=document.getElementById('s-per');if(per) per.value='monthly';
  teInit();teRun();teUpdateYearModeUI();
  closeModal('trade-reset-modal');
  addFileTag('te-loaded-files','seo_obs_v2','✅ تم المسح وإعادة تحميل بيانات seed');
  alert('✅ تم مسح بيانات التجارة وإعادة تحميل بيانات seed فقط.');
}
function teImportDBBackup(e){
  const f=e.target.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const parsed=JSON.parse(ev.target.result);
      const incoming=parsed.db||parsed;
      if(!incoming||!Array.isArray(incoming.annual)||!incoming.years||typeof incoming.years!=='object') throw new Error('ملف JSON لا يحتوي على قاعدة تجارة صحيحة');
      const incomingNormalized=incoming.normalized||{
        sourceFiles:incoming.sourceFiles,
        importBatches:incoming.importBatches,
        draftObservations:incoming.draftObservations,
        observations:incoming.observations,
        publishedTotals:incoming.publishedTotals,
        validationResults:incoming.validationResults,
        extractionRules:incoming.extractionRules,
        activeYearBatches:incoming.activeYearBatches,
      };
      DB={
        annual:incoming.annual,
        years:incoming.years,
        sources:Array.isArray(incoming.sources)?incoming.sources:[],
        normalized:window.SEO_SERVICES.trade.ensureNormalizedShape(incomingNormalized),
      };
      saveDB();DB=loadDB();teInit();teRun();
      addFileTag('te-loaded-files',f.name,'✅ تم استيراد JSON');
      alert('✅ تم استيراد نسخة قاعدة التجارة بنجاح');
    }catch(err){
      alert('تعذر استيراد ملف JSON: '+err.message);
      addFileTag('te-loaded-files',f.name,'❌ فشل الاستيراد');
    }finally{
      e.target.value='';
    }
  };
  reader.readAsText(f,'UTF-8');
}

// teParsePdfPrototype kept as stub for legacy batch references in existing storage
function teParsePdfPrototype(){console.warn('PDF parsing removed — use xlsx import instead.');}
function tePdfDebugLatestBatch(){return null;}
function tePdfDebugLoadLatest(){teApprovedRegistryRender();}
function teExtract2013ExportSummaryDraft(){
  const summary=document.getElementById('te-pdf-extraction-summary');
  try{
    const batch=tePdfDebugLatestBatch();
    if(!batch) throw new Error('لا توجد draft batch تحتوي على نص صفحات مستخرج.');
    if(String(batch.targetYear)!=='2013') throw new Error('هذه القاعدة التجريبية مخصصة لسنة 2013 فقط.');
    const sourceFile=(DB.normalized?.sourceFiles||[]).find(source=>source.id===batch.sourceFileId)||null;
    const activeBefore=(DB.normalized?.observations||[]).length;
    const result=window.SEO_SERVICES.tradeExtraction.extract2013ExportSummary(batch,sourceFile);
    let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
    normalized=window.SEO_SERVICES.trade.saveDraftObservationsForRule(normalized,batch.id,result.validation.extractionRuleId,result.observations);
    normalized.validationResults=(normalized.validationResults||[]).filter(item=>!(item.importBatchId===batch.id&&item.extractionRuleId===result.validation.extractionRuleId));
    normalized.validationResults.push(result.validation);
    DB.normalized=normalized;
    saveDB();
    DB=loadDB();
    const activeAfter=(DB.normalized?.observations||[]).length;
    const diff=result.validation.differenceValueUsdThousand;
    if(summary){
      summary.style.display='flex';
      summary.style.color=result.validation.status==='pass'?'var(--exp)':result.validation.status==='warning'?'var(--amber)':'var(--imp)';
      summary.textContent=[
        `Extracted draft rows: ${result.observations.length}`,
        `Extracted total: ${result.validation.extractedTotalValueUsdThousand.toLocaleString()} ألف دولار`,
        `Expected total: ${result.validation.expectedTotalValueUsdThousand.toLocaleString()} ألف دولار`,
        `Difference: ${diff.toLocaleString()} ألف دولار`,
        `Validation: ${result.validation.status}`,
        `Source page: ${result.debug.detectedPageNumber}`,
        `Publication issue: Q4 2013`,
        `Covered economic period: Annual 2013 Jan-Dec`,
        `Debug: searchedPages=${result.debug.searchedPages}, detectedPageNumber=${result.debug.detectedPageNumber}, anchorMatched=${result.debug.anchorMatched}`,
        `Active observations unchanged: ${activeBefore===activeAfter}`,
        teTradeBalanceReadinessText(normalized),
      ].join(' · ');
    }
    teSetPdfProtoStatus(`تم استخراج ${result.observations.length} صفاً كمسودة فقط. لا يوجد نشر.`);
    addFileTag('te-loaded-files','2013 exports summary draft',`${result.validation.status} · ${result.observations.length} rows`);
    teDraftReviewRender(batch.id);
  }catch(err){
    if(summary){
      summary.style.display='flex';
      summary.style.color='var(--imp)';
      summary.textContent='تعذر استخراج جدول صادرات 2013: '+err.message;
    }
    teSetPdfProtoStatus('تعذر استخراج جدول صادرات 2013: '+err.message,true);
  }
}
function teExtract2013ImportSummaryDraft(){
  const summary=document.getElementById('te-pdf-extraction-summary');
  try{
    const batch=tePdfDebugLatestBatch(config.year);
    if(!batch) throw new Error('لا توجد draft batch تحتوي على نص صفحات مستخرج.');
    if(String(batch.targetYear)!=='2013') throw new Error('هذه القاعدة التجريبية مخصصة لسنة 2013 فقط.');
    const sourceFile=(DB.normalized?.sourceFiles||[]).find(source=>source.id===batch.sourceFileId)||null;
    const activeBefore=(DB.normalized?.observations||[]).length;
    const result=window.SEO_SERVICES.tradeExtraction.extract2013ImportSummary(batch,sourceFile);
    let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
    normalized=window.SEO_SERVICES.trade.saveDraftObservationsForRule(normalized,batch.id,result.validation.extractionRuleId,result.observations);
    normalized.validationResults=(normalized.validationResults||[]).filter(item=>!(item.importBatchId===batch.id&&item.extractionRuleId===result.validation.extractionRuleId));
    normalized.validationResults.push(result.validation);
    DB.normalized=normalized;
    saveDB();
    DB=loadDB();
    const activeAfter=(DB.normalized?.observations||[]).length;
    const diff=result.validation.differenceValueUsdThousand;
    if(summary){
      summary.style.display='flex';
      summary.style.color=result.validation.status==='pass'?'var(--exp)':result.validation.status==='warning'?'var(--amber)':'var(--imp)';
      summary.textContent=[
        `Imports draft rows: ${result.observations.length}`,
        `Extracted total: ${result.validation.extractedTotalValueUsdThousand.toLocaleString()} ألف دولار`,
        `Reported total: ${(result.validation.reportedTotalValueUsdThousand||result.validation.expectedTotalValueUsdThousand).toLocaleString()} ألف دولار`,
        `Difference: ${diff.toLocaleString()} ألف دولار`,
        `Validation: ${result.validation.status}`,
        `Source page: ${result.debug.detectedPageNumber}`,
        `Debug: searchedPages=${result.debug.searchedPages}, detectedPageNumber=${result.debug.detectedPageNumber}, anchorMatched=${result.debug.anchorMatched}`,
        `Active observations unchanged: ${activeBefore===activeAfter}`,
      ].join(' · ');
    }
    teSetPdfProtoStatus(`تم استخراج ${result.observations.length} صف واردات كمسودة فقط. لا يوجد نشر.`);
    addFileTag('te-loaded-files','2013 imports summary draft',`${result.validation.status} · ${result.observations.length} rows`);
    teDraftReviewRender(batch.id);
  }catch(err){
    if(summary){
      summary.style.display='flex';
      summary.style.color='var(--imp)';
      summary.textContent='تعذر استخراج جدول واردات 2013: '+err.message;
    }
    teSetPdfProtoStatus('تعذر استخراج جدول واردات 2013: '+err.message,true);
  }
}
function teExtract2014ExportSummaryDraft(){
  teExtract2014AnnualSummaryDraft({
    year:'2014',
    flow:'export',
    label:'exports',
    ruleId:'cbos-2014-exports-summary-v1',
    extract:window.SEO_SERVICES.tradeExtraction.extract2014ExportSummary.bind(window.SEO_SERVICES.tradeExtraction),
    errorLabel:'صادرات 2014',
  });
}
function teExtract2014ImportSummaryDraft(){
  teExtract2014AnnualSummaryDraft({
    year:'2014',
    flow:'import',
    label:'imports',
    ruleId:'cbos-2014-imports-summary-v1',
    extract:window.SEO_SERVICES.tradeExtraction.extract2014ImportSummary.bind(window.SEO_SERVICES.tradeExtraction),
    errorLabel:'واردات 2014',
  });
}
function teExtract2014AnnualSummaryDraft(config){
  const summary=document.getElementById('te-pdf-extraction-summary');
  try{
    const batch=tePdfDebugLatestBatch();
    if(!batch) throw new Error('لا توجد draft batch تحتوي على نص صفحات مستخرج.');
    if(String(batch.targetYear)!==config.year) throw new Error(`هذه القاعدة التجريبية مخصصة لسنة ${config.year} فقط.`);
    const sourceFile=(DB.normalized?.sourceFiles||[]).find(source=>source.id===batch.sourceFileId)||null;
    const activeBefore=(DB.normalized?.observations||[]).length;
    const active2013Before=te2013ActiveStateSnapshot();
    const result=config.extract(batch,sourceFile);
    result.validation.annualApprovalReadiness=teBuildAnnualApprovalReadiness(result.validation,result.observations);
    let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
    normalized=window.SEO_SERVICES.trade.saveDraftObservationsForRule(normalized,batch.id,result.validation.extractionRuleId,result.observations);
    normalized.validationResults=(normalized.validationResults||[]).filter(item=>!(item.importBatchId===batch.id&&item.extractionRuleId===result.validation.extractionRuleId));
    normalized.validationResults.push(result.validation);
    DB.normalized=normalized;
    saveDB();
    DB=loadDB();
    const activeAfter=(DB.normalized?.observations||[]).length;
    const active2013After=te2013ActiveStateSnapshot();
    const diff=result.validation.differenceValueUsdThousand;
    if(summary){
      summary.style.display='flex';
      summary.style.color=result.validation.status==='pass'?'var(--exp)':result.validation.status==='warning'?'var(--amber)':'var(--imp)';
      summary.textContent=[
        `2014 ${config.label} draft rows: ${result.observations.length}`,
        `Extracted total: ${result.validation.extractedTotalValueUsdThousand.toLocaleString()} ألف دولار`,
        `Expected total: ${result.validation.expectedTotalValueUsdThousand.toLocaleString()} ألف دولار`,
        `Reported total: ${(result.validation.reportedTotalValueUsdThousand||result.validation.expectedTotalValueUsdThousand).toLocaleString()} ألف دولار`,
        `Difference: ${diff.toLocaleString()} ألف دولار`,
        `Validation: ${result.validation.status}`,
        `Unmapped commodities: ${result.validation.unmappedCommodityRows||0}`,
        `Source page: ${result.debug.detectedPageNumber}`,
        `Source classification: ${result.validation.sourceClassification.structuralFamily} · comparedTo ${result.validation.sourceClassification.comparedTo}`,
        `Publication issue: Q4 2014`,
        `Covered economic period: Annual 2014 Jan-Dec`,
        `Debug: searchedPages=${result.debug.searchedPages}, detectedPageNumber=${result.debug.detectedPageNumber}, anchorMatched=${result.debug.anchorMatched}`,
        `Active observations unchanged: ${activeBefore===activeAfter}`,
        `2013 unchanged: ${JSON.stringify(active2013Before)===JSON.stringify(active2013After)}`,
      ].join(' · ');
    }
    teSetPdfProtoStatus(`تم استخراج ${result.observations.length} صف ${config.label} لسنة 2014 كمسودة فقط. لا يوجد نشر.`);
    addFileTag('te-loaded-files',`2014 ${config.label} summary draft`,`${result.validation.status} · ${result.observations.length} rows`);
    teDraftReviewRender(batch.id);
  }catch(err){
    if(summary){
      summary.style.display='flex';
      summary.style.color='var(--imp)';
      const diagnostics=config.flow==='import'&&err.discovery?teMonthlyImportDiscoveryDebugText(err.discovery):'';
      summary.textContent=`تعذر استخراج جدول ${config.errorLabel}: ${err.message}${diagnostics?` · ${diagnostics}`:''}`;
    }
    if(config.flow==='import'&&err.discovery) teRenderMonthlyImportDiscoveryDiagnostics(err.discovery);
    teSetPdfProtoStatus(`تعذر استخراج جدول ${config.errorLabel}: ${err.message}`,true);
  }
}
function teValidate2014ExportSummaryDraft(){
  teValidateAnnualSummaryDraft({
    year:2014,
    flow:'export',
    ruleId:'cbos-2014-exports-summary-v1',
    extractionVersion:'cbos-2014-q4-v1',
    tableType:'exports_summary',
    expectedRowsCount:22,
    expectedTotalValueUsdThousand:4350210,
    validationIdPrefix:'validation_2014_exports_summary_',
  });
}
function teValidate2014ImportSummaryDraft(){
  teValidateAnnualSummaryDraft({
    year:2014,
    flow:'import',
    ruleId:'cbos-2014-imports-summary-v1',
    extractionVersion:'cbos-2014-q4-v1',
    tableType:'imports_summary',
    expectedRowsCount:16,
    expectedTotalValueUsdThousand:9211300,
    validationIdPrefix:'validation_2014_imports_summary_',
  });
}
function teValidateAnnualSummaryDraft(config){
  const summary=document.getElementById('te-pdf-extraction-summary');
  try{
    const batch=teLatestBatchForDraftRule(config.ruleId);
    if(!batch) throw new Error(`No ${config.year} ${config.flow} draft batch found.`);
    const rows=teDraftReviewRowsForRule(batch.id,config.ruleId)
      .filter(row=>String(row.year)===String(config.year)&&row.flow===config.flow&&row.periodType==='annual'&&row.extractionRuleId===config.ruleId);
    if(!rows.length) throw new Error(`No ${config.year} ${config.flow} annual draft rows available.`);
    const normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
    const total=rows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
    const difference=total-config.expectedTotalValueUsdThousand;
    const duplicateIds=teDuplicateValues(rows.map(row=>row.id));
    const duplicateCommodities=teDuplicateValues(rows.map(row=>row.commodityId||row.commodityName).filter(Boolean));
    const unmappedCommodities=[...new Set(rows.filter(row=>row.commodityNormalizationStatus==='unmapped'||!row.commodityId).map(row=>row.rawCommodityName||row.commodityName||'unknown'))];
    const rowStatus=rows.length===config.expectedRowsCount?'pass':'fail';
    const totalStatus=Math.abs(difference)<=1?'pass':'fail';
    const normalizationStatus=unmappedCommodities.length?'fail':'pass';
    const duplicateStatus=duplicateIds.length||duplicateCommodities.length?'fail':'pass';
    const status=rowStatus==='pass'&&totalStatus==='pass'&&normalizationStatus==='pass'&&duplicateStatus==='pass'?'pass':'fail';
    const validation={
      id:config.validationIdPrefix+Date.now(),
      importBatchId:batch.id,
      sourceFileId:batch.sourceFileId,
      extractionRuleId:config.ruleId,
      extractionVersion:config.extractionVersion,
      tableType:config.tableType,
      flow:config.flow,
      year:config.year,
      periodType:'annual',
      publicationIssue:{source:'CBOS Foreign Trade Statistical Digest',issueYear:config.year,issuePeriod:'Q4',issueLabel:`Q4 ${config.year}`},
      coveredEconomicPeriod:{year:config.year,periodType:'annual',startMonth:1,endMonth:12,label:`Annual ${config.year} Jan-Dec`},
      expectedRowsCount:config.expectedRowsCount,
      extractedRowsCount:rows.length,
      expectedTotalValueUsdThousand:config.expectedTotalValueUsdThousand,
      reportedTotalValueUsdThousand:config.expectedTotalValueUsdThousand,
      extractedTotalValueUsdThousand:total,
      differenceValueUsdThousand:difference,
      duplicateDraftIds:duplicateIds,
      duplicateCommodityKeys:duplicateCommodities,
      unmappedCommodities,
      unmappedCommodityRows:unmappedCommodities.length,
      status,
      checkedAt:new Date().toISOString(),
      notes:`${config.year} annual ${config.flow} draft validation/readiness check. No approval or publishing performed.`,
      sourceClassification:{structuralFamily:'cbos-legacy-q4-word-distiller',comparedTo:'cbos-2013-q4-v1',result:'same annual summary table family'},
      diagnostics:{rowStatus,totalStatus,normalizationStatus,duplicateStatus,activeObservationsUnchanged:true},
    };
    validation.annualApprovalReadiness=teBuildAnnualApprovalReadiness(validation,rows,normalized);
    normalized.validationResults=(normalized.validationResults||[]).filter(item=>!(item.importBatchId===batch.id&&item.extractionRuleId===config.ruleId));
    normalized.validationResults.push(validation);
    DB.normalized=normalized;
    saveDB();
    DB=loadDB();
    if(summary){
      summary.style.display='flex';
      summary.style.color=validation.status==='pass'?'var(--exp)':'var(--imp)';
      summary.textContent=[
        `${config.year} ${config.flow} validation: ${validation.status}`,
        `readiness: ${validation.annualApprovalReadiness.isReady}`,
        `rows: ${rows.length}/${config.expectedRowsCount}`,
        `total: ${total.toLocaleString()} ألف دولار`,
        `expected: ${config.expectedTotalValueUsdThousand.toLocaleString()} ألف دولار`,
        `difference: ${difference.toLocaleString()} ألف دولار`,
        `unmapped: ${unmappedCommodities.length}`,
        `duplicateIds: ${duplicateIds.length}`,
        `duplicateCommodityKeys: ${duplicateCommodities.length}`,
        `blockingReasons: ${validation.annualApprovalReadiness.blockingReasons.join(' | ')||'none'}`,
        `active observations unchanged: true`,
      ].join(' · ');
    }
    teSetPdfProtoStatus(`${config.year} ${config.flow} validation/readiness complete: ${validation.status}. No publishing performed.`,validation.status!=='pass');
    teDraftReviewRender(batch.id);
  }catch(err){
    if(summary){
      summary.style.display='flex';
      summary.style.color='var(--imp)';
      summary.textContent=`تعذر تشغيل تحقق ${config.year} ${config.flow}: ${err.message}`;
    }
    teSetPdfProtoStatus(`تعذر تشغيل تحقق ${config.year} ${config.flow}: ${err.message}`,true);
  }
}
function teBuildAnnualApprovalReadiness(validation,rows,normalized=DB.normalized){
  const shaped=window.SEO_SERVICES.trade.ensureNormalizedShape(normalized||{});
  const blockingReasons=[];
  const warningReasons=[];
  const activeRows=(shaped.observations||[]).filter(row=>row.isPublished&&String(row.year)===String(validation.year)&&row.extractionRuleId===validation.extractionRuleId);
  if(validation.status!=='pass') blockingReasons.push(`validationStatus is ${validation.status}`);
  if(Number(validation.unmappedCommodityRows||0)>0||(validation.unmappedCommodities||[]).length) blockingReasons.push('unmapped commodities remain');
  if(Math.abs(Number(validation.differenceValueUsdThousand||0))>1) blockingReasons.push(`total difference is ${validation.differenceValueUsdThousand}`);
  if(validation.expectedRowsCount&&Number(validation.extractedRowsCount)!==Number(validation.expectedRowsCount)) blockingReasons.push(`row count is ${validation.extractedRowsCount}/${validation.expectedRowsCount}`);
  if((validation.duplicateDraftIds||[]).length) blockingReasons.push(`${validation.duplicateDraftIds.length} duplicate draft id(s)`);
  if((validation.duplicateCommodityKeys||[]).length) blockingReasons.push(`${validation.duplicateCommodityKeys.length} duplicate commodity key(s)`);
  if(activeRows.length) blockingReasons.push(`${activeRows.length} active row(s) already published for this rule`);
  if(rows.some(row=>row.reviewStatus==='flagged'||row.reviewStatus==='rejected')) blockingReasons.push('draft contains flagged or rejected rows');
  return {
    isReady:blockingReasons.length===0,
    blockingReasons,
    warningReasons,
    checkedAt:new Date().toISOString(),
    ruleId:validation.extractionRuleId,
    year:validation.year,
    flow:validation.flow,
    rowCount:rows.length,
    totalValue:validation.extractedTotalValueUsdThousand,
    reconciliationStatus:{
      validationStatus:validation.status,
      totalDifferenceValueUsdThousand:validation.differenceValueUsdThousand,
      rowCountStatus:validation.expectedRowsCount&&Number(validation.extractedRowsCount)===Number(validation.expectedRowsCount)?'pass':'fail',
    },
    normalizationStatus:{
      unmappedCommodities:Number(validation.unmappedCommodityRows||0),
    },
    draftIsolationStatus:{
      activePublishedRows:activeRows.length,
      activeObservationsUnchanged:activeRows.length===0,
    },
  };
}
function teDuplicateValues(values){
  const counts=new Map();
  values.forEach(value=>counts.set(value,(counts.get(value)||0)+1));
  return [...counts.entries()].filter(([,count])=>count>1).map(([value])=>value);
}
function te2013ActiveStateSnapshot(){
  const rows=DB.normalized?.observations||[];
  return {
    annualExports:rows.filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='export'&&row.periodType==='annual'&&row.extractionRuleId==='cbos-2013-exports-summary-v1').reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0),
    annualImports:rows.filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='import'&&row.periodType==='annual'&&row.extractionRuleId==='cbos-2013-imports-summary-v1').reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0),
    monthlyExports:rows.filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='export'&&row.periodType==='monthly'&&row.extractionRuleId==='cbos-2013-monthly-exports-v1').length,
    monthlyImports:rows.filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='import'&&row.periodType==='monthly'&&row.extractionRuleId==='cbos-2013-monthly-imports-v1').length,
  };
}
function teExtract2013MonthlyExportsDraft(){
  const summary=document.getElementById('te-pdf-extraction-summary');
  try{
    const batch=tePdfDebugLatestBatch();
    if(!batch) throw new Error('لا توجد draft batch تحتوي على نص صفحات مستخرج.');
    if(String(batch.targetYear)!=='2013') throw new Error('هذه القاعدة التجريبية مخصصة لسنة 2013 فقط.');
    const sourceFile=(DB.normalized?.sourceFiles||[]).find(source=>source.id===batch.sourceFileId)||null;
    const activeBefore=(DB.normalized?.observations||[]).length;
    const result=window.SEO_SERVICES.tradeExtraction.extract2013MonthlyExports(batch,sourceFile);
    let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
    result.validation=teEnhanceMonthlyExportsValidation(result.validation,result.observations,normalized);
    normalized=window.SEO_SERVICES.trade.saveDraftObservationsForRule(normalized,batch.id,result.validation.extractionRuleId,result.observations);
    normalized.validationResults=(normalized.validationResults||[]).filter(item=>!(item.importBatchId===batch.id&&item.extractionRuleId===result.validation.extractionRuleId));
    normalized.validationResults.push(result.validation);
    DB.normalized=normalized;
    saveDB();
    DB=loadDB();
    const activeAfter=(DB.normalized?.observations||[]).length;
    const totals=result.validation.extractedMonthlyTotals.map(item=>`${item.monthLabel}: ${Number(item.extractedTotalValueUsdThousand||0).toLocaleString()}`).join(', ');
    if(summary){
      summary.style.display='flex';
      summary.style.color=result.validation.status==='pass'?'var(--exp)':result.validation.status==='warning'?'var(--amber)':'var(--imp)';
      summary.textContent=[
        `Monthly export draft rows: ${result.observations.length}`,
        `Expected months: ${result.validation.expectedMonths.join(', ')}`,
        `Extracted months: ${result.validation.coveredMonths.join(', ')||'none'}`,
        `Missing months: ${result.validation.missingMonths.length?result.validation.missingMonths.join(', '):'none'}`,
        `Monthly totals: ${totals||'none'}`,
        `Validation: ${result.validation.status}`,
        `Source page: ${result.debug.detectedPageNumber}`,
        `Publication issue: Q4 2013`,
        `Covered economic period: monthly observations for Jan-Dec 2013 where extractable`,
        `Debug: searchedPages=${result.debug.searchedPages}, detectedPageNumber=${result.debug.detectedPageNumber}, anchorMatched=${result.debug.anchorMatched}, shape=${result.debug.parsedTableShape}`,
        `Signature score: ${result.debug.tableSignature?.score ?? 'n/a'}`,
        `Rejected candidates: ${(result.debug.candidateRejections||[]).map(item=>`p${item.pageNumber}:${item.rejectionReasons.join('+')}`).join(' | ')||'none'}`,
        `Active observations unchanged: ${activeBefore===activeAfter}`,
      ].join(' · ');
    }
    teSetPdfProtoStatus(`تم استخراج ${result.observations.length} صف صادرات شهرية كمسودة فقط. لا يوجد نشر.`);
    addFileTag('te-loaded-files','2013 monthly exports draft',`${result.validation.status} · ${result.observations.length} rows`);
    teDraftReviewRender(batch.id);
  }catch(err){
    if(summary){
      summary.style.display='flex';
      summary.style.color='var(--imp)';
      summary.textContent='تعذر استخراج جدول الصادرات الشهرية 2013: '+err.message;
    }
    teSetPdfProtoStatus('تعذر استخراج جدول الصادرات الشهرية 2013: '+err.message,true);
  }
}
function teExtract2013MonthlyImportsDraft(){
  const summary=document.getElementById('te-pdf-extraction-summary');
  try{
    const batch=tePdfLatestParsedBatch();
    if(!batch) throw new Error('لا توجد parsed batch تحتوي على نص صفحات مستخرج.');
    if(String(batch.targetYear)!=='2013') throw new Error('هذه القاعدة التجريبية مخصصة لسنة 2013 فقط.');
    const sourceFile=(DB.normalized?.sourceFiles||[]).find(source=>source.id===batch.sourceFileId)||null;
    const activeBefore=(DB.normalized?.observations||[]).length;
    const activeMonthlyImportsBefore=(DB.normalized?.observations||[]).filter(row=>row.isPublished&&row.extractionRuleId==='cbos-2013-monthly-imports-v1').length;
    const result=window.SEO_SERVICES.tradeExtraction.extract2013MonthlyImports(batch,sourceFile);
    let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
    result.validation.monthlyImportApprovalReadiness=teBuildMonthlyImportApprovalReadiness(result.validation,result.observations,normalized,{activeBefore});
    normalized=window.SEO_SERVICES.trade.saveDraftObservationsForRule(normalized,batch.id,result.validation.extractionRuleId,result.observations);
    normalized.validationResults=(normalized.validationResults||[]).filter(item=>!(item.importBatchId===batch.id&&item.extractionRuleId===result.validation.extractionRuleId));
    normalized.validationResults.push(result.validation);
    DB.normalized=normalized;
    saveDB();
    DB=loadDB();
    const activeAfter=(DB.normalized?.observations||[]).length;
    const activeMonthlyImportsAfter=(DB.normalized?.observations||[]).filter(row=>row.isPublished&&row.extractionRuleId==='cbos-2013-monthly-imports-v1').length;
    const validation=result.validation;
    if(summary){
      summary.style.display='flex';
      summary.style.color=validation.status==='pass'?'var(--exp)':validation.status==='warning'?'var(--amber)':'var(--imp)';
      summary.textContent=[
        `Monthly import draft rows: ${result.observations.length}`,
        `Commodity rows: ${validation.extractedCommodityRowsCount}`,
        `Parsed Total row: ${Number(validation.tableTotalRow?.grandTotalValueUsdThousand||0).toLocaleString()} ألف دولار`,
        `Generated monthly imports total: ${Number(validation.annualComparison?.monthlyTotalValueUsdThousand||0).toLocaleString()} ألف دولار`,
        `Gap vs annual imports: ${Number(validation.annualComparison?.differenceValueUsdThousand||0).toLocaleString()} ألف دولار`,
        `Row-total mismatches: ${validation.rowTotalMismatches.length}`,
        `Duplicate keys: ${validation.duplicateObservationKeys.length}`,
        `Unmapped commodities: ${validation.diagnostics.unmappedCommodityRows}`,
        `Validation: ${validation.status}`,
        `Source pages: ${(result.debug.windowPageNumbers||[]).join(', ')}`,
        `Selected page: ${result.debug.detectedPageNumber}`,
        `Active observations unchanged: ${activeBefore===activeAfter}`,
        `Published monthly import rows unchanged: ${activeMonthlyImportsBefore===activeMonthlyImportsAfter&&activeMonthlyImportsAfter===0}`,
        teTradeBalanceReadinessText(normalized),
      ].join(' · ');
    }
    teSetPdfProtoStatus(`تم استخراج ${result.observations.length} صف واردات شهرية كمسودة فقط. لا يوجد نشر.`);
    addFileTag('te-loaded-files','2013 monthly imports draft',`${validation.status} · ${result.observations.length} rows`);
    teDraftReviewRender(batch.id);
  }catch(err){
    if(summary){
      summary.style.display='flex';
      summary.style.color='var(--imp)';
      summary.textContent='تعذر استخراج جدول الواردات الشهرية 2013: '+err.message;
    }
    teSetPdfProtoStatus('تعذر استخراج جدول الواردات الشهرية 2013: '+err.message,true);
  }
}
function teExtract2014MonthlyExportsDraft(){
  teExtractMonthlyYearDraft({
    year:2014,
    flow:'export',
    ruleId:'cbos-2014-monthly-exports-v1',
    annualRuleId:'cbos-2014-exports-summary-v1',
    extract:window.SEO_SERVICES.tradeExtraction.extract2014MonthlyExports.bind(window.SEO_SERVICES.tradeExtraction),
    label:'2014 monthly exports',
    errorLabel:'الصادرات الشهرية 2014',
    readinessKey:'monthlyApprovalReadiness',
  });
}
function teExtract2014MonthlyImportsDraft(){
  teExtractMonthlyYearDraft({
    year:2014,
    flow:'import',
    ruleId:'cbos-2014-monthly-imports-v1',
    annualRuleId:'cbos-2014-imports-summary-v1',
    extract:window.SEO_SERVICES.tradeExtraction.extract2014MonthlyImports.bind(window.SEO_SERVICES.tradeExtraction),
    label:'2014 monthly imports',
    errorLabel:'الواردات الشهرية 2014',
    readinessKey:'monthlyImportApprovalReadiness',
  });
}
function teExtractMonthlyYearDraft(config){
  const summary=document.getElementById('te-pdf-extraction-summary');
  try{
    const batch=tePdfLatestParsedBatch(config.year);
    if(!batch) throw new Error('لا توجد parsed batch تحتوي على نص صفحات مستخرج.');
    if(String(batch.targetYear)!==String(config.year)) throw new Error(`هذه القاعدة مخصصة لسنة ${config.year} فقط.`);
    const sourceFile=(DB.normalized?.sourceFiles||[]).find(source=>source.id===batch.sourceFileId)||null;
    const active2013Before=te2013ActiveStateSnapshot();
    const activeBefore=(DB.normalized?.observations||[]).length;
    const result=config.extract(batch,sourceFile);
    let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
    result.validation=teEnhanceMonthlyYearValidation(result.validation,result.observations,normalized,config);
    normalized=window.SEO_SERVICES.trade.saveDraftObservationsForRule(normalized,batch.id,result.validation.extractionRuleId,result.observations);
    normalized.validationResults=(normalized.validationResults||[]).filter(item=>!(item.importBatchId===batch.id&&item.extractionRuleId===result.validation.extractionRuleId));
    normalized.validationResults.push(result.validation);
    DB.normalized=normalized;
    saveDB();
    DB=loadDB();
    const activeAfter=(DB.normalized?.observations||[]).length;
    const active2013After=te2013ActiveStateSnapshot();
    if(summary){
      summary.style.display='flex';
      summary.style.color=result.validation.status==='pass'?'var(--exp)':result.validation.status==='warning'?'var(--amber)':'var(--imp)';
      summary.textContent=[
        `${config.label} draft rows: ${result.observations.length}`,
        `Commodity rows: ${result.validation.extractedCommodityRowsCount||'n/a'}`,
        `Parsed Total row: ${Number(result.validation.tableTotalRow?.grandTotalValueUsdThousand||result.validation.tableTotalValidation?.reportedGrandTotalValueUsdThousand||0).toLocaleString()} ألف دولار`,
        `Generated monthly total: ${Number(result.validation.monthlyTotalValueUsdThousand||result.validation.annualComparison?.monthlyTotalValueUsdThousand||0).toLocaleString()} ألف دولار`,
        `Approved annual total: ${Number(result.validation.annualComparison?.approvedAnnualTotalValueUsdThousand||0).toLocaleString()} ألف دولار`,
        `Gap: ${Number(result.validation.annualComparison?.differenceValueUsdThousand||0).toLocaleString()} ألف دولار`,
        `Row-total mismatches: ${(result.validation.rowTotalMismatches||[]).length}`,
        `Duplicate keys: ${(result.validation.duplicateObservationKeys||[]).length}`,
        `Unmapped commodities: ${Number(result.validation.unmappedCommodityRows||result.validation.diagnostics?.unmappedCommodityRows||0)}`,
        `Validation: ${result.validation.status}`,
        `Readiness: ${result.validation[config.readinessKey]?.isReady}`,
        `Source page: ${result.debug?.detectedPageNumber||'n/a'}`,
        `Approved annual lookup: ${JSON.stringify(result.validation.approvedAnnualLookupDiagnostics||{})}`,
        `Mismatch raw rows: ${JSON.stringify(result.validation.debug?.mismatchRawRows||result.validation.rowTotalMismatches||[]).slice(0,1200)}`,
        `Skipped candidates: ${JSON.stringify(result.validation.debug?.skippedCandidateRows||[]).slice(0,1200)}`,
        `Active observations unchanged: ${activeBefore===activeAfter}`,
        `2013 unchanged: ${JSON.stringify(active2013Before)===JSON.stringify(active2013After)}`,
      ].join(' · ');
    }
    teSetPdfProtoStatus(`تم استخراج ${result.observations.length} صف ${config.label} كمسودة فقط. لا يوجد نشر.`);
    addFileTag('te-loaded-files',`${config.label} draft`,`${result.validation.status} · ${result.observations.length} rows`);
    teDraftReviewRender(batch.id);
  }catch(err){
    if(summary){
      summary.style.display='flex';
      summary.style.color='var(--imp)';
      summary.textContent=`تعذر استخراج جدول ${config.errorLabel}: ${err.message}`;
    }
    teSetPdfProtoStatus(`تعذر استخراج جدول ${config.errorLabel}: ${err.message}`,true);
  }
}
function teDiscover2013MonthlyImportsTable(){
  const panel=document.getElementById('te-imports-discovery-panel');
  const summary=document.getElementById('te-pdf-extraction-summary');
  try{
    const batch=tePdfLatestParsedBatch();
    if(!batch) throw new Error('لا توجد draft batch تحتوي على نص صفحات مستخرج.');
    if(String(batch.targetYear)!=='2013') throw new Error('تشخيص جدول واردات 2013 الشهري مخصص لسنة 2013 فقط.');
    const result=window.SEO_SERVICES.tradeExtraction.discover2013MonthlyImportsTables(batch);
    const selected=result.selected;
    const rejected=(result.rejectedCandidates||[]).slice(0,6).map(item=>[
      `p${item.pageNumber}${item.printedPageNumber?` printed ${item.printedPageNumber}`:''}`,
      `score=${item.signatureScore}`,
      `accepted=${item.accepted}`,
      `reject=${item.rejectedSignals.length?item.rejectedSignals.join(' | '):'none'}`,
      `preview=${item.headerPreview}`,
    ].join(' · ')).join('\n\n');
    if(panel){
      panel.style.display='flex';
      panel.style.color=selected?.accepted?'var(--exp)':selected?'var(--amber)':'var(--imp)';
      panel.textContent=[
        'Monthly imports table discovery diagnostics',
        `ruleId: ${result.ruleId}`,
        `searchedPages: ${result.searchedPages}`,
        selected?`selectedPage: ${selected.pageNumber}`:'selectedPage: none',
        selected?`detectedPrintedPage: ${selected.printedPageNumber||'not detected'}`:'',
      selected?`signatureScore: ${selected.signatureScore}`:'',
      selected?`detectedMonths: ${(selected.detectedMonthLabels||[]).length}/12 · ${(selected.detectedMonthLabels||[]).join(', ')}`:'',
      selected?`missingMonths: ${(selected.missingMonthLabels||[]).length?(selected.missingMonthLabels||[]).join(', '):'none'}`:'',
      selected?`acceptedSignals: ${selected.matchedSignals.join(' | ')||'none'}`:'',
      selected?`selectedRejectedSignals: ${selected.rejectedSignals.join(' | ')||'none'}`:'',
      selected?`reconstruction: ${selected.reconstructionNotes||'none'}`:'',
      selected?`headerPreview: ${selected.headerPreview}`:'',
      selected?`rawHeaderEvidence: ${selected.rawHeaderEvidence||'not available'}`:'',
      `safeForDeterministicExtraction: ${result.safeForDeterministicExtraction}`,
        `notes: ${result.notes}`,
        '',
        'Rejected / non-selected candidates:',
        rejected||'none',
      ].filter(line=>line!==null&&line!==undefined).join('\n');
    }
    if(summary){
      summary.style.display='flex';
      summary.style.color=selected?.accepted?'var(--exp)':selected?'var(--amber)':'var(--imp)';
      summary.textContent=selected
        ? `Monthly imports discovery only · selected page ${selected.pageNumber} · score ${selected.signatureScore} · accepted=${selected.accepted} · no draft rows created`
        : 'Monthly imports discovery only · no safe candidate selected · no draft rows created';
    }
    teSetPdfProtoStatus('تم تشغيل تشخيص جدول الواردات الشهرية فقط. لا يوجد استخراج أو نشر.');
    return result;
  }catch(err){
    if(panel){
      panel.style.display='flex';
      panel.style.color='var(--imp)';
      panel.textContent='تعذر تشخيص جدول الواردات الشهرية 2013: '+err.message;
    }
    if(summary){
      summary.style.display='flex';
      summary.style.color='var(--imp)';
      summary.textContent='تعذر تشخيص جدول الواردات الشهرية 2013: '+err.message;
    }
    teSetPdfProtoStatus('تعذر تشخيص جدول الواردات الشهرية 2013: '+err.message,true);
    return null;
  }
}
function teDraftReviewValidation(batchId){
  return (DB.normalized?.validationResults||[]).slice().reverse().find(item=>item.importBatchId===batchId&&item.extractionRuleId==='cbos-2013-exports-summary-v1')||null;
}
function teDraftReviewValidationForRule(batchId,ruleId){
  return (DB.normalized?.validationResults||[]).slice().reverse().find(item=>item.importBatchId===batchId&&item.extractionRuleId===ruleId)||null;
}
function teDraftReviewRows(batchId){
  return window.SEO_SERVICES.trade.getDraftObservationsByBatch(DB.normalized||{},batchId)
    .filter(row=>row.extractionRuleId==='cbos-2013-exports-summary-v1'||row.extractionRuleId==='cbos-2013-imports-summary-v1'||row.extractionRuleId==='cbos-2014-exports-summary-v1'||row.extractionRuleId==='cbos-2014-imports-summary-v1'||row.extractionRuleId==='cbos-2013-monthly-exports-v1'||row.extractionRuleId==='cbos-2013-monthly-imports-v1'||row.extractionRuleId==='cbos-2014-monthly-exports-v1'||row.extractionRuleId==='cbos-2014-monthly-imports-v1');
}
function teDraftReviewRowsForRule(batchId,ruleId){
  return window.SEO_SERVICES.trade.getDraftObservationsByBatch(DB.normalized||{},batchId).filter(row=>row.extractionRuleId===ruleId);
}
function teLatestBatchForDraftRule(ruleId){
  const normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{});
  const batchIds=new Set((normalized.draftObservations||[]).filter(row=>row.extractionRuleId===ruleId).map(row=>row.importBatchId).filter(Boolean));
  const debugBatch=tePdfDebugLatestBatch();
  if(debugBatch&&batchIds.has(debugBatch.id)) return debugBatch;
  return (normalized.importBatches||[]).slice().reverse().find(batch=>batchIds.has(batch.id))||null;
}
function teTradeBalanceReadinessText(normalized){
  const readiness=teTradeBalanceReadiness(normalized);
  if(readiness.balanceReady) return `Trade Balance readiness: ready · exports ${readiness.exportsTotal.toLocaleString()} · imports ${readiness.importsTotal.toLocaleString()} · balance ${readiness.balance.toLocaleString()} ألف دولار`;
  if(readiness.exportApproved&&readiness.importDraft) return 'Trade Balance readiness: imports draft extracted; balance can be computed after imports approval';
  if(readiness.exportApproved) return 'Trade Balance readiness: exports approved; imports not approved yet';
  return 'Trade Balance readiness: requires approved exports and imports';
}
function teTradeBalanceReadiness(normalized=DB.normalized){
  const shaped=window.SEO_SERVICES.trade.ensureNormalizedShape(normalized||{});
  const exportsTotal=(shaped.publishedTotals||[]).filter(total=>String(total.year)==='2013'&&total.flow==='export'&&total.extractionRuleId==='cbos-2013-exports-summary-v1').reduce((sum,total)=>sum+(Number(total.valueUsdThousand)||0),0);
  const importsTotal=(shaped.publishedTotals||[]).filter(total=>String(total.year)==='2013'&&total.flow==='import'&&total.extractionRuleId==='cbos-2013-imports-summary-v1').reduce((sum,total)=>sum+(Number(total.valueUsdThousand)||0),0);
  const exportApproved=exportsTotal>0||(shaped.observations||[]).some(row=>row.isPublished&&row.flow==='export'&&String(row.year)==='2013'&&row.extractionRuleId==='cbos-2013-exports-summary-v1');
  const importApproved=importsTotal>0||(shaped.observations||[]).some(row=>row.isPublished&&row.flow==='import'&&String(row.year)==='2013'&&row.extractionRuleId==='cbos-2013-imports-summary-v1');
  const importDraft=(shaped.draftObservations||[]).some(row=>row.flow==='import'&&String(row.year)==='2013'&&row.extractionRuleId==='cbos-2013-imports-summary-v1');
  return {exportApproved,importApproved,importDraft,balanceReady:exportApproved&&importApproved,exportsTotal,importsTotal,balance:exportsTotal-importsTotal};
}
function teEnhanceMonthlyExportsValidation(validation,rows,normalized=DB.normalized){
  if(validation?.extractionRuleId!=='cbos-2013-monthly-exports-v1') return validation;
  const shaped=window.SEO_SERVICES.trade.ensureNormalizedShape(normalized||{});
  rows.forEach(row=>{
    row.parsingConfidenceCategory=teMonthlyParsingConfidence(row);
    row.extractionDiagnostics={
      sourcePageNumber:row.sourcePageNumber,
      extractionRuleId:row.extractionRuleId,
      rawRowText:row.rawRowText,
      parsingConfidenceCategory:row.parsingConfidenceCategory,
    };
  });
  const monthlyTotal=rows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  const annualTotal=(shaped.publishedTotals||[])
    .filter(total=>String(total.year)==='2013'&&total.flow==='export'&&total.extractionRuleId==='cbos-2013-exports-summary-v1')
    .reduce((sum,total)=>sum+(Number(total.valueUsdThousand)||0),0);
  const difference=monthlyTotal-annualTotal;
  const differencePct=annualTotal?difference/annualTotal*100:null;
  const duplicateKeys=teMonthlyDraftDuplicateKeys(rows);
  const diagnostics=teMonthlyDraftDiagnostics(rows);
  const reconciliation=teMonthlyExportsReconciliation(rows,shaped,annualTotal,monthlyTotal);
  const activeMonthlyPublishedRows=(shaped.observations||[]).filter(row=>row.isPublished&&row.extractionRuleId==='cbos-2013-monthly-exports-v1').length;
  const absPct=Math.abs(differencePct||0);
  let comparisonStatus=annualTotal&&Math.abs(difference)<=1?'pass':annualTotal&&absPct<=2?'warning':'fail';
  if(!annualTotal) comparisonStatus='warning';
  const fieldStatus=diagnostics.missingCommodityIdRows||diagnostics.missingMonthNumberRows||diagnostics.unmappedCommodityRows?'warning':'pass';
  const status=validation.status==='fail'||comparisonStatus==='fail'||duplicateKeys.length?'fail':validation.status==='warning'||comparisonStatus==='warning'||fieldStatus==='warning'?'warning':'pass';
  const enhancedValidation={
    ...validation,
    status,
    monthlyTotalValueUsdThousand:monthlyTotal,
    annualApprovedExportTotalValueUsdThousand:annualTotal,
    annualComparison:{
      monthlyTotalValueUsdThousand:monthlyTotal,
      annualApprovedTotalValueUsdThousand:annualTotal,
      differenceValueUsdThousand:difference,
      differencePct,
      status:comparisonStatus,
      notes:'Draft monthly commodity rows are compared against approved annual export summary total for review only.',
    },
    duplicateObservationKeys:duplicateKeys,
    duplicateKeysCount:duplicateKeys.length,
    missingValueRows:diagnostics.missingValueRows,
    missingCommodityIdRows:diagnostics.missingCommodityIdRows,
    missingMonthNumberRows:diagnostics.missingMonthNumberRows,
    unmappedCommodityRows:diagnostics.unmappedCommodityRows,
    diagnostics,
    reconciliation,
  };
  enhancedValidation.monthlyApprovalReadiness=teBuildMonthlyApprovalReadiness(enhancedValidation,rows,{activeMonthlyPublishedRows});
  return enhancedValidation;
}
function teBuildMonthlyApprovalReadiness(validation,rows,options={}){
  const blockingReasons=[];
  const warningReasons=[];
  const ruleId='cbos-2013-monthly-exports-v1';
  const activeMonthlyPublishedRows=Number(options.activeMonthlyPublishedRows||0);
  const monthDiffs=validation.tableTotalValidation?.totalsByMonth||[];
  const monthByMonthPass=monthDiffs.length===12&&monthDiffs.every(item=>Math.abs(Number(item.differenceValueUsdThousand)||0)<=1);
  const tableStatus=validation.tableTotalValidation?.status||'not checked';
  const annualStatus=validation.annualComparison?.status||'not checked';
  const duplicateCount=(validation.duplicateObservationKeys||[]).length;
  const unmappedCount=Number(validation.unmappedCommodityRows||validation.diagnostics?.unmappedCommodityRows||0);
  const missingCommodityIdRows=Number(validation.missingCommodityIdRows||validation.diagnostics?.missingCommodityIdRows||0);
  const missingMonthNumberRows=Number(validation.missingMonthNumberRows||validation.diagnostics?.missingMonthNumberRows||0);
  const rowTotalMismatchCount=(validation.rowTotalMismatches||[]).length;
  if(validation.status!=='pass') blockingReasons.push(`validationStatus is ${validation.status}`);
  if(tableStatus!=='pass') blockingReasons.push(`tableTotalValidation is ${tableStatus}`);
  if(!monthByMonthPass) blockingReasons.push('month-by-month reconciliation has differences');
  if(annualStatus!=='pass') blockingReasons.push(`annual reconciliation is ${annualStatus}`);
  if(duplicateCount) blockingReasons.push(`${duplicateCount} duplicate commodity-month key(s)`);
  if(unmappedCount) blockingReasons.push(`${unmappedCount} unmapped commodity row(s)`);
  if(missingCommodityIdRows) blockingReasons.push(`${missingCommodityIdRows} row(s) missing commodityId`);
  if(missingMonthNumberRows) blockingReasons.push(`${missingMonthNumberRows} row(s) missing monthNumber`);
  if(rowTotalMismatchCount) blockingReasons.push(`${rowTotalMismatchCount} row-total mismatch(es)`);
  if(activeMonthlyPublishedRows) blockingReasons.push(`${activeMonthlyPublishedRows} active monthly row(s) already published`);
  if(Number(validation.missingValueRows||validation.diagnostics?.missingValueRows||0)) warningReasons.push('Some monthly cells are blank/hyphen and stored as null by design.');
  if(validation.reconciliation?.missingInMonthly?.length) warningReasons.push('Annual category comparison still has category-level gaps; monthly subtypes reconcile by value.');
  return {
    isReady:blockingReasons.length===0,
    blockingReasons,
    warningReasons,
    checkedAt:new Date().toISOString(),
    ruleId,
    year:2013,
    rowCount:rows.length,
    totalValue:validation.monthlyTotalValueUsdThousand,
    reconciliationStatus:{
      validationStatus:validation.status,
      tableTotalValidation:tableStatus,
      monthByMonth:monthByMonthPass?'pass':'fail',
      annualComparison:annualStatus,
      rowTotalMismatches:rowTotalMismatchCount,
      duplicateKeys:duplicateCount,
    },
    normalizationStatus:{
      unmappedCommodities:unmappedCount,
      missingCommodityIdRows,
      missingMonthNumberRows,
    },
    draftIsolationStatus:{
      activeMonthlyPublishedRows,
      activeObservationsUnchanged:activeMonthlyPublishedRows===0,
    },
  };
}
function teBuildMonthlyImportApprovalReadiness(validation,rows,normalized=DB.normalized,options={}){
  const ruleId='cbos-2013-monthly-imports-v1';
  const blockingReasons=[];
  const warningReasons=[];
  const duplicateKeys=validation.duplicateObservationKeys||teMonthlyDraftDuplicateKeys(rows);
  const diagnostics=validation.diagnostics||teMonthlyDraftDiagnostics(rows);
  const tableStatus=validation.tableTotalValidation?.status;
  const monthDiffs=validation.tableTotalValidation?.totalsByMonth||[];
  const monthByMonthPass=monthDiffs.length===12&&monthDiffs.every(item=>Math.abs(Number(item.differenceValueUsdThousand)||0)<=1);
  const annualDiff=Number(validation.annualComparison?.differenceValueUsdThousand||0);
  const activeMonthlyImportRows=(normalized.observations||[]).filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='import'&&row.periodType==='monthly'&&row.extractionRuleId===ruleId).length;
  const activeBefore=Number(options.activeBefore ?? (normalized.observations||[]).length);
  const activeNow=(normalized.observations||[]).length;
  if(validation.status!=='pass') blockingReasons.push(`validationStatus is ${validation.status}`);
  if(tableStatus!=='pass') blockingReasons.push(`tableTotalValidation is ${tableStatus||'missing'}`);
  if(!monthByMonthPass) blockingReasons.push('month-by-month reconciliation is not clean');
  if(Math.abs(annualDiff)>1) blockingReasons.push(`annual reconciliation gap is ${annualDiff}`);
  if(duplicateKeys.length) blockingReasons.push(`${duplicateKeys.length} duplicate key(s) detected`);
  if(Number(diagnostics.unmappedCommodityRows||0)) blockingReasons.push(`${diagnostics.unmappedCommodityRows} unmapped commodity row(s)`);
  if(Number(diagnostics.missingCommodityIdRows||0)) blockingReasons.push(`${diagnostics.missingCommodityIdRows} missing commodity id row(s)`);
  if(Number(diagnostics.missingMonthRows||diagnostics.missingMonthNumberRows||0)) blockingReasons.push(`${diagnostics.missingMonthRows||diagnostics.missingMonthNumberRows} missing month row(s)`);
  if(activeMonthlyImportRows) blockingReasons.push(`${activeMonthlyImportRows} active monthly import row(s) already published`);
  if(activeNow!==activeBefore) blockingReasons.push('active observations changed during readiness assessment');
  if(Number(diagnostics.missingValueRows||0)) warningReasons.push('Some monthly cells are blank/hyphen and stored as null by design.');
  return {
    isReady:blockingReasons.length===0,
    blockingReasons,
    warningReasons,
    checkedAt:new Date().toISOString(),
    ruleId,
    year:2013,
    flow:'import',
    rowCount:rows.length,
    totalValue:validation.annualComparison?.monthlyTotalValueUsdThousand??rows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0),
    reconciliationStatus:{
      validationStatus:validation.status,
      tableTotalValidation:tableStatus||'missing',
      monthByMonthPass,
      annualComparisonPass:Math.abs(annualDiff)<=1,
      annualDifferenceValueUsdThousand:annualDiff,
      expectedAnnualImportTotalValueUsdThousand:validation.annualComparison?.approvedAnnualImportTotalValueUsdThousand||teTradeBalanceReadiness(normalized).importsTotal,
    },
    normalizationStatus:{
      duplicateKeysCount:duplicateKeys.length,
      unmappedCommodityRows:Number(diagnostics.unmappedCommodityRows||0),
      missingCommodityIdRows:Number(diagnostics.missingCommodityIdRows||0),
      missingMonthRows:Number(diagnostics.missingMonthRows||diagnostics.missingMonthNumberRows||0),
    },
    draftIsolationStatus:{
      activeMonthlyImportRows,
      activeObservationsBefore:activeBefore,
      activeObservationsAfter:activeNow,
      activeObservationsUnchanged:activeNow===activeBefore,
      publishedMonthlyImportRows:activeMonthlyImportRows,
    },
  };
}
function teEnsureMonthlyImportApprovalReadiness(batch,rows){
  if(!batch||!rows.length) return null;
  const validation=teDraftReviewValidationForRule(batch.id,'cbos-2013-monthly-imports-v1');
  if(!validation) return null;
  if(validation.monthlyImportApprovalReadiness) return validation.monthlyImportApprovalReadiness;
  const normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{});
  const readiness=teBuildMonthlyImportApprovalReadiness(validation,rows,normalized);
  validation.monthlyImportApprovalReadiness=readiness;
  saveDB();
  return readiness;
}
function teApprovedAnnualRuleTotal(year,flow,annualRuleId,normalized=DB.normalized){
  const shaped=window.SEO_SERVICES.trade.ensureNormalizedShape(normalized||{});
  const directActiveRows=(shaped.observations||[])
    .filter(row=>row.isPublished&&String(row.year)===String(year)&&row.flow===flow&&(!row.periodType||row.periodType==='annual')&&row.extractionRuleId===annualRuleId)
    .reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  if(String(year)==='2014') return directActiveRows;
  const published=(shaped.publishedTotals||[])
    .filter(total=>String(total.year)===String(year)&&total.flow===flow&&(!total.periodType||total.periodType==='annual')&&total.extractionRuleId===annualRuleId)
    .reduce((sum,total)=>sum+(Number(total.valueUsdThousand)||0),0);
  if(published) return published;
  if(directActiveRows) return directActiveRows;
  const approvedRuleBatches=(shaped.importBatches||[])
    .filter(batch=>batch.ruleApprovals?.[annualRuleId]?.status==='approved')
    .map(batch=>batch.id);
  const viaApprovedBatch = (shaped.observations||[])
    .filter(row=>row.isPublished&&String(row.year)===String(year)&&row.flow===flow&&(!row.periodType||row.periodType==='annual')&&approvedRuleBatches.includes(row.approvedBatchId))
    .reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  if(viaApprovedBatch) return viaApprovedBatch;
  const activeRuleBatchId=shaped.activeYearRuleBatches?.[`${year}:${annualRuleId}`];
  const activeRuleApproval=(shaped.importBatches||[]).find(batch=>batch.id===activeRuleBatchId)?.ruleApprovals?.[annualRuleId];
  const activeRuleRows=(shaped.observations||[])
    .filter(row=>row.isPublished&&String(row.year)===String(year)&&row.flow===flow&&(!row.periodType||row.periodType==='annual')&&(row.approvedBatchId===activeRuleBatchId||row.importBatchId===activeRuleBatchId))
    .reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  if(activeRuleRows) return activeRuleRows;
  return activeRuleApproval?.status==='approved'?Number(activeRuleApproval.approvedTotalValueUsdThousand)||0:0;
}
function teApprovedAnnualRuleLookupDiagnostics(year,flow,annualRuleId,normalized=DB.normalized){
  const shaped=window.SEO_SERVICES.trade.ensureNormalizedShape(normalized||{});
  const totals=(shaped.publishedTotals||[]).filter(total=>String(total.year)===String(year)&&total.flow===flow&&total.extractionRuleId===annualRuleId);
  const rows=(shaped.observations||[]).filter(row=>row.isPublished&&String(row.year)===String(year)&&row.flow===flow&&row.extractionRuleId===annualRuleId);
  const sameYearFlowRows=(shaped.observations||[]).filter(row=>row.isPublished&&String(row.year)===String(year)&&row.flow===flow&&(!row.periodType||row.periodType==='annual'));
  const approvedRuleBatches=(shaped.importBatches||[])
    .filter(batch=>batch.ruleApprovals?.[annualRuleId]?.status==='approved')
    .map(batch=>({id:batch.id,ruleApproval:batch.ruleApprovals[annualRuleId]}));
  const rowsViaApprovedBatch=sameYearFlowRows.filter(row=>approvedRuleBatches.some(batch=>batch.id===row.approvedBatchId));
  const activeRuleBatchId=shaped.activeYearRuleBatches?.[`${year}:${annualRuleId}`]||null;
  const activeRuleApproval=(shaped.importBatches||[]).find(batch=>batch.id===activeRuleBatchId)?.ruleApprovals?.[annualRuleId]||null;
  const activeRuleRows=sameYearFlowRows.filter(row=>row.approvedBatchId===activeRuleBatchId||row.importBatchId===activeRuleBatchId);
  return {
    year,
    flow,
    annualRuleId,
    publishedTotalsCount:totals.length,
    publishedTotals:totals.map(total=>({id:total.id,periodType:total.periodType||null,valueUsdThousand:Number(total.valueUsdThousand)||0,importBatchId:total.importBatchId||null})),
    activeRowsCount:rows.length,
    activeRowsTotalValueUsdThousand:rows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0),
    activeRowsPeriodTypes:[...new Set(rows.map(row=>row.periodType||null))],
    approvedRuleBatches,
    rowsViaApprovedBatchCount:rowsViaApprovedBatch.length,
    rowsViaApprovedBatchTotalValueUsdThousand:rowsViaApprovedBatch.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0),
    activeYearRuleBatchId:activeRuleBatchId,
    activeYearRuleApproval:activeRuleApproval?{status:activeRuleApproval.status,approvedRowsCount:activeRuleApproval.approvedRowsCount,approvedTotalValueUsdThousand:activeRuleApproval.approvedTotalValueUsdThousand}:null,
    activeYearRuleRowsCount:activeRuleRows.length,
    activeYearRuleRowsTotalValueUsdThousand:activeRuleRows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0),
    sameYearFlowAnnualCandidateCount:sameYearFlowRows.length,
    sameYearFlowAnnualCandidateRuleIds:[...new Set(sameYearFlowRows.map(row=>row.extractionRuleId||null))],
    sameYearFlowAnnualCandidateBatchIds:[...new Set(sameYearFlowRows.map(row=>row.approvedBatchId||row.importBatchId||null))].slice(0,10),
  };
}
function teEnhanceMonthlyYearValidation(validation,rows,normalized=DB.normalized,config){
  const shaped=window.SEO_SERVICES.trade.ensureNormalizedShape(normalized||{});
  rows.forEach(row=>{
    row.parsingConfidenceCategory=teMonthlyParsingConfidence(row);
    row.extractionDiagnostics={sourcePageNumber:row.sourcePageNumber,extractionRuleId:row.extractionRuleId,rawRowText:row.rawRowText,parsingConfidenceCategory:row.parsingConfidenceCategory};
  });
  const monthlyTotal=rows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  const approvedAnnualTotal=teApprovedAnnualRuleTotal(config.year,config.flow,config.annualRuleId,shaped);
  const difference=monthlyTotal-approvedAnnualTotal;
  const duplicateKeys=validation.duplicateObservationKeys||teMonthlyDraftDuplicateKeys(rows);
  const diagnostics=validation.diagnostics||teMonthlyDraftDiagnostics(rows);
  const tableStatus=validation.tableTotalValidation?.status||'not checked';
  const monthDiffs=validation.tableTotalValidation?.totalsByMonth||[];
  const monthByMonthPass=monthDiffs.length===12&&monthDiffs.every(item=>Math.abs(Number(item.differenceValueUsdThousand)||0)<=1);
  const rowTotalMismatchCount=(validation.rowTotalMismatches||[]).length;
  const unmappedCount=Number(validation.unmappedCommodityRows||diagnostics.unmappedCommodityRows||0);
  const activeMonthlyRows=(shaped.observations||[]).filter(row=>row.isPublished&&String(row.year)===String(config.year)&&row.flow===config.flow&&row.periodType==='monthly'&&row.extractionRuleId===config.ruleId).length;
  const annualStatus=approvedAnnualTotal&&Math.abs(difference)<=1?'pass':'fail';
  const status=validation.status==='pass'&&tableStatus==='pass'&&monthByMonthPass&&annualStatus==='pass'&&!duplicateKeys.length&&!unmappedCount&&!rowTotalMismatchCount?'pass':'fail';
  const enhanced={
    ...validation,
    status,
    monthlyTotalValueUsdThousand:monthlyTotal,
    approvedAnnualTotalValueUsdThousand:approvedAnnualTotal,
    annualComparison:{
      monthlyTotalValueUsdThousand:monthlyTotal,
      approvedAnnualTotalValueUsdThousand:approvedAnnualTotal,
      annualRuleId:config.annualRuleId,
      differenceValueUsdThousand:difference,
      differencePct:approvedAnnualTotal?difference/approvedAnnualTotal*100:null,
      status:annualStatus,
      notes:`Draft monthly ${config.flow} rows are compared against approved ${config.year} annual ${config.flow} summary total.`,
    },
    duplicateObservationKeys:duplicateKeys,
    duplicateKeysCount:duplicateKeys.length,
    missingValueRows:diagnostics.missingValueRows,
    missingCommodityIdRows:diagnostics.missingCommodityIdRows,
    missingMonthNumberRows:diagnostics.missingMonthNumberRows||diagnostics.missingMonthRows||0,
    unmappedCommodityRows:unmappedCount,
    diagnostics,
    approvedAnnualLookupDiagnostics:teApprovedAnnualRuleLookupDiagnostics(config.year,config.flow,config.annualRuleId,shaped),
  };
  enhanced[config.readinessKey]=teBuildMonthlyYearApprovalReadiness(enhanced,rows,{...config,activeMonthlyRows,approvedAnnualTotal});
  return enhanced;
}
function teMonthlyImportDiscoveryDebugText(discovery){
  const candidates=(discovery?.candidates||[]).slice(0,5);
  return candidates.map(item=>`p${item.pageNumber} ${item.textMode||'text'}: score=${item.signatureScore}, accepted=${item.accepted}, signals=${(item.matchedSignals||[]).join('/')||'none'}, reject=${(item.rejectedSignals||[]).join('/')||'none'}`).join(' · ');
}
function teRenderMonthlyImportDiscoveryDiagnostics(discovery){
  const panel=document.getElementById('te-imports-discovery-panel');
  if(!panel||!discovery) return;
  panel.style.display='flex';
  panel.style.color='var(--imp)';
  panel.textContent=[
    `2014 monthly imports discovery diagnostics`,
    `searchedPages: ${discovery.searchedPages}`,
    `selected: ${discovery.selected?`p${discovery.selected.pageNumber} accepted=${discovery.selected.accepted} score=${discovery.selected.signatureScore}`:'none'}`,
    '',
    ...(discovery.candidates||[]).slice(0,10).map(item=>[
      `page ${item.pageNumber} mode ${item.textMode||'text'} window ${item.windowPageNumbers?.join(',')}`,
      `score=${item.signatureScore}`,
      `accepted=${item.accepted}`,
      `matched=${(item.matchedSignals||[]).join(' | ')||'none'}`,
      `rejected=${(item.rejectedSignals||[]).join(' | ')||'none'}`,
      `months=${(item.detectedMonthLabels||[]).length}/12 missing=${(item.missingMonthLabels||[]).join(',')||'none'}`,
      `signals=${JSON.stringify(item.signalPresence||{})}`,
      `header=${item.headerPreview||''}`,
    ].join('\n')),
  ].join('\n\n');
}
function teRun2014GridInspector(){
  const panel=document.getElementById('te-2014-grid-inspector');
  if(!panel) return;
  panel.style.display='block';
  panel.style.color='var(--navy)';
  try{
    const batch=tePdfLatestParsedBatch('2014');
    if(!batch?.debugPreviewPages?.length) throw new Error('No parsed 2014 PDF pages are available. Re-parse the 2014 PDF first.');
    const svc=window.SEO_SERVICES.tradeExtraction;
    const pages=batch.debugPreviewPages;
    const exportPageMatch=svc.findMonthlyExportsPage(pages,{year:2014,expectedTotalValueUsdThousand:4350210});
    const exportGrid=exportPageMatch?svc.parse2014MonthlyExportsGrid(exportPageMatch.page):null;
    const importPage24=pages.find(page=>Number(page.pageNumber)===24)||null;
    const importText=importPage24?(importPage24.textReconstruction?.normal||importPage24.text||''):'';
    const importSignature=importPage24?svc.scoreMonthlyImportsSignature(importText,importText,{year:2014,expectedTotalValueUsdThousand:9211300,textMode:'normal'}):null;
    const importDiscovery=svc.discoverMonthlyImportsTables(batch,{year:2014,expectedTotalValueUsdThousand:9211300,ruleId:'cbos-2014-monthly-imports-v1'});
    const annualLookup=teApprovedAnnualRuleLookupDiagnostics(2014,'export','cbos-2014-exports-summary-v1',DB.normalized);
    const annualTotal=teApprovedAnnualRuleTotal(2014,'export','cbos-2014-exports-summary-v1',DB.normalized);
    panel.textContent=[
      '2014 PDF Grid Inspector (diagnostic only)',
      'No extraction, approval, publishing, or storage mutation was run.',
      '',
      'EXPORT MONTHLY TABLE CANDIDATE',
      exportPageMatch?[
        `selectedPage: ${exportPageMatch.page.pageNumber}`,
        `textMode: ${exportPageMatch.signature?.textMode||'unknown'}`,
        `signatureScore: ${exportPageMatch.signature?.score}`,
        `signatureAccepted: ${exportPageMatch.signature?.accepted}`,
        `detectedRowsByCurrentParser: ${exportPageMatch.rows?.length||0}`,
      ].join('\n'):'selectedPage: not found',
      '',
      'EXPORT COORDINATE GRID',
      exportGrid?teFormat2014GridExportDiagnostics(exportGrid):'coordinate grid: unavailable (page has no layoutItems; re-parse PDF with latest code)',
      '',
      'IMPORTS PAGE 24 UPRIGHT INSPECTION',
      importPage24?[
        'classification: user-confirmed 2014 monthly imports table page. This page is inspected upright/non-rotated.',
        `page24Items: ${importPage24.itemsCount||0}`,
        `page24TextLength: ${(importPage24.text||'').length}`,
        `signatureScore: ${importSignature?.score}`,
        `signatureAccepted: ${importSignature?.accepted}`,
        `matchedSignals: ${(importSignature?.matchedSignals||[]).join(' | ')||'none'}`,
        `rejectedSignals: ${(importSignature?.rejectedSignals||[]).join(' | ')||'none'}`,
        'headerEvidence:',
        (svc.extractImportsMonthlyHeaderEvidence(importText)||'').slice(0,900),
        'normalRowsPreview:',
        teFormatPageLayoutRows(importPage24,'normal',18),
      ].join('\n'):'page 24 not found in parsed PDF pages',
      '',
      'IMPORTS DISCOVERY SUMMARY',
      importDiscovery?[
        `selected: ${importDiscovery.selected?`p${importDiscovery.selected.pageNumber} ${importDiscovery.selected.textMode} score=${importDiscovery.selected.signatureScore} accepted=${importDiscovery.selected.accepted} window=${(importDiscovery.selected.windowPageNumbers||[]).join(',')}`:'none'}`,
        `safeForDeterministicExtraction: ${importDiscovery.safeForDeterministicExtraction}`,
        'topCandidates:',
        (importDiscovery.candidates||[]).slice(0,8).map(item=>`p${item.pageNumber} ${item.textMode}: score=${item.signatureScore}, accepted=${item.accepted}, reject=${(item.rejectedSignals||[]).join('/')||'none'}`).join('\n'),
      ].join('\n'):'imports discovery unavailable',
      '',
      '2014 ANNUAL EXPORT APPROVED LOOKUP',
      JSON.stringify({
        requiredRuleId:'cbos-2014-exports-summary-v1',
        approvedAnnualExportTotal:annualTotal,
        activeRowsCount:annualLookup.activeRowsCount,
        activeRowsTotalValueUsdThousand:annualLookup.activeRowsTotalValueUsdThousand,
        activeRowsPeriodTypes:annualLookup.activeRowsPeriodTypes,
        publishedTotalsCount:annualLookup.publishedTotalsCount,
        activeYearRuleBatchId:annualLookup.activeYearRuleBatchId,
        note: annualTotal?'Resolved from active approved 2014 annual export rows.':'No active approved 2014 annual export rows found for the required ruleId in current storage.',
      },null,2),
    ].join('\n');
  }catch(err){
    panel.style.color='var(--imp)';
    panel.textContent='2014 grid inspector failed: '+err.message;
  }
}
function teFormat2014GridExportDiagnostics(grid){
  const rows=grid.rows||[];
  const total=rows.reduce((sum,row)=>sum+(Number(row.monthlySumValueUsdThousand)||0),0);
  const mismatchRows=rows.filter(row=>row.rowTotalMismatch);
  const duplicateNames=rows.map(row=>row.commodityName).filter((name,index,arr)=>arr.indexOf(name)!==index);
  const rowPreview=rows.slice(0,90).map(row=>{
    const ignored=(row.gridCellDiagnostics?.ignoredItems||[]).map(item=>`${item.str}@${Number(item.x).toFixed(1)}:${item.reason}`).join('; ');
    return [
      row.commodityName,
      `sum=${Number(row.monthlySumValueUsdThousand||0).toLocaleString()}`,
      `rowTotal=${Number(row.rowTotalValueUsdThousand||0).toLocaleString()}`,
      `diff=${Number(row.rowTotalDifferenceValueUsdThousand||0).toLocaleString()}`,
      `ignored=${ignored||'none'}`,
      `raw=${String(row.rawRowText||'').slice(0,180)}`,
    ].join(' | ');
  }).join('\n');
  return [
    `gridShape: ${grid.shape}`,
    `coordinateItems: ${grid.diagnostics?.coordinateItems}`,
    `yBands: ${grid.diagnostics?.yBands}`,
    `columnLayoutDetected: ${grid.diagnostics?.columnLayoutDetected}`,
    `footerTokensRejected: ${grid.diagnostics?.footerTokensRejected}`,
    `parsedCommodityRows: ${rows.length}`,
    `generatedTotal: ${total.toLocaleString()}`,
    `expectedTotal: 4,350,210`,
    `gap: ${(total-4350210).toLocaleString()}`,
    `totalRowGrandTotal: ${Number(grid.totalRow?.grandTotalValueUsdThousand||0).toLocaleString()}`,
    `rowTotalMismatches: ${mismatchRows.length}`,
    `duplicateCommodityNames: ${[...new Set(duplicateNames)].join(', ')||'none'}`,
    'columnLayout:',
    JSON.stringify(grid.diagnostics?.columnLayout||null,null,2).slice(0,2400),
    'rowPreview:',
    rowPreview||'no rows',
  ].join('\n');
}
function teFormatPageLayoutRows(page,mode='normal',limit=12){
  const rows=page?.textReconstruction?.layoutRows?.[mode]||[];
  return rows.slice(0,limit).map((row,index)=>`${index+1}. ${row}`).join('\n')||'no reconstructed rows available';
}
function teBuildMonthlyYearApprovalReadiness(validation,rows,options){
  const blockingReasons=[];
  const warningReasons=[];
  const tableStatus=validation.tableTotalValidation?.status||'not checked';
  const monthDiffs=validation.tableTotalValidation?.totalsByMonth||[];
  const monthByMonthPass=monthDiffs.length===12&&monthDiffs.every(item=>Math.abs(Number(item.differenceValueUsdThousand)||0)<=1);
  const duplicateCount=(validation.duplicateObservationKeys||[]).length;
  const unmappedCount=Number(validation.unmappedCommodityRows||validation.diagnostics?.unmappedCommodityRows||0);
  const rowTotalMismatchCount=(validation.rowTotalMismatches||[]).length;
  const activeMonthlyRows=Number(options.activeMonthlyRows||0);
  if(validation.status!=='pass') blockingReasons.push(`validationStatus is ${validation.status}`);
  if(tableStatus!=='pass') blockingReasons.push(`tableTotalValidation is ${tableStatus}`);
  if(!monthByMonthPass) blockingReasons.push('month-by-month reconciliation has differences');
  if(validation.annualComparison?.status!=='pass') blockingReasons.push(`annual reconciliation is ${validation.annualComparison?.status||'missing'}`);
  if(!Number(options.approvedAnnualTotal||0)) blockingReasons.push(`approved annual ${options.flow} total is missing`);
  if(duplicateCount) blockingReasons.push(`${duplicateCount} duplicate commodity-month key(s)`);
  if(unmappedCount) blockingReasons.push(`${unmappedCount} unmapped commodity row(s)`);
  if(Number(validation.missingCommodityIdRows||validation.diagnostics?.missingCommodityIdRows||0)) blockingReasons.push('rows missing commodityId');
  if(Number(validation.missingMonthNumberRows||validation.diagnostics?.missingMonthNumberRows||0)) blockingReasons.push('rows missing monthNumber');
  if(rowTotalMismatchCount) blockingReasons.push(`${rowTotalMismatchCount} row-total mismatch(es)`);
  if(activeMonthlyRows) blockingReasons.push(`${activeMonthlyRows} active monthly row(s) already published`);
  if(Number(validation.missingValueRows||validation.diagnostics?.missingValueRows||0)) warningReasons.push('Some monthly cells are blank/hyphen and stored as null by design.');
  return {
    isReady:blockingReasons.length===0,
    blockingReasons,
    warningReasons,
    checkedAt:new Date().toISOString(),
    ruleId:options.ruleId,
    year:options.year,
    flow:options.flow,
    rowCount:rows.length,
    totalValue:validation.monthlyTotalValueUsdThousand,
    reconciliationStatus:{validationStatus:validation.status,tableTotalValidation:tableStatus,monthByMonth:monthByMonthPass?'pass':'fail',annualComparison:validation.annualComparison?.status||'missing',rowTotalMismatches:rowTotalMismatchCount,duplicateKeys:duplicateCount},
    normalizationStatus:{unmappedCommodities:unmappedCount,missingCommodityIdRows:Number(validation.missingCommodityIdRows||validation.diagnostics?.missingCommodityIdRows||0),missingMonthNumberRows:Number(validation.missingMonthNumberRows||validation.diagnostics?.missingMonthNumberRows||0)},
    draftIsolationStatus:{activeMonthlyPublishedRows:activeMonthlyRows,activeObservationsUnchanged:activeMonthlyRows===0},
  };
}
function teMonthlyParsingConfidence(row){
  if(!row.rawRowText||!row.sourcePageNumber||!row.extractionRuleId) return 'low';
  if(row.valueUsdThousand===null||row.valueUsdThousand===undefined||!(row.monthNumber||row.month)) return 'medium';
  if(row.commodityNormalizationStatus==='unmapped'||!row.commodityId) return 'medium';
  return 'high';
}
function teMonthlyExportsReconciliation(monthlyRows,normalized,annualTotal,monthlyTotal){
  const annualRows=(normalized.observations||[]).filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='export'&&row.periodType==='annual'&&row.extractionRuleId==='cbos-2013-exports-summary-v1'&&row.commodityId);
  const annualByCommodity=teSumRowsByCommodity(annualRows,{useReconcileId:false});
  const monthlyByCommodity=teSumRowsByCommodity(monthlyRows,{useReconcileId:true});
  const annualIds=new Set(annualByCommodity.map(row=>row.commodityId));
  const monthlyIds=new Set(monthlyByCommodity.map(row=>row.commodityId));
  const missingInMonthly=annualByCommodity.filter(row=>!monthlyIds.has(row.commodityId));
  const monthlyNotAnnual=monthlyByCommodity.filter(row=>!annualIds.has(row.commodityId));
  const allIds=[...new Set([...annualIds,...monthlyIds])];
  const byAnnual=new Map(annualByCommodity.map(row=>[row.commodityId,row]));
  const byMonthly=new Map(monthlyByCommodity.map(row=>[row.commodityId,row]));
  const commodityReconciliation=allIds.map(id=>{
    const annual=byAnnual.get(id)||{};
    const monthly=byMonthly.get(id)||{};
    const annualValue=Number(annual.valueUsdThousand||0);
    const monthlyValue=Number(monthly.valueUsdThousand||0);
    const difference=monthlyValue-annualValue;
    const differencePct=annualValue?difference/annualValue*100:null;
    const absPct=Math.abs(differencePct||0);
    const status=!annualValue&&monthlyValue?'monthly_only':annualValue&&!monthlyValue?'missing_monthly':Math.abs(difference)<=1?'matched':absPct<=5?'near':'gap';
    return {
      commodityId:id,
      commodityName:annual.commodityName||monthly.commodityName||id,
      annualValueUsdThousand:annualValue,
      monthlyValueUsdThousand:monthlyValue,
      differenceValueUsdThousand:difference,
      differencePct,
      status,
    };
  }).sort((a,b)=>Math.abs(b.differenceValueUsdThousand)-Math.abs(a.differenceValueUsdThousand));
  const coveragePctByValue=annualTotal?monthlyTotal/annualTotal*100:null;
  const coveragePctByCommodity=annualByCommodity.length?annualByCommodity.filter(row=>monthlyIds.has(row.commodityId)).length/annualByCommodity.length*100:null;
  const confidenceCounts=monthlyRows.reduce((acc,row)=>{const key=row.parsingConfidenceCategory||'unknown';acc[key]=(acc[key]||0)+1;return acc;},{});
  const gapCauses=teClassifyMonthlyGap({
    annualTotal,
    monthlyTotal,
    missingInMonthly,
    monthlyNotAnnual,
    coveragePctByValue,
    commodityReconciliation,
  });
  return {
    annualCommodityCount:annualByCommodity.length,
    monthlyCommodityCount:monthlyByCommodity.length,
    missingInMonthly,
    monthlyNotAnnual,
    coveragePctByValue,
    coveragePctByCommodity,
    monthlyContribution:teSumRowsByCommodity(monthlyRows,{useReconcileId:false})
      .map(row=>({...row,sharePct:monthlyTotal?row.valueUsdThousand/monthlyTotal*100:0}))
      .sort((a,b)=>b.valueUsdThousand-a.valueUsdThousand),
    commodityReconciliation,
    confidenceCounts,
    structuralDiagnostics:[
      'Manual evidence confirms the monthly table includes Gold, Gum Hashab, Gum Taleh, Ethanol, Groundnuts, Dura/Sorghum, Other Petroleum Products, and Others.',
      'Any remaining gap is classified as parser/extraction failure, not source coverage limitation.',
      'Monthly rows are parsed from a monthly-specific commodity row catalog with row-total and table-total diagnostics.',
      'No automatic balancing or fabricated rows were applied.',
    ],
    possibleCauses:gapCauses,
    economicallyPublishable:gapCauses.includes('unresolved parsing ambiguity')||gapCauses.includes('incomplete table coverage')||Math.abs((monthlyTotal-annualTotal)/(annualTotal||1)*100)>5?false:true,
  };
}
function teSumRowsByCommodity(rows,options={}){
  const map=new Map();
  rows.forEach(row=>{
    const id=(options.useReconcileId?(row.reconcileCommodityId||row.commodityId):row.commodityId)||row.commodityName;
    if(!id) return;
    if(!map.has(id)) map.set(id,{commodityId:id,commodityName:row.commodityName||id,valueUsdThousand:0,rowsCount:0});
    const item=map.get(id);
    item.valueUsdThousand+=Number(row.valueUsdThousand)||0;
    item.rowsCount+=1;
  });
  return [...map.values()];
}
function teClassifyMonthlyGap({annualTotal,monthlyTotal,missingInMonthly,monthlyNotAnnual,coveragePctByValue,commodityReconciliation}){
  const causes=[];
  const gapPct=annualTotal?(monthlyTotal-annualTotal)/annualTotal*100:null;
  if(coveragePctByValue!==null&&coveragePctByValue<99.5) causes.push('parser failure confirmed by manual evidence');
  if(missingInMonthly.length) causes.push('extraction miss');
  if(monthlyNotAnnual.length) causes.push('commodity normalization mismatch');
  if(Math.abs(gapPct||0)>5) causes.push('annual/monthly semantic mismatch');
  if(commodityReconciliation.some(row=>row.status==='missing_monthly'&&row.annualValueUsdThousand>100000)) causes.push('excluded commodity groups');
  if(Math.abs(gapPct||0)>2) causes.push('unresolved parsing ambiguity');
  return [...new Set(causes)];
}
function teMonthlyDraftDuplicateKeys(rows){
  const counts=new Map();
  rows.forEach(row=>{
    const key=[row.year,row.flow,row.periodType,row.monthNumber||row.month,row.commodityId,row.extractionRuleId].join('|');
    counts.set(key,(counts.get(key)||0)+1);
  });
  return [...counts.entries()].filter(([,count])=>count>1).map(([key])=>key);
}
function teMonthlyDraftDiagnostics(rows){
  return {
    missingValueRows:rows.filter(row=>row.valueUsdThousand===null||row.valueUsdThousand===undefined||row.valueUsdThousand==='').length,
    missingCommodityIdRows:rows.filter(row=>!row.commodityId).length,
    missingMonthNumberRows:rows.filter(row=>!(row.monthNumber||row.month)).length,
    unmappedCommodityRows:rows.filter(row=>row.commodityNormalizationStatus==='unmapped').length,
  };
}
function teDraftReviewRender(batchId){
  const wrap=document.getElementById('te-draft-review'),body=document.getElementById('te-draft-review-body'),summary=document.getElementById('te-draft-review-summary'),filters=document.getElementById('te-draft-review-filters');
  if(!wrap||!body||!summary) return;
  const batch=batchId?((DB.normalized?.importBatches||[]).find(item=>item.id===batchId)||tePdfDebugLatestBatch()):tePdfDebugLatestBatch();
  const rows=batch?teDraftReviewRows(batch.id):[];
  if(!batch||!rows.length){wrap.style.display='none';body.innerHTML='';teDraftApprovalRender(null,[]);teMonthlyValidationPanelRender(null,[]);return;}
  if(filters) filters.style.display='block';
  const filteredRows=teDraftReviewApplyFilters(rows);
  const exportRows=rows.filter(row=>row.flow==='export');
  const importRows=rows.filter(row=>row.flow==='import');
  const monthlyRows=rows.filter(row=>row.flow==='export'&&row.periodType==='monthly');
  const monthlyImportRows=rows.filter(row=>row.flow==='import'&&row.periodType==='monthly');
  const exportValidation=teDraftReviewValidationForRule(batch.id,'cbos-2013-exports-summary-v1')?.status||'not checked';
  const importValidation=teDraftReviewValidationForRule(batch.id,'cbos-2013-imports-summary-v1')?.status||'not checked';
  const monthlyValidation=monthlyRows[0]?teDraftReviewValidationForRule(batch.id,monthlyRows[0].extractionRuleId)?.status||'not checked':'not checked';
  const monthlyImportValidation=monthlyImportRows[0]?teDraftReviewValidationForRule(batch.id,monthlyImportRows[0].extractionRuleId)?.status||'not checked':'not checked';
  const exportSum=exportRows.reduce((total,row)=>total+(Number(row.valueUsdThousand)||0),0);
  const importSum=importRows.reduce((total,row)=>total+(Number(row.valueUsdThousand)||0),0);
  const monthlySum=monthlyRows.reduce((total,row)=>total+(Number(row.valueUsdThousand)||0),0);
  const monthlyImportSum=monthlyImportRows.reduce((total,row)=>total+(Number(row.valueUsdThousand)||0),0);
  wrap.style.display='block';
  summary.textContent=`Draft rows: ${rows.length} · shown: ${filteredRows.length} · annual exports: ${exportRows.length-monthlyRows.length} rows / ${(exportSum-monthlySum).toLocaleString()} ألف دولار / validation ${exportValidation} · monthly exports: ${monthlyRows.length} rows / ${monthlySum.toLocaleString()} ألف دولار / validation ${monthlyValidation} · annual imports: ${importRows.length-monthlyImportRows.length} rows / ${(importSum-monthlyImportSum).toLocaleString()} ألف دولار / validation ${importValidation} · monthly imports: ${monthlyImportRows.length} rows / ${monthlyImportSum.toLocaleString()} ألف دولار / validation ${monthlyImportValidation} · ${teTradeBalanceReadinessText(DB.normalized)} · Batch status: ${batch.status}`;
  teMonthlyValidationPanelRender(batch,monthlyRows,monthlyImportRows);
  body.innerHTML=filteredRows.map(row=>teDraftReviewRowHTML(row,teDraftReviewValidationForRule(batch.id,row.extractionRuleId)?.status||'not checked')).join('');
  teDraftApprovalRender(batch,rows);
  teApprovedRegistryRender();
}
function teDraftReviewApplyFilters(rows){
  const flow=document.getElementById('te-draft-filter-flow')?.value||'all';
  const rule=document.getElementById('te-draft-filter-rule')?.value||'all';
  const period=document.getElementById('te-draft-filter-period')?.value||'all';
  const month=document.getElementById('te-draft-filter-month')?.value||'all';
  const commodity=(document.getElementById('te-draft-filter-commodity')?.value||'').trim().toLowerCase();
  return rows.filter(row=>{
    if(flow!=='all'&&row.flow!==flow) return false;
    if(rule!=='all'&&row.extractionRuleId!==rule) return false;
    if(period!=='all'&&row.periodType!==period) return false;
    if(month!=='all'&&Number(row.monthNumber||row.month)!==Number(month)) return false;
    if(commodity){
      const text=[row.commodityName,row.rawCommodityName,row.commodityId,row.commodityCanonicalEnglishName,row.commodityCanonicalArabicName].join(' ').toLowerCase();
      if(!text.includes(commodity)) return false;
    }
    return true;
  });
}
function teMonthlyValidationPanelRender(batch,monthlyRows,monthlyImportRows=[]){
  const panel=document.getElementById('te-monthly-validation-panel');
  const readinessPanel=document.getElementById('te-monthly-readiness-panel');
  const importReadinessPanel=document.getElementById('te-monthly-import-readiness-panel');
  const reconPanel=document.getElementById('te-monthly-reconciliation-panel');
  if(!panel) return;
  if(!batch||(!monthlyRows.length&&!monthlyImportRows.length)){
    panel.style.display='none';panel.textContent='';
    if(readinessPanel){readinessPanel.style.display='none';readinessPanel.textContent='';}
    if(importReadinessPanel){importReadinessPanel.style.display='none';importReadinessPanel.textContent='';}
    if(reconPanel){reconPanel.style.display='none';reconPanel.textContent='';}
    return;
  }
  const importRuleId=monthlyImportRows[0]?.extractionRuleId||'cbos-2013-monthly-imports-v1';
  const importValidation=monthlyImportRows[0]?teDraftReviewValidationForRule(batch.id,importRuleId):null;
  const importReadiness=importValidation?.monthlyImportApprovalReadiness||(importRuleId==='cbos-2013-monthly-imports-v1'?teEnsureMonthlyImportApprovalReadiness(batch,monthlyImportRows):null);
  teMonthlyImportReadinessPanelRender(importReadinessPanel,importReadiness);
  if(!monthlyRows.length){
    panel.style.display='none';panel.textContent='';
    if(readinessPanel){readinessPanel.style.display='none';readinessPanel.textContent='';}
    if(reconPanel){reconPanel.style.display='none';reconPanel.textContent='';}
    return;
  }
  const exportRuleId=monthlyRows[0]?.extractionRuleId||'cbos-2013-monthly-exports-v1';
  const validation=teDraftReviewValidationForRule(batch.id,exportRuleId);
  if(!validation){
    panel.style.display='none';panel.textContent='';
    if(readinessPanel){readinessPanel.style.display='none';readinessPanel.textContent='';}
    if(reconPanel){reconPanel.style.display='none';reconPanel.textContent='';}
    return;
  }
  const diagnostics=validation.diagnostics||teMonthlyDraftDiagnostics(monthlyRows);
  const duplicateKeys=validation.duplicateObservationKeys||teMonthlyDraftDuplicateKeys(monthlyRows);
  const monthlyTotal=validation.monthlyTotalValueUsdThousand??monthlyRows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  const annualTotal=validation.annualApprovedExportTotalValueUsdThousand??validation.approvedAnnualTotalValueUsdThousand??validation.annualComparison?.approvedAnnualTotalValueUsdThousand??teTradeBalanceReadiness().exportsTotal;
  const diff=validation.annualComparison?.differenceValueUsdThousand??(monthlyTotal-annualTotal);
  const diffPct=validation.annualComparison?.differencePct??(annualTotal?diff/annualTotal*100:null);
  const activeMonthly=(DB.normalized?.observations||[]).filter(row=>row.extractionRuleId===exportRuleId&&row.isPublished).length;
  const monthReconciliation=(validation.tableTotalValidation?.totalsByMonth||[])
    .map(item=>`${item.monthLabel}: table ${Number(item.reportedValueUsdThousand||0).toLocaleString()} / generated ${Number(item.extractedValueUsdThousand||0).toLocaleString()} / diff ${Number(item.differenceValueUsdThousand||0).toLocaleString()} / ${Math.abs(Number(item.differenceValueUsdThousand)||0)<=1?'pass':'fail'}`)
    .join('\n');
  panel.style.display='block';
  panel.style.color=validation.status==='pass'?'var(--exp)':validation.status==='warning'?'var(--amber)':'var(--imp)';
  panel.textContent=[
    'Monthly exports validation',
    `ruleId: ${exportRuleId}`,
    `status: ${validation.status}`,
    `expectedMonths: ${(validation.expectedMonths||[]).join(', ')}`,
    `extractedMonths: ${(validation.coveredMonths||[]).join(', ')}`,
    `missingMonths: ${(validation.missingMonths||[]).length?(validation.missingMonths||[]).join(', '):'none'}`,
    `draftRows: ${monthlyRows.length}`,
    `duplicateKeysCount: ${duplicateKeys.length}`,
    `duplicateExamples: ${duplicateKeys.slice(0,3).join(' || ')||'none'}`,
    `rowTotalMismatches: ${(validation.rowTotalMismatches||[]).length}`,
    `tableTotalValidation: ${validation.tableTotalValidation?.status||'not parsed'}`,
    `tableTotalGrandTotal: ${validation.tableTotalValidation?.reportedGrandTotalValueUsdThousand?.toLocaleString?.()||validation.tableTotalRow?.grandTotalValueUsdThousand?.toLocaleString?.()||'not parsed'}`,
    `tableTotalTokens: ${(validation.tableTotalRow?.numericTokens||[]).slice(0,16).join(' | ')||'not available'}`,
    `tableTotalRaw: ${(validation.tableTotalRow?.rawRowText||'').slice(0,260)}`,
    `candidateRowsParsed: ${(validation.rowDiagnostics||[]).filter(row=>row.status==='parsed'||row.status==='row_total_mismatch').length}`,
    `candidateRowsSkipped: ${(validation.rowDiagnostics||[]).filter(row=>String(row.status||'').startsWith('skipped')).length}`,
    `monthlyTotal: ${Number(monthlyTotal||0).toLocaleString()} thousand USD`,
    `approvedAnnualExportTotal: ${Number(annualTotal||0).toLocaleString()} thousand USD`,
    `difference: ${Number(diff||0).toLocaleString()} thousand USD`,
    `differencePct: ${diffPct===null||diffPct===undefined?'n/a':diffPct.toFixed(2)+'%'}`,
    `missingValueRows: ${diagnostics.missingValueRows}`,
    `missingCommodityIdRows: ${diagnostics.missingCommodityIdRows}`,
    `missingMonthNumberRows: ${diagnostics.missingMonthNumberRows}`,
    `unmappedCommodityRows: ${diagnostics.unmappedCommodityRows}`,
    `publishedMonthlyRows: ${activeMonthly}`,
    `draftIsolation: ${activeMonthly===0?'active observations unchanged':'WARNING monthly rows are published'}`,
    '',
    'Month-by-month table Total reconciliation:',
    monthReconciliation||'not available',
  ].join('\n');
  teMonthlyReadinessPanelRender(readinessPanel,validation.monthlyApprovalReadiness);
  teMonthlyReconciliationPanelRender(reconPanel,validation.reconciliation);
}
function teMonthlyReadinessPanelRender(panel,readiness){
  if(!panel||!readiness){if(panel){panel.style.display='none';panel.textContent='';}return;}
  panel.style.display='block';
  panel.style.color=readiness.isReady?'var(--exp)':'var(--imp)';
  panel.textContent=[
    'Monthly approval readiness gate',
    `isReady: ${readiness.isReady}`,
    `ruleId: ${readiness.ruleId}`,
    `year: ${readiness.year}`,
    `rowCount: ${readiness.rowCount}`,
    `totalValue: ${Number(readiness.totalValue||0).toLocaleString()} thousand USD`,
    `checkedAt: ${readiness.checkedAt}`,
    `reconciliationStatus: ${JSON.stringify(readiness.reconciliationStatus)}`,
    `normalizationStatus: ${JSON.stringify(readiness.normalizationStatus)}`,
    `draftIsolationStatus: ${JSON.stringify(readiness.draftIsolationStatus)}`,
    `blockingReasons: ${readiness.blockingReasons?.length?readiness.blockingReasons.join(' | '):'none'}`,
    `warningReasons: ${readiness.warningReasons?.length?readiness.warningReasons.join(' | '):'none'}`,
    'approvalAction: not implemented',
    'publishingAction: not implemented',
  ].join('\n');
}
function teMonthlyImportReadinessPanelRender(panel,readiness){
  if(!panel||!readiness){if(panel){panel.style.display='none';panel.textContent='';}return;}
  panel.style.display='block';
  panel.style.color=readiness.isReady?'var(--exp)':'var(--imp)';
  panel.textContent=[
    'Monthly import approval readiness gate',
    `isReady: ${readiness.isReady}`,
    `ruleId: ${readiness.ruleId}`,
    `year: ${readiness.year}`,
    `flow: ${readiness.flow}`,
    `rowCount: ${readiness.rowCount}`,
    `totalValue: ${Number(readiness.totalValue||0).toLocaleString()} thousand USD`,
    `checkedAt: ${readiness.checkedAt}`,
    `reconciliationStatus: ${JSON.stringify(readiness.reconciliationStatus)}`,
    `normalizationStatus: ${JSON.stringify(readiness.normalizationStatus)}`,
    `draftIsolationStatus: ${JSON.stringify(readiness.draftIsolationStatus)}`,
    `blockingReasons: ${readiness.blockingReasons?.length?readiness.blockingReasons.join(' | '):'none'}`,
    `warningReasons: ${readiness.warningReasons?.length?readiness.warningReasons.join(' | '):'none'}`,
    'approvalAction: not implemented',
    'publishingAction: not implemented',
  ].join('\n');
}
function teMonthlyReconciliationPanelRender(panel,reconciliation){
  if(!panel||!reconciliation){if(panel){panel.style.display='none';panel.textContent='';}return;}
  const validation=teDraftReviewValidationForRule(tePdfDebugLatestBatch()?.id,'cbos-2013-monthly-exports-v1');
  const missing=reconciliation.missingInMonthly||[];
  const extra=reconciliation.monthlyNotAnnual||[];
  const topContribution=(reconciliation.monthlyContribution||[]).slice(0,8).map((row,index)=>`${index+1}. ${row.commodityName}: ${Number(row.valueUsdThousand||0).toLocaleString()} (${Number(row.sharePct||0).toFixed(1)}%)`).join('\n');
  const topGaps=(reconciliation.commodityReconciliation||[]).slice(0,8).map(row=>`${row.commodityName}: annual ${Number(row.annualValueUsdThousand||0).toLocaleString()} / monthly ${Number(row.monthlyValueUsdThousand||0).toLocaleString()} / diff ${Number(row.differenceValueUsdThousand||0).toLocaleString()} / ${row.differencePct===null?'n/a':row.differencePct.toFixed(1)+'%'} / ${row.status}`).join('\n');
  const rowDiagnostics=(validation?.rowReconciliationDiagnostics||[]).slice(0,8).map(row=>`${row.commodityName}: computed ${Number(row.computedMonthlySumValueUsdThousand||0).toLocaleString()} / rowTotal ${Number(row.extractedRowTotalValueUsdThousand||0).toLocaleString()} / rowDiff ${Number(row.differenceValueUsdThousand||0).toLocaleString()} / generated ${Number(row.generatedMonthlySumValueUsdThousand||0).toLocaleString()} / generatedRows ${row.generatedRowCount} / ${row.parseStatus}`).join('\n');
  panel.style.display='block';
  panel.style.color=reconciliation.economicallyPublishable?'var(--exp)':'var(--imp)';
  panel.textContent=[
    'Monthly exports reconciliation investigation',
    `annualCommodityCount: ${reconciliation.annualCommodityCount}`,
    `monthlyCommodityCount: ${reconciliation.monthlyCommodityCount}`,
    `coveragePctByValue: ${reconciliation.coveragePctByValue===null?'n/a':reconciliation.coveragePctByValue.toFixed(2)+'%'}`,
    `coveragePctByCommodity: ${reconciliation.coveragePctByCommodity===null?'n/a':reconciliation.coveragePctByCommodity.toFixed(2)+'%'}`,
    `missingInMonthly: ${missing.length?missing.map(row=>row.commodityName).join(', '):'none'}`,
    `monthlyNotAnnual: ${extra.length?extra.map(row=>row.commodityName).join(', '):'none'}`,
    `confidenceCounts: ${JSON.stringify(reconciliation.confidenceCounts||{})}`,
    `possibleCauses: ${(reconciliation.possibleCauses||[]).join(', ')||'none'}`,
    `economicallyPublishableYet: ${reconciliation.economicallyPublishable?'yes':'no'}`,
    `expectedChecklist: ${teChecklistSummary(validation?.expectedCommodityChecklist||[])}`,
    `skippedDiagnostics: ${teSkippedDiagnosticsSummary(validation?.rowDiagnostics||[])}`,
    '',
    'Top monthly commodity contributions:',
    topContribution||'none',
    '',
    'Largest annual-vs-monthly gaps:',
    topGaps||'none',
    '',
    'Row reconciliation diagnostics:',
    rowDiagnostics||'none',
    '',
    'Structural diagnostics:',
    (reconciliation.structuralDiagnostics||[]).map(item=>`- ${item}`).join('\n'),
  ].join('\n');
}
function teChecklistSummary(checklist){
  if(!checklist.length) return 'none';
  const parsed=checklist.filter(item=>item.status==='parsed').length;
  const mismatched=checklist.filter(item=>item.rowTotalMismatch).length;
  const missing=checklist.filter(item=>item.status!=='parsed').map(item=>item.commodityName);
  return `parsed ${parsed}/${checklist.length}; rowTotalMismatch ${mismatched}; missing/skipped ${missing.length?missing.join(', '):'none'}`;
}
function teSkippedDiagnosticsSummary(diagnostics){
  if(!diagnostics.length) return 'none';
  const counts=diagnostics.reduce((acc,item)=>{acc[item.status]=(acc[item.status]||0)+1;return acc;},{});
  return JSON.stringify(counts);
}
function teDraftReviewRowHTML(row,validationFlag){
  const id=teAttr(row.id);
  return `<tr data-draft-id="${id}">
    <td>${row.flow==='import'?'واردات':'صادرات'}</td>
    <td>${teEsc(row.periodType||'annual')}</td>
    <td>${teEsc(row.monthLabel||row.month||'')}</td>
    <td><input class="draft-in draft-commodity" disabled value="${teAttr(row.commodityName||'')}" style="width:120px;padding:4px;border:1px solid var(--border2);border-radius:4px;font-family:inherit;font-size:11px"></td>
    <td><input class="draft-in draft-unit" disabled value="${teAttr(row.unit||'')}" style="width:66px;padding:4px;border:1px solid var(--border2);border-radius:4px;font-family:inherit;font-size:11px"></td>
    <td><input class="draft-in draft-quantity" disabled value="${row.quantity===null||row.quantity===undefined?'':teAttr(row.quantity)}" style="width:86px;padding:4px;border:1px solid var(--border2);border-radius:4px;font-family:inherit;font-size:11px;direction:ltr"></td>
    <td><input class="draft-in draft-value" disabled value="${row.valueUsdThousand===null||row.valueUsdThousand===undefined?'':teAttr(row.valueUsdThousand)}" style="width:96px;padding:4px;border:1px solid var(--border2);border-radius:4px;font-family:inherit;font-size:11px;direction:ltr"></td>
    <td class="n">${row.sourcePageNumber||''}</td>
    <td style="font-size:10px;direction:ltr;text-align:left">${teEsc(row.extractionRuleId||'')}</td>
    <td>${teDraftStatusBadge(row)}</td>
    <td>${teEsc(validationFlag)}</td>
    <td style="white-space:nowrap">
      <button class="btn btn-ghost" style="font-size:10px;padding:4px 7px" onclick="teDraftReviewEditRow('${id}')">Edit</button>
      <button class="btn btn-ghost" style="font-size:10px;padding:4px 7px" onclick="teDraftReviewSaveRow('${id}')">Save</button>
      <button class="btn btn-ghost" style="font-size:10px;padding:4px 7px;color:var(--amber)" onclick="teDraftReviewFlagRow('${id}')">Flag</button>
      <button class="btn btn-ghost" style="font-size:10px;padding:4px 7px;color:var(--imp)" onclick="teDraftReviewDeleteRow('${id}')">Delete</button>
    </td>
  </tr>`;
}
function teDraftStatusBadge(row){
  const edited=row.manuallyEdited?' · edited':'';
  const flagged=row.reviewStatus==='flagged'?' · flagged':'';
  return teEsc((row.reviewStatus||'pending')+edited+flagged);
}
function teDraftReviewEditRow(id){
  const tr=document.querySelector(`tr[data-draft-id="${CSS.escape(id)}"]`);
  tr?.querySelectorAll('.draft-in').forEach(input=>input.disabled=false);
  tr?.querySelector('.draft-commodity')?.focus();
}
function teDraftReviewSaveRow(id){
  const tr=document.querySelector(`tr[data-draft-id="${CSS.escape(id)}"]`);
  const row=teDraftReviewFindRow(id);
  if(!tr||!row) return;
  row.commodityName=tr.querySelector('.draft-commodity')?.value.trim()||row.commodityName;
  row.unit=tr.querySelector('.draft-unit')?.value.trim()||null;
  row.quantity=teDraftParseNumberOrNull(tr.querySelector('.draft-quantity')?.value);
  row.valueUsdThousand=teDraftParseNumberOrNull(tr.querySelector('.draft-value')?.value);
  row.valueUsd=row.valueUsdThousand===null?null:row.valueUsdThousand*1000;
  const normalizedCommodity=window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation(row);
  if(normalizedCommodity) Object.assign(row,normalizedCommodity);
  else row.commodityId=window.SEO_SERVICES.tradeExtraction.slug('cbos',row.commodityName);
  row.manuallyEdited=true;
  row.editedAt=new Date().toISOString();
  teDraftReviewPersist();
  teDraftReviewRender(row.importBatchId);
}
function teDraftReviewDeleteRow(id){
  const row=teDraftReviewFindRow(id);
  if(!row) return;
  const activeBefore=(DB.normalized?.observations||[]).length;
  DB.normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
  DB.normalized.draftObservations=DB.normalized.draftObservations.filter(item=>item.id!==id);
  teDraftReviewPersist();
  const activeAfter=(DB.normalized?.observations||[]).length;
  teDraftReviewRender(row.importBatchId);
  teSetPdfProtoStatus(`تم حذف صف مسودة فقط. Active observations unchanged: ${activeBefore===activeAfter}`);
}
function teDraftReviewFlagRow(id){
  const row=teDraftReviewFindRow(id);
  if(!row) return;
  row.reviewStatus='flagged';
  row.reviewFlag=true;
  row.flaggedAt=new Date().toISOString();
  teDraftReviewPersist();
  teDraftReviewRender(row.importBatchId);
}
function teDraftReviewFindRow(id){
  return (DB.normalized?.draftObservations||[]).find(row=>row.id===id);
}
function teDraftReviewPersist(){
  saveDB();
  DB=loadDB();
}
function teDraftApprovalRender(batch,rows){
  const controls=document.getElementById('te-draft-approval-controls'),btn=document.getElementById('te-approve-batch-btn'),importBtn=document.getElementById('te-approve-import-batch-btn'),export2014Btn=document.getElementById('te-approve-2014-export-batch-btn'),import2014Btn=document.getElementById('te-approve-2014-import-batch-btn'),monthlyBtn=document.getElementById('te-approve-monthly-batch-btn'),monthlyImportBtn=document.getElementById('te-approve-monthly-import-batch-btn'),monthly2014ExportBtn=document.getElementById('te-approve-2014-monthly-export-batch-btn'),monthly2014ImportBtn=document.getElementById('te-approve-2014-monthly-import-batch-btn'),status=document.getElementById('te-approval-status');
  if(!controls||!btn||!status) return;
  if(!batch){controls.style.display='none';return;}
  controls.style.display='flex';
  const exportState=teDraftRuleApprovalState(batch,'cbos-2013-exports-summary-v1');
  const importState=teDraftRuleApprovalState(batch,'cbos-2013-imports-summary-v1');
  const export2014State=teDraftAnnualApprovalState(batch,'cbos-2014-exports-summary-v1',2014);
  const import2014State=teDraftAnnualApprovalState(batch,'cbos-2014-imports-summary-v1',2014);
  const monthlyState=teDraftMonthlyApprovalState(batch);
  const monthlyImportState=teDraftMonthlyImportApprovalState(batch);
  const monthly2014ExportState=teDraftMonthlyYearApprovalState(batch,'cbos-2014-monthly-exports-v1',2014,'export','monthlyApprovalReadiness');
  const monthly2014ImportState=teDraftMonthlyYearApprovalState(batch,'cbos-2014-monthly-imports-v1',2014,'import','monthlyImportApprovalReadiness');
  btn.disabled=!exportState.canApprove;
  btn.style.opacity=exportState.canApprove?'1':'.55';
  if(importBtn){importBtn.disabled=!importState.canApprove;importBtn.style.opacity=importState.canApprove?'1':'.55';}
  if(export2014Btn){export2014Btn.disabled=!export2014State.canApprove;export2014Btn.style.opacity=export2014State.canApprove?'1':'.55';}
  if(import2014Btn){import2014Btn.disabled=!import2014State.canApprove;import2014Btn.style.opacity=import2014State.canApprove?'1':'.55';}
  if(monthlyBtn){monthlyBtn.disabled=!monthlyState.canApprove;monthlyBtn.style.opacity=monthlyState.canApprove?'1':'.55';}
  if(monthlyImportBtn){monthlyImportBtn.disabled=!monthlyImportState.canApprove;monthlyImportBtn.style.opacity=monthlyImportState.canApprove?'1':'.55';}
  if(monthly2014ExportBtn){monthly2014ExportBtn.disabled=!monthly2014ExportState.canApprove;monthly2014ExportBtn.style.opacity=monthly2014ExportState.canApprove?'1':'.55';}
  if(monthly2014ImportBtn){monthly2014ImportBtn.disabled=!monthly2014ImportState.canApprove;monthly2014ImportBtn.style.opacity=monthly2014ImportState.canApprove?'1':'.55';}
  status.textContent=`Export: ${exportState.message} · Import: ${importState.message} · 2014 export: ${export2014State.message} · 2014 import: ${import2014State.message} · Monthly exports: ${monthlyState.message} · Monthly imports: ${monthlyImportState.message} · 2014 monthly exports: ${monthly2014ExportState.message} · 2014 monthly imports: ${monthly2014ImportState.message}`;
}
function teDraftApprovalState(batch,rows){return teDraftRuleApprovalState(batch,'cbos-2013-exports-summary-v1');}
function teDraftRuleApprovalState(batch,ruleId){
  const validation=teDraftReviewValidationForRule(batch.id,ruleId);
  const validationOK=validation?.status==='pass'||validation?.status==='warning';
  const existing=(DB.normalized?.observations||[]).filter(obs=>obs.approvedBatchId===batch.id&&obs.extractionRuleId===ruleId);
  const otherActive2013=(DB.normalized?.observations||[]).some(obs=>obs.approvedBatchId!==batch.id&&obs.extractionRuleId===ruleId&&String(obs.year)==='2013'&&obs.isPublished);
  const rows=teDraftReviewRowsForRule(batch.id,ruleId);
  const flow=ruleId.includes('imports')?'import':'export';
  if(batch.ruleApprovals?.[ruleId]?.status==='approved') return {canApprove:false,message:`This ${flow} batch has already been approved`};
  if(batch.ruleApprovals?.[ruleId]?.status==='rejected') return {canApprove:false,message:`This ${flow} draft batch has been rejected`};
  if(existing.length) return {canApprove:false,message:'This batch has already been approved'};
  if(otherActive2013) return {canApprove:false,message:`Another 2013 ${flow} summary batch is already active. Roll it back before approving a replacement.`};
  if(!validationOK) return {canApprove:false,message:`Approval requires validation pass or warning. Current: ${validation?.status||'not checked'}`};
  if(!rows.length) return {canApprove:false,message:`No ${flow} summary draft rows available.`};
  if(!rows.some(row=>row.reviewStatus!=='rejected'&&row.reviewStatus!=='flagged')) return {canApprove:false,message:`No eligible ${flow} rows remain after review flags/rejections.`};
  return {canApprove:true,message:`Approval available for ${flow} summary.`};
}
function teDraftAnnualApprovalState(batch,ruleId,year){
  const validation=teDraftReviewValidationForRule(batch.id,ruleId);
  const rows=teDraftReviewRowsForRule(batch.id,ruleId).filter(row=>String(row.year)===String(year)&&row.periodType==='annual');
  const flow=ruleId.includes('imports')?'import':'export';
  const existingForBatch=(DB.normalized?.observations||[]).filter(obs=>obs.approvedBatchId===batch.id&&obs.extractionRuleId===ruleId);
  const duplicateActive=(DB.normalized?.observations||[]).filter(obs=>obs.approvedBatchId!==batch.id&&obs.isPublished&&String(obs.year)===String(year)&&obs.extractionRuleId===ruleId);
  if(batch.ruleApprovals?.[ruleId]?.status==='approved') return {canApprove:false,message:`This ${year} ${flow} batch has already been approved`};
  if(batch.ruleApprovals?.[ruleId]?.status==='rejected') return {canApprove:false,message:`This ${year} ${flow} draft batch has been rejected`};
  if(existingForBatch.length) return {canApprove:false,message:`This ${year} ${flow} batch has already been approved`};
  if(duplicateActive.length) return {canApprove:false,message:`Active ${year} ${flow} summary already exists. Duplicate approval blocked.`};
  if(validation?.status!=='pass') return {canApprove:false,message:`${year} ${flow} approval requires validation pass. Current: ${validation?.status||'not checked'}`};
  if(Number(validation.unmappedCommodityRows||0)>0||(validation.unmappedCommodities||[]).length) return {canApprove:false,message:`${year} ${flow} approval blocked by unmapped commodities.`};
  if(!rows.length) return {canApprove:false,message:`No ${year} ${flow} annual draft rows available.`};
  if(rows.some(row=>row.reviewStatus==='flagged'||row.reviewStatus==='rejected')) return {canApprove:false,message:`${year} ${flow} draft has flagged or rejected rows.`};
  return {canApprove:true,message:`Approval available for ${year} ${flow} annual summary.`};
}
function teDraftMonthlyApprovalState(batch){
  const ruleId='cbos-2013-monthly-exports-v1';
  const validation=teDraftReviewValidationForRule(batch.id,ruleId);
  const readiness=validation?.monthlyApprovalReadiness;
  const rows=teDraftReviewRowsForRule(batch.id,ruleId).filter(row=>String(row.year)==='2013'&&row.flow==='export'&&row.periodType==='monthly');
  const existingForBatch=(DB.normalized?.observations||[]).filter(obs=>obs.approvedBatchId===batch.id&&obs.extractionRuleId===ruleId&&obs.periodType==='monthly');
  const activeMonthly=(DB.normalized?.observations||[]).filter(obs=>obs.isPublished&&String(obs.year)==='2013'&&obs.flow==='export'&&obs.periodType==='monthly'&&obs.extractionRuleId===ruleId);
  if(batch.ruleApprovals?.[ruleId]?.status==='approved') return {canApprove:false,message:'This monthly batch has already been approved'};
  if(existingForBatch.length) return {canApprove:false,message:'This monthly batch has already been approved'};
  if(activeMonthly.length) return {canApprove:false,message:'Active 2013 monthly exports already exist. Roll them back before approving another monthly batch.'};
  if(!readiness) return {canApprove:false,message:'Monthly approval readiness has not been checked.'};
  if(readiness.isReady!==true) return {canApprove:false,message:`Monthly readiness is blocked: ${(readiness.blockingReasons||[]).join(' | ')||'not ready'}`};
  if(!rows.length) return {canApprove:false,message:'No monthly export draft rows available.'};
  if(rows.some(row=>row.reviewStatus==='flagged'||row.reviewStatus==='rejected')) return {canApprove:false,message:'Monthly draft has flagged or rejected rows.'};
  return {canApprove:true,message:'Approval available for monthly exports.'};
}
function teDraftMonthlyImportApprovalState(batch){
  const ruleId='cbos-2013-monthly-imports-v1';
  const validation=teDraftReviewValidationForRule(batch.id,ruleId);
  const readiness=validation?.monthlyImportApprovalReadiness||teEnsureMonthlyImportApprovalReadiness(batch,teDraftReviewRowsForRule(batch.id,ruleId));
  const rows=teDraftReviewRowsForRule(batch.id,ruleId).filter(row=>String(row.year)==='2013'&&row.flow==='import'&&row.periodType==='monthly');
  const existingForBatch=(DB.normalized?.observations||[]).filter(obs=>obs.approvedBatchId===batch.id&&obs.extractionRuleId===ruleId&&obs.periodType==='monthly');
  const activeMonthly=(DB.normalized?.observations||[]).filter(obs=>obs.isPublished&&String(obs.year)==='2013'&&obs.flow==='import'&&obs.periodType==='monthly'&&obs.extractionRuleId===ruleId);
  if(batch.ruleApprovals?.[ruleId]?.status==='approved') return {canApprove:false,message:'This monthly import batch has already been approved'};
  if(existingForBatch.length) return {canApprove:false,message:'This monthly import batch has already been approved'};
  if(activeMonthly.length) return {canApprove:false,message:'Active 2013 monthly imports already exist. Roll them back before approving another monthly import batch.'};
  if(!readiness) return {canApprove:false,message:'Monthly import approval readiness has not been checked.'};
  if(readiness.isReady!==true) return {canApprove:false,message:`Monthly import readiness is blocked: ${(readiness.blockingReasons||[]).join(' | ')||'not ready'}`};
  if(!rows.length) return {canApprove:false,message:'No monthly import draft rows available.'};
  if(rows.some(row=>row.reviewStatus==='flagged'||row.reviewStatus==='rejected')) return {canApprove:false,message:'Monthly import draft has flagged or rejected rows.'};
  return {canApprove:true,message:'Approval available for monthly imports.'};
}
function teDraftMonthlyYearApprovalState(batch,ruleId,year,flow,readinessKey){
  const validation=teDraftReviewValidationForRule(batch.id,ruleId);
  const readiness=validation?.[readinessKey];
  const rows=teDraftReviewRowsForRule(batch.id,ruleId).filter(row=>String(row.year)===String(year)&&row.flow===flow&&row.periodType==='monthly');
  const existingForBatch=(DB.normalized?.observations||[]).filter(obs=>obs.approvedBatchId===batch.id&&obs.extractionRuleId===ruleId&&obs.periodType==='monthly');
  const activeMonthly=(DB.normalized?.observations||[]).filter(obs=>obs.isPublished&&String(obs.year)===String(year)&&obs.flow===flow&&obs.periodType==='monthly'&&obs.extractionRuleId===ruleId);
  if(batch.ruleApprovals?.[ruleId]?.status==='approved') return {canApprove:false,message:`This ${year} monthly ${flow} batch has already been approved`};
  if(existingForBatch.length) return {canApprove:false,message:`This ${year} monthly ${flow} batch has already been approved`};
  if(activeMonthly.length) return {canApprove:false,message:`Active ${year} monthly ${flow} rows already exist. Roll them back before approving another monthly batch.`};
  if(!readiness) return {canApprove:false,message:`${year} monthly ${flow} approval readiness has not been checked.`};
  if(readiness.isReady!==true) return {canApprove:false,message:`${year} monthly ${flow} readiness blocked: ${(readiness.blockingReasons||[]).join(' | ')||'not ready'}`};
  if(!rows.length) return {canApprove:false,message:`No ${year} monthly ${flow} draft rows available.`};
  if(rows.some(row=>row.reviewStatus==='flagged'||row.reviewStatus==='rejected')) return {canApprove:false,message:`${year} monthly ${flow} draft has flagged or rejected rows.`};
  return {canApprove:true,message:`Approval available for ${year} monthly ${flow}.`};
}
function teApprove2013ExportSummaryBatch(){
  const confirmValue=document.getElementById('te-approval-confirm')?.value||'';
  if(confirmValue!=='APPROVE 2013 EXPORT SUMMARY'){teDraftApprovalMessage('Type APPROVE 2013 EXPORT SUMMARY exactly before approval.',true);return;}
  teApprove2013SummaryRule('cbos-2013-exports-summary-v1');
}
function teApprove2013ImportSummaryBatch(){
  const confirmValue=document.getElementById('te-import-approval-confirm')?.value||'';
  if(confirmValue!=='APPROVE 2013 IMPORT SUMMARY'){teDraftApprovalMessage('Type APPROVE 2013 IMPORT SUMMARY exactly before approval.',true);return;}
  teApprove2013SummaryRule('cbos-2013-imports-summary-v1');
}
function teApprove2014ExportSummaryBatch(){
  const confirmValue=document.getElementById('te-2014-export-approval-confirm')?.value||'';
  if(confirmValue!=='APPROVE 2014 EXPORT SUMMARY'){teDraftApprovalMessage('Type APPROVE 2014 EXPORT SUMMARY exactly before approval.',true);return;}
  teApproveAnnualSummaryRule({year:2014,ruleId:'cbos-2014-exports-summary-v1',flow:'export'});
}
function teApprove2014ImportSummaryBatch(){
  const confirmValue=document.getElementById('te-2014-import-approval-confirm')?.value||'';
  if(confirmValue!=='APPROVE 2014 IMPORT SUMMARY'){teDraftApprovalMessage('Type APPROVE 2014 IMPORT SUMMARY exactly before approval.',true);return;}
  teApproveAnnualSummaryRule({year:2014,ruleId:'cbos-2014-imports-summary-v1',flow:'import'});
}
function teApprove2013MonthlyExportsBatch(){
  const confirmValue=document.getElementById('te-monthly-approval-confirm')?.value||'';
  if(confirmValue!=='APPROVE 2013 MONTHLY EXPORTS'){teDraftApprovalMessage('Type APPROVE 2013 MONTHLY EXPORTS exactly before approval.',true);return;}
  const ruleId='cbos-2013-monthly-exports-v1';
  const batch=teLatestBatchForDraftRule(ruleId);
  if(!batch){teDraftApprovalMessage('No draft batch found.',true);return;}
  const state=teDraftMonthlyApprovalState(batch);
  if(!state.canApprove){teDraftApprovalMessage(state.message,true);return;}
  let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
  const activeBefore=normalized.observations.length;
  const tradeBalanceBefore=teTradeBalanceReadiness(normalized);
  const validation=teDraftReviewValidationForRule(batch.id,ruleId);
  const readiness=validation?.monthlyApprovalReadiness;
  const publishedAt=new Date().toISOString();
  const rows=teDraftReviewRowsForRule(batch.id,ruleId).filter(row=>String(row.year)==='2013'&&row.flow==='export'&&row.periodType==='monthly'&&row.extractionRuleId===ruleId);
  const duplicateActive=normalized.observations.filter(obs=>obs.isPublished&&String(obs.year)==='2013'&&obs.flow==='export'&&obs.periodType==='monthly'&&obs.extractionRuleId===ruleId);
  if(duplicateActive.length){teDraftApprovalMessage('Active 2013 monthly exports already exist. Duplicate approval blocked.',true);return;}
  const approvedRows=rows.map(row=>({
    ...(window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation(row)||row),
    id:'approved_'+row.id,
    isPublished:true,
    publishedAt,
    approvedFromDraftId:row.id,
    approvedBatchId:batch.id,
    reviewStatus:row.reviewStatus||'pending',
  }));
  const existingIds=new Set(normalized.observations.map(obs=>obs.id));
  if(approvedRows.some(row=>existingIds.has(row.id))){teDraftApprovalMessage('Duplicate approved monthly observation ids detected; approval stopped before publishing.',true);return;}
  normalized.observations.push(...approvedRows);
  const total=approvedRows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  const updatedBatch=normalized.importBatches.find(item=>item.id===batch.id);
  if(updatedBatch){
    updatedBatch.ruleApprovals={...(updatedBatch.ruleApprovals||{})};
    updatedBatch.ruleApprovals[ruleId]={
      id:`approval_2013_monthly_exports_${Date.now()}`,
      status:'approved',
      flow:'export',
      periodType:'monthly',
      ruleId,
      year:2013,
      approvedAt:publishedAt,
      approvedRowsCount:approvedRows.length,
      approvedTotalValueUsdThousand:total,
      sourceFileId:batch.sourceFileId,
      importBatchId:batch.id,
      validationResultId:validation?.id||null,
      readinessSnapshot:readiness||null,
      approvalScope:{months:[1,2,3,4,5,6,7,8,9,10,11,12],tableType:'exports_by_commodity_monthly'},
    };
    updatedBatch.status=Object.values(updatedBatch.ruleApprovals).some(item=>item.status==='approved')?'approved':updatedBatch.status;
  }
  normalized.activeYearRuleBatches={...(normalized.activeYearRuleBatches||{}),[`2013:${ruleId}`]:batch.id};
  DB.normalized=normalized;
  saveDB();
  DB=loadDB();
  teInit();teRun();teDraftReviewRender(batch.id);teApprovedRegistryRender(`${batch.id}|${ruleId}`);
  const activeAfter=DB.normalized?.observations?.length||0;
  const tradeBalanceAfter=teTradeBalanceReadiness(DB.normalized);
  teDraftApprovalMessage(`Monthly exports approved · rows: ${approvedRows.length} · total: ${total.toLocaleString()} ألف دولار · active observations added: ${activeAfter-activeBefore} · Trade Balance unchanged: ${tradeBalanceBefore.balance===tradeBalanceAfter.balance}`,false);
}
function teApprove2013MonthlyImportsBatch(){
  const confirmValue=document.getElementById('te-monthly-import-approval-confirm')?.value||'';
  if(confirmValue!=='APPROVE 2013 MONTHLY IMPORTS'){teDraftApprovalMessage('Type APPROVE 2013 MONTHLY IMPORTS exactly before approval.',true);return;}
  const ruleId='cbos-2013-monthly-imports-v1';
  const batch=teLatestBatchForDraftRule(ruleId);
  if(!batch){teDraftApprovalMessage('No draft batch found.',true);return;}
  const state=teDraftMonthlyImportApprovalState(batch);
  if(!state.canApprove){teDraftApprovalMessage(state.message,true);return;}
  let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
  const activeBefore=normalized.observations.length;
  const tradeBalanceBefore=teTradeBalanceReadiness(normalized);
  const annualImportsBefore=(normalized.observations||[]).filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='import'&&row.periodType==='annual').reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  const monthlyExportsBefore=(normalized.observations||[]).filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='export'&&row.periodType==='monthly'&&row.extractionRuleId==='cbos-2013-monthly-exports-v1').length;
  const validation=teDraftReviewValidationForRule(batch.id,ruleId);
  const readiness=validation?.monthlyImportApprovalReadiness;
  const publishedAt=new Date().toISOString();
  const rows=teDraftReviewRowsForRule(batch.id,ruleId).filter(row=>String(row.year)==='2013'&&row.flow==='import'&&row.periodType==='monthly'&&row.extractionRuleId===ruleId);
  const duplicateActive=normalized.observations.filter(obs=>obs.isPublished&&String(obs.year)==='2013'&&obs.flow==='import'&&obs.periodType==='monthly'&&obs.extractionRuleId===ruleId);
  if(duplicateActive.length){teDraftApprovalMessage('Active 2013 monthly imports already exist. Duplicate approval blocked.',true);return;}
  const approvedRows=rows.map(row=>({
    ...(window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation(row)||row),
    id:'approved_'+row.id,
    isPublished:true,
    publishedAt,
    approvedFromDraftId:row.id,
    approvedBatchId:batch.id,
    reviewStatus:row.reviewStatus||'pending',
  }));
  const existingIds=new Set(normalized.observations.map(obs=>obs.id));
  if(approvedRows.some(row=>existingIds.has(row.id))){teDraftApprovalMessage('Duplicate approved monthly import observation ids detected; approval stopped before publishing.',true);return;}
  normalized.observations.push(...approvedRows);
  const total=approvedRows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  const updatedBatch=normalized.importBatches.find(item=>item.id===batch.id);
  if(updatedBatch){
    updatedBatch.ruleApprovals={...(updatedBatch.ruleApprovals||{})};
    updatedBatch.ruleApprovals[ruleId]={
      id:`approval_2013_monthly_imports_${Date.now()}`,
      status:'approved',
      flow:'import',
      periodType:'monthly',
      ruleId,
      year:2013,
      approvedAt:publishedAt,
      approvedRowsCount:approvedRows.length,
      approvedTotalValueUsdThousand:total,
      sourceFileId:batch.sourceFileId,
      importBatchId:batch.id,
      validationResultId:validation?.id||null,
      readinessSnapshot:readiness||null,
      approvalScope:{months:[1,2,3,4,5,6,7,8,9,10,11,12],tableType:'imports_by_commodity_monthly'},
    };
    updatedBatch.status=Object.values(updatedBatch.ruleApprovals).some(item=>item.status==='approved')?'approved':updatedBatch.status;
  }
  normalized.activeYearRuleBatches={...(normalized.activeYearRuleBatches||{}),[`2013:${ruleId}`]:batch.id};
  DB.normalized=normalized;
  saveDB();
  DB=loadDB();
  teInit();teRun();teDraftReviewRender(batch.id);teApprovedRegistryRender(`${batch.id}|${ruleId}`);
  const activeAfter=DB.normalized?.observations?.length||0;
  const tradeBalanceAfter=teTradeBalanceReadiness(DB.normalized);
  const annualImportsAfter=(DB.normalized?.observations||[]).filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='import'&&row.periodType==='annual').reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  const monthlyExportsAfter=(DB.normalized?.observations||[]).filter(row=>row.isPublished&&String(row.year)==='2013'&&row.flow==='export'&&row.periodType==='monthly'&&row.extractionRuleId==='cbos-2013-monthly-exports-v1').length;
  teDraftApprovalMessage(`Monthly imports approved · rows: ${approvedRows.length} · total: ${total.toLocaleString()} ألف دولار · active observations added: ${activeAfter-activeBefore} · annual imports unchanged: ${annualImportsBefore===annualImportsAfter} · monthly exports unaffected: ${monthlyExportsBefore===monthlyExportsAfter} · Trade Balance unchanged: ${tradeBalanceBefore.balance===tradeBalanceAfter.balance}`,false);
}
function teApprove2014MonthlyExportsBatch(){
  const confirmValue=document.getElementById('te-2014-monthly-export-approval-confirm')?.value||'';
  if(confirmValue!=='APPROVE 2014 MONTHLY EXPORTS'){teDraftApprovalMessage('Type APPROVE 2014 MONTHLY EXPORTS exactly before approval.',true);return;}
  teApproveMonthlyYearRule({year:2014,flow:'export',ruleId:'cbos-2014-monthly-exports-v1',readinessKey:'monthlyApprovalReadiness',approvalLabel:'2014 monthly exports'});
}
function teApprove2014MonthlyImportsBatch(){
  const confirmValue=document.getElementById('te-2014-monthly-import-approval-confirm')?.value||'';
  if(confirmValue!=='APPROVE 2014 MONTHLY IMPORTS'){teDraftApprovalMessage('Type APPROVE 2014 MONTHLY IMPORTS exactly before approval.',true);return;}
  teApproveMonthlyYearRule({year:2014,flow:'import',ruleId:'cbos-2014-monthly-imports-v1',readinessKey:'monthlyImportApprovalReadiness',approvalLabel:'2014 monthly imports'});
}
function teApproveMonthlyYearRule(config){
  const batch=teLatestBatchForDraftRule(config.ruleId);
  if(!batch){teDraftApprovalMessage('No draft batch found.',true);return;}
  const state=teDraftMonthlyYearApprovalState(batch,config.ruleId,config.year,config.flow,config.readinessKey);
  if(!state.canApprove){teDraftApprovalMessage(state.message,true);return;}
  let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
  const activeBefore=normalized.observations.length;
  const active2013Before=te2013ActiveStateSnapshot();
  const annualBefore=teApprovedAnnualRuleTotal(config.year,config.flow,config.flow==='export'?'cbos-2014-exports-summary-v1':'cbos-2014-imports-summary-v1',normalized);
  const validation=teDraftReviewValidationForRule(batch.id,config.ruleId);
  const readiness=validation?.[config.readinessKey];
  const rows=teDraftReviewRowsForRule(batch.id,config.ruleId).filter(row=>String(row.year)===String(config.year)&&row.flow===config.flow&&row.periodType==='monthly'&&row.extractionRuleId===config.ruleId);
  const duplicateActive=normalized.observations.filter(obs=>obs.isPublished&&String(obs.year)===String(config.year)&&obs.flow===config.flow&&obs.periodType==='monthly'&&obs.extractionRuleId===config.ruleId);
  if(duplicateActive.length){teDraftApprovalMessage(`Active ${config.approvalLabel} rows already exist. Duplicate approval blocked.`,true);return;}
  const publishedAt=new Date().toISOString();
  const approvedRows=rows.map(row=>({
    ...(window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation(row)||row),
    id:'approved_'+row.id,
    isPublished:true,
    publishedAt,
    approvedFromDraftId:row.id,
    approvedBatchId:batch.id,
    reviewStatus:row.reviewStatus||'pending',
  }));
  const existingIds=new Set(normalized.observations.map(obs=>obs.id));
  if(approvedRows.some(row=>existingIds.has(row.id))){teDraftApprovalMessage(`Duplicate approved ${config.approvalLabel} observation ids detected; approval stopped before publishing.`,true);return;}
  normalized.observations.push(...approvedRows);
  const total=approvedRows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  const updatedBatch=normalized.importBatches.find(item=>item.id===batch.id);
  if(updatedBatch){
    updatedBatch.ruleApprovals={...(updatedBatch.ruleApprovals||{})};
    updatedBatch.ruleApprovals[config.ruleId]={
      id:`approval_${config.year}_monthly_${config.flow}_${Date.now()}`,
      status:'approved',
      flow:config.flow,
      periodType:'monthly',
      ruleId:config.ruleId,
      year:config.year,
      approvedAt:publishedAt,
      approvedRowsCount:approvedRows.length,
      approvedTotalValueUsdThousand:total,
      sourceFileId:batch.sourceFileId,
      importBatchId:batch.id,
      validationResultId:validation?.id||null,
      readinessSnapshot:readiness||null,
      approvalScope:{months:[1,2,3,4,5,6,7,8,9,10,11,12],tableType:`${config.flow}s_by_commodity_monthly`},
    };
    updatedBatch.status=Object.values(updatedBatch.ruleApprovals).some(item=>item.status==='approved')?'approved':updatedBatch.status;
  }
  normalized.activeYearRuleBatches={...(normalized.activeYearRuleBatches||{}),[`${config.year}:${config.ruleId}`]:batch.id};
  DB.normalized=normalized;
  saveDB();
  DB=loadDB();
  teInit();teRun();teDraftReviewRender(batch.id);teApprovedRegistryRender(`${batch.id}|${config.ruleId}`);
  const activeAfter=DB.normalized?.observations?.length||0;
  const active2013After=te2013ActiveStateSnapshot();
  const annualAfter=teApprovedAnnualRuleTotal(config.year,config.flow,config.flow==='export'?'cbos-2014-exports-summary-v1':'cbos-2014-imports-summary-v1',DB.normalized);
  teDraftApprovalMessage(`${config.approvalLabel} approved · rows: ${approvedRows.length} · total: ${total.toLocaleString()} ألف دولار · active observations added: ${activeAfter-activeBefore} · annual ${config.flow} unchanged: ${annualBefore===annualAfter} · 2013 unchanged: ${JSON.stringify(active2013Before)===JSON.stringify(active2013After)}`,false);
}
function teApprove2013SummaryRule(ruleId){
  const status=document.getElementById('te-approval-status');
  const batch=tePdfDebugLatestBatch();
  const flow=ruleId.includes('imports')?'import':'export';
  if(!batch){teDraftApprovalMessage('No draft batch found.',true);return;}
  const rows=teDraftReviewRowsForRule(batch.id,ruleId);
  const state=teDraftRuleApprovalState(batch,ruleId);
  if(!state.canApprove){teDraftApprovalMessage(state.message,true);return;}
  const eligible=rows.filter(row=>row.reviewStatus!=='rejected'&&row.reviewStatus!=='flagged');
  const activeBefore=(DB.normalized?.observations||[]).length;
  const publishedAt=new Date().toISOString();
  let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
  const existing=(normalized.observations||[]).filter(obs=>obs.approvedBatchId===batch.id&&obs.extractionRuleId===ruleId);
  if(existing.length){teDraftApprovalMessage(`This ${flow} batch has already been approved`,true);return;}
  const updatedBatch=normalized.importBatches.find(item=>item.id===batch.id);
  if(ruleId==='cbos-2013-exports-summary-v1'&&updatedBatch&&!updatedBatch.preApprovalLegacy2013){
    updatedBatch.preApprovalLegacy2013=teCapture2013LegacySnapshot();
  }
  const approvedRows=eligible.map(row=>({
    ...(window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation(row)||row),
    id:'approved_'+row.id,
    isPublished:true,
    publishedAt,
    approvedFromDraftId:row.id,
    approvedBatchId:batch.id,
    reviewStatus:row.reviewStatus||'pending',
  }));
  const ids=new Set(normalized.observations.map(obs=>obs.id));
  const uniqueApprovedRows=approvedRows.filter(row=>!ids.has(row.id));
  if(uniqueApprovedRows.length!==approvedRows.length){teDraftApprovalMessage('Duplicate approved observation ids detected; approval stopped before publishing.',true);return;}
  normalized.observations.push(...uniqueApprovedRows);
  const approvedTotal=uniqueApprovedRows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  normalized.publishedTotals=normalized.publishedTotals.filter(total=>!(total.importBatchId===batch.id&&total.flow===flow&&String(total.year)==='2013'&&total.extractionRuleId===ruleId));
  normalized.publishedTotals.push({
    id:`total_2013_${flow}_${batch.id}`,
    year:2013,
    flow,
    periodType:'annual',
    valueUsd:approvedTotal*1000,
    valueUsdThousand:approvedTotal,
    sourceFileId:batch.sourceFileId,
    importBatchId:batch.id,
    extractionRuleId:ruleId,
  });
  if(updatedBatch){
    updatedBatch.status='approved';
    updatedBatch.approvedAt=publishedAt;
    updatedBatch.approvedRowsCount=uniqueApprovedRows.length;
    updatedBatch.approvedTotalValueUsdThousand=approvedTotal;
    updatedBatch.approvedRuleId=updatedBatch.approvedRuleId||ruleId;
    updatedBatch.approvedYear=2013;
    updatedBatch.rollbackAt=null;
    updatedBatch.rolledBackRowsCount=0;
    updatedBatch.ruleApprovals={...(updatedBatch.ruleApprovals||{})};
    updatedBatch.ruleApprovals[ruleId]={status:'approved',flow,approvedAt:publishedAt,approvedRowsCount:uniqueApprovedRows.length,approvedTotalValueUsdThousand:approvedTotal,year:2013};
  }
  normalized.activeYearBatches={...(normalized.activeYearBatches||{}),2013:normalized.activeYearBatches?.['2013']||batch.id};
  normalized.activeYearRuleBatches={...(normalized.activeYearRuleBatches||{}),[`2013:${ruleId}`]:batch.id};
  DB.normalized=normalized;
  if(ruleId==='cbos-2013-exports-summary-v1') teApply2013ExportSummaryLegacyAdapter(uniqueApprovedRows,approvedTotal);
  if(ruleId==='cbos-2013-imports-summary-v1') teApply2013ImportSummaryLegacyAdapter(uniqueApprovedRows,approvedTotal);
  saveDB();
  DB=loadDB();
  teInit();teRun();teDraftReviewRender(batch.id);teApprovedRegistryRender(batch.id);
  const activeAfter=(DB.normalized?.observations||[]).length;
  teDraftApprovalMessage(`${flow} approved rows: ${uniqueApprovedRows.length} · Approved total: ${approvedTotal.toLocaleString()} ألف دولار · Active observations added: ${activeAfter-activeBefore} · duplicate protection: active · ${teTradeBalanceReadinessText(DB.normalized)}`,false);
  if(status) status.style.color='var(--exp)';
}
function teApproveAnnualSummaryRule({year,ruleId,flow}){
  const batch=teLatestBatchForDraftRule(ruleId);
  if(!batch){teDraftApprovalMessage('No draft batch found.',true);return;}
  const state=teDraftAnnualApprovalState(batch,ruleId,year);
  if(!state.canApprove){teDraftApprovalMessage(state.message,true);return;}
  const active2013Before=te2013ActiveStateSnapshot();
  let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
  const activeBefore=normalized.observations.length;
  const validation=teDraftReviewValidationForRule(batch.id,ruleId);
  const rows=teDraftReviewRowsForRule(batch.id,ruleId).filter(row=>String(row.year)===String(year)&&row.flow===flow&&row.periodType==='annual'&&row.extractionRuleId===ruleId);
  if(!rows.length){teDraftApprovalMessage(`No ${year} ${flow} draft rows available.`,true);return;}
  const duplicateActive=normalized.observations.filter(obs=>obs.isPublished&&String(obs.year)===String(year)&&obs.extractionRuleId===ruleId);
  if(duplicateActive.length){teDraftApprovalMessage(`Active ${year} ${flow} summary already exists. Duplicate approval blocked.`,true);return;}
  const publishedAt=new Date().toISOString();
  const approvedRows=rows.map(row=>({
    ...(window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation(row)||row),
    id:'approved_'+row.id,
    isPublished:true,
    publishedAt,
    approvedFromDraftId:row.id,
    approvedBatchId:batch.id,
    reviewStatus:row.reviewStatus||'pending',
  }));
  const existingIds=new Set(normalized.observations.map(obs=>obs.id));
  if(approvedRows.some(row=>existingIds.has(row.id))){teDraftApprovalMessage('Duplicate approved observation ids detected; approval stopped before publishing.',true);return;}
  normalized.observations.push(...approvedRows);
  const approvedTotal=approvedRows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  normalized.publishedTotals=(normalized.publishedTotals||[]).filter(total=>!(total.importBatchId===batch.id&&total.flow===flow&&String(total.year)===String(year)&&total.extractionRuleId===ruleId));
  normalized.publishedTotals.push({
    id:`total_${year}_${flow}_${batch.id}`,
    year,
    flow,
    periodType:'annual',
    valueUsd:approvedTotal*1000,
    valueUsdThousand:approvedTotal,
    sourceFileId:batch.sourceFileId,
    importBatchId:batch.id,
    extractionRuleId:ruleId,
  });
  const updatedBatch=normalized.importBatches.find(item=>item.id===batch.id);
  if(updatedBatch){
    updatedBatch.ruleApprovals={...(updatedBatch.ruleApprovals||{})};
    updatedBatch.ruleApprovals[ruleId]={
      id:`approval_${year}_${flow}_summary_${Date.now()}`,
      status:'approved',
      flow,
      periodType:'annual',
      ruleId,
      year,
      approvedAt:publishedAt,
      approvedRowsCount:approvedRows.length,
      approvedTotalValueUsdThousand:approvedTotal,
      sourceFileId:batch.sourceFileId,
      importBatchId:batch.id,
      validationResultId:validation?.id||null,
      approvalScope:{tableType:validation?.tableType||`${flow}s_summary`,periodType:'annual'},
    };
    updatedBatch.status=Object.values(updatedBatch.ruleApprovals).some(item=>item.status==='approved')?'approved':updatedBatch.status;
    updatedBatch.approvedYear=updatedBatch.approvedYear||year;
  }
  normalized.activeYearBatches={...(normalized.activeYearBatches||{})};
  if(!normalized.activeYearBatches[String(year)]) normalized.activeYearBatches[String(year)]=batch.id;
  normalized.activeYearRuleBatches={...(normalized.activeYearRuleBatches||{}),[`${year}:${ruleId}`]:batch.id};
  DB.normalized=normalized;
  teApplyAnnualSummaryLegacyAdapter(year,flow,approvedRows,approvedTotal,ruleId);
  saveDB();
  DB=loadDB();
  teInit();teRun();teDraftReviewRender(batch.id);teApprovedRegistryRender(`${batch.id}|${ruleId}`);
  const activeAfter=DB.normalized?.observations?.length||0;
  const active2013After=te2013ActiveStateSnapshot();
  teDraftApprovalMessage(`${year} ${flow} approved rows: ${approvedRows.length} · Approved total: ${approvedTotal.toLocaleString()} ألف دولار · Active observations added: ${activeAfter-activeBefore} · duplicate protection: active · 2013 unchanged: ${JSON.stringify(active2013Before)===JSON.stringify(active2013After)}`,false);
}
function teApplyAnnualSummaryLegacyAdapter(year,flow,rows,total,ruleId){
  const y=String(year);
  if(!DB.years[y]) DB.years[y]={monthly_e:[],monthly_i:[],quarterly_e:[],quarterly_i:[],exp_com:[],imp_com:[],exp_ctr:[],imp_ctr:[]};
  const grouped=new Map();
  rows.forEach(row=>{
    const normalized=window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation(row)||row;
    const key=normalized.commodityId||normalized.commodityName;
    if(!grouped.has(key)) grouped.set(key,{n:normalized.commodityName,v:0,q:0,u:normalized.unit,p:0,draftId:normalized.approvedFromDraftId,commodityId:normalized.commodityId,rawNames:new Set()});
    const item=grouped.get(key);
    item.v+=Number(normalized.valueUsdThousand)||0;
    if(normalized.quantity!==null&&normalized.quantity!==undefined) item.q+=Number(normalized.quantity)||0;
    item.rawNames.add(normalized.rawCommodityName||normalized.commodityName);
  });
  const target=flow==='import'?'imp_com':'exp_com';
  DB.years[y][target]=[...grouped.values()].map((row,index)=>({
    n:row.n,
    v:row.v,
    q:row.q||null,
    u:row.u,
    p:total?+(((row.v||0)/total)*100).toFixed(1):0,
    draftId:row.draftId,
    commodityId:row.commodityId,
    rawNames:[...row.rawNames],
    rank:index+1,
  }));
  const annual=DB.annual.find(row=>String(row.y)===y);
  if(annual) annual[flow==='import'?'i':'e']=total;
  else DB.annual.push({y, e:flow==='export'?total:0, i:flow==='import'?total:0});
  DB.annual.sort((a,b)=>String(a.y).localeCompare(String(b.y)));
  const sourceLabel=`${year} ${flow} summary approved draft`;
  if(!DB.sources.find(source=>String(source.year)===y&&source.file===sourceLabel)){
    DB.sources.push({year:y,file:sourceLabel,added:new Date().toISOString().slice(0,10),extractionRuleId:ruleId});
  }
}
function teCapture2013LegacySnapshot(){
  return JSON.parse(JSON.stringify({
    year:DB.years?.['2013']||null,
    annual:(DB.annual||[]).find(row=>String(row.y)==='2013')||null,
    sources:(DB.sources||[]).filter(source=>String(source.year)==='2013'),
    capturedAt:new Date().toISOString(),
  }));
}
function teApply2013ExportSummaryLegacyAdapter(rows,total){
  if(!DB.years['2013']) DB.years['2013']={monthly_e:[],monthly_i:[],quarterly_e:[],quarterly_i:[],exp_com:[],imp_com:[],exp_ctr:[],imp_ctr:[]};
  const grouped=new Map();
  rows.forEach(row=>{
    const normalized=window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation(row)||row;
    const key=normalized.commodityId||normalized.commodityName;
    if(!grouped.has(key)){
      grouped.set(key,{n:normalized.commodityName,v:0,q:0,u:normalized.unit,p:0,draftId:normalized.approvedFromDraftId,commodityId:normalized.commodityId,rawNames:new Set()});
    }
    const item=grouped.get(key);
    item.v+=Number(normalized.valueUsdThousand)||0;
    if(normalized.quantity!==null&&normalized.quantity!==undefined) item.q+=Number(normalized.quantity)||0;
    item.rawNames.add(normalized.rawCommodityName||normalized.commodityName);
  });
  DB.years['2013'].exp_com=[...grouped.values()].map((row,index)=>({
    n:row.n,
    v:row.v,
    q:row.q||null,
    u:row.u,
    p:total?+(((row.v||0)/total)*100).toFixed(1):0,
    draftId:row.draftId,
    commodityId:row.commodityId,
    rawNames:[...row.rawNames],
    rank:index+1,
  }));
  DB.years['2013'].imp_com=DB.years['2013'].imp_com||[];
  DB.years['2013'].exp_ctr=DB.years['2013'].exp_ctr||[];
  DB.years['2013'].imp_ctr=DB.years['2013'].imp_ctr||[];
  DB.years['2013'].monthly_e=DB.years['2013'].monthly_e||[];
  DB.years['2013'].monthly_i=DB.years['2013'].monthly_i||[];
  DB.years['2013'].quarterly_e=DB.years['2013'].quarterly_e||[];
  DB.years['2013'].quarterly_i=DB.years['2013'].quarterly_i||[];
  const annual=DB.annual.find(row=>String(row.y)==='2013');
  if(annual) annual.e=total;
  else DB.annual.push({y:'2013',e:total,i:0});
  DB.annual.sort((a,b)=>String(a.y).localeCompare(String(b.y)));
  if(!DB.sources.find(source=>String(source.year)==='2013'&&source.file==='2013 export summary approved draft')){
    DB.sources.push({year:'2013',file:'2013 export summary approved draft',added:new Date().toISOString().slice(0,10)});
  }
}
function teApply2013ImportSummaryLegacyAdapter(rows,total){
  if(!DB.years['2013']) DB.years['2013']={monthly_e:[],monthly_i:[],quarterly_e:[],quarterly_i:[],exp_com:[],imp_com:[],exp_ctr:[],imp_ctr:[]};
  const grouped=new Map();
  rows.forEach(row=>{
    const normalized=window.SEO_SERVICES.commodity?.applyCommodityNormalizationToObservation(row)||row;
    const key=normalized.commodityId||normalized.commodityName;
    if(!grouped.has(key)){
      grouped.set(key,{n:normalized.commodityName,v:0,q:0,u:normalized.unit,p:0,draftId:normalized.approvedFromDraftId,commodityId:normalized.commodityId,rawNames:new Set()});
    }
    const item=grouped.get(key);
    item.v+=Number(normalized.valueUsdThousand)||0;
    if(normalized.quantity!==null&&normalized.quantity!==undefined) item.q+=Number(normalized.quantity)||0;
    item.rawNames.add(normalized.rawCommodityName||normalized.commodityName);
  });
  DB.years['2013'].imp_com=[...grouped.values()].map((row,index)=>({
    n:row.n,
    v:row.v,
    q:row.q||null,
    u:row.u,
    p:total?+(((row.v||0)/total)*100).toFixed(1):0,
    draftId:row.draftId,
    commodityId:row.commodityId,
    rawNames:[...row.rawNames],
    rank:index+1,
  }));
  DB.years['2013'].exp_com=DB.years['2013'].exp_com||[];
  DB.years['2013'].exp_ctr=DB.years['2013'].exp_ctr||[];
  DB.years['2013'].imp_ctr=DB.years['2013'].imp_ctr||[];
  DB.years['2013'].monthly_e=DB.years['2013'].monthly_e||[];
  DB.years['2013'].monthly_i=DB.years['2013'].monthly_i||[];
  DB.years['2013'].quarterly_e=DB.years['2013'].quarterly_e||[];
  DB.years['2013'].quarterly_i=DB.years['2013'].quarterly_i||[];
  const annual=DB.annual.find(row=>String(row.y)==='2013');
  if(annual) annual.i=total;
  else DB.annual.push({y:'2013',e:0,i:total});
  DB.annual.sort((a,b)=>String(a.y).localeCompare(String(b.y)));
  if(!DB.sources.find(source=>String(source.year)==='2013'&&source.file==='2013 import summary approved draft')){
    DB.sources.push({year:'2013',file:'2013 import summary approved draft',added:new Date().toISOString().slice(0,10)});
  }
}
function teRestore2013LegacyAfterRollback(batch){
  const snapshot=batch?.preApprovalLegacy2013;
  if(snapshot){
    if(snapshot.year) DB.years['2013']=JSON.parse(JSON.stringify(snapshot.year));
    else delete DB.years['2013'];
    DB.annual=(DB.annual||[]).filter(row=>String(row.y)!=='2013');
    if(snapshot.annual) DB.annual.push(JSON.parse(JSON.stringify(snapshot.annual)));
    DB.sources=(DB.sources||[]).filter(source=>String(source.year)!=='2013');
    DB.sources.push(...(snapshot.sources||[]).map(source=>JSON.parse(JSON.stringify(source))));
    DB.annual.sort((a,b)=>String(a.y).localeCompare(String(b.y)));
    return;
  }
  const hasOnlyApprovedAdapterRows=(DB.years?.['2013']?.exp_com||[]).every(row=>row.draftId);
  if(hasOnlyApprovedAdapterRows&&DB.years?.['2013']){
    DB.years['2013'].exp_com=[];
  }
  DB.annual=(DB.annual||[]).filter(row=>String(row.y)!=='2013');
  DB.sources=(DB.sources||[]).filter(source=>!(String(source.year)==='2013'&&source.file==='2013 export summary approved draft'));
}
function teRestore2013ImportLegacyAfterRollback(){
  if(DB.years?.['2013']){
    DB.years['2013'].imp_com=[];
  }
  const remainingImportTotal=(DB.normalized?.publishedTotals||[]).find(total=>String(total.year)==='2013'&&total.flow==='import'&&total.extractionRuleId==='cbos-2013-imports-summary-v1');
  const annual=DB.annual.find(row=>String(row.y)==='2013');
  if(annual) annual.i=remainingImportTotal?.valueUsdThousand||0;
  DB.sources=(DB.sources||[]).filter(source=>!(String(source.year)==='2013'&&source.file==='2013 import summary approved draft'));
}
function teRejectDraftBatch(){
  const confirmValue=document.getElementById('te-reject-confirm')?.value||'';
  const batch=tePdfDebugLatestBatch();
  if(!batch){teDraftApprovalMessage('No draft batch found.',true);return;}
  if(confirmValue!=='REJECT DRAFT BATCH'){teDraftApprovalMessage('Type REJECT DRAFT BATCH exactly before rejection.',true);return;}
  const activeBefore=(DB.normalized?.observations||[]).length;
  let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
  const rejectedAt=new Date().toISOString();
  const targetBatch=normalized.importBatches.find(item=>item.id===batch.id);
  if(targetBatch){targetBatch.status='rejected';targetBatch.rejectedAt=rejectedAt;}
  normalized.draftObservations=normalized.draftObservations.map(row=>row.importBatchId===batch.id?{...row,reviewStatus:'rejected',rejectedAt}:row);
  DB.normalized=normalized;
  saveDB();
  DB=loadDB();
  teDraftReviewRender(batch.id);
  teApprovedRegistryRender();
  const activeAfter=(DB.normalized?.observations||[]).length;
  teDraftApprovalMessage(`Batch rejected · draft rows retained for audit · active observations unchanged: ${activeBefore===activeAfter}`,false);
}
function teRejectImportDraftBatch(){
  const confirmValue=document.getElementById('te-reject-import-confirm')?.value||'';
  const batch=tePdfDebugLatestBatch();
  if(!batch){teDraftApprovalMessage('No draft batch found.',true);return;}
  if(confirmValue!=='REJECT IMPORT DRAFT BATCH'){teDraftApprovalMessage('Type REJECT IMPORT DRAFT BATCH exactly before rejection.',true);return;}
  const activeBefore=(DB.normalized?.observations||[]).length;
  let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized);
  const rejectedAt=new Date().toISOString();
  normalized.draftObservations=normalized.draftObservations.map(row=>row.importBatchId===batch.id&&row.extractionRuleId==='cbos-2013-imports-summary-v1'?{...row,reviewStatus:'rejected',rejectedAt}:row);
  const targetBatch=normalized.importBatches.find(item=>item.id===batch.id);
  if(targetBatch){
    targetBatch.ruleApprovals={...(targetBatch.ruleApprovals||{})};
    targetBatch.ruleApprovals['cbos-2013-imports-summary-v1']={status:'rejected',flow:'import',rejectedAt,year:2013};
  }
  DB.normalized=normalized;
  saveDB();
  DB=loadDB();
  teDraftReviewRender(batch.id);
  teApprovedRegistryRender();
  const activeAfter=(DB.normalized?.observations||[]).length;
  teDraftApprovalMessage(`Import draft rejected · import draft rows retained for audit · active observations unchanged: ${activeBefore===activeAfter}`,false);
}
function teApprovedBatches(){
  const normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{});
  return teApprovedBatchRecords(normalized).map(record=>record.batch);
}
function teApprovedBatchRecords(normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{})){
  const records=[];
  (normalized.importBatches||[]).forEach(batch=>{
    const approvals=batch.ruleApprovals||{};
    Object.entries(approvals).forEach(([ruleId,approval])=>{
      const year=String(approval.year||batch.targetYear||'2013');
      if((approval.status==='approved'||approval.status==='rolled_back')&&(year==='2013'||year==='2014')) records.push({batch,ruleId,approval});
    });
    if(batch.approvedRuleId&&!approvals[batch.approvedRuleId]&&(batch.status==='approved'||batch.status==='rolled_back')){
      records.push({batch,ruleId:batch.approvedRuleId,approval:{status:batch.status,flow:batch.approvedRuleId.includes('imports')?'import':'export',approvedAt:batch.approvedAt,approvedRowsCount:batch.approvedRowsCount,approvedTotalValueUsdThousand:batch.approvedTotalValueUsdThousand,year:batch.approvedYear||2013}});
    }
  });
  return records;
}
function teApprovedRegistryRender(preferredBatchId=null){
  const wrap=document.getElementById('te-approved-registry'),body=document.getElementById('te-approved-registry-body'),summary=document.getElementById('te-approved-registry-summary'),controls=document.getElementById('te-rollback-controls'),select=document.getElementById('te-rollback-batch-select');
  if(!wrap||!body||!summary||!controls||!select) return;
  const normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{});
  const records=teApprovedBatchRecords(normalized);
  if(!records.length){
    wrap.style.display='none';
    body.innerHTML='';
    controls.style.display='none';
    return;
  }
  wrap.style.display='block';
  const current=preferredBatchId||select.value||`${records[0].batch.id}|${records[0].ruleId}`;
  select.innerHTML=records.map(record=>`<option value="${teAttr(record.batch.id+'|'+record.ruleId)}">${teEsc(record.batch.id)} · ${teEsc(record.approval.flow)} · ${teEsc(record.approval.status||'unknown')}</option>`).join('');
  select.value=records.some(record=>`${record.batch.id}|${record.ruleId}`===current)?current:`${records[0].batch.id}|${records[0].ruleId}`;
  controls.style.display='flex';
  const approvedCount=records.filter(record=>record.approval.status==='approved').length;
  const rolledBackCount=records.filter(record=>record.approval.status==='rolled_back').length;
  const migration=commodityMigrationResult||{normalizedCount:0,unmappedCount:0,periodMetadataCount:0,duplicateGroupsResolved:0};
  const ruleMigration=ruleApprovalMigrationResult||{backfilledCount:0};
  summary.textContent=`Approved batch registry: ${records.length} rule approval record(s) · approved: ${approvedCount} · rolled back: ${rolledBackCount} · rule approvals backfilled: ${ruleMigration.backfilledCount||0} · ${teTradeBalanceReadinessText(normalized)} · commodity normalization: ${migration.normalizedCount} normalized, ${migration.unmappedCount} unmapped, ${migration.duplicateGroupsResolved} duplicate group(s) resolved · period metadata fields added: ${migration.periodMetadataCount||0}`;
  body.innerHTML=records.map(record=>teApprovedRegistryRowHTML(record.batch,normalized,record.ruleId,record.approval)).join('');
  teRollbackPreview();
}
function teApprovedRegistryRowHTML(batch,normalized,ruleId=batch.approvedRuleId||batch.rolledBackRuleId||'cbos-2013-exports-summary-v1',approval={}){
  const source=(normalized.sourceFiles||[]).find(item=>item.id===batch.sourceFileId);
  const activeRows=(normalized.observations||[]).filter(obs=>obs.approvedBatchId===batch.id&&obs.extractionRuleId===ruleId);
  const total=approval.status==='approved'
    ? activeRows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0)
    : Number(approval.approvedTotalValueUsdThousand||batch.approvedTotalValueUsdThousand)||0;
  const rows=approval.status==='approved'?activeRows.length:(approval.approvedRowsCount||batch.approvedRowsCount||0);
  return `<tr>
    <td style="font-size:10px;direction:ltr;text-align:left">${teEsc(batch.id)}</td>
    <td>${teEsc(source?.fileName||batch.sourceFileName||batch.sourceFileId||'')}</td>
    <td>${approval.flow==='import'?'واردات':'صادرات'}</td>
    <td style="font-size:10px;direction:ltr;text-align:left">${teEsc(ruleId)}</td>
    <td class="n">${rows}</td>
    <td class="n">${Number(total||0).toLocaleString()}</td>
    <td style="font-size:10px;direction:ltr;text-align:left">${teEsc(approval.approvedAt||batch.approvedAt||'')}</td>
    <td class="n">${teEsc(approval.year||batch.approvedYear||batch.targetYear||'2013')}</td>
    <td>${teEsc(approval.status||batch.status||'')}</td>
  </tr>`;
}
function teRollbackApprovedBatch(){
  const confirmValue=document.getElementById('te-rollback-confirm')?.value||'';
  const selectedBatchId=document.getElementById('te-rollback-batch-select')?.value||'';
  if(confirmValue!=='ROLLBACK APPROVED BATCH'){teRollbackMessage('Type ROLLBACK APPROVED BATCH exactly before rollback.',true);return;}
  let normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{});
  const [batchId,ruleId='cbos-2013-exports-summary-v1']=selectedBatchId.split('|');
  const batch=normalized.importBatches.find(item=>item.id===batchId);
  if(!batch){teRollbackMessage('No approved batch selected.',true);return;}
  const approval=batch.ruleApprovals?.[ruleId]||{status:batch.status};
  if(approval.status!=='approved'){teRollbackMessage(`Rollback disabled for ${ruleId} status: ${approval.status}`,true);return;}
  const approvalYear=String(approval.year||batch.approvedYear||batch.targetYear||'2013');
  if(approvalYear!=='2013'){teRollbackMessage(`Rollback mutation for ${approvalYear} is not implemented in this step. Use Preview Rollback only.`,true);return;}
  const rollbackAt=new Date().toISOString();
  const activeBefore=(normalized.observations||[]).length;
  const draftBefore=(normalized.draftObservations||[]).length;
  const isMonthlyRule=ruleId==='cbos-2013-monthly-exports-v1';
  const isTargetObs=(obs)=>obs.approvedBatchId===batch.id&&obs.extractionRuleId===ruleId&&(!isMonthlyRule||obs.periodType==='monthly');
  const removeRows=(normalized.observations||[]).filter(isTargetObs);
  normalized.observations=(normalized.observations||[]).filter(obs=>!isTargetObs(obs));
  normalized.publishedTotals=(normalized.publishedTotals||[]).filter(total=>!(total.importBatchId===batch.id&&total.extractionRuleId===ruleId));
  batch.ruleApprovals={...(batch.ruleApprovals||{})};
  batch.ruleApprovals[ruleId]={...(batch.ruleApprovals[ruleId]||approval),status:'rolled_back',rollbackAt,rolledBackRowsCount:removeRows.length};
  if(!Object.values(batch.ruleApprovals).some(item=>item.status==='approved')) batch.status='rolled_back';
  batch.rollbackAt=rollbackAt;
  batch.rolledBackRowsCount=removeRows.length;
  batch.rolledBackRuleId=ruleId;
  batch.rolledBackActiveCountBefore=activeBefore;
  batch.rolledBackActiveCountAfter=normalized.observations.length;
  const fallback=teFindActiveBatchFor2013(normalized,batch.id,ruleId);
  normalized.activeYearBatches={...(normalized.activeYearBatches||{})};
  normalized.activeYearRuleBatches={...(normalized.activeYearRuleBatches||{})};
  if(normalized.activeYearRuleBatches[`2013:${ruleId}`]===batch.id){
    if(fallback) normalized.activeYearRuleBatches[`2013:${ruleId}`]=fallback;
    else delete normalized.activeYearRuleBatches[`2013:${ruleId}`];
  }
  if(ruleId==='cbos-2013-exports-summary-v1'&&(normalized.activeYearBatches['2013']===batch.id||normalized.activeYearBatches[2013]===batch.id)){
    if(fallback) normalized.activeYearBatches['2013']=fallback;
    else {delete normalized.activeYearBatches['2013'];delete normalized.activeYearBatches[2013];}
  }
  DB.normalized=normalized;
  if(ruleId==='cbos-2013-exports-summary-v1') teRestore2013LegacyAfterRollback(batch);
  if(ruleId==='cbos-2013-imports-summary-v1') teRestore2013ImportLegacyAfterRollback();
  saveDB();
  DB=loadDB();
  teInit();teRun();teDraftReviewRender(batch.id);teApprovedRegistryRender(`${batch.id}|${ruleId}`);
  const activeAfter=(DB.normalized?.observations||[]).length;
  const draftAfter=(DB.normalized?.draftObservations||[]).length;
  const input=document.getElementById('te-rollback-confirm');if(input) input.value='';
  teRollbackMessage(`Rollback complete · rule: ${ruleId} · removed observations: ${removeRows.length} · affected year: 2013 · rollbackAt: ${rollbackAt} · active observations after rollback: ${activeAfter} · draft rows preserved: ${draftBefore===draftAfter}`,false);
}
function teRollbackPreview(){
  const box=document.getElementById('te-rollback-preview');
  const selected=document.getElementById('te-rollback-batch-select')?.value||'';
  if(!box||!selected){if(box) box.style.display='none';return null;}
  const normalized=window.SEO_SERVICES.trade.ensureNormalizedShape(DB.normalized||{});
  const [batchId,ruleId='cbos-2013-exports-summary-v1']=selected.split('|');
  const rows=(normalized.observations||[]).filter(obs=>obs.approvedBatchId===batchId&&obs.extractionRuleId===ruleId);
  const total=rows.reduce((sum,row)=>sum+(Number(row.valueUsdThousand)||0),0);
  const flow=rows[0]?.flow||(ruleId.includes('imports')?'import':'export');
  const year=rows[0]?.year||2013;
  const periodType=rows[0]?.periodType||(ruleId.includes('monthly')?'monthly':'annual');
  const months=[...new Set(rows.map(row=>Number(row.monthNumber||row.month)).filter(Boolean))].sort((a,b)=>a-b);
  const draftRows=(normalized.draftObservations||[]).filter(obs=>obs.importBatchId===batchId&&obs.extractionRuleId===ruleId).length;
  box.style.display='block';
  box.textContent=[
    'Rollback dry-run preview',
    `batchId: ${batchId}`,
    `ruleId: ${ruleId}`,
    `flow: ${flow}`,
    `year: ${year}`,
    `periodType: ${periodType}`,
    `affectedMonths: ${months.length?months.join(', '):'n/a'}`,
    `observations that would be removed: ${rows.length}`,
    `total affected value: ${total.toLocaleString()} ألف دولار`,
    `draft rows preserved: ${draftRows}`,
  ].join('\n');
  return {batchId,ruleId,flow,year,periodType,affectedMonths:months,count:rows.length,total,draftRows};
}
function teFindActiveBatchFor2013(normalized,excludeBatchId,ruleId='cbos-2013-exports-summary-v1'){
  const rows=(normalized.observations||[]).filter(obs=>obs.approvedBatchId!==excludeBatchId&&obs.extractionRuleId===ruleId&&String(obs.year)==='2013');
  if(!rows.length) return null;
  const sorted=rows.slice().sort((a,b)=>String(b.publishedAt||'').localeCompare(String(a.publishedAt||'')));
  return sorted[0].approvedBatchId||sorted[0].importBatchId||null;
}
function teRollbackMessage(message,isError=false){
  const status=document.getElementById('te-rollback-status');
  if(status){status.style.color=isError?'var(--imp)':'var(--exp)';status.textContent=message;}
  teSetPdfProtoStatus(message,isError);
}
function teDraftApprovalMessage(message,isError=false){
  const status=document.getElementById('te-approval-status');
  if(status){status.style.color=isError?'var(--imp)':'var(--exp)';status.textContent=message;}
  teSetPdfProtoStatus(message,isError);
}
function teDraftParseNumberOrNull(value){
  const text=String(value||'').replace(/,/g,'').trim();
  if(!text||text==='-') return null;
  const parsed=Number(text);
  return Number.isFinite(parsed)?parsed:null;
}
function teEsc(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function teAttr(value){return teEsc(value);}

// ══ MARKET PRICES ══
const MP_ITEMS = window.SEO_SERVICES.market.loadItems(window.SEO_DATA.MP_ITEMS);
let MP_CHART=null,mpSel=MP_ITEMS[0];
function mpInit(){
  // Populate item select
  const itemSel=document.getElementById('mp-item');
  if(itemSel){const cur=itemSel.value;itemSel.innerHTML=MP_ITEMS.map(i=>`<option value="${i.n}">${i.n}</option>`).join('');if(cur) itemSel.value=cur;}
  // Populate state select with all 18 states
  const stateSel=document.getElementById('mp-state');
  if(stateSel&&stateSel.options.length<5){
    const states=['الخرطوم','كسلا','البحر الأحمر','القضارف','سنار','الجزيرة','النيل الأزرق','النيل الأبيض','شمال كردفان','جنوب كردفان','شمال دارفور','جنوب دارفور','وسط دارفور','غرب دارفور','شرق دارفور','نهر النيل','الولاية الشمالية','غرب كردفان'];
    states.forEach(s=>{if(!stateSel.querySelector(`option[value="${s}"]`)){const o=document.createElement('option');o.value=s;o.textContent=s;stateSel.appendChild(o);}});
  }
  // Filter by selected item if specific
  const selItem=document.getElementById('mp-item')?.value;
  const filteredItems=selItem&&selItem!=='all'?MP_ITEMS.filter(i=>i.n===selItem):MP_ITEMS;
  document.getElementById('mp-grid').innerHTML=filteredItems.map(item=>`<div class="price-card" onclick="mpSelectItem('${item.n}')"><div class="pc-item">${item.n}</div><div class="pc-price">${item.p.toLocaleString()}</div><div class="pc-unit">SDG / ${item.u} — تقدير</div><div class="pc-change ${item.trend==='up'?'tr-r':item.trend==='down'?'tr-g':'tr-y'}">${item.ch}</div></div>`).join('');
  if(!mpSel) mpSel=MP_ITEMS[0];
  mpRenderChart(mpSel);
}
function mpSelectItem(name){mpSel=MP_ITEMS.find(i=>i.n===name)||MP_ITEMS[0];document.getElementById('mp-chart-title').textContent=`تطور السعر — ${name} 2025`;mpRenderChart(mpSel);}
function mpSelectByFilter(){const name=document.getElementById('mp-item').value;mpSelectItem(name);}
function mpRun(){mpInit();}
function mpRenderChart(item){
  if(MP_CHART){MP_CHART.destroy();MP_CHART=null;}
  const ctx=document.getElementById('mp-chart').getContext('2d');
  const isBar=document.getElementById('mp-vt-bar')?.classList.contains('on');
  MP_CHART=new Chart(ctx,{type:isBar?'bar':'line',data:{labels:MN,datasets:[{label:`${item.n} (SDG/${item.u})`,data:item.mon,backgroundColor:isBar?'rgba(27,58,107,.65)':'rgba(27,58,107,.1)',borderColor:'rgba(27,58,107,1)',borderWidth:isBar?0:2,tension:.4,fill:!isBar,pointRadius:3,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(27,58,107,.95)',titleColor:'#fff',bodyColor:'rgba(255,255,255,.75)',padding:9}},scales:{x:{ticks:{color:'#6b7280',font:{size:9}},grid:{color:'rgba(0,0,0,.04)'}},y:{ticks:{color:'#6b7280',font:{size:9},callback:v=>v.toLocaleString()+' SDG'},grid:{color:'rgba(0,0,0,.04)'}}}},});
}
function mpSetChart(t,btn){document.querySelectorAll('[id^=mp-vt-]').forEach(b=>b.className='vt');btn.className='vt on';mpRenderChart(mpSel);}
function mpDL(){dlCSV([['السلعة',...MN],...MP_ITEMS.map(i=>[i.n,...i.mon])],'market_prices_sudan');}
function mpDLTemplate(){dlCSV([['date','state','commodity','price_sdg','unit'],['2025-01-01','بورتسودان','دقيق القمح',1200,'كجم']],'market_prices_template');}
function mpLoadFile(e){
  const f=e.target.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    const lines=ev.target.result.split('\n').filter(l=>l.trim());
    const headers=lines[0].split(',').map(h=>h.replace(/"/g,'').trim());
    const rows=lines.slice(1).map(l=>l.split(',').map(v=>v.replace(/"/g,'').trim()));
    let added=0;
    rows.forEach(r=>{
      const item=r[headers.indexOf('commodity')]||r[0]||'';
      const price=parseFloat(r[headers.indexOf('price_sdg')]||r[1]||0);
      const city=r[headers.indexOf('state')]||r[2]||'';
      if(item&&price){
        const existing=MP_ITEMS.find(i=>i.n===item);
        if(existing){existing.p=price;added++;}
        else{MP_ITEMS.push({n:item,u:'كجم',p:price,ch:'جديد',trend:'flat',mon:Array(12).fill(price)});added++;}
      }
    });
    mpSavePrices();mpInit();
    addFileTag('mp-files-list',f.name,'✅ '+added+' سجل');
    alert('✅ تم إضافة '+added+' سجل من '+f.name);
  };
  reader.readAsText(f,'UTF-8');
}
const MP_KEY='seo_mp_v1';
function mpSavePrices(){window.SEO_SERVICES.market.saveItems(MP_ITEMS);}
function mpLoadPrices(){const s=window.SEO_SERVICES.market.loadItems(window.SEO_DATA.MP_ITEMS);if(s&&s.length) MP_ITEMS.length=0,MP_ITEMS.push(...s);}
function mpAddItem(){
  const name=document.getElementById('new-item-name').value.trim();
  const unit=document.getElementById('new-item-unit').value.trim()||'كجم';
  const price=parseFloat(document.getElementById('new-item-price').value)||0;
  if(!name){alert('أدخل اسم السلعة');return;}
  if(MP_ITEMS.find(i=>i.n===name)){alert('السلعة موجودة بالفعل');return;}
  MP_ITEMS.push({n:name,u:unit,p:price||0,ch:'جديد',trend:'flat',mon:Array(12).fill(price||0)});
  mpSavePrices();mpInit();
  document.getElementById('new-item-name').value='';document.getElementById('new-item-price').value='';
  const sel=document.getElementById('mp-item');sel.innerHTML=MP_ITEMS.map(i=>`<option value="${i.n}">${i.n}</option>`).join('');
  addTag('mp-added-list','✅ سلعة: '+name);
}
function mpAddCity(){
  const city=document.getElementById('new-city-name').value.trim();
  const state=document.getElementById('new-city-state').value;
  if(!city||!state){alert('أدخل اسم المدينة والولاية');return;}
  const sel=document.getElementById('mp-state');
  if(!sel.querySelector(`option[value="${city}"]`)){const opt=document.createElement('option');opt.value=city;opt.textContent=city+' ('+state+')';sel.appendChild(opt);}
  addTag('mp-added-list','✅ مدينة: '+city+' — '+state);
  document.getElementById('new-city-name').value='';
}
function mpAddMarket(){
  const market=document.getElementById('new-market-name').value.trim();
  const city=document.getElementById('new-market-city').value.trim();
  if(!market){alert('أدخل اسم السوق');return;}
  addTag('mp-added-list','✅ سوق: '+market+(city?' — '+city:''));
  document.getElementById('new-market-name').value='';document.getElementById('new-market-city').value='';
}
function addTag(cid,text){const el=document.getElementById(cid);if(el) el.innerHTML=`<div class="lf-item"><span>${text}</span></div>`+el.innerHTML;}
function mpDLAllData(){const rows=[['السلعة','الوحدة','آخر سعر SDG','التغيير',...MN.map(m=>m+' 2025')],...MP_ITEMS.map(i=>[i.n,i.u,i.p,i.ch,...i.mon])];dlCSV(rows,'market_prices_all_sudan');}

// ══ MACRO ══
let ICHART=null,GCHART=null;
function macroInit(){
  if(ICHART) ICHART.destroy();
  const ic=document.getElementById('inf-chart')?.getContext('2d');
  if(ic) ICHART=new Chart(ic,{type:'line',data:{labels:['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024'],datasets:[{label:'التضخم %',data:[16,17,33,63,51,163,359,138,256,83],backgroundColor:'rgba(185,28,28,.1)',borderColor:'rgba(185,28,28,.8)',borderWidth:2,tension:.4,fill:true,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.raw}%`}}},scales:{x:{ticks:{color:'#6b7280',font:{size:9}},grid:{color:'rgba(0,0,0,.04)'}},y:{ticks:{color:'#6b7280',font:{size:9},callback:v=>v+'%'},grid:{color:'rgba(0,0,0,.04)'}}}},});
  if(GCHART) GCHART.destroy();
  const gc=document.getElementById('gdp-chart')?.getContext('2d');
  if(gc) GCHART=new Chart(gc,{type:'bar',data:{labels:['2015','2016','2017','2018','2019','2020','2021'],datasets:[{label:'GDP $B',data:[97,95,117,90,72,67,34],backgroundColor:CLRS.slice(0,7),borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`$${ctx.raw}B`}}},scales:{x:{ticks:{color:'#6b7280',font:{size:9}},grid:{color:'rgba(0,0,0,.04)'}},y:{ticks:{color:'#6b7280',font:{size:9},callback:v=>'$'+v+'B'},grid:{color:'rgba(0,0,0,.04)'}}}},});
}

// ══ GAPS ══
const GAP_DATA = window.SEO_SERVICES.gaps.loadData(window.SEO_DATA.GAP_DATA);
const GAP_DET = window.SEO_SERVICES.gaps.loadDetails(window.SEO_DATA.GAP_DET);
const GCM={'🟢':'gc-g','🟡':'gc-w','🔴':'gc-r','⭕':'gc-n'};
const SBDG={حرج:'badge-r',مزمن:'badge-r',متقطع:'badge-w',متأخر:'badge-w',مفقود:'badge-r'};
function gapsRender(){
  document.getElementById('gap-tbody').innerHTML=GAP_DATA.map(r=>`<tr><td>${r.n}</td>${r.c.map(c=>`<td><div class="gc ${GCM[c]||'gc-n'}">${c}</div></td>`).join('')}<td><span class="badge ${SBDG[r.s]||'badge-b'}">${r.s}</span></td></tr>`).join('');
  document.getElementById('gap-cards').innerHTML=GAP_DET.map(g=>`<div class="gap-card ${g.type}"><div class="gc-title">${g.ic} ${g.t}</div><div class="gc-body">${g.b}</div><div class="gc-impact">⚡ ${g.impact}</div></div>`).join('');
}

// ══ FORUM ══
const F_KEY='seo_forum_v2';
const FTOPICS = window.SEO_DATA.FTOPICS;
const TL={macro:'الاقتصاد الكلي',monetary:'السياسة النقدية',trade:'التجارة',food:'الأمن الغذائي',gaps:'فجوات البيانات',policy:'السياسات',other:'أخرى'};
let POSTS=window.SEO_SERVICES.forum.loadPosts();
function fSave(){window.SEO_SERVICES.forum.savePosts(POSTS);}
function fRender(){
  const tc={};POSTS.forEach(p=>{tc[p.topic]=(tc[p.topic]||0)+1;});
  document.getElementById('forum-topics').innerHTML=FTOPICS.map(t=>`<div class="topic-row"><div class="td" style="background:${t.c}"></div><div class="tr-name">${t.n}</div><div class="tr-cnt">${tc[t.id]||0}</div></div>`).join('');
  document.getElementById('f-count').textContent=POSTS.length;
  document.getElementById('f-authors').textContent=[...new Set(POSTS.map(p=>p.author))].length;
  const top=Object.entries(tc).sort((a,b)=>b[1]-a[1])[0];
  document.getElementById('f-top-topic').textContent=top?TL[top[0]]:'—';
  document.getElementById('forum-posts').innerHTML=POSTS.slice().reverse().map(p=>`<div class="post-card"><div class="post-meta"><div class="avatar">${p.author[0]}</div><div><div class="post-author">${p.author}</div><div class="post-time">${p.time||'الآن'}</div></div><div class="post-tag">${TL[p.topic]||p.topic}</div></div><div class="post-title">${p.title}</div><div class="post-body">${p.body.length>200?p.body.slice(0,200)+'...':p.body}</div><div class="post-acts"><div class="pact" onclick="fLike(${p.id},this)">❤ ${p.likes||0}</div><div class="pact">💬 مشاركة</div></div></div>`).join('');
}
function fPost(){const t=document.getElementById('f-title').value.trim(),b=document.getElementById('f-body').value.trim(),topic=document.getElementById('f-topic').value,author=document.getElementById('f-author').value.trim()||'مجهول';if(!t||!b){alert('يرجى كتابة العنوان والمحتوى');return;}POSTS.push({id:Date.now(),title:t,body:b,topic,author,time:'الآن — '+new Date().toLocaleDateString('ar-SA'),likes:0});fSave();document.getElementById('f-title').value='';document.getElementById('f-body').value='';fRender();}
function fLike(id,el){const p=POSTS.find(p=>p.id===id);if(p){p.likes=(p.likes||0)+1;fSave();el.textContent='❤ '+p.likes;}}

// ══ LIBRARY ══
const LIBRARY = window.SEO_SERVICES.library.loadItems(window.SEO_DATA.LIBRARY);
function libSearch(){const q=document.getElementById('lib-q').value.toLowerCase();const d=q?LIBRARY.filter(l=>l.title.includes(q)||l.desc.includes(q)||l.src.toLowerCase().includes(q)):LIBRARY;document.getElementById('lib-grid').innerHTML=d.map(l=>`<div class="lib-card"><div class="lib-type">${l.type}</div><div class="lib-title">${l.title}</div><div class="lib-desc">${l.desc}</div><div class="lib-meta"><span>${l.year} · ${l.src}</span><span class="badge ${l.tag}">${l.type}</span></div></div>`).join('');}
function libRender(){libSearch();}

// ══ HELPERS ══
function dlCSV(rows,fn){const csv='\uFEFF'+rows.map(r=>r.map(x=>`"${x}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=fn+'_seo.csv';a.click();}
function openModal(id){document.getElementById(id).classList.add('show');}
function closeModal(id){document.getElementById(id).classList.remove('show');}
function addFileTag(cid,name,status){const el=document.getElementById(cid);if(el) el.innerHTML+=`<div class="lf-item"><span>📄 ${name}</span><span style="color:var(--exp);font-weight:700">${status}</span></div>`;}

// ══ INIT ══
mpLoadPrices();
teInit();teRun();gapsRender();libRender();fRender();mpInit();



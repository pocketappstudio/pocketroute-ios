// Local plan engine: guided answers -> plan, pasted text -> plan. No network.
(function(){
const money=s=>{const m=[...String(s).matchAll(/\$\s?(\d[\d,]*(?:\.\d+)?)\s*([kKmM])?/g)].map(x=>{let v=parseFloat(x[1].replace(/,/g,''));if(/k/i.test(x[2]||''))v*=1e3;if(/m/i.test(x[2]||''))v*=1e6;return v});return m};
const clean=s=>s.replace(/\*\*|__|`/g,'').replace(/\[[^\]]*\]/g,'').replace(/\s+/g,' ').trim();
const SEC={steps:/step|phase|plan|action|roadmap|how/i,budget:/budget|cost|expense|spend|price|money|financ/i,timeline:/timeline|schedule|milestone|when|calendar/i,risks:/risk|threat|challenge|pitfall|concern/i,decisions:/decision|question|open|owed|tbd|unknown|to decide/i};
function toMonths(s){s=s.toLowerCase();let m=s.match(/(week|month|year|day|quarter|q)s?\s*(\d+(?:\.\d+)?)\s*(?:to|-|–|through|until)\s*(\d+(?:\.\d+)?)/);const u=k=>k.startsWith('week')?0.25:k.startsWith('year')?12:k.startsWith('day')?1/30:k.startsWith('q')?3:1;
 if(m)return[(+m[2]-(m[1].startsWith('q')?1:0))*u(m[1]),+m[3]*u(m[1])];
 m=s.match(/(week|month|year|day|quarter|q)s?\s*(\d+(?:\.\d+)?)/);if(m){const a=+m[2]*u(m[1]);return[Math.max(0,a-u(m[1])),a]}
 m=s.match(/(\d+(?:\.\d+)?)\s*(week|month|year|day)s?/);if(m){const a=+m[1]*u(m[2]);return[null,a]}return null}
function splitPair(s){const p=s.split(/\s+(?:→|->|—|–|-)\s+|:\s+|\s*\|\s*|\bmitigat(?:e|ion|ed)?\s*:?/i).map(x=>x.trim()).filter(Boolean);return[p[0]||s,p.slice(1).join(' ')]}
function level(s,def){s=s.toLowerCase();if(/\bhigh\b/.test(s))return 3;if(/\b(med|medium|moderate)\b/.test(s))return 2;if(/\blow\b/.test(s))return 1;return def}
window.parsePaste=function(text,idea){
 const plan={title:'',idea:idea||'',steps:[],budget:[],timeline:[],risks:[],decisions:[],kpis:[],note:'Parsed on this phone from pasted text.'};
 let sec='steps';const lines=text.replace(/\r/g,'').split('\n');
 for(let raw of lines){let l=raw.trim();if(!l||/^\|?\s*:?-{3,}/.test(l))continue;
  const isHead=/^#{1,6}\s/.test(l)||(/^\*\*[^*]+\*\*:?$/.test(l))||(/^[A-Z][^.!?]{0,40}:$/.test(l));
  if(isHead){const h=clean(l.replace(/^#+/,'').replace(/:$/,''));let f=null;for(const k of['risks','decisions','budget','timeline','steps'])if(SEC[k].test(h)){f=k;break}
   if(f)sec=f;else if(!plan.title&&/^#\s/.test(l))plan.title=h;continue}
  let cells=null;if(l.startsWith('|')){cells=l.split('|').slice(1,-1).map(c=>clean(c));if(cells.every(c=>/^[A-Za-z /]+$/.test(c))&&cells.some(c=>/^(risks?|items?|when|milestones?|steps?|costs?|mitigations?|line items?)$/i.test(c)))continue}
  const body=clean(cells?cells.join(' | '):l.replace(/^([-*•]|\d+[.)])\s+/,''));if(!body)continue;
  if(sec==='budget'||(sec==='steps'&&money(body).length&&!/^\d+[.)]/.test(l))){const v=money(body);if(!v.length){if(sec==='budget')continue}else{
   let name=clean((cells?cells[0]:body.split(/[:–—]|\s-\s|\$/)[0])).replace(/[,(]+$/,'').trim()||'Item';if(/total/i.test(name))continue;
   plan.budget.push([name.slice(0,48),Math.min(...v.slice(0,2)),Math.max(...v.slice(0,2)),'Costs']);continue}}
  if(sec==='timeline'){const t=toMonths(body);const [lab,rest]=cells?[cells[1]||cells[0],cells[0]]:splitPair(body);const label=clean(t&&cells?cells[1]||lab:(rest&&toMonths(lab)?rest:lab));
   const prev=plan.timeline.length?plan.timeline[plan.timeline.length-1][2]:0;let s=prev,e=prev+1;if(t){s=t[0]==null?prev:t[0];e=Math.max(t[1],s+0.25)}
   plan.timeline.push([label.slice(0,44),s,e]);continue}
  if(sec==='risks'){let r,m,L=2,I=2;if(cells){r=cells[0];m=cells[cells.length-1];const li=cells.slice(1,-1).join(' ');const p=li.split('/');L=level(p[0]||li,2);I=level(p[1]||li,2)}else{[r,m]=splitPair(body);L=level(body,2);I=level(body,2)}
   plan.risks.push([clean(r).slice(0,60),L,I,clean(m||'Plan a fallback').slice(0,80)]);continue}
  if(sec==='decisions'){plan.decisions.push(body.slice(0,90));continue}
  const [t,d]=splitPair(body);plan.steps.push([t.slice(0,60),d.slice(0,90)]);
 }
 if(!plan.timeline.length&&plan.steps.length)plan.timeline=plan.steps.slice(0,10).map((s,i)=>[s[0],i,i+1]);
 if(!plan.title)plan.title=titleFrom(idea||plan.steps[0]?.[0]||'My plan');
 addKpis(plan);return plan};
function titleFrom(s){const w=s.replace(/^(i want to|i'd like to|we want to|build|make|start)\s+/i,'').split(/[.,;\n]/)[0].trim();return (w.charAt(0).toUpperCase()+w.slice(1)).slice(0,40)}
function fmt(v){return v>=1e6?'$'+(v/1e6).toFixed(1).replace(/\.0$/,'')+'M':v>=1e3?'$'+Math.round(v/1e3)+'k':'$'+Math.round(v)}
window.fmtMoney=fmt;
function horizonLabel(m){return m<1?Math.round(m*4)+' weeks':m<12?Math.round(m)+' months':(m/12).toFixed(m%12?1:0).replace(/\.0$/,'')+' years'}
window.horizonLabel=horizonLabel;
function addKpis(p){const lo=p.budget.reduce((a,b)=>a+b[1],0),hi=p.budget.reduce((a,b)=>a+b[2],0);const end=Math.max(0,...p.timeline.map(t=>t[2]));
 p.kpis=[[!p.budget.length?'—':lo===hi?fmt(lo):fmt(lo)+'–'+fmt(hi),'Budget'],[end?horizonLabel(end):'—','Timeline'],[String(p.steps.length),'Steps'],[String(p.decisions.length),'Open decisions']]}
const RISK={Money:['Running out of money',2,3,'Stage spending, keep a 15% reserve'],Time:['Takes longer than planned',3,2,'Weekly checkpoint, cut scope early'],Skills:['Missing a key skill',2,2,'Hire or partner for that piece'],Competition:['A rival does it first',2,2,'Own one niche, ship sooner'],Legal:['Legal or permit surprise',1,3,'Get a professional review up front'],Partners:['Partner disagreement',2,3,'Write roles and exit terms down'],Customers:['Too few buyers',2,3,'Pre-sell or test demand first']};
window.buildGuided=function(a){
 const months={'1 month':1,'3 months':3,'6 months':6,'1 year':12,'3 years':36,'5+ years':60}[a.horizon]||6;
 const B=+String(a.budget||'').replace(/[^\d.]/g,'')||0;
 let steps=(a.steps||'').split('\n').map(s=>s.replace(/^([-*•]|\d+[.)])\s*/,'').trim()).filter(Boolean).map(s=>[s.slice(0,60),'']);
 if(!steps.length)steps=[['Lock the goal','What “done” looks like'],['Check demand','Talk to '+(a.who||'5 likely users').toLowerCase()],['Set budget & funding','Ceiling and reserve'],['Prepare / build','Smallest version that works'],['Test with a few people','Watch, then fix'],['Launch','Go live'],['Review & adjust','Keep what works']];
 const w=steps.map((_,i)=>i===3?3:i===0?0.6:1),W=w.reduce((x,y)=>x+y,0);let t=0;
 const timeline=steps.map((s,i)=>{const d=months*w[i]/W;const r=[s[0],t,t+d];t+=d;return r});
 const split=[['Research',.10,'Plan'],['Build / prepare',.45,'Make'],['Tools & materials',.10,'Make'],['Marketing',.15,'Launch'],['Legal & admin',.05,'Plan'],['Reserve',.15,'Reserve']];
 const budget=B?split.map(([n,p,g])=>[n,Math.round(B*p*.8),Math.round(B*p*1.2),g]):[];
 const risks=(a.worries||[]).map(k=>RISK[k]).filter(Boolean);if(!risks.length)risks.push(RISK.Time,RISK.Money);
 const dec=(a.decisions||'').split('\n').map(s=>s.trim()).filter(Boolean);if(!B)dec.unshift('Budget ceiling');dec.push('Who signs off on launch');
 const p={title:titleFrom(a.idea),idea:a.idea,steps,budget,timeline,risks,decisions:dec,note:'Budget split and timing are estimates based on your answers.'};addKpis(p);return p};
window.addKpis=addKpis;
})();

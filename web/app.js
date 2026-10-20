(function(){
const $=s=>document.querySelector(s),app=$('#app'),E=escHTML;
// === Store config: swap these when the Gumroad product exists ===
const GUMROAD_PRODUCT_ID='REPLACE_WITH_GUMROAD_PRODUCT_ID';
const GUMROAD_URL='https://pocketappstudio.gumroad.com/'; // replace with the product page link
const PRICE='$9.99',BUY_URL=GUMROAD_URL;
const lic={ok(){return localStorage.getItem('itp-unlocked')==='1'},set(k){localStorage.setItem('itp-unlocked','1');localStorage.setItem('itp-key',k)}};
async function verifyKey(key){if(GUMROAD_PRODUCT_ID.startsWith('REPLACE'))return{err:'Not on sale yet'};
 try{const r=await fetch('https://api.gumroad.com/v2/licenses/verify',{method:'POST',body:new URLSearchParams({product_id:GUMROAD_PRODUCT_ID,license_key:key,increment_uses_count:'false'})});const j=await r.json();
  if(j.success&&!j.purchase?.refunded&&!j.purchase?.chargebacked)return{ok:true};return{err:'Key not recognized'}}catch(e){return{err:'Connect to the internet to activate'}}}
const store={all(){try{return JSON.parse(localStorage.getItem('itp-plans')||'[]')}catch(e){return[]}},get(id){return EXAMPLES.find(e=>e.id===id)||store.all().find(e=>e.id===id)},save(p){const a=store.all().filter(x=>x.id!==p.id);a.unshift(p);localStorage.setItem('itp-plans',JSON.stringify(a.slice(0,50)))},del(id){localStorage.setItem('itp-plans',JSON.stringify(store.all().filter(x=>x.id!==id)))}};
let draft={idea:'',worries:[]};
const Q=[
 {k:'who',q:'Who is it for?',chips:['Me','A client','Customers','A partner','A lender']},
 {k:'budget',q:'Budget ceiling?',input:'number',ph:'$ 5,000',chips:['$1,000','$10,000','$50,000','$250,000']},
 {k:'horizon',q:'How long?',chips:['1 month','3 months','6 months','1 year','3 years','5+ years']},
 {k:'worries',q:'Biggest worries?',multi:true,chips:['Money','Time','Skills','Competition','Legal','Partners','Customers']},
 {k:'steps',q:'Steps you already know?',area:true,ph:'One per line, or skip'},
 {k:'decisions',q:'Still undecided?',area:true,ph:'One per line, or skip'}];
// Editor schema: section -> label, item label, fields
const LV=['Low','Med','High'];
const ED={
 steps:{t:'Steps',lab:x=>x[0],sub:x=>x[1],f:[['Step','text',0],['Details','area',1]],blank:['','']},
 timeline:{t:'Timeline',lab:x=>x[0],sub:x=>`${horizonLabel(+x[1]||0).replace(/^0 \w+/,'Start')} → ${horizonLabel(+x[2]||0)}`,f:[['Task','text',0],['Starts at month','num',1],['Ends at month','num',2]],blank:['',0,1]},
 budget:{t:'Budget',lab:x=>x[0],sub:x=>x[5]==='%'?`${x[1]}–${x[2]}%`:`${fmtMoney(+x[1]||0)} – ${fmtMoney(+x[2]||0)} · ${x[3]||''}`,f:[['Item','text',0],['Low $','num',1],['High $','num',2],['Group','text',3]],blank:['',0,0,'Costs']},
 risks:{t:'Risks',lab:x=>x[0],sub:x=>`${LV[x[1]-1]} chance · ${LV[x[2]-1]} impact`,f:[['Risk','text',0],['Chance','lvl',1],['Impact','lvl',2],['Fix','area',3]],blank:['',2,2,'']},
 decisions:{t:'Decisions',lab:x=>x,sub:()=>'',f:[['Decision','area',null]],blank:''}};
const top=(back,mid='')=>`<div class="top">${back?`<button class="ib" data-go="${back}" aria-label="Back">‹</button>`:`<div class="brand"><img src="icon.svg" alt="">pocketappstudio</div>`}${mid}<span style="width:48px"></span></div>`;
const dock=h=>`<div class="dock"><div>${h}</div></div>`;
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),1800)}
const legal=`<div class="links"><a href="terms.html">Terms</a><a href="privacy.html">Privacy</a></div>`;
const V={
home(){const n=store.all().length;return`${top()}<h1 class="wm">Pocket<span class="grad">Route</span></h1><p class="tagline">Idea to plan</p>
 <button class="tile" data-go="examples"><span class="ic">✦</span><span><b>Examples</b><small>2 ready-made plans</small></span></button>
 ${n?`<button class="tile" data-go="saved"><span class="ic">▤</span><span><b>My plans</b><small>${n} on this phone</small></span></button>`:''}
 <button class="tile" data-go="unlock"><span class="ic">★</span><span><b>Unlock</b><small>${PRICE} one-time</small></span></button>
 ${legal}${dock(`<button class="btn" data-go="idea">New idea</button>`)}`},
unlock(){if(lic.ok())return`${top('home')}<h1 class="wm">Pocket<span class="grad">Route</span></h1><p class="tagline">Idea to plan</p><h2 style="margin-top:.6em">Unlocked</h2><p class="sub">Thank you. Everything is on.</p>${legal}`;return`${top('home')}<h1 class="wm">Pocket<span class="grad">Route</span></h1><p class="tagline">Idea to plan</p><p class="price grad">${PRICE}</p><p class="sub">One-time. Yours to keep. No account.</p>
 <div class="card"><div class="dec"><span class="bx" style="background:var(--a2);color:#06110d;display:grid;place-items:center;font-weight:800">✓</span><span>PocketRoute Pro · Unlimited plans</span></div><div class="dec"><span class="bx" style="background:var(--a2);color:#06110d;display:grid;place-items:center;font-weight:800">✓</span><span>Share files and presenter</span></div><div class="dec"><span class="bx" style="background:var(--a2);color:#06110d;display:grid;place-items:center;font-weight:800">✓</span><span>Stays on this phone</span></div></div>
 <div class="field2"><label for="lk">License key</label><input id="lk" autocomplete="off" placeholder="From your Gumroad receipt"></div>
 <button class="btn ghost" data-act="key">Activate key</button>${legal}
 ${dock(`<a class="btn" href="${BUY_URL}" target="_blank" rel="noopener" style="text-decoration:none">Buy · ${PRICE}</a>`)}`},
examples(){return`${top('home')}<h1>Examples</h1>${EXAMPLES.map(e=>`<button class="tile" data-open="${e.id}"><span class="ic">${e.icon}</span><span><b>${E(e.title)}</b><small>${e.steps.length} steps · ${e.risks.length} risks</small></span></button>`).join('')}`},
saved(){const a=store.all();return`${top('home')}<h1>My plans</h1>${a.map(p=>`<button class="tile" data-open="${p.id}"><span class="ic">◆</span><span><b>${E(p.title)}</b><small>${new Date(p.at).toLocaleDateString()}</small></span></button>`).join('')||'<p class="sub">None yet</p>'}`},
idea(){const sr=window.SpeechRecognition||window.webkitSpeechRecognition;return`${top('home')}<h1>Your idea</h1><div class="field"><textarea id="idea" placeholder="Type or tap the mic on your keyboard">${E(draft.idea)}</textarea>${sr?`<button class="ib mic" id="mic" aria-label="Speak">🎙</button>`:''}</div>${dock(`<button class="btn" data-act="idea">Next</button>`)}`},
path(){return`${top('idea')}<h1>Build it how?</h1>
 <button class="tile" data-go="q0"><span class="ic">?</span><span><b>Answer 6 quick questions</b><small>About 1 minute</small></span></button>
 <button class="tile" data-go="paste"><span class="ic">⇩</span><span><b>Paste from your AI chat</b><small>Turned into visuals here</small></span></button>`},
paste(){return`${top('path')}<h1>Paste plan</h1><textarea id="paste" placeholder="Paste text with steps, costs, dates, risks"></textarea>${dock(`<button class="btn ghost" data-act="clip" style="flex:.6">Paste</button><button class="btn" data-act="parse">Make plan</button>`)}`},
q(i){const q=Q[i],v=draft[q.k];const prog=`<div class="prog"><i style="width:${(i+1)/Q.length*100}%"></i></div>`;
 let body='';if(q.input)body=`<input id="qi" inputmode="numeric" placeholder="${q.ph}" value="${E(v||'')}">`;if(q.area)body=`<textarea id="qi" style="min-height:34dvh" placeholder="${q.ph}">${E(v||'')}</textarea>`;
 if(q.chips)body+=`<div class="chips">${q.chips.map(c=>`<button class="chip ${(q.multi?(v||[]).includes(c):v===c)?'on':''}" data-chip="${E(c)}">${E(c)}</button>`).join('')}</div>`;
 return`${top(i?'q'+(i-1):'path',prog)}<h1>${q.q}</h1>${body}${dock(`<button class="btn" data-act="q${i}">${i===Q.length-1?'Make plan':'Next'}</button>`)}`},
plan(id){const p=store.get(id);if(!p)return V.home();cur=p;const lk=lic.ok()?'':'<small class="lk">🔒</small>';
 return`${top(p.example?'examples':'saved')}<div id="planroot">${renderPlan(p)}</div>${dock(`<button class="ib" data-act="edit" aria-label="Edit">${lk}✎</button><button class="ib" data-act="present" aria-label="Present">${lk}▶</button><button class="btn" data-act="export">${lic.ok()?'':'🔒 '}Share file</button>`)}`},
// editor: edit:ID[:review] , sec:ID:key , item:ID:key:idx
edit(id,review){const p=store.get(id);reviewId=review?id:(reviewId===id?null:reviewId);if(!p)return V.home();const S=Object.keys(ED);
 return`${top(review?'':'plan:'+id)}<h1>${review?'Check your plan':'Edit'}</h1><button class="tile" data-go="item:${id}:title:0"><span class="ic">Aa</span><span><b>${E(p.title)}</b><small>Title</small></span></button>
 ${S.map(k=>`<button class="tile" data-go="sec:${id}:${k}"><span class="ic">${(p[k]||[]).length}</span><span><b>${ED[k].t}</b><small>${E(((p[k]||[])[0]?[].concat(ED[k].lab(p[k][0])).join(''):'Empty').slice(0,40))}</small></span></button>`).join('')}
 ${review?'':`<button class="btn ghost" data-act="delplan" style="color:var(--bad);margin-top:8px">Delete plan</button>`}
 ${dock(`<button class="btn" data-go="plan:${id}">${review?'Looks good':'Done'}</button>`)}`},
sec(id,k){const p=store.get(id),d=ED[k],a=p[k]||[];return`${top('edit:'+id+(reviewId===id?':review':''))}<h1>${d.t}</h1>${a.map((x,i)=>`<div class="row"><button class="tile" data-go="item:${id}:${k}:${i}"><span class="ic">${i+1}</span><span><b>${E(String(d.lab(x)).slice(0,60))}</b><small>${E(String(d.sub(x)||'').slice(0,60))}</small></span></button>${a.length>1?`<div class="mv"><button class="ib" data-act="mv:${k}:${i}:-1" aria-label="Move up" ${i?'':'disabled'}>↑</button><button class="ib" data-act="mv:${k}:${i}:1" aria-label="Move down" ${i<a.length-1?'':'disabled'}>↓</button></div>`:''}</div>`).join('')||'<p class="sub">Empty</p>'}${dock(`<button class="btn" data-go="item:${id}:${k}:new">Add</button>`)}`},
item(id,k,idx){const p=store.get(id);if(k==='title')return`${top('edit:'+id+(reviewId===id?':review':''))}<h1>Title</h1><div class="field2"><label>Title</label><input id="f0" value="${E(p.title)}"></div><div class="field2"><label>Idea</label><textarea id="f1" style="min-height:24dvh">${E(p.idea)}</textarea></div>${dock(`<button class="btn" data-act="save:${k}:0">Save</button>`)}`;
 const d=ED[k],x=idx==='new'?d.blank:p[k][+idx];
 const fl=d.f.map(([lab,ty,j],n)=>{const v=j==null?x:x[j];if(ty==='lvl')return`<div class="field2"><label>${lab}</label><div class="chips" data-lvl="${n}">${LV.map((l,m)=>`<button class="chip ${v===m+1?'on':''}" data-lv="${m+1}">${l}</button>`).join('')}</div></div>`;
  if(ty==='area')return`<div class="field2"><label>${lab}</label><textarea id="f${n}" style="min-height:22dvh">${E(v)}</textarea></div>`;
  return`<div class="field2"><label>${lab}</label><input id="f${n}" ${ty==='num'?'inputmode="decimal"':''} value="${E(v)}"></div>`}).join('');
 return`${top('sec:'+id+':'+k)}<h1>${idx==='new'?'Add':'Edit'}</h1>${fl}${dock(`${idx==='new'?'':`<button class="ib" data-act="delitem:${k}:${idx}" aria-label="Delete">🗑</button>`}<button class="btn" data-act="save:${k}:${idx}">Save</button>`)}`}};
let cur=null,reviewId=null;
function go(r){location.hash=r}
const route=()=>location.hash.slice(1)||'home';
function render(){let h=route();if(/^(edit|sec|item):/.test(h)&&!lic.ok()){location.replace('#unlock');h='unlock'}const parts=h.split(':');let html;
 if(/^q\d$/.test(h))html=V.q(+h[1]);else if(parts[0]==='plan')html=V.plan(parts[1]);else if(parts[0]==='edit')html=V.edit(parts[1],parts[2]==='review');
 else if(parts[0]==='sec')html=V.sec(parts[1],parts[2]);else if(parts[0]==='item')html=V.item(parts[1],parts[2],parts[3]);else html=(V[h]||V.home)();
 app.innerHTML=`<div class="scr">${html}</div>`;window.scrollTo(0,0);const f=$('#idea,#qi,#f0');if(f&&!('ontouchstart' in window)&&!h.startsWith('item'))f.focus()}
function finish(p){p.id='p'+Date.now();p.at=Date.now();store.save(p);draft={idea:'',worries:[]};go(lic.ok()?'edit:'+p.id+':review':'plan:'+p.id)}
const gate=()=>{if(lic.ok())return false;go('unlock');return true};
// editing an example makes your own copy first
function editable(p){if(!p.example)return p;const c=JSON.parse(JSON.stringify(p));c.example=false;c.fromExample=true;c.id='p'+Date.now();c.at=Date.now();store.save(c);return c}
let rec=null;
app.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.go==='idea'&&!lic.ok()&&store.all().length>=1)return go('unlock');
 if(t.dataset.go)return go(t.dataset.go);if(t.dataset.open)return go('plan:'+t.dataset.open);
 if(t.dataset.lv){t.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===t));return}
 if(t.dataset.chip){const q=Q[+route()[1]];if(q.multi){const a=draft[q.k]||[];draft[q.k]=a.includes(t.dataset.chip)?a.filter(x=>x!==t.dataset.chip):[...a,t.dataset.chip];t.classList.toggle('on')}else{draft[q.k]=t.dataset.chip;const qi=$('#qi');if(qi)qi.value=t.dataset.chip;document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===t))}return}
 if(t.id==='mic'){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(rec){rec.stop();return}rec=new SR();rec.interimResults=true;rec.continuous=true;const ta=$('#idea'),base=ta.value;
  rec.onresult=ev=>{ta.value=(base?base+' ':'')+[...ev.results].map(r=>r[0].transcript).join(' ')};rec.onend=()=>{rec=null;t.classList.remove('on')};rec.onerror=()=>toast('Mic unavailable');t.classList.add('on');rec.start();return}
 const a=t.dataset.act;if(!a)return;
 if(a==='idea'){draft.idea=$('#idea').value.trim();if(!draft.idea)return toast('Add your idea');if(rec)rec.stop();return go('path')}
 if(/^q\d$/.test(a)){const i=+a[1],q=Q[i];const qi=$('#qi');if(qi&&!q.multi)draft[q.k]=qi.value.trim()||(q.chips?draft[q.k]:'');if(i<Q.length-1)return go('q'+(i+1));return finish(buildGuided(draft))}
 if(a==='clip'){try{$('#paste').value=await navigator.clipboard.readText()}catch(_){toast('Long-press to paste')}return}
 if(a==='parse'){const v=$('#paste').value.trim();if(!v)return toast('Paste a plan first');const p=parsePaste(v,draft.idea);if(!p.steps.length&&!p.budget.length&&!p.risks.length)return toast('No plan found in that text');return finish(p)}
 if((a==='edit'||a==='present'||a==='export')&&gate())return;
 if(a==='edit'){const c=editable(cur);return go('edit:'+c.id)}
 if(a==='present')return itpPresent($('#planroot'));
 if(a==='export')return exportFile(cur);
 if(a==='key'){const k=$('#lk').value.trim();if(!k)return toast('Enter your key');t.disabled=true;const r=await verifyKey(k);t.disabled=false;if(r.ok){lic.set(k);toast('Unlocked');return go('home')}return toast(r.err)}
 const parts=route().split(':'),id=parts[1];
 if(a==='delplan'){if(confirm('Delete this plan?')){store.del(id);go('saved')}return}
 if(a.startsWith('mv:')){const [,k,i,dv]=a.split(':');const p=store.get(id),j=+i+ +dv;[p[k][+i],p[k][j]]=[p[k][j],p[k][+i]];commit(p,k);return render()}
 if(a.startsWith('delitem:')){const [,k,idx]=a.split(':');const p=store.get(id);p[k].splice(+idx,1);commit(p,k);return go('sec:'+id+':'+k)}
 if(a.startsWith('save:')){const [,k,idx]=a.split(':');const p=store.get(id);
  if(k==='title'){p.title=$('#f0').value.trim()||p.title;p.idea=$('#f1').value.trim();store.save(p);return go('edit:'+id+(reviewId===id?':review':''))}
  const d=ED[k];let x=JSON.parse(JSON.stringify(idx==='new'?d.blank:p[k][+idx]));
  d.f.forEach(([lab,ty,j],n)=>{let v;if(ty==='lvl')v=+(document.querySelector(`[data-lvl="${n}"] .on`)?.dataset.lv||2);else{v=$('#f'+n).value.trim();if(ty==='num')v=parseFloat(v.replace(/[^\d.\-]/g,''))||0}if(j==null)x=v;else x[j]=v});
  if(!(j=>j)(d.lab(x)))return toast('Add a name');
  if(k==='timeline'&&x[2]<=x[1])x[2]=x[1]+0.25;if(k==='budget'&&x[2]<x[1])[x[1],x[2]]=[x[2],x[1]];
  p[k]=p[k]||[];if(idx==='new')p[k].push(x);else p[k][+idx]=x;commit(p,k);return go('sec:'+id+':'+k)}
});
function commit(p,k){addKpis(p);p.at=Date.now();store.save(p)}
async function exportFile(p){let css='',js='';try{css=await (await fetch('app.css')).text();js=await (await fetch('present.js')).text()}catch(_){}
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0b0d12"><title>${E(p.title)} · PocketRoute: Idea to plan</title><style>${css}#app{padding-bottom:110px}</style></head><body><main id="app"><div class="xbrand">Pocket<span class="grad">Route</span><span>Idea to plan</span></div><div id="planroot">${renderPlan(p)}</div><p class="foot">Made with PocketRoute · pocketappstudio</p></main><div class="dock"><div><button class="btn" onclick="itpPresent(document.getElementById('planroot'))">▶ Present</button></div></div><script>${js}<\/script></body></html>`;
 const name=(p.title.replace(/[^\w]+/g,'-').replace(/^-|-$/g,'')||'plan')+'.html';const file=new File([html],name,{type:'text/html'});
 if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:p.title});return}catch(e){if(e.name==='AbortError')return}}
 const u=URL.createObjectURL(file);const l=document.createElement('a');l.href=u;l.download=name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast('Saved '+name)}
addEventListener('hashchange',render);render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();

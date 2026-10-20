// Plan -> HTML with inline SVG visuals. Used on screen and in the exported file.
(function(){
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PAL=['#7cf5c6','#6aa8ff','#c8a6ff','#ffb86b','#ff8fa3','#5fd4ff','#e6f27a'];
const cut=(s,n)=>s.length>n?s.slice(0,n-1)+'…':s;
const M=v=>fmtMoney(v);
let HAS_SRC=false;
function cite(t){let h=esc(t);if(!HAS_SRC)return h;return h.replace(/\[(?:Cited,?\s*)?((?:\d+\s*[,\]\[]*\s*)+)\](?:\[(\d+)\])*/g,(m)=>{const ns=[...m.matchAll(/\d+/g)].map(x=>x[0]);return ns.map(n=>`<a class="cite" href="#src-${n}">${n}</a>`).join('')})}
const sevCol=s=>s>=6?'#ff6b7a':s>=3?'#ffb86b':'#7cf5c6';
function steps(st){return`<ol class="steps">${st.map((s,i)=>`<li><span class="sn">${i+1}</span><div><b>${esc(s[0])}</b>${s[1]?`<p>${cite(s[1])}</p>`:''}</div></li>`).join('')}</ol>`}
function gantt(rows){if(!rows.length)return'';const W=340,R=46,T=30,H=rows.length*R+T+6;const end=Math.max(...rows.map(r=>+r[2]||0),1);const yrs=end>18;const unit=yrs?12:1;const span=Math.ceil(end/unit)*unit||1;const x=v=>10+v/span*(W-20);
 let o=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Timeline">`;const n=Math.ceil(span/unit),step=Math.max(1,Math.ceil(n/6));
 for(let k=0;k<=n;k+=step){const xx=x(k*unit);o+=`<line x1="${xx}" x2="${xx}" y1="${T-8}" y2="${H}" stroke="currentColor" opacity=".12"/><text x="${xx}" y="${T-14}" font-size="12" fill="currentColor" opacity=".6" text-anchor="${k?'middle':'start'}">${k===0?'Start':(yrs?'Yr ':'Mo ')+k}</text>`}
 rows.forEach((r,i)=>{const y=T+i*R;const a=x(+r[1]||0),b=Math.max(x(+r[2]||0),a+8);const c=PAL[i%PAL.length];const lx=Math.max(10,Math.min(a,W-220));
  o+=`<text x="${lx}" y="${y+14}" font-size="14" font-weight="600" fill="currentColor">${esc(cut(r[0],32))}</text><rect x="${a}" y="${y+21}" width="${b-a}" height="14" rx="7" fill="${c}"/>`});
 return o+'</svg>'}
function squarify(items,x,y,w,h,out){if(!items.length)return;if(items.length===1){out.push({...items[0],x,y,w,h});return}
 const tot=items.reduce((a,b)=>a+b.v,0);let acc=0,k=0;while(k<items.length-1&&acc+items[k].v<=tot/2){acc+=items[k].v;k++}if(k===0){acc=items[0].v;k=1}
 const A=items.slice(0,k),B=items.slice(k),f=acc/tot;if(w>=h){squarify(A,x,y,w*f,h,out);squarify(B,x+w*f,y,w*(1-f),h,out)}else{squarify(A,x,y,w,h*f,out);squarify(B,x,y+h*f,w,h*(1-f),out)}}
const money=b=>b[5]!=='%';
const rng=b=>b[5]==='%'?`${b[1]}%–${b[2]}% of sale`:(b[1]===b[2]?M(b[1]):M(b[1])+'–'+M(b[2])+(b[6]||''));
function groupsOf(budget){return[...new Set(budget.map(b=>b[3]||'Costs'))]}
function treemap(budget){const groups=groupsOf(budget);const items=budget.filter(money).map(b=>({n:b[0],v:Math.max((+b[1]+ +b[2])/2,1),g:b[3]||'Costs',b})).sort((a,b)=>b.v-a.v);if(!items.length)return'';
 const W=340,H=300,out=[];squarify(items,0,0,W,H,out);let o=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Budget blocks">`;
 out.forEach(r=>{const c=PAL[groups.indexOf(r.g)%PAL.length];const big=r.w>70&&r.h>40;o+=`<rect x="${r.x+1.5}" y="${r.y+1.5}" width="${Math.max(0,r.w-3)}" height="${Math.max(0,r.h-3)}" rx="10" fill="${c}" opacity="${big?.92:.7}"><title>${esc(r.n)}: ${rng(r.b)}</title></rect>`;
  if(big)o+=`<text x="${r.x+10}" y="${r.y+24}" font-size="14" font-weight="700" fill="#0b0d12">${esc(cut(r.n,Math.floor(r.w/8)))}</text><text x="${r.x+10}" y="${r.y+42}" font-size="13" fill="#0b0d12" opacity=".75">${rng(r.b)}</text>`});
 return o+'</svg>'+legend(groups)}
const legend=g=>`<div class="legend">${g.map((x,i)=>`<span><i style="background:${PAL[i%PAL.length]}"></i>${esc(x)}</span>`).join('')}</div>`;
function sankey(budget){const it=budget.filter(money).filter(b=>+b[2]>0);const groups=groupsOf(it);if(groups.length<2||it.length<3)return'';
 const gv=groups.map(g=>it.filter(b=>(b[3]||'Costs')===g).reduce((a,b)=>a+(+b[1]+ +b[2])/2,0));const tot=gv.reduce((a,b)=>a+b,0)||1;
 const W=340,H=280,gap=10,x0=8,x1=104,x2=196,nw=12,avail=H-gap*(groups.length-1);const minh=6;
 const hs=gv.map(v=>Math.max(minh,v/tot*avail));const sc=avail/hs.reduce((a,b)=>a+b,0);const h=hs.map(v=>v*sc);
 let o=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Where the money goes"><rect x="${x0}" y="0" width="${nw}" height="${H}" rx="4" fill="currentColor" opacity=".85"/>`;
 let ly=0,ry=0,lastY=-40;groups.forEach((g,i)=>{const c=PAL[i%PAL.length],hh=h[i],hl=hh*H/avail;const sy=ly,ty=ry;
  o+=`<path d="M${x0+nw} ${sy} C${x1} ${sy},${x1} ${ty},${x2} ${ty} L${x2} ${ty+hh} C${x1} ${ty+hh},${x1} ${sy+hl},${x0+nw} ${sy+hl}Z" fill="${c}" opacity=".45"/><rect x="${x2}" y="${ty}" width="${nw}" height="${hh}" rx="3" fill="${c}"/>`;
  let my=Math.max(ty+hh/2,14,lastY+36);lastY=my;o+=`<text x="${x2+nw+8}" y="${my-2}" font-size="14" font-weight="650" fill="currentColor">${esc(g)}</text><text x="${x2+nw+8}" y="${my+15}" font-size="12.5" fill="currentColor" opacity=".65">${M(gv[i])} · ${Math.round(gv[i]/tot*100)}%</text>`;
  ly+=hl;ry+=hh+gap;});
 return o.replace('<svg viewBox="0 0 '+W+' '+H+'"','<svg viewBox="0 0 '+W+' '+Math.max(H,lastY+24)+'"')+'</svg>'}
function btable(budget,tags){return`<table class="tb">${budget.map(b=>`<tr><td>${esc(b[0])}${tags&&b[4]?`<br><small>${cite(b[4])}</small>`:''}</td><td class="r">${rng(b)}</td></tr>`).join('')}</table>`}
function matrix(risks){if(!risks.length)return'';const W=340,P=34,S=(W-P)/3;let o=`<svg viewBox="0 0 ${W} ${W}" role="img" aria-label="Risk grid">`;
 for(let r=0;r<3;r++)for(let c=0;c<3;c++){const sev=(c+1)*(3-r);o+=`<rect x="${P+c*S+2}" y="${r*S+2}" width="${S-4}" height="${S-4}" rx="14" fill="${sevCol(sev)}" opacity="${.1+sev*.035}"/>`}
 o+=`<text x="${P+S*1.5}" y="${W-6}" text-anchor="middle" font-size="13" fill="currentColor" opacity=".7">Likelihood →</text><text transform="translate(16 ${S*1.5}) rotate(-90)" text-anchor="middle" font-size="13" fill="currentColor" opacity=".7">Impact →</text>`;
 const cell={};risks.forEach((k,i)=>{const key=k[1]+'-'+k[2];const j=cell[key]=(cell[key]||0)+1;const cx=P+(k[1]-1)*S+S/2+((j-1)%3-1)*30,cy=(3-k[2])*S+S/2+(Math.floor((j-1)/3)-.3)*30;
  o+=`<circle cx="${cx}" cy="${cy}" r="14" fill="${sevCol(k[1]*k[2])}" stroke="#0b0d12" stroke-width="2"/><text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="13" font-weight="700" fill="#0b0d12">${i+1}</text>`});
 return o+'</svg>'}
function rlist(risks){return risks.map((k,i)=>`<div class="risk"><span class="n" style="background:${sevCol(k[1]*k[2])}">${i+1}</span><div><b>${esc(k[0])}</b>${k[4]?` <small class="mut">${esc(k[4])}</small>`:''}<p>${cite(k[3])}</p></div></div>`).join('')}
function slope(s){const W=340,H=260,T=24,B=36,L=96,Rr=222;const vals=[...s.y5,...s.y10,0];const mx=Math.max(...vals),mn=Math.min(...vals);const y=v=>T+(mx-v)/(mx-mn)*(H-T-B);const C=['#ff6b7a','#6aa8ff','#7cf5c6'];
 let o=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sell at year 5 or hold to year 10">`;
 o+=`<line x1="${L-10}" x2="${Rr+10}" y1="${y(0)}" y2="${y(0)}" stroke="currentColor" stroke-dasharray="4 5" opacity=".5"/><text x="${L-14}" y="${y(0)+4}" font-size="12" text-anchor="end" fill="currentColor" opacity=".7">Break-even</text>`;
 o+=`<text x="${L}" y="${H-10}" text-anchor="middle" font-size="13" fill="currentColor" opacity=".7">Sell yr 5</text><text x="${Rr}" y="${H-10}" text-anchor="middle" font-size="13" fill="currentColor" opacity=".7">Hold to yr 10</text>`;
 s.cols.forEach((c,i)=>{const a=y(s.y5[i]),b=y(s.y10[i]);o+=`<line x1="${L}" y1="${a}" x2="${Rr}" y2="${b}" stroke="${C[i]}" stroke-width="4" stroke-linecap="round"/><circle cx="${L}" cy="${a}" r="7" fill="${C[i]}"/><circle cx="${Rr}" cy="${b}" r="7" fill="${C[i]}"/>
  <text x="${Rr+12}" y="${b-3}" font-size="13" font-weight="700" fill="${C[i]}">${esc(c)}</text><text x="${Rr+12}" y="${b+13}" font-size="12" fill="currentColor" opacity=".75">${(s.y10[i]<0?'−':'+')+M(Math.abs(s.y10[i]))}</text>`});
 return o+`</svg>`}
const tbl=(head,rows,wide)=>`<div class="tw"><table class="tb${wide?' wide':''}">${head?`<tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr>`:''}${rows.map(r=>`<tr>${r.map((c,i)=>`<td${i?' class="r"':''}>${cite(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
function scards(s){const C=['#ff6b7a','#6aa8ff','#7cf5c6'];return s.cols.map((c,i)=>`<div class="sc" style="border-color:${C[i]}55"><b style="color:${C[i]}">${esc(c)}</b><dl><dt>Invested</dt><dd>${M(s.invested[i])}</dd>${s.results.map(r=>`<dt>${esc(r[0].replace(/:$/,''))}</dt><dd>${esc(r[i+1])}</dd>`).join('')}</dl></div>`).join('')}
const more=(label,body)=>`<details class="more"><summary>${esc(label)}</summary>${body}</details>`;
window.renderPlan=function(p){HAS_SRC=!!(p.sources&&p.sources.length);
 const sec=(t,cue,body,id)=>body?`<section class="slide" data-title="${esc(t)}"${id?` id="${id}"`:''}><h2>${t}</h2>${cue?`<p class="sub">${cue}</p>`:''}<div class="card">${body}</div></section>`:'';
 const s=p.scenario;
 return `<section class="slide" data-title="${esc(p.title)}"><h1>${esc(p.title)}</h1><p class="sub">${esc(p.idea)}</p>${p.note?`<span class="tag ${p.example?'':'c'}">${p.example?'Estimates':'On this phone'}</span>`:''}
 <div class="kpis">${(p.kpis||[]).map(k=>`<div class="kpi"><b class="grad">${esc(k[0])}</b><span>${esc(k[1])}</span></div>`).join('')}</div>${p.key?`<div class="callout">${cite(p.key)}</div>`:''}</section>
 ${sec('Steps','In order',p.steps.length?steps(p.steps):'')}
 ${sec('Timeline','Each bar runs while that work happens',gantt(p.timeline))}
 ${sec('Where the money goes','Wider band, more money',sankey(p.budget))}
 ${sec('Budget','Bigger block, bigger cost',p.budget.length?treemap(p.budget)+(p.budget.some(b=>!money(b))?'':'')+more(`All ${p.budget.length} line items`,btable(p.budget,HAS_SRC)):'')}
 ${s?sec('Sell or hold','Above the dashed line = profit',slope(s)+scards(s)+more('Assumptions',`<p class="mut">${cite(s.assumptions)}</p><p class="mut">${cite(s.reference)}</p>`+tbl(['',...s.cols],s.assume,true))+more('How to read',`<p>${cite(s.howto)}</p><p>${cite(s.breakeven)}</p>`)+more('Tax notes',`<p class="mut">${cite(s.tax)}</p>`)):''}
 ${sec('Risks','Top right = act first',p.risks.length?matrix(p.risks)+rlist(p.risks):'')}
 ${p.deal?sec('A good deal','',p.deal.map(d=>more(d[0],`<p>${cite(d[1])}</p><p class="mut">${cite(d[2])}</p>`)).join('')+(p.redflags?`<div class="callout warn">${esc(p.redflags)}</div>`:'')):''}
 ${p.rules?sec('Rules that apply','',p.rules.map(r=>more(r[0],`<p>${cite(r[1])}</p>`)).join('')):''}
 ${p.headline?sec('Market numbers','',tbl(null,p.headline.map(r=>[r[0],r[1]+(r[2]?' · '+r[2]:'')]))):''}
 ${sec('Decisions owed','',p.decisions.map(d=>`<div class="dec"><span class="bx"></span><span>${cite(d)}</span></div>`).join(''))}
 ${HAS_SRC?`<section id="sources">${more(`Sources (${p.sources.length})`,`<ol class="src">${p.sources.map((x,i)=>`<li id="src-${i+1}">${esc(x).replace(/(https?:\/\/[^\s;]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>')}</li>`).join('')}</ol>${p.caveat?`<p class="mut">${esc(p.caveat)}</p>`:''}`)}</section>`:''}
 ${p.note?`<p class="foot">${esc(p.note)}</p>`:''}`};
window.escHTML=esc;
})();

// Presenter: one section per screen. Self-contained so the exported file can embed it.
window.itpPresent=function(root){root=root||document;const sl=[...root.querySelectorAll('.slide')];if(!sl.length)return;let i=0;
 const o=document.createElement('div');o.className='pres';o.innerHTML='<div class="pbar">'+sl.map(()=>'<i></i>').join('')+'</div><p class="pc"></p><div class="pbody"></div><div class="pnav"><button class="pv" aria-label="Back">‹ Back</button><button class="nx">Next ›</button></div><button class="px" aria-label="Close">✕</button>';
 document.body.appendChild(o);const body=o.querySelector('.pbody');
 const show=()=>{body.innerHTML='';const c=sl[i].cloneNode(true);c.removeAttribute('id');body.appendChild(c);body.scrollTop=0;o.querySelectorAll('.pbar i').forEach((b,k)=>b.classList.toggle('on',k<=i));o.querySelector('.pc').textContent=(i+1)+' / '+sl.length;o.querySelector('.nx').textContent=i===sl.length-1?'Done':'Next ›';o.querySelector('.pv').style.visibility=i?'visible':'hidden'};
 const close=()=>{o.remove();document.removeEventListener('keydown',key)};
 const nx=()=>{if(i<sl.length-1){i++;show()}else close()},pv=()=>{if(i){i--;show()}};
 const key=e=>{if(e.key==='ArrowRight'||e.key===' ')nx();if(e.key==='ArrowLeft')pv();if(e.key==='Escape')close()};
 o.querySelector('.nx').onclick=nx;o.querySelector('.pv').onclick=pv;o.querySelector('.px').onclick=close;document.addEventListener('keydown',key);
 let sx=null,sy=0;body.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
 body.addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)(dx<0?nx:pv)();sx=null});
 show()};
window.addEventListener('beforeprint',()=>document.querySelectorAll('details').forEach(d=>d.open=true));

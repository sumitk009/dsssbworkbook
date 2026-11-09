/* ================= DATA ================= */
const CH=BANK.chap;
const SETS=[];
CH.forEach(c=>c.sets.forEach(s=>SETS.push({id:s.id,ch:c.n,icon:c.icon,short:c.sets.length>1?s.title:'Practice Set',title:'Ch '+c.n+' · '+c.name+(c.sets.length>1?' — '+s.title:''),group:'chapter',qs:s.qs})));
BANK.pyq.forEach(s=>SETS.push({id:s.id,ch:0,icon:'📌',short:s.title,title:s.title+' (पिछले वर्षों के प्रश्न)',group:'pyq',qs:s.qs}));
SETS.forEach(s=>s.qs.forEach(q=>{q.sec=s.title}));
const ALLQ=[].concat(...SETS.map(s=>s.qs));
const findSet=id=>SETS.find(s=>s.id===id);
const TFMAP={},FLMAP={};
CH.forEach(c=>{c.tf.forEach((t,i)=>{TFMAP[c.n+'-'+i]=t});c.fill.forEach((t,i)=>{FLMAP[c.n+'-'+i]=t})});
const TFN=Object.keys(TFMAP).length,FLN=Object.keys(FLMAP).length;
const LET='ABCDE';

/* ================= STATE ================= */
const DEF=()=>({scores:{},tf:{},fill:{},diary:[],mocks:[],sound:true});
let S=DEF(),USER=null,AM='login';
const LS={g:k=>{try{return localStorage.getItem(k)}catch(e){return null}},s:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},d:k=>{try{localStorage.removeItem(k)}catch(e){}}};
const users=()=>{try{return JSON.parse(LS.g('dsssb_users')||'{}')}catch(e){return{}}};
const putUsers=u=>LS.s('dsssb_users',JSON.stringify(u));
function save(){if(USER)LS.s('dsssb_data_'+USER.email,JSON.stringify(S))}
function loadData(email){try{S=Object.assign(DEF(),JSON.parse(LS.g('dsssb_data_'+email)||'{}'))}catch(e){S=DEF()}}
async function hashPw(pw,salt){const t=salt+'|'+pw;try{if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return 'h1'+Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}}catch(e){}let a=5381,g=7;for(let i=0;i<t.length;i++)a=((a<<5)+a+t.charCodeAt(i))>>>0;for(let i=t.length-1;i>=0;i--)g=((g<<5)-g+t.charCodeAt(i))>>>0;return 'h0'+a.toString(16)+g.toString(16)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=s=>document.querySelector(s);


/* ================= HELPERS ================= */
let TM=null;function stopTimer(){if(TM){clearInterval(TM);TM=null}}
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const hasScore=s=>S.scores[s.id]&&S.scores[s.id].some(x=>x!=null);
const lastPct=s=>{const a=S.scores[s.id].filter(x=>x!=null);return a[a.length-1]/s.qs.length*100};
function pctBadge(sc,n){if(sc==null)return'';const p=Math.round(sc/n*100);return`<span class="bd ${p>=80?'g':p>=60?'y':'r'}">${sc}/${n} · ${p}%</span>`}
function band(p){return p>=80?['💪 तैयारी मजबूत है!','अगला कदम: Mock Test और Revision','rgba(34,197,94,.22)']:p>=60?['👍 ठीक-ठाक प्रदर्शन','अगला कदम: गलत टॉपिक दोहराएँ','rgba(251,191,36,.22)']:['📖 और अभ्यास चाहिए','अगला कदम: चैप्टर के नोट्स पढ़कर यही सेट फिर हल करें','rgba(239,68,68,.22)']}
function countUp(el,to,ms=1200,suf=''){if(!el)return;const t0=performance.now();(function s(t){const k=Math.min(1,(t-t0)/ms);el.textContent=Math.round(to*k)+suf;if(k<1)requestAnimationFrame(s)})(t0)}
function nav(){if(!USER){$('#nav').innerHTML='<span class="logo">DSSSB TGT CS</span>';return}const cur=(location.hash||'#/home').split('/')[1];
 const items=[['home','#/home','🏠 होम'],['guide','#/guide','📘 कैसे करें'],['stats','#/stats','📊 प्रगति'],['tf','#/tf/all','✔ सही/गलत'],['fill','#/fill/all','✏ रिक्त स्थान'],['mock','#/mock/50','🎯 Mock Test'],['diary','#/diary','📒 गलतियाँ'],['feedback','#/feedback','💬 फीडबैक']];
 $('#nav').innerHTML=`<span class="logo" onclick="location.hash='#/home'">DSSSB TGT CS</span>`+items.map(i=>`<button class="nb ${cur===i[0]?'on':''}" onclick="location.hash='${i[1]}'">${i[2]}</button>`).join('')+`<button class="nb" style="margin-left:auto" onclick="toggleSound()">${S.sound?'🔊':'🔇'}</button><button class="nb ${cur==='profile'?'on':''}" onclick="location.hash='#/profile'">👤 ${esc(USER.name.split(' ')[0])}</button><button class="nb" onclick="logout()">⎋ Logout</button>`}
function toggleSound(){S.sound=!S.sound;save();nav();if(S.sound)SFX.ok()}

/* ================= ROUTER ================= */
window.addEventListener('hashchange',route);
function route(){stopTimer();if(!USER){nav();$('#app').innerHTML=vAuth();return}
 const h=(location.hash||'#/home').split('/');const v=h[1];const app=$('#app');nav();app.style.animation='none';void app.offsetWidth;app.style.animation='';scrollTo(0,0);
 if(v==='quiz')return startIntro(h[2]);
 if(v==='mock')return mockIntro(+h[2]||50);
 const map={home:vHome,guide:vGuide,stats:vStats,ch:()=>vChapter(+h[2]),tf:()=>vTF(h[2]),fill:()=>vFill(h[2]),diary:vDiary,profile:vProfile,feedback:vFeedback};
 app.innerHTML=(map[v]||vHome)()}

/* ================= HOME ================= */
function vHome(){
 setTimeout(()=>{const g=id=>document.getElementById(id);if(!g('c1'))return;const d=SETS.filter(hasScore);const l=d.map(lastPct);countUp(g('c1'),d.length);countUp(g('c2'),l.length?Math.round(l.reduce((a,b)=>a+b,0)/l.length):0,1200,'%');countUp(g('c3'),S.diary.filter(x=>!x.done).length);countUp(g('c4'),Object.keys(S.tf).length+Object.keys(S.fill).filter(k=>S.fill[k].r!=null).length+S.mocks.length)},60);
 const chTile=(c,i)=>{const ds=c.sets.filter(hasScore).length;const pct=Math.round(ds/c.sets.length*100);return`<div class="card tile" style="animation-delay:${i*.035}s" onclick="location.hash='#/ch/${c.n}'"><div class="ic">${c.icon}</div><h3>${c.n}. ${esc(c.name)}</h3><div class="meta">${c.total} MCQ · ${c.tf.length} सही/गलत · ${c.fill.length} रिक्त स्थान</div><div class="bar" style="margin-top:10px"><i style="width:${pct}%"></i></div><div class="badges"><span class="bd ${ds===c.sets.length?'g':''}">${ds}/${c.sets.length} सेट हल</span></div></div>`};
 const pyTile=(s,i)=>{const sc=S.scores[s.id]||[];return`<div class="card tile" style="animation-delay:${i*.05}s" onclick="location.hash='#/quiz/${s.id}'"><div class="ic">📌</div><h3>${esc(s.short)}</h3><div class="meta">${s.qs.length} असली परीक्षा प्रश्न · उत्तर + व्याख्या</div><div class="badges">${sc[0]!=null?pctBadge(sc[0],s.qs.length):'<span class="bd">शुरू करें →</span>'}${sc[1]!=null?pctBadge(sc[1],s.qs.length):''}</div></div>`};
 const mini=(h,ic,t,m)=>`<div class="card tile" onclick="location.hash='${h}'"><div class="ic">${ic}</div><h3>${t}</h3><div class="meta">${m}</div></div>`;
 const pyN=BANK.pyq.reduce((a,s)=>a+s.qs.length,0);
 return`<div class="hero"><small>DSSSB TGT Computer Science · Practice Workbook</small><h1>DSSSB TGT Computer Science<br>डिजिटल अभ्यास पुस्तिका</h1><p>${ALLQ.length-pyN} MCQ (15 अध्याय) · ${pyN} PYQ · ${TFN} सही/गलत · ${FLN} रिक्त स्थान · Mock Test</p><div class="chips"><span class="chip">✔ हर प्रश्न पर उत्तर + व्याख्या</span><span class="chip">⏱ टाइमर</span><span class="chip">🎯 Random Mock Test</span><span class="chip">📒 गलतियों की डायरी</span><span class="chip">📊 स्कोर ट्रैकिंग</span></div></div>
 <div class="stats"><div class="card stat"><b id="c1">0</b><span>सेट हल किए / ${SETS.length}</span></div><div class="card stat"><b id="c2">0</b><span>औसत स्कोर %</span></div><div class="card stat"><b id="c3">0</b><span>डायरी में बाकी गलतियाँ</span></div><div class="card stat"><b id="c4">0</b><span>अन्य अभ्यास पूरे</span></div></div>
 <h2 class="sec">📘 अध्याय-वार अभ्यास</h2><div class="grid">${CH.map(chTile).join('')}</div>
 <h2 class="sec">📌 पिछले वर्षों के प्रश्न (PYQ)</h2><div class="grid">${BANK.pyq.map(pyTile).join('')}</div>
 <h2 class="sec">🎯 Mock Test और अन्य अभ्यास</h2><div class="grid">${mini('#/mock/25','🎯','Mini Mock','25 प्रश्न · सभी अध्यायों से')}${mini('#/mock/50','🏁','Full Mock','50 प्रश्न · 50 मिनट')}${mini('#/mock/100','🔥','Marathon Mock','100 प्रश्न · 100 मिनट')}${mini('#/tf/all','✔','सही / गलत',TFN+' कथन')}${mini('#/fill/all','✏','रिक्त स्थान भरें',FLN+' प्रश्न')}${mini('#/diary','📒','मेरी गलतियों की डायरी',S.diary.filter(d=>!d.done).length+' बाकी')}</div>
 <p style="text-align:center;margin-top:30px"><button class="btn gh sm" onclick="resetAll()">🗑 सारा डेटा रीसेट करें</button></p>`}
function resetAll(){if(confirm('सारा स्कोर, प्रगति और गलतियों की डायरी मिट जाएगी। पक्का?')){const s=S.sound;S=DEF();S.sound=s;save();route()}}

/* ================= CHAPTER PAGE ================= */
function vChapter(n){const c=CH.find(x=>x.n===n);if(!c)return vHome();
 const tfDone=c.tf.filter((_,i)=>S.tf[n+'-'+i]!=null).length,flDone=c.fill.filter((_,i)=>(S.fill[n+'-'+i]||{}).r!=null).length;
 return`<div class="hero"><small>अध्याय ${c.n}</small><h1>${c.icon} ${esc(c.name)}</h1><p>${c.total} MCQ · ${c.tf.length} सही/गलत · ${c.fill.length} रिक्त स्थान</p></div>
 <h2 class="sec">MCQ सेट</h2><div class="grid">${c.sets.map((s,i)=>{const sc=S.scores[s.id]||[];return`<div class="card tile" onclick="location.hash='#/quiz/${s.id}'"><div class="ic">📝</div><h3>${esc(c.sets.length>1?s.title:'Practice Set')}</h3><div class="meta">${s.qs.length} प्रश्न · ~${s.qs.length} मिनट</div><div class="badges">${sc[0]!=null?pctBadge(sc[0],s.qs.length):'<span class="bd">शुरू करें →</span>'}${sc[1]!=null?pctBadge(sc[1],s.qs.length):''}</div></div>`}).join('')}</div>
 <h2 class="sec">इसी अध्याय के अन्य अभ्यास</h2><div class="grid"><div class="card tile" onclick="location.hash='#/tf/${c.n}'"><div class="ic">✔</div><h3>सही / गलत</h3><div class="meta">${tfDone}/${c.tf.length} हल</div></div><div class="card tile" onclick="location.hash='#/fill/${c.n}'"><div class="ic">✏</div><h3>रिक्त स्थान भरें</h3><div class="meta">${flDone}/${c.fill.length} हल</div></div></div>
 <p style="margin-top:22px"><button class="btn gh sm" onclick="location.hash='#/home'">← सभी अध्याय</button></p>`}

/* ================= GUIDE ================= */
function vGuide(){return`<div class="hero"><h1>📘 इस Workbook का उपयोग कैसे करें</h1><p>अभ्यास की 4 स्टेप विधि</p></div>
<div class="card" style="margin-top:16px"><div class="steps"><div><b>पहले हल करें</b><br>उत्तर न देखें; हर सेट के लिए प्रश्न-संख्या के बराबर मिनट का टाइमर चलता है।</div><div><b>फिर जाँचें</b><br>स्कोर अपने-आप सेव होता है (पहला और दूसरा प्रयास)।</div><div><b>गलती समझें</b><br>व्याख्या पढ़ें; गलत प्रश्न अपने-आप 📒 गलतियों की डायरी में जुड़ जाते हैं।</div><div><b>3 दिन बाद दोबारा हल करें</b><br>सेट के परिणाम पर "केवल गलत प्रश्न" बटन से सिर्फ गलत प्रश्न दोहराएँ।</div></div></div>
<h2 class="sec">इसमें क्या है</h2><div class="card"><table><tr><th>भाग</th><th>विवरण</th></tr><tr><td>अध्याय-वार MCQ</td><td>DSSSB TGT CS के 15 अध्यायों के नोट्स पर आधारित, हर सेट में लगभग 25 प्रश्न तक</td></tr><tr><td>PYQ सेट</td><td>पिछली परीक्षाओं के असली प्रश्न; जिन प्रश्नों की आधिकारिक कुंजी बदली गई है उन पर ⚠ का निशान और सही उत्तर दिया है</td></tr><tr><td>सही / गलत और रिक्त स्थान</td><td>अध्याय चुनकर या सभी एक साथ</td></tr><tr><td>Mock Test</td><td>हर बार नए सिरे से Random प्रश्न (25 / 50 / 100)</td></tr></table></div>
<h2 class="sec">स्कोर का अर्थ</h2><div class="card"><table><tr><th>स्कोर</th><th>अर्थ</th><th>अगला कदम</th></tr><tr><td>80% या अधिक</td><td>तैयारी मजबूत</td><td>Mock Test और Revision</td></tr><tr><td>60% – 79%</td><td>ठीक-ठाक</td><td>गलत टॉपिक दोहराएँ</td></tr><tr><td>60% से कम</td><td>और अभ्यास चाहिए</td><td>अध्याय के नोट्स पढ़कर यही सेट फिर हल करें</td></tr></table></div>
<h2 class="sec">मोड</h2><div class="card"><b>प्रैक्टिस मोड:</b> हर उत्तर पर तुरंत सही/गलत + व्याख्या।<br><b>परीक्षा मोड:</b> अंत तक कोई उत्तर नहीं दिखता, फिर पूरा रिव्यू।</div>
<div class="card" style="margin-top:14px;border-color:var(--gold)">💡 <b>सलाह:</b> अध्याय-वार प्रश्न नोट्स को आधार बनाकर लिखे गए अभ्यास-प्रश्न हैं; परीक्षा के पैटर्न के लिए PYQ सेट और Mock Test ज़रूर हल करें।<br>🔊 आवाज़ के लिए ऊपर 🔊 बटन से चालू/बंद करें (पहले टैप के बाद ही ब्राउज़र आवाज़ देता है)।<br>💾 सारी प्रगति इसी ब्राउज़र में आपके खाते में सेव रहती है; दूसरे डिवाइस के लिए 👤 प्रोफ़ाइल से Backup/Restore करें।</div>`}

/* ================= STATS ================= */
function vStats(){let t1=0,t2=0,n1=0,n2=0,tq=0;
 const row=s=>{const sc=S.scores[s.id]||[];tq+=s.qs.length;if(sc[0]!=null){t1+=sc[0];n1+=s.qs.length}if(sc[1]!=null){t2+=sc[1];n2+=s.qs.length}return`<tr><td>${esc(s.title)}</td><td>${s.qs.length}</td><td>${sc[0]!=null?sc[0]:'—'}</td><td>${sc[1]!=null?sc[1]:'—'}</td></tr>`};
 const rows=SETS.map(row).join('');
 const tfd=Object.keys(S.tf),tfc=tfd.filter(k=>TFMAP[k]&&S.tf[k]===TFMAP[k].a).length;const fl=Object.keys(S.fill).filter(k=>S.fill[k].r!=null),flc=fl.filter(k=>S.fill[k].r).length;
 const mk=S.mocks.slice().reverse().map(m=>`<tr><td>${new Date(m.t).toLocaleString('hi-IN')}</td><td>${m.n}</td><td>${m.sc} (${Math.round(m.sc/m.n*100)}%)</td><td>${fmt(m.secs)}</td></tr>`).join('');
 return`<div class="hero"><h1>📊 प्रगति तालिका</h1><p>कुल ${tq} MCQ · पहला कुल ${t1} · दूसरा कुल ${t2}</p><div class="chips"><span class="chip">सही/गलत: ${tfc}/${tfd.length} सही</span><span class="chip">रिक्त स्थान: ${flc}/${fl.length} सही</span><span class="chip">Mock Test: ${S.mocks.length}</span></div></div>
 <div class="card" style="margin-top:16px;overflow:auto"><table><tr><th>सेट</th><th>प्रश्न</th><th>पहला स्कोर</th><th>दूसरा स्कोर</th></tr>${rows}<tr><th>कुल</th><th>${tq}</th><th>${t1}${n1?` (${Math.round(t1/n1*100)}%)`:''}</th><th>${t2}${n2?` (${Math.round(t2/n2*100)}%)`:''}</th></tr></table></div>
 <h2 class="sec">🎯 Mock Test इतिहास</h2><div class="card" style="overflow:auto">${mk?`<table><tr><th>तारीख</th><th>प्रश्न</th><th>स्कोर</th><th>समय</th></tr>${mk}</table>`:'<div class="empty">अभी कोई Mock Test नहीं दिया।</div>'}</div>`}

/* ================= QUIZ ================= */
let Q=null;
function startIntro(id){const s=findSet(id);if(!s){location.hash='#/home';return}const sc=S.scores[s.id]||[];const wrong=s.qs.filter(q=>S.diary.some(d=>d.key===q.u&&!d.done)).length;
 $('#app').innerHTML=`<div class="hero"><small>${s.group==='pyq'?'पिछले वर्षों के प्रश्न':'अध्याय '+s.ch}</small><h1>${s.icon} ${esc(s.title)}</h1><p>कुल ${s.qs.length} प्रश्न | समय: लगभग ${s.qs.length} मिनट</p></div>
 <div class="card" style="margin-top:16px"><div class="badges" style="margin:0 0 14px"><span class="bd">पहला स्कोर: ${sc[0]!=null?sc[0]+'/'+s.qs.length:'—'}</span><span class="bd">दूसरा स्कोर: ${sc[1]!=null?sc[1]+'/'+s.qs.length:'—'}</span></div>
 <p style="margin:0 0 12px"><b>मोड चुनें:</b></p><div class="row"><button class="btn" onclick="beginQuiz('${s.id}','practice')">⚡ प्रैक्टिस मोड</button><button class="btn gh" onclick="beginQuiz('${s.id}','exam')">📝 परीक्षा मोड</button>${wrong?`<button class="btn ok" onclick="beginQuiz('${s.id}','practice',true)">🔁 केवल गलत प्रश्न (${wrong})</button>`:''}</div>
 ${s.ch?`<p style="margin:16px 0 0"><button class="btn gh sm" onclick="location.hash='#/ch/${s.ch}'">← अध्याय ${s.ch}</button></p>`:''}</div>`}
function mockIntro(n){if(![25,50,100].includes(n))n=50;
 $('#app').innerHTML=`<div class="hero"><small>सभी अध्यायों + PYQ से Random</small><h1>🎯 Mock Test</h1><p>हर बार नए सिरे से प्रश्न चुने जाते हैं</p></div>
 <div class="card" style="margin-top:16px"><div class="row" style="margin-bottom:14px">${[25,50,100].map(k=>`<button class="btn sm ${k===n?'':'gh'}" onclick="location.hash='#/mock/${k}'">${k} प्रश्न</button>`).join('')}</div>
 <div class="badges" style="margin:0 0 14px"><span class="bd">${n} प्रश्न</span><span class="bd">समय: ${n} मिनट</span><span class="bd">पिछले टेस्ट: ${S.mocks.length}</span>${S.mocks.length?`<span class="bd g">सर्वश्रेष्ठ: ${Math.max(...S.mocks.map(m=>Math.round(m.sc/m.n*100)))}%</span>`:''}</div>
 <p style="margin:0 0 12px"><b>मोड चुनें:</b></p><div class="row"><button class="btn" onclick="beginMock(${n},'exam')">📝 परीक्षा मोड (अंत में उत्तर)</button><button class="btn gh" onclick="beginMock(${n},'practice')">⚡ प्रैक्टिस मोड</button></div></div>`}
function beginMock(n,mode){const a=ALLQ.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
 const s={id:'mock',ch:0,icon:'🎯',title:'Mock Test ('+n+' प्रश्न)',qs:a.slice(0,n),mock:true};startSet(s,mode,s.qs.map((_,i)=>i),false)}
function beginQuiz(id,mode,retry){const s=findSet(id);let list=s.qs.map((_,i)=>i);if(retry)list=list.filter(i=>S.diary.some(d=>d.key===s.qs[i].u&&!d.done));if(!list.length)return;startSet(s,mode,list,!!retry)}
function startSet(s,mode,list,retry){Q={s,mode,retry,list,pos:0,ans:[],t0:Date.now()};SFX.start();stopTimer();TM=setInterval(()=>{const e=$('#tm');if(e)e.textContent='⏱ '+fmt(Math.floor((Date.now()-Q.t0)/1000))+' / '+fmt(Q.list.length*60)},1000);renderQ()}
function qMeta(q){return(q.src?`<div class="tag" style="margin-top:6px">📌 ${esc(q.src)}${q.chg?' <span class="pill">⚠ आधिकारिक कुंजी बदली गई</span>':''}</div>`:'')}
function renderQ(){const{s,list,pos,mode}=Q;const q=s.qs[list[pos]];const a=Q.ans[pos];const locked=mode==='practice'&&a!=null;
 const opts=q.o.map((o,k)=>{let c='opt';if(locked){c+=' lock';if(k===q.a)c+=' ok';else if(k===a)c+=' bad';else c+=' dim'}else if(a===k)c+=' sel';return`<button class="${c}" onclick="pick(${k})"><span class="l">${LET[k]}</span><span>${esc(o)}</span></button>`}).join('');
 $('#app').innerHTML=`<div class="card"><div class="qtop"><span>${esc(s.title)}${Q.retry?' · 🔁 गलत प्रश्न':''}</span><span id="tm">⏱ 00:00</span><span>प्रश्न ${pos+1} / ${list.length}</span></div><div class="bar"><i style="width:${(pos+(locked?1:0))/list.length*100}%"></i></div>
 ${q.t&&!q.src?`<div class="tag" style="margin-top:10px">📖 ${esc(q.t)}</div>`:''}${qMeta(q)}
 <div class="qtext">${pos+1}. ${esc(q.q)}</div><div class="opts">${opts}</div>
 ${locked?`<div class="expl"><b>${a===q.a?'✅ सही!':'❌ गलत — सही उत्तर: ('+LET[q.a]+') '+esc(q.o[q.a])}</b><br>${esc(q.e)}</div>`:''}
 <div class="row" style="margin-top:18px;justify-content:space-between"><button class="btn gh sm" onclick="if(confirm('क्विज़ छोड़ें? प्रगति सेव नहीं होगी')){stopTimer();location.hash='#/home'}">✖ छोड़ें</button><span>${pos>0&&mode==='exam'?'<button class="btn gh sm" onclick="Q.pos--;renderQ()">← पिछला</button> ':''}<button class="btn" onclick="nextQ()" ${(mode==='practice'&&a==null)?'disabled style="opacity:.4;cursor:not-allowed"':''}>${pos===list.length-1?'🏁 समाप्त':'अगला →'}</button></span></div></div>`}
function pick(k){const{s,list,pos,mode}=Q;const q=s.qs[list[pos]];if(mode==='practice'){if(Q.ans[pos]!=null)return;Q.ans[pos]=k;k===q.a?SFX.ok():SFX.bad()}else{Q.ans[pos]=k;SFX.click()}renderQ()}
function nextQ(){if(Q.mode==='practice'&&Q.ans[Q.pos]==null)return;if(Q.pos<Q.list.length-1){Q.pos++;renderQ()}else finishQ()}
function addDiary(q){const key=q.u;const ex=S.diary.find(d=>d.key===key);if(ex){ex.done=false;ex.due=Date.now()+3*864e5;ex.times=(ex.times||1)+1;return}S.diary.push({key,secTitle:q.sec||'',q:q.q,ans:LET[q.a]+') '+q.o[q.a],e:q.e,reason:'',done:false,due:Date.now()+3*864e5,times:1})}
function finishQ(){stopTimer();const{s,list,ans,retry}=Q;let sc=0;const wrong=[];list.forEach((qi,i)=>{const q=s.qs[qi];if(ans[i]===q.a){sc++;const d=S.diary.find(d=>d.key===q.u);if(d&&(retry||s.mock))d.done=true}else{wrong.push(i);addDiary(q)}});
 const n=list.length,p=Math.round(sc/n*100),secs=Math.floor((Date.now()-Q.t0)/1000);
 if(s.mock)S.mocks.push({t:Date.now(),sc,n,secs});else if(!retry){const a=S.scores[s.id]||[null,null];if(a[0]==null)a[0]=sc;else a[1]=sc;S.scores[s.id]=a}save();
 const b=band(p);p>=80?(SFX.win(),confetti()):SFX.done();
 const C=2*Math.PI*80;
 $('#app').innerHTML=`<div class="card res"><h2 style="margin:0">${retry?'🔁 गलत प्रश्न — परिणाम':'📋 परिणाम'}</h2><div style="color:var(--mut)">${esc(s.title)}</div>
 <div class="ring"><svg width="190" height="190"><circle cx="95" cy="95" r="80" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="14"/><circle id="rg" cx="95" cy="95" r="80" fill="none" stroke="url(#gr)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" style="transition:stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)"/><defs><linearGradient id="gr"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs></svg><div class="c"><div><span id="rp">0</span><small>${sc} / ${n}</small></div></div></div>
 <div class="band" style="background:${b[2]}">${b[0]}<br><small style="font-weight:400">${b[1]}</small></div>
 <div style="color:var(--mut)">⏱ समय: ${fmt(secs)} (लक्ष्य ${fmt(n*60)})${wrong.length?' · 📒 '+wrong.length+' गलती डायरी में जुड़ीं':''}</div>
 <div class="row" style="justify-content:center;margin-top:16px">${s.mock?`<button class="btn" onclick="location.hash='#/mock/${n}';route()">🔄 नया Mock Test</button>`:`<button class="btn" onclick="location.hash='#/quiz/${s.id}'">🔄 फिर हल करें</button>`}${wrong.length&&!s.mock?`<button class="btn ok" onclick="beginQuiz('${s.id}','practice',true)">🔁 केवल गलत प्रश्न</button>`:''}<button class="btn gh" onclick="location.hash='#/home'">🏠 होम</button></div></div>
 <h2 class="sec">उत्तर-कुंजी और व्याख्या</h2>${list.map((qi,i)=>{const q=s.qs[qi];const ok=ans[i]===q.a;return`<div class="card item ${ok?'right':'wrong'}"><div style="white-space:pre-wrap"><span class="n">${i+1}.</span>${esc(q.q)}</div>${qMeta(q)}<div class="fb ${ok?'ok':'bad'}">${ok?'✅ आपका उत्तर सही':'❌ आपका उत्तर: '+(ans[i]!=null?'('+LET[ans[i]]+') '+esc(q.o[ans[i]]):'—')+'<br>✔ सही: ('+LET[q.a]+') '+esc(q.o[q.a])}<br><span class="tag">${esc(q.e)}</span></div></div>`}).join('')}`;
 $('#app').insertAdjacentHTML('beforeend',rateCard(s.title));
 setTimeout(()=>{$('#rg').style.strokeDashoffset=C*(1-p/100);countUp($('#rp'),p,1400,'%')},80);scrollTo(0,0)}

/* ================= TRUE / FALSE + FILL ================= */
function chips(kind,cur){return`<div class="row" style="margin:14px 0">${['all'].concat(CH.map(c=>c.n)).map(k=>`<button class="nb ${String(k)===String(cur)?'on':''}" onclick="location.hash='#/${kind}/${k}'">${k==='all'?'सभी':'अध्याय '+k}</button>`).join('')}</div>`}
function keysOf(map,cur){return Object.keys(map).filter(k=>cur==='all'||k.split('-')[0]===String(cur))}
function chTag(k){const c=CH.find(x=>x.n===+k.split('-')[0]);return c?`<div class="tag" style="margin-bottom:4px">${c.icon} अध्याय ${c.n} · ${esc(c.name)}</div>`:''}
function tfCard(k,n){const d=TFMAP[k],a=S.tf[k];const cls=a==null?'':(a===d.a?'right':'wrong');let fb='';if(a!=null)fb=`<div class="fb ${a===d.a?'ok':'bad'}">${a===d.a?'✅ सही उत्तर':'❌ गलत — सही उत्तर: '+(d.a?'T (सही)':'F (गलत)')}${d.n?'<br>'+esc(d.n):''}</div>`;
 return`<div class="card item ${cls}" id="tf${k}">${chTag(k)}<div><span class="n">${n}</span>${esc(d.s)}</div><div class="row" style="margin-top:10px"><button class="btn sm tfbtn ${a===true?'':'gh'}" onclick="tfPick('${k}',true)">T · सही</button><button class="btn sm tfbtn ${a===false?'':'gh'}" onclick="tfPick('${k}',false)">F · गलत</button></div>${fb}</div>`}
let CURTF='all',CURFL='all';
function tfPick(k,v){if(S.tf[k]!=null)return;S.tf[k]=v;save();v===TFMAP[k].a?SFX.ok():SFX.bad();const ks=keysOf(TFMAP,CURTF);$('#tf'+k).outerHTML=tfCard(k,ks.indexOf(k)+1);tfHead()}
function tfHead(){const ks=keysOf(TFMAP,CURTF);const dn=ks.filter(k=>S.tf[k]!=null);const c=dn.filter(k=>S.tf[k]===TFMAP[k].a).length;const e=$('#tfh');if(e)e.textContent=`स्कोर: ${c} / ${ks.length} · हल किए: ${dn.length}`}
function tfReset(){keysOf(TFMAP,CURTF).forEach(k=>delete S.tf[k]);save();route()}
function vTF(cur){CURTF=cur||'all';setTimeout(tfHead,0);const ks=keysOf(TFMAP,CURTF);return`<div class="hero"><small>सही / गलत</small><h1>True or False</h1><p>गलत कथन को सही रूप में समझने का अभ्यास करें।</p></div>${chips('tf',CURTF)}<div class="card" style="margin:14px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><b id="tfh"></b><button class="btn gh sm" onclick="tfReset()">🔄 रीसेट</button></div>${ks.map((k,i)=>tfCard(k,i+1)).join('')}`}
const nz=s=>String(s).toLowerCase().replace(/\s+/g,'');
function fillOK(k){const inp=(S.fill[k]||{}).v||'';const w=nz(inp),pcs=inp.toLowerCase().split(/[,;\s]+/).filter(Boolean).map(nz);return FLMAP[k].alts.split('~').some(v=>v.split(',').every(t=>{t=nz(t);if(!t)return false;return t.length>3?w.includes(t):(pcs.includes(t)||w===t)}))}
function fCard(k,n){const d=FLMAP[k],st=S.fill[k]||{v:'',r:null,shown:false};const cls=st.r==null?'':st.r?'right':'wrong';let fb='';
 if(st.shown)fb=`<div class="fb ${st.r?'ok':'bad'}">${st.r?'✅ सही!':'❌ मिलान नहीं हुआ'} · <b>उत्तर: ${esc(d.d)}</b>${st.r?'':`<div style="margin-top:8px"><button class="btn ok sm" onclick="fOver('${k}')">मेरा उत्तर सही था ✔</button></div>`}</div>`;
 return`<div class="card item ${cls}" id="fl${k}">${chTag(k)}<div><span class="n">${n}</span>${esc(d.q)}</div><div class="row" style="margin-top:10px;flex-wrap:nowrap"><input type="text" value="${esc(st.v)}" placeholder="अपना उत्तर लिखें…" oninput="fType('${k}',this.value)" onkeydown="if(event.key==='Enter')fCheck('${k}')"><button class="btn sm" style="flex:none" onclick="fCheck('${k}')">जाँचें</button></div>${fb}</div>`}
function fType(k,v){S.fill[k]=S.fill[k]||{v:'',r:null,shown:false};S.fill[k].v=v;save()}
function fCheck(k){S.fill[k]=S.fill[k]||{v:'',r:null,shown:false};const r=fillOK(k);S.fill[k].r=r;S.fill[k].shown=true;save();r?SFX.ok():SFX.bad();const ks=keysOf(FLMAP,CURFL);$('#fl'+k).outerHTML=fCard(k,ks.indexOf(k)+1);fHead()}
function fOver(k){S.fill[k].r=true;save();SFX.ok();const ks=keysOf(FLMAP,CURFL);$('#fl'+k).outerHTML=fCard(k,ks.indexOf(k)+1);fHead()}
function fHead(){const ks=keysOf(FLMAP,CURFL);const dn=ks.filter(k=>(S.fill[k]||{}).shown);const c=dn.filter(k=>S.fill[k].r).length;const e=$('#fh');if(e)e.textContent=`सही: ${c} / ${ks.length} · जाँचे गए: ${dn.length}`}
function fReset(){keysOf(FLMAP,CURFL).forEach(k=>delete S.fill[k]);save();route()}
function vFill(cur){CURFL=cur||'all';setTimeout(fHead,0);const ks=keysOf(FLMAP,CURFL);return`<div class="hero"><small>रिक्त स्थान</small><h1>✏ रिक्त स्थान भरें</h1><p>खाली स्थान में सही शब्द/संख्या लिखें, फिर "जाँचें" दबाएँ।</p></div>${chips('fill',CURFL)}<div class="card" style="margin:14px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><b id="fh"></b><button class="btn gh sm" onclick="fReset()">🔄 रीसेट</button></div>${ks.map((k,i)=>fCard(k,i+1)).join('')}`}

/* ================= DIARY ================= */
function vDiary(){const L=S.diary.slice().sort((a,b)=>a.done-b.done||a.due-b.due);const p=S.diary.filter(d=>!d.done).length;const now=Date.now();
 return`<div class="hero"><small>गलतियों की डायरी</small><h1>📒 मेरी गलतियों की डायरी</h1><p>जो प्रश्न गलत हुआ, वह यहाँ अपने-आप जुड़ता है। परीक्षा से पहले यही पन्ने दो बार पढ़ें।</p><div class="chips"><span class="chip">बाकी: ${p}</span><span class="chip">दोहराए: ${S.diary.length-p}</span></div></div>
 <div class="card" style="margin-top:14px"><b>➕ अपनी गलती जोड़ें</b><div style="display:grid;gap:8px;margin-top:8px"><input type="text" id="dq" placeholder="प्रश्न / टॉपिक"><input type="text" id="da" placeholder="सही उत्तर / नियम"><input type="text" id="dr" placeholder="गलती का कारण"><button class="btn sm" style="justify-self:start" onclick="dAdd()">जोड़ें</button></div></div>
 <div style="margin-top:14px">${L.length?L.map(d=>{const i=S.diary.indexOf(d);const due=!d.done&&d.due<=now;return`<div class="card diaryitem ${d.done?'done':''}"><div class="tag">${esc(d.secTitle||'मेरी प्रविष्टि')} ${d.times>1?'· '+d.times+' बार गलत':''} ${due?'<span class="pill">🔔 दोहराने का समय</span>':!d.done&&d.due?'<span class="tag">· दोहराएँ: '+new Date(d.due).toLocaleDateString('hi-IN')+'</span>':''}</div><div style="margin:6px 0;white-space:pre-wrap"><b>${esc(d.q)}</b></div><div class="fb ok">✔ सही उत्तर / नियम: ${esc(d.ans)}${d.e?'<br><span class="tag">'+esc(d.e)+'</span>':''}</div><textarea rows="2" placeholder="गलती का कारण लिखें…" style="margin-top:8px" oninput="S.diary[${i}].reason=this.value;save()">${esc(d.reason||'')}</textarea><div class="row" style="margin-top:8px"><button class="btn sm ${d.done?'gh':'ok'}" onclick="dToggle(${i})">${d.done?'↩ फिर से खोलें':'✔ दोहरा लिया'}</button><button class="btn gh sm" onclick="dDel(${i})">🗑</button></div></div>`}).join(''):'<div class="empty">🎉 अभी कोई गलती नहीं! MCQ सेट हल करें — गलत उत्तर यहाँ अपने-आप जुड़ेंगे।</div>'}</div>`}
function dAdd(){const q=$('#dq').value.trim();if(!q)return;S.diary.push({key:'m'+Date.now(),secTitle:'',q,ans:$('#da').value,e:'',reason:$('#dr').value,done:false,due:Date.now()+3*864e5,times:1});save();SFX.ok();route()}
function dToggle(i){const d=S.diary[i];d.done=!d.done;if(!d.done)d.due=Date.now()+3*864e5;save();d.done?SFX.ok():SFX.click();route()}
function dDel(i){S.diary.splice(i,1);save();route()}


(function(){const e=LS.g('dsssb_session'),u=users();if(e&&u[e]){USER={email:e,name:u[e].name};loadData(e)}route()})();

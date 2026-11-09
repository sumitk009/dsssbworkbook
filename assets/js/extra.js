/* Feedback, Rating, Contact (owner details yahin se badlein) */
const OWNER={name:'Sumit Kumar',wa:'918969543599',waShow:'+91 89695 43599',mail:'sumitk09jmu@gmail.com'};
const FB_KEY='dsssb_feedback';
const fbList=()=>{try{return JSON.parse(LS.g(FB_KEY)||'[]')}catch(e){return[]}};
const CATS=['सामान्य फीडबैक','प्रश्न / उत्तर में गलती','सुझाव','तकनीकी समस्या'];
const STAR_TXT=['','बहुत खराब','ठीक नहीं','ठीक है','अच्छा','बहुत बढ़िया'];
let FR=0;
function stars(id,cur,fn){return`<div class="stars" role="radiogroup" aria-label="रेटिंग">${[1,2,3,4,5].map(i=>`<button type="button" class="star ${i<=cur?'on':''}" role="radio" aria-checked="${i===cur}" aria-label="${i} स्टार" onclick="${fn}(${i})">★</button>`).join('')}</div>`}
function starStatic(v){return'<span class="sstat" aria-label="'+v+' स्टार">'+'★'.repeat(v)+'<i>'+'★'.repeat(5-v)+'</i></span>'}
function setFR(v){FR=v;const e=document.getElementById('frs');if(e)e.innerHTML=stars('frs',FR,'setFR');const t=document.getElementById('frt');if(t)t.textContent=STAR_TXT[v];SFX.click()}
function vFeedback(){FR=0;const L=fbList().filter(x=>x.email===USER.email).slice().reverse();const all=fbList().filter(x=>x.rating);const avg=all.length?(all.reduce((a,b)=>a+b.rating,0)/all.length).toFixed(1):'—';
 return`<div class="hero"><small>आपकी राय हमारे लिए ज़रूरी है</small><h1>💬 फीडबैक और रेटिंग</h1><p>वेबसाइट कैसी लगी? कोई गलती मिली या सुझाव है? सीधे Sumit Kumar तक पहुँचाएँ।</p></div>
<div class="fgrid"><div class="card"><h3 class="ct">अपना फीडबैक लिखें</h3>
<div class="fl">आपकी रेटिंग</div><div id="frs">${stars('frs',0,'setFR')}</div><div class="tag" id="frt" style="min-height:20px">स्टार चुनें</div>
<div class="fl">विषय</div><select id="fcat">${CATS.map(c=>`<option>${c}</option>`).join('')}</select>
<div class="fl">आपका संदेश</div><textarea id="fmsg" rows="5" maxlength="1000" placeholder="यहाँ लिखें… (प्रश्न की गलती हो तो अध्याय और प्रश्न संख्या भी लिखें)"></textarea>
<div id="ferr" class="fb bad" style="display:none"></div>
<div class="row" style="margin-top:14px"><button class="btn" onclick="fbSend('wa')">WhatsApp पर भेजें</button><button class="btn gh" onclick="fbSend('mail')">Email से भेजें</button></div>
<p class="tag" style="margin:12px 0 0">आपका फीडबैक इस ब्राउज़र में सेव होता है और ऊपर के बटन से सीधे Sumit Kumar को WhatsApp / Email पर पहुँचता है।</p></div>
<div class="card"><h3 class="ct">संपर्क</h3><div class="contact"><a href="https://wa.me/${OWNER.wa}" target="_blank" rel="noopener"><b>WhatsApp</b><span>${OWNER.waShow}</span></a><a href="mailto:${OWNER.mail}"><b>Email</b><span>${OWNER.mail}</span></a></div>
<div class="fl" style="margin-top:16px">आपकी औसत रेटिंग (इस डिवाइस पर)</div><div class="avg"><b>${avg}</b>${all.length?starStatic(Math.round(avg)):''}<span class="tag">${all.length} रेटिंग</span></div></div></div>
<h2 class="sec">आपके भेजे फीडबैक</h2>${L.length?L.map(x=>`<div class="card item"><div class="row" style="justify-content:space-between"><span>${x.rating?starStatic(x.rating):''} <span class="tag">${esc(x.cat||'')}</span></span><span class="tag">${new Date(x.t).toLocaleDateString('hi-IN')}</span></div>${x.msg?`<div style="margin-top:8px;white-space:pre-wrap">${esc(x.msg)}</div>`:''}</div>`).join(''):'<div class="card empty">अभी कोई फीडबैक नहीं भेजा। ऊपर फॉर्म भरकर शुरू करें।</div>'}`}
function fbErr(m){const e=$('#ferr');e.style.display='block';e.textContent=m;SFX.bad()}
function fbSend(how){const msg=$('#fmsg').value.trim(),cat=$('#fcat').value;if(!FR)return fbErr('कृपया पहले स्टार रेटिंग चुनें।');if(msg.length<5)return fbErr('कृपया अपना संदेश कम से कम 5 अक्षर में लिखें।');
 const l=fbList();l.push({t:Date.now(),email:USER.email,name:USER.name,rating:FR,cat,msg});LS.s(FB_KEY,JSON.stringify(l));
 const txt=`DSSSB Workbook फीडबैक\nनाम: ${USER.name}\nEmail: ${USER.email}\nरेटिंग: ${FR}/5\nविषय: ${cat}\n\n${msg}`;
 SFX.win();if(how==='wa')window.open('https://wa.me/'+OWNER.wa+'?text='+encodeURIComponent(txt),'_blank');else location.href='mailto:'+OWNER.mail+'?subject='+encodeURIComponent('DSSSB Workbook फीडबैक ('+FR+'/5)')+'&body='+encodeURIComponent(txt);
 setTimeout(route,300)}
/* result screen par quick rating */
let QR=0;
function rateCard(title){QR=0;return`<div class="card" id="qrate" style="margin-top:16px;text-align:center"><b>इस अभ्यास को रेट करें</b><div id="qrs">${stars('qrs',0,'setQR')}</div><div class="row" style="justify-content:center;margin-top:8px"><input type="text" id="qrm" placeholder="छोटा सुझाव (वैकल्पिक)" style="max-width:340px"><button class="btn sm" onclick="qrSave(${JSON.stringify(title).replace(/"/g,'&quot;')})">सेव करें</button></div></div>`}
function setQR(v){QR=v;$('#qrs').innerHTML=stars('qrs',v,'setQR');SFX.click()}
function qrSave(t){if(!QR)return;const l=fbList();l.push({t:Date.now(),email:USER.email,name:USER.name,rating:QR,cat:'अभ्यास रेटिंग: '+t,msg:$('#qrm').value.trim()});LS.s(FB_KEY,JSON.stringify(l));SFX.ok();$('#qrate').innerHTML='<b>धन्यवाद! आपकी रेटिंग सेव हो गई।</b> <a href="#/feedback" style="color:var(--gold)">विस्तार से फीडबैक दें</a>'}

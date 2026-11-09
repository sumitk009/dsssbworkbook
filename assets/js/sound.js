/* Sound effects + confetti (Web Audio API, koi audio file nahi) */
/* ================= SOUND ================= */
let AC;function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d=.15,t='sine',v=.15,delay=0){if(!S.sound)return;const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.value=f;const st=c.currentTime+delay;g.gain.setValueAtTime(.0001,st);g.gain.exponentialRampToValueAtTime(v,st+.02);g.gain.exponentialRampToValueAtTime(.0001,st+d);o.connect(g);g.connect(c.destination);o.start(st);o.stop(st+d+.05)}
const SFX={click:()=>tone(660,.07,'triangle',.08),ok:()=>{tone(784,.14,'sine',.18);tone(1047,.28,'sine',.18,.1)},bad:()=>{tone(220,.22,'sawtooth',.1);tone(160,.3,'sawtooth',.1,.12)},win:()=>[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.32,'triangle',.15,i*.11)),done:()=>[392,523,659].forEach((f,i)=>tone(f,.25,'sine',.14,i*.13)),start:()=>[440,554,659].forEach((f,i)=>tone(f,.12,'triangle',.1,i*.07))};
document.addEventListener('click',e=>{if(e.target.closest('.nb,.btn,.tile'))SFX.click()},true);

/* ================= CONFETTI ================= */
function confetti(){const cv=$('#cv'),x=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;const cols=['#6366f1','#06b6d4','#fbbf24','#22c55e','#4f8cff','#a855f7'];const P=Array.from({length:150},()=>({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*.5,r:4+Math.random()*6,c:cols[Math.random()*6|0],vx:-2+Math.random()*4,vy:2+Math.random()*4,a:Math.random()*6}));let f=0;(function d(){x.clearRect(0,0,cv.width,cv.height);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a+=.1;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillRect(-p.r,-p.r/2,p.r*2,p.r);x.restore()});if(++f<220)requestAnimationFrame(d);else x.clearRect(0,0,cv.width,cv.height)})()}


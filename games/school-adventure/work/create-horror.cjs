const fs=require('fs');
let s=fs.readFileSync('outputs/sekolah-kartun-3d.html','utf8');
function replace(a,b){if(!s.includes(a))throw Error('Missing replacement: '+a.slice(0,100));s=s.replace(a,b)}
function section(a,b,text){const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<0)throw Error('Missing section');s=s.slice(0,start)+text+'\n'+s.slice(end)}
replace('<title>Realistic School 3D — Sekolah Pelangi</title>','<title>Sekolah Anomali — Sembilan Penghuni</title>');
replace('</style>',`
/* Tema malam: panel arsip, fosfor hijau, aksen merah tembaga. */
:root{--mint:#b1d69b;--ink:#111a17}
body{background:#060b10;color:#e1e6da}button{background:#303e3a;color:#dce5d6;border:1px solid #83917a40;border-radius:5px}
.overlay{background:#03080dc9}.card{background:linear-gradient(145deg,#15201ff7,#0c1419fa);border:1px solid #8caa824d;border-radius:10px;box-shadow:0 25px 100px #0009}
h1{letter-spacing:-.04em}p{color:#b0beb7}.eyebrow{color:#c79379}.badge{border:1px solid #9aac8d33;background:#a3b3940b;border-radius:3px}
.stat,#mapBox,#prompt,#bottom,#toast{background:#0d1719ed;border-color:#94ab8055;border-radius:5px}.stat b,#status,#teacherStatus{color:#c5d4a7}
.answer{background:#243430;border-radius:5px}.right{background:#284e3d!important}.wrong{background:#663736!important}
#hint{color:#c8c6a3;background:#bdb7870d;border-color:#a69b68}textarea{background:#091314;border-color:#637760}#mapBox header{color:#adbdaf}
#atmosphere{position:fixed;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at center,transparent 24%,#0004 70%,#000a 100%);box-shadow:inset 0 0 100px #0007}
#atmosphere:after{content:'';position:absolute;inset:0;opacity:.055;background:repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 4px)}
#missionTag{position:fixed;left:18px;bottom:72px;color:#a7b29c;font:11px monospace;letter-spacing:.12em;z-index:3;pointer-events:none}
#mapBox #flashButton{width:100%;font-size:11px;padding:7px;margin-top:6px}
</style>`);
replace('<canvas id="world"></canvas>','<canvas id="world"></canvas><div id="atmosphere"></div><div id="missionTag" class="hidden">ARSIP 09 / SEKOLAH ANOMALI</div>');
replace('NPC ditemukan','Anomali dituntaskan');
replace('SEKOLAH PELANGI','PETA SINYAL');
replace('<button id="sound">🔊 Suara: ON</button>','<button id="sound">🔊 Suara: ON</button><button id="flashButton">F · Senter ON</button>');
replace('Space Lompat · E Bicara · Esc Jeda','Space Lompat · E Selidiki · F Senter · Esc Jeda');
replace('Sekolah Pelangi · Petualangan pengetahuan','Arsip 09 · Sekolah setelah tengah malam');
replace('<h1 id="title">Realistic School 3D</h1>','<h1 id="title">Sekolah Anomali</h1>');
replace('Jelajahi sekolah kartun empat lantai. Temukan sembilan NPC dan jawab tujuh pertanyaan dari setiap penjaga pengetahuan.','Bel terakhir sudah lama berhenti. Namun sembilan penghuni masih menunggu di kelas yang berbeda. Temukan setiap anomali, ajak berbicara, dan selesaikan tujuh pertanyaannya agar mereka dapat pergi.');
replace('24 kelas berwarna','24 kelas terbengkalai');replace('9 NPC · 63 soal','9 anomali · 63 soal');replace('Tangga fisik</span>','Senter &amp; detektor</span>');
replace('E: berinteraksi<br>Tangga kuning berada di koridor belakang. Naik dari ujung bertanda NAIK, lalu ikuti jalur biru untuk ke tangga berikutnya.','E: selidiki anomali · F: senter<br>Tangga berada di koridor belakang. Ikuti papan NAIK dan jalur penunjuk. Sinyal anomali hanya muncul di peta saat kamu mendekat.');
replace('Hebat, penjelajah!','Sekolah kembali sunyi.');replace('Kesembilan NPC sudah ditemukan dan seluruh 63 soal selesai dijawab.','Sembilan anomali telah pergi. Seluruh 63 pertanyaan selesai dijawab. Untuk malam ini, pintu sekolah terbuka kembali.');
replace('const colors=[0xffb85b,0x55cbbb,0x9f90ee,0xff829b];','const colors=[0x4d5d58,0x53616a,0x605663,0x655d4e];\nlet flashlight,flashTarget,flashOn=true,ambienceGain,droneNodes=[],dust,nearSignal=0;\nconst corridorLights=[];');
replace("function audioStart(){try{if(!audio)","function audioStart(){try{if(!audio)");
replace('master.connect(audio.destination);noise=', 'master.connect(audio.destination);ambienceGain=audio.createGain();ambienceGain.gain.value=0;ambienceGain.connect(master);[43.65,65.41,87.8].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type=i===1?"triangle":"sine";o.frequency.value=f;g.gain.value=i===0?.10:.025;o.connect(g);g.connect(ambienceGain);o.start();droneNodes.push(o,g)});noise=');
replace("kind==='tile'?'#77bdce':kind==='wall'?'#fff0bf':'#bd703f'","kind==='tile'?'#313c3d':kind==='wall'?'#7a8170':'#5c493b'");
replace("'#c9e9e5':'#f4efcc'","'#758078':'#536362'");replace("g.strokeStyle='#fff9'","g.strokeStyle='#b1b69a40'");replace("g.strokeStyle='#d9bb7960'","g.strokeStyle='#353d3960'");
replace("let t=new THREE.CanvasTexture(c);",`// Taches, griffures et fissures procédurales, sans image externe.
for(let i=0;i<95;i++){g.fillStyle=i%2?'#111b1b18':'#b3b59c0c';g.fillRect(Math.random()*256,Math.random()*256,3+Math.random()*35,2+Math.random()*25)}
if(kind!=='wood'){g.strokeStyle='#17242065';g.lineWidth=1;for(let k=0;k<5;k++){let x=Math.random()*256,y=Math.random()*256;g.beginPath();g.moveTo(x,y);for(let n=0;n<5;n++){x+=Math.random()*18-9;y+=9;g.lineTo(x,y)}g.stroke()}}
let t=new THREE.CanvasTexture(c);`);
replace('o.receiveShadow=true;scene.add(o);','o.receiveShadow=true;o.castShadow=solid;scene.add(o);');
replace("bg='#173c65'","bg='#172b29'");replace("g.strokeStyle='#ffdc6b'","g.strokeStyle='#a9c29a'");
replace('mat(0x79c876)','mat(0x1c302c)');replace('mat(0x96dc78)','mat(0x273f32)');
s=s.replaceAll('mat(0xffdf69)','mat(0x8c9271)');replace('mat(0x428fc4)','mat(0x263940)');replace('0x3aaf7d:0x6cbf51','0x213d35:0x324735');replace('mat(0xffc75f)','mat(0x665b47)');replace('mat(0xe88862)','mat(0x56473d)');replace('mat(0xe88a36)','mat(0x6a6651)');
replace("'#1a7992'","'#294841'");replace("'#bf6432'","'#4d5140'");
section("const names=['Bu Maya'",'function removeNPC(n)',`
const names=['01 · Murid Tanpa Wajah','02 · Penjaga Jam Mati','03 · Si Bayangan','04 · Siswi Melayang','05 · Pengawas Sunyi','06 · Kepala Terbalik','07 · Anak Kapur','08 · Seragam Kosong','09 · Sang Pengarsip'];
function npcMake(slot,i,questions){
 const g=new THREE.Group(),body=new THREE.Group();g.add(body);
 const pale=mat(0xa5b4a9),dark=mat(0x10191d),cloth=mat([0x314742,0x3e3c4a,0x172128,0x737c74,0x343f42,0x454046,0xa5b5ac,0x37454c,0x50493e][i]);
 const glow=mat(i%2?0xb4d9cb:0xd99c83,{emissive:i%2?0x7bbaab:0xb65034,emissiveIntensity:1.6});
 function part(w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;body.add(o);return o}
 const head=part(.45,.49,.41,0,1.85,0,i===7?dark:pale);
 part(.62,.77,.33,0,1.18,0,cloth);
 for(const side of [-1,1]){
  const arm=part(.13,i===2?.98:.76,.15,side*.43,1.08,0,cloth);arm.rotation.z=side*(i===4?.42:.08);
  part(.12,.18,.15,side*.46,.59,0,pale);
  if(i!==3&&i!==7)part(.20,.67,.24,side*.16,.46,0,dark);
  if(i!==0&&i!==7)part(.06,.045,.026,side*.105,1.89,.213,glow);
 }
 if(i===0){part(.31,.34,.03,0,1.86,.22,pale);part(.38,.12,.4,0,2.14,0,dark)}
 if(i===1){const clock=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.06,24),pale);clock.rotation.x=Math.PI/2;clock.position.set(0,1.26,.22);body.add(clock);part(.025,.20,.04,0,1.32,.27,dark);part(.15,.025,.04,.06,1.24,.27,dark)}
 if(i===2){head.material=dark;body.scale.set(.78,1.22,.67)}
 if(i===3){body.position.y=.30;part(.68,.64,.42,0,.59,0,cloth);part(.5,.25,.45,0,2.03,-.04,dark)}
 if(i===4){part(.78,.10,.50,0,2.16,0,dark);part(.44,.18,.38,0,2.27,0,dark)}
 if(i===5){head.rotation.z=Math.PI;part(.24,.035,.03,0,2.01,.22,glow)}
 if(i===6){part(.34,.08,.03,0,1.7,.22,dark);for(let k=0;k<3;k++)part(.04,.15,.03,-.15+k*.15,1.38,.19,dark)}
 if(i===7){head.visible=false;part(.26,.09,.25,0,1.63,0,pale);part(.58,.08,.34,0,.8,0,dark);body.position.y=.18}
 if(i===8){part(.13,.23,.05,0,1.85,.23,dark);part(.05,.05,.05,0,1.86,.27,glow);part(.45,.12,.41,0,2.13,0,dark);part(.32,.39,.10,.41,.94,.14,mat(0x807053))}
 const tag=label(names[i],512);tag.position.y=2.9;tag.scale.set(3,.47,1);g.add(tag);
 g.position.set(slot.x,slot.y,slot.z);g.rotation.y=slot.x>0?-Math.PI/2:Math.PI/2;
 scene.add(g);return{g,body,baseY:body.position.y,slot,name:names[i],tag,questions,index:0,done:false,discovered:false,seed:i*1.7};
}
`);
replace("let best=2.7;for(const n of npcs)","let best=2.7;for(const n of npcs)");
replace("'Tekan E · Bicara dengan '","'Tekan E · Selidiki '");
replace("if(e.code==='KeyE'&&locked()&&nearby&&!active)openQuiz(nearby)","if(e.code==='KeyF'&&locked()&&!active)toggleFlash();if(e.code==='KeyE'&&locked()&&nearby&&!active)openQuiz(nearby)");
replace("won=false;vy=0;grounded=true;yaw=pitch=0;", "won=false;vy=0;grounded=true;yaw=pitch=0;flashOn=true;$('flashButton').textContent='F · Senter ON';");
replace("['hud','mapBox','bottom']","['hud','mapBox','bottom','missionTag']");
replace('function openQuiz(n){active=n;','function openQuiz(n){n.discovered=true;active=n;');
replace("if(document.hidden&&locked())document.exitPointerLock()", "if(document.hidden){if(ambienceGain&&audio)ambienceGain.gain.setTargetAtTime(0,audio.currentTime,.1);if(locked())document.exitPointerLock()}");
replace("clearKeys();cancelPress();if(locked())document.exitPointerLock()", "clearKeys();cancelPress();if(ambienceGain&&audio)ambienceGain.gain.setTargetAtTime(0,audio.currentTime,.1);if(locked())document.exitPointerLock()");
replace("' selesai. NPC telah pergi. Lanjutkan pencarian!'","' selesai. Anomali menghilang. Lanjutkan penyelidikan.'");
section('function minimap(){','function setup(){',`
function minimap(){
 const g=$('map').getContext('2d'),sx=x=>163+x*5.8,sz=z=>120+z*5.8;
 g.fillStyle='#0b171a';g.fillRect(0,0,326,240);
 const rect=(x,z,w,d,c)=>{g.fillStyle=c;g.fillRect(sx(x),sz(z),w*5.8,d*5.8)};
 rect(-24,-15,48,10,'#48605a');rect(-24,-5,12,20,'#48605a');rect(12,-5,12,20,'#48605a');rect(-24,-5,8,20,'#2b3b3a');rect(16,-5,8,20,'#2b3b3a');rect(-9,-13,18,4,'#7c8060');
 g.strokeStyle='#718074';for(const side of [-1,1])for(let r=0;r<=3;r++){const z=-5+r*20/3;g.beginPath();g.moveTo(sx(side*16),sz(z));g.lineTo(sx(side*24),sz(z));g.stroke()}
 g.font='bold 12px monospace';g.textAlign='center';g.fillStyle='#d0d9b0';g.fillText('NAIK →',sx(0),sz(-10.3));
 for(const n of npcs)if(!n.done&&n.slot.floor===floor()&&(n.discovered||Math.hypot(n.slot.x-player.x,n.slot.z-player.z)<8)){g.fillStyle='#d3947d';g.beginPath();g.arc(sx(n.slot.x),sz(n.slot.z),4.8,0,7);g.fill()}
 g.save();g.translate(Math.max(8,Math.min(318,sx(player.x))),Math.max(8,Math.min(232,sz(player.z))));g.rotate(-yaw);g.beginPath();g.moveTo(0,-9);g.lineTo(-6,6);g.lineTo(0,3);g.lineTo(6,6);g.closePath();g.fillStyle='#b3d8a2';g.fill();g.restore();
}
function toggleFlash(){flashOn=!flashOn;$('flashButton').textContent='F · Senter '+(flashOn?'ON':'OFF')}
$('flashButton').onclick=toggleFlash;
function buildAtmosphere(){
 flashlight=new THREE.SpotLight(0xe3edce,2.8,30,Math.PI/5.5,.55,1.25);
 flashTarget=new THREE.Object3D();camera.add(flashlight,flashTarget);flashlight.position.set(.20,-.15,-.05);flashTarget.position.set(0,-.02,-10);flashlight.target=flashTarget;
 flashlight.castShadow=true;flashlight.shadow.mapSize.set(1024,1024);flashlight.shadow.camera.near=.1;flashlight.shadow.camera.far=32;flashlight.shadow.bias=-.0007;
 scene.add(camera);
 for(let f=0;f<4;f++){
  const light=new THREE.PointLight(f%2?0x8cbdab:0xc6b392,.65,29,1.4);light.position.set(0,f*FH+3.7,-6.3);scene.add(light);corridorLights.push(light);
  const tubeMat=mat(0x7c9688,{emissive:0x739b8d,emissiveIntensity:.65});
  box(3,.08,.35,0,f*FH+4.08,-6.5,tubeMat);
  for(const x of [-14,14])for(const z of [-1,8])box(.25,.07,1.7,x,f*FH+4.04,z,tubeMat);
 }
 for(const slot of slots){
  const fixture=mat(0x85998a,{emissive:0x588277,emissiveIntensity:.35});
  box(2,.07,.22,slot.x,slot.y+4.05,slot.z,fixture);
  // Gribouillage sur le tableau, toujours sans texture externe.
  const mark=label('NE PAS OUBLIER',512,'#19342e');mark.position.set(slot.x>0?23.6:-23.6,slot.y+2.1,slot.z);mark.scale.set(2.4,.38,1);scene.add(mark);
 }
 const geometry=new THREE.BufferGeometry(),positions=new Float32Array(700*3);
 for(let i=0;i<700;i++){positions[i*3]=(Math.random()-.5)*48;positions[i*3+1]=Math.random()*17.8;positions[i*3+2]=(Math.random()-.5)*30}
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 dust=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xb8cbb8,size:.035,transparent:true,opacity:.24,depthWrite:false}));scene.add(dust);
}
function mood(now){
 const live=started&&!won&&!document.hidden&&(locked()||active),t=elapsed;
 if(flashlight)flashlight.intensity=started&&!won&&flashOn?2.8:0;
 // Oscillation lente, sans stroboscope rapide.
 corridorLights.forEach((l,i)=>{l.intensity=.48+.18*Math.sin(t*.8+i*2.1);if(Math.sin(t*.31+i*1.8)>.97)l.intensity*=.35});
 let nearestDistance=100;
 for(const n of npcs)if(!n.done){
  const distance=Math.hypot(n.slot.x-player.x,n.slot.z-player.z);
  if(n.slot.floor===floor())nearestDistance=Math.min(nearestDistance,distance);
  n.body.position.y=n.baseY+Math.sin(t*1.1+n.seed)*.065;
  n.body.rotation.z=Math.sin(t*.47+n.seed)*.025;
  n.tag.position.y=2.9+Math.sin(t*.9+n.seed)*.04;
  // L'anomalie reste dans sa classe, mais tourne lentement vers le joueur.
  if(distance<7)n.g.rotation.y=Math.atan2(player.x-n.slot.x,player.z-n.slot.z);
 }
 nearSignal=Math.max(0,1-nearestDistance/10);
 if(ambienceGain&&audio)ambienceGain.gain.setTargetAtTime(live?.32+nearSignal*.2:0,audio.currentTime,.25);
 if(dust){dust.position.y=Math.sin(now*.00009)*.06;dust.material.opacity=.19+nearSignal*.06}
 $('missionTag').textContent='ARSIP 09 / '+(won?'DOSSIER CLOS':nearSignal>.4?'SIGNAL PROCHE · PRÉSENCE DÉTECTÉE':'SEKOLAH ANOMALI · '+finished+'/9 SELESAI');
}
`);
section('function setup(){','function animate(now){',`
function setup(){
 renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(innerWidth,innerHeight);renderer.outputEncoding=THREE.sRGBEncoding;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();scene.background=new THREE.Color(0x070e16);scene.fog=new THREE.FogExp2(0x101e23,.027);
 camera=new THREE.PerspectiveCamera(73,innerWidth/innerHeight,.07,150);camera.rotation.order='YXZ';
 scene.add(new THREE.HemisphereLight(0x839fa9,0x29352e,.48));
 const moon=new THREE.DirectionalLight(0x8faec5,.32);moon.position.set(-25,40,10);scene.add(moon);
 tileTex=texture('tile');wallMat=mat(0xabb4a2,{map:texture('wall')});woodMat=mat(0x8b8676,{map:texture('wood')});metalMat=mat(0x455b59);glassMat=mat(0x638c96,{transparent:true,opacity:.28,depthWrite:false,roughness:.6});stairMat=mat(0x92917a);
 school();buildAtmosphere();scene.updateMatrixWorld(true);ready=true;$('status').textContent='Senter siap. Masuk dan temukan sembilan anomali.';requestAnimationFrame(animate);
}
`);
replace("' · Ikuti jalur biru untuk tangga selanjutnya.'","' · Ikuti penunjuk fosfor menuju tangga selanjutnya.'");
replace('renderer.render(scene,camera)}','mood(now);renderer.render(scene,camera)}');
// Seluruh teks yang tampil menggunakan bahasa Indonesia.
s=s.replaceAll('NE PAS OUBLIER','JANGAN LUPA').replaceAll('DOSSIER CLOS','ARSIP DITUTUP').replaceAll('SIGNAL PROCHE · PRÉSENCE DÉTECTÉE','SINYAL DEKAT · KEHADIRAN TERDETEKSI');
s=s.replaceAll('Taches, griffures et fissures procédurales, sans image externe.','Noda dan retakan prosedural tanpa gambar eksternal.').replaceAll('Gribouillage sur le tableau, toujours sans texture externe.','Pesan misterius di papan kelas.').replaceAll('Oscillation lente, sans stroboscope rapide.','Perubahan cahaya perlahan.').replaceAll("L'anomalie reste dans sa classe, mais tourne lentement vers le joueur.",'Anomali tetap di kelasnya dan menoleh ke pemain yang mendekat.');
fs.writeFileSync('outputs/sekolah-anomali-3d.html',s);
console.log('Created sekolah-anomali-3d.html ('+Buffer.byteLength(s)+' bytes)');

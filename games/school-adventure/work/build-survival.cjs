const fs=require('fs');
let s=fs.readFileSync('outputs/sekolah-anomali-3d.html','utf8');
function replace(a,b){if(!s.includes(a))throw Error('Missing text: '+a.slice(0,100));s=s.replace(a,b)}
function section(a,b,text){const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<0)throw Error('Missing section '+a);s=s.slice(0,start)+text+'\n'+s.slice(end)}
replace('<title>Sekolah Anomali — Sembilan Penghuni</title>','<title>Sekolah Anomali — The Hallway Watcher</title>');
replace('</style>',`
#safePanel{position:fixed;left:18px;bottom:82px;z-index:5;pointer-events:none;background:#131c20ee;border:1px solid #c6987455;border-radius:7px;padding:11px 15px;max-width:320px;box-shadow:0 8px 30px #0004}
#safePanel strong{display:block;font-size:12px;letter-spacing:.09em;color:#e2bd92}#safePanel span{display:block;font-size:11px;line-height:1.6;color:#b5c3b9;margin-top:3px}
#safePanel.safe{border-color:#8ac19c88;background:#12251fee}#safePanel.safe strong{color:#a5ddaf}
#threatVignette{position:fixed;inset:0;z-index:2;pointer-events:none;box-shadow:inset 0 0 100px #b4573d;opacity:0;transition:opacity .3s}
#fail{z-index:45}.failIcon{font-size:48px;color:#d5a18e;margin-bottom:12px}.objectives{padding:13px 16px;border:1px solid #a9bd8a44;border-radius:10px;color:#c4d1be;line-height:1.8;font-size:13px;background:#a3b98709}
#itemSummary{font-size:12px;color:#b5c6ad;line-height:1.7}#hud{max-width:calc(100% - 235px)}#hud .stat{font-size:12px}#bottom{bottom:16px}#missionTag{bottom:65px}
@media(max-width:650px){#safePanel{left:10px;bottom:92px;padding:8px 10px;max-width:220px}#safePanel strong{font-size:10px}#safePanel span{font-size:10px}#hud{max-width:calc(100% - 150px)}#hud .stat{font-size:9px;padding:7px}#prompt{bottom:170px;font-size:12px;max-width:94%}}
</style>`);
replace('<canvas id="world"></canvas>','<canvas id="world"></canvas><div id="threatVignette"></div><div id="safePanel" class="hidden"><strong id="safeTitle">KORIDOR · WASPADA</strong><span id="safeText">Masuk kelas untuk berlindung.</span></div>');
replace('<div class="stat">Anomali dituntaskan <b id="npcHUD">0/9</b></div>','<div class="stat">Anomali dituntaskan <b id="npcHUD">0/9</b></div><div class="stat">Item ditemukan <b id="itemHUD">0/5</b></div>');
replace('Arsip 09 · Sekolah setelah tengah malam','SURVIVAL EDITION · THE HALLWAY WATCHER');
replace('<h1 id="title">Sekolah Anomali</h1>','<h1 id="title">Sekolah Anomali<br><span style="font-size:.43em;letter-spacing:.04em;color:#c89d7e">THE HALLWAY WATCHER</span></h1>');
replace('Bel terakhir sudah lama berhenti. Namun sembilan penghuni masih menunggu di kelas yang berbeda. Temukan setiap anomali, ajak berbicara, dan selesaikan tujuh pertanyaannya agar mereka dapat pergi.','Selesaikan tujuh pertanyaan dari masing-masing sembilan anomali dan cari lima benda tersembunyi. Penjaga Koridor berpatroli melewati tangga dari lantai 1 sampai 4. Berlindunglah sepenuhnya di dalam kelas saat ia mendekat.');
replace('<span class="badge">Senter &amp; detektor</span>','<span class="badge">5 item acak</span><span class="badge">1 penjaga berpatroli</span>');
replace('Tangga berada di koridor belakang. Ikuti papan NAIK dan jalur penunjuk. Sinyal anomali hanya muncul di peta saat kamu mendekat.','Tangga berada di koridor belakang. Ikuti papan NAIK.<br><b>Kelas = zona aman.</b> Tunggu penjaga lewat sebelum keluar. Kuis dapat dikerjakan di kelas sambil penjaga tetap berpatroli.<br><b>Tertangkap = gagal dan seluruh progres dimulai dari nol.</b> Item dan lokasi anomali diacak ulang pada percobaan baru.');
replace('<p>Sembilan anomali telah pergi. Seluruh 63 pertanyaan selesai dijawab. Untuk malam ini, pintu sekolah terbuka kembali.</p>','<p>Sembilan anomali telah pergi, seluruh 63 pertanyaan selesai dijawab, dan kelima benda berhasil dikumpulkan. Kamu selamat dari Penjaga Koridor.</p><div class="objectives">✓ 9 / 9 anomali dituntaskan<br>✓ 5 / 5 item ditemukan</div>');
replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"',`<div id="fail" class="overlay hidden"><div class="card"><div class="eyebrow">MISI GAGAL · TERTANGKAP</div><div class="failIcon">◉</div><h1>Penjaga menemukanmu.</h1><p id="failReason"></p><div class="objectives">Seluruh progres telah direset: anomali 0/9, item 0/5, jawaban 0/63. Soal kustom pengajar tetap tersimpan.</div><p class="small">Pada percobaan berikutnya, dengarkan langkah berat. Masuk sepenuhnya ke ruang kelas dan tunggu sampai penjaga melewati pintu sebelum kembali ke koridor.</p><button id="retry" class="primary">Ulang dari awal</button></div></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"`);
replace('const corridorLights=[];',`const corridorLights=[];
${fs.readFileSync('work/survival-globals.js','utf8')}`);
// Room safety has explicit geometry, independent of NPC placement.
replace('slots.push({x,y,z:zc,floor:f,room:num});','slots.push({x,y,z:zc,floor:f,room:num});\n    safeRooms.push({floor:f,room:num,y,minX:side<0?-23.65:16.43,maxX:side<0?-16.43:23.65,minZ:z1+.32,maxZ:z2-.32});\n    box(.75,.015,1.65,doorX+side*.63,y+.015,zc,mat(0x6b9e7b,{emissive:0x294c33,emissiveIntensity:.35}));');
replace('function pause(message=', 'function pause(message=');
replace("{if(active||won)return;$('start')", "{if(active||won||failed)return;$('start')");
replace('if(!locked()||active||won)return;', 'if(!locked()||active||won||failed)return;');
replace("if(e.code==='KeyE'&&locked()&&nearby&&!active)openQuiz(nearby)","if(e.code==='KeyE'&&locked()&&!active&&!failed){if(nearItem)collectItem(nearItem);else if(nearby)openQuiz(nearby)}");
replace('function reset(){clearTimeout(answerTimer);','function reset(){attemptToken++;clearTimeout(answerTimer);');
replace("populate();scene.updateMatrixWorld(true);['quiz','win','prompt','toast']", "populate();resetSurvival();scene.updateMatrixWorld(true);['quiz','win','prompt','toast','fail']");
replace("['hud','mapBox','bottom','missionTag']", "['hud','mapBox','bottom','missionTag','safePanel']");
replace('function openQuiz(n){n.discovered=true;',"function openQuiz(n){if(failed||won||!safeRoom()){showToast('Masuk lebih jauh ke dalam kelas untuk berbicara dengan aman.');return}n.discovered=true;");
replace('function answer(i){if(!active||busy)return;busy=true;','function answer(i){if(!active||busy||failed||won)return;const epoch=attemptToken;busy=true;');
replace('answerTimer=setTimeout(()=>{busy=false;', 'answerTimer=setTimeout(()=>{if(epoch!==attemptToken||failed)return;busy=false;');
replace("if(finished===9)victory();else pause('Kuis '+n.name+' selesai. Anomali menghilang. Lanjutkan penyelidikan.')", "if(!checkVictory())pause('Kuis '+n.name+' selesai. Anomali menghilang. Periksa koridor sebelum keluar kelas.')");
replace('function victory(){won=true;', 'function victory(){if(failed||won||finished!==9||foundItems!==5)return;won=true;');
replace("$('npcHUD').textContent=finished+'/9';", "$('npcHUD').textContent=finished+'/9';$('itemHUD').textContent=foundItems+'/5';");
replace("if(nearby)$('prompt').textContent='Tekan E · Selidiki '+nearby.name}","if(nearby)$('prompt').textContent='Tekan E · Selidiki '+nearby.name;updateItemFocus()}");
replace('function toggleFlash(){',fs.readFileSync('work/survival-mechanics.js','utf8')+'\nfunction toggleFlash(){');
replace("const live=started&&!won&&!document.hidden&&(locked()||active)","const live=started&&!won&&!failed&&!document.hidden&&(locked()||active)");
replace('if(flashlight)flashlight.intensity=started&&!won&&flashOn?2.8:0;', 'if(flashlight)flashlight.intensity=started&&!won&&!failed&&flashOn?2.8:0;');
replace("$('missionTag').textContent='ARSIP 09 / '+(won?'ARSIP DITUTUP':nearSignal>.4?'SINYAL DEKAT · KEHADIRAN TERDETEKSI':'SEKOLAH ANOMALI · '+finished+'/9 SELESAI');", "$('missionTag').textContent='ARSIP 09 / '+(won?'SEMUA TUJUAN TUNTAS':failed?'PERCOBAAN BERAKHIR':'ANOMALI '+finished+'/9 · ITEM '+foundItems+'/5');");
replace('school();buildAtmosphere();scene.updateMatrixWorld(true);','school();buildAtmosphere();buildSurvival();scene.updateMatrixWorld(true);');
section('function animate(now){',"window.addEventListener('resize'",`
function animate(now){
 requestAnimationFrame(animate);const real=Math.max(0,(now-previous)/1000),dt=Math.min(real,.05);previous=now;
 const playing=started&&!won&&!failed&&!document.hidden&&(locked()||active);
 if(playing){elapsed+=Math.min(real,.25);if(locked()&&!active){const old=floor();physics(dt);if(floor()!==old)showToast('Lantai '+(floor()+1)+' · Periksa koridor. Kelas adalah zona aman.')}updatePatrol(dt);if(!failed&&!active&&locked())nearest()}
 if(started){camera.position.set(player.x,player.y+EYE,player.z);camera.rotation.set(pitch,yaw,0,'YXZ');hud();minimap();updateSurvivalHUD();animateItems()}
 else{camera.position.set(35,25,40);camera.lookAt(0,7,-1)}
 mood(now);renderer.render(scene,camera);
}
`);
// Add a local radar indicator for the patrol, without revealing hidden items.
replace("g.save();g.translate(Math.max(8,Math.min(318,sx(player.x)))", "if(hunter&&Math.abs(hunter.g.position.y-player.y)<2.2&&Math.hypot(hunter.g.position.x-player.x,hunter.g.position.z-player.z)<19){g.fillStyle='#e29279';g.beginPath();g.arc(sx(hunter.g.position.x),sz(hunter.g.position.z),6,0,7);g.fill()}\n+ g.save();g.translate(Math.max(8,Math.min(318,sx(player.x)))".replace('\n+ ','\n '));
fs.writeFileSync('outputs/sekolah-anomali-survival.html',s);
console.log('Built sekolah-anomali-survival.html ('+Buffer.byteLength(s)+' bytes)');

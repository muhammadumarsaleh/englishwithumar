// SURVIVAL_START
function safeRoom(pos=player){
 return safeRooms.find(r=>pos.x>=r.minX&&pos.x<=r.maxX&&pos.z>=r.minZ&&pos.z<=r.maxZ&&pos.y>=r.y-.12&&pos.y<=r.y+FH-1.15)||null;
}
function buildPatrolRoute(){
 const forward=[];
 const point=(x,y,z)=>{const last=forward[forward.length-1];if(!last||Math.hypot(last.x-x,last.y-y,last.z-z)>.001)forward.push({x,y,z})};
 for(let f=0;f<4;f++){
  const y=f*FH;
  point(-14,y,-6.6);point(-14,y,13.3);point(-14,y,-6.6);
  point(14,y,-6.6);point(14,y,13.3);point(14,y,-6.6);
  if(f<3){
   point(-10.2,y,-6.6);point(-10.2,y,-11);point(-9.4,y,-11);
   for(let step=0;step<30;step++)point(-9+(step+.5)*.6,y+(step+1)*.15,-11);
   point(10.2,y+FH,-11);point(10.2,y+FH,-6.6);
  }
 }
 // Pulang melalui jalan yang sama, termasuk tangga fisik, tanpa teleport.
 return forward.concat(forward.slice(1,-1).reverse());
}
function buildItemCandidates(){
 const candidates=[];
 for(const slot of slots){const z1=slot.z-10/3,z2=slot.z+10/3;
  for(const x of [Math.sign(slot.x)*23.38,Math.sign(slot.x)*16.66])for(const z of [z1+.53,z2-.53])candidates.push({id:'room-'+slot.room+'-'+x+'-'+z,x,y:slot.y,z,floor:slot.floor,kind:'room',room:slot.room});
 }
 for(let f=0;f<4;f++)for(const side of [-1,1]){
  for(const z of [-14.05,-5.75])candidates.push({id:'hall-back-'+f+'-'+side+'-'+z,x:side*22.8,y:f*FH,z,floor:f,kind:'hall'});
  for(const x of [side*12.7,side*15.2])candidates.push({id:'hall-wing-'+f+'-'+x,x,y:f*FH,z:14.05,floor:f,kind:'hall'});
 }
 return candidates;
}
function chooseItemLocations(){
 const floors=shuffle([0,1,2,3]),chosen=[],used=new Set(),startKind=Math.random()<.5?'room':'hall';
 for(let i=0;i<4;i++){const kind=i%2===0?startKind:(startKind==='room'?'hall':'room');const options=itemCandidates.filter(p=>p.floor===floors[i]&&p.kind===kind);const pick=shuffle(options)[0];chosen.push(pick);used.add(pick.id)}
 chosen.push(shuffle(itemCandidates.filter(p=>!used.has(p.id)))[0]);return shuffle(chosen);
}
function disposeGroup(group){
 scene.remove(group);const geometries=new Set(),materials=new Set(),textures=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){materials.add(o.material);if(o.material.map)textures.add(o.material.map)}});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());
}
function makePickup(type,location,index){
 const g=new THREE.Group(),body=new THREE.Group();g.add(body);const material=mat(type.color,{emissive:type.color,emissiveIntensity:.15}),dark=mat(0x35413e),paper=mat(0xc9c9ad);
 function part(w,h,d,x,y,z,m=material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);body.add(mesh);return mesh}
 if(type.kind==='key'){const ring=new THREE.Mesh(new THREE.TorusGeometry(.15,.045,8,20),material);ring.position.y=.18;body.add(ring);part(.075,.35,.07,0,-.07,0);part(.16,.06,.07,.06,-.18,0);part(.14,.06,.07,.05,-.08,0)}
 if(type.kind==='book'){part(.43,.07,.32,0,0,0,paper);part(.47,.025,.35,0,.055,0);part(.47,.025,.35,0,-.055,0);part(.035,.13,.35,-.23,0,0)}
 if(type.kind==='watch'){const disk=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.065,24),material);disk.rotation.x=Math.PI/2;body.add(disk);part(.025,.17,.02,0,.045,.05,dark);part(.12,.025,.02,.04,-.015,.05,dark);part(.08,.10,.07,0,.23,0)}
 if(type.kind==='candle'){const wax=new THREE.Mesh(new THREE.CylinderGeometry(.11,.12,.43,16),material);body.add(wax);part(.022,.08,.022,0,.25,0,dark);const flame=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),mat(0xffd18c,{emissive:0xe09f54,emissiveIntensity:.8}));flame.position.y=.32;flame.scale.y=1.5;body.add(flame)}
 if(type.kind==='box'){part(.38,.27,.30,0,0,0);part(.43,.045,.34,0,.16,0);part(.10,.07,.04,0,.015,.17,paper);part(.18,.035,.035,.25,0,0);part(.035,.10,.035,.32,.035,0)}
 const tag=label(type.name,384);tag.scale.set(1.65,.34,1);tag.position.y=.65;tag.visible=false;g.add(tag);
 g.position.set(location.x,location.y+.37,location.z);g.rotation.y=Math.random()*Math.PI*2;scene.add(g);return{g,body,tag,type,location,index,done:false};
}
function makeHunter(){
 const g=new THREE.Group(),body=new THREE.Group();g.add(body);
 const pale=mat(0xa5b1a8),dress=mat(0x414449),hair=mat(0x192126),dark=mat(0x253138),eye=mat(0xe9ad8a,{emissive:0xcd6d49,emissiveIntensity:1.6});
 function part(w,h,d,x,y,z,m){const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);a.castShadow=true;body.add(a);return a}
 part(1.05,1.1,.57,0,2.12,0,dress);
 const skirt=new THREE.Mesh(new THREE.CylinderGeometry(.47,.82,1.62,8),dress);skirt.position.set(0,1.1,0);skirt.castShadow=true;body.add(skirt);
 part(.69,.75,.61,0,3.14,0,pale);part(.79,.23,.70,0,3.58,-.04,hair);part(.77,1.22,.28,0,2.98,-.30,hair);
 const arms=[];for(const side of [-1,1]){const arm=part(.23,1.6,.27,side*.71,1.88,0,dress);arm.rotation.z=side*.09;arms.push(arm);part(.21,.38,.23,side*.79,.96,0,pale);part(.28,.20,.5,side*.29,.13,.08,dark);part(.10,.07,.03,side*.17,3.21,.315,eye)}
 part(.21,.035,.025,0,2.99,.322,dark);
 scene.add(g);return{g,body,arms,pathPosition:new THREE.Vector3(),index:0,footDistance:0,moved:0,state:'PATROL'};
}
function buildSurvival(){patrolRoute=buildPatrolRoute();itemCandidates=buildItemCandidates();hunter=makeHunter()}
function resetSurvival(){
 failed=false;foundItems=0;nearItem=null;hunterThreat=0;
 for(const p of pickups)if(!p.done)disposeGroup(p.g);
 const locations=chooseItemLocations();pickups=itemTypes.map((type,i)=>makePickup(type,locations[i],i));
 const start=patrolRoute.findIndex(p=>p.x===14&&p.y===0&&p.z===13.3);
 hunter.index=(start+1)%patrolRoute.length;hunter.g.position.set(patrolRoute[start].x,patrolRoute[start].y,patrolRoute[start].z);hunter.pathPosition.set(patrolRoute[start].x,patrolRoute[start].y,patrolRoute[start].z);hunter.g.visible=true;hunter.footDistance=0;hunter.moved=0;hunter.state='PATROL';
 $('threatVignette').style.opacity='0';
}
function updateItemFocus(){
 nearItem=null;let best=nearby?Math.hypot(player.x-nearby.slot.x,player.z-nearby.slot.z):1.85;
 for(const item of pickups){if(item.done||Math.abs(player.y-item.location.y)>.65)continue;const distance=Math.hypot(player.x-item.location.x,player.z-item.location.z);if(distance<best&&!lineBlocked({x:player.x,y:player.y+1.2,z:player.z},{x:item.g.position.x,y:item.g.position.y+.14,z:item.g.position.z})){best=distance;nearItem=item}}
 if(nearItem){$('prompt').classList.remove('hidden');$('prompt').textContent='Tekan E · Ambil '+nearItem.type.name}
}
function collectItem(item){
 if(!started||won||failed||item.done||active)return;
 if(Math.abs(player.y-item.location.y)>.65||Math.hypot(player.x-item.location.x,player.z-item.location.z)>1.85)return;
 if(lineBlocked({x:player.x,y:player.y+1.2,z:player.z},{x:item.g.position.x,y:item.g.position.y+.14,z:item.g.position.z}))return;
 item.done=true;disposeGroup(item.g);foundItems++;nearItem=null;bling();hud();showToast('✓ '+item.type.name+' — '+item.type.meaning+' ('+foundItems+'/5)');checkVictory();
}
function checkVictory(){if(!failed&&!won&&finished===9&&foundItems===5){victory();return true}return false}
function animateItems(){for(const item of pickups)if(!item.done){const d=Math.hypot(player.x-item.location.x,player.z-item.location.z);item.body.position.y=Math.sin(elapsed*1.7+item.index)*.018;item.tag.visible=!failed&&!won&&Math.abs(player.y-item.location.y)<.8&&d<3.5&&!lineBlocked({x:player.x,y:player.y+1.2,z:player.z},{x:item.g.position.x,y:item.g.position.y+.14,z:item.g.position.z})}}
function monsterDistance(){if(!hunter)return Infinity;return Math.hypot(hunter.g.position.x-player.x,hunter.g.position.z-player.z)}
function hunterSeesPlayer(){
 if(!hunter||safeRoom()||Math.abs(hunter.g.position.y-player.y)>1.6||monsterDistance()>10.5)return false;
 return!lineBlocked({x:hunter.g.position.x,y:hunter.g.position.y+1.6,z:hunter.g.position.z},{x:player.x,y:player.y+1.3,z:player.z});
}
function heavyStep(){
 if(!audio||muted||Math.abs(hunter.g.position.y-player.y)>5)return;
 const proximity=Math.max(0,1-monsterDistance()/23);if(proximity<=0)return;
 tone(49,audio.currentTime,.28,'triangle',.30*proximity);tone(73,audio.currentTime+.055,.19,'sine',.15*proximity);
}
function canCapture(){
 if(!hunter||safeRoom()||failed||won||active)return false;
 const m=hunter.g.position;if(monsterDistance()>1.38||player.y>=m.y+3.5||player.y+HEIGHT<=m.y+.12)return false;
 return!lineBlocked({x:m.x,y:m.y+1.4,z:m.z},{x:player.x,y:player.y+1.3,z:player.z});
}
function updatePatrol(dt){
 if(!hunter||failed||won||!started||document.hidden||(!locked()&&!active))return;
 hunter.state=hunterSeesPlayer()?'ALERT':'PATROL';
 let travel=(hunter.state==='ALERT'?3.8:2.6)*dt;
 while(travel>1e-7){const target=patrolRoute[hunter.index],pos=hunter.pathPosition,dx=target.x-pos.x,dy=target.y-pos.y,dz=target.z-pos.z,d=Math.hypot(dx,dy,dz);if(d<.025){pos.set(target.x,target.y,target.z);hunter.index=(hunter.index+1)%patrolRoute.length;continue}
  const step=Math.min(travel,d,.15);const x=pos.x+dx/d*step,z=pos.z+dz/d*step,y=pos.y+dy/d*step;
  // Rute menaiki tangga nyata; ray lantai merapatkan kaki ke injakan.
  // Posisi vertikal rute disimpan terpisah agar snapping tidak menahan rute.
  pos.set(x,y,z);const floorY=supportAt(x,z,y+.25,y-.35);hunter.g.position.set(x,Number.isFinite(floorY)?floorY:y,z);if(Math.hypot(dx,dz)>.001)hunter.g.rotation.y=Math.atan2(dx,dz);
  travel-=step;hunter.footDistance+=step;hunter.moved+=step;
  if(canCapture()){failMission();return}
 }
 hunter.body.position.y=Math.sin(hunter.moved*3.5)*.035;hunter.body.rotation.z=Math.sin(hunter.moved*1.8)*.022;
 hunter.arms.forEach((a,i)=>a.rotation.x=Math.sin(hunter.moved*3.5+i*Math.PI)*.12);
 if(hunter.footDistance>.95){hunter.footDistance%=.95;heavyStep()}
 if(canCapture())failMission();
}
function updateSurvivalHUD(){
 const room=safeRoom(),sameHeight=hunter&&Math.abs(hunter.g.position.y-player.y)<2.1,d=monsterDistance();
 hunterThreat=!failed&&!won&&sameHeight?Math.max(0,1-d/15):0;
 $('safePanel').classList.toggle('safe',!!room);$('safeTitle').textContent=failed?'PERCOBAAN BERAKHIR':won?'SEMUA TUJUAN TUNTAS':room?'ZONA AMAN · KELAS '+room.room:'KORIDOR · WASPADA';
 $('safeText').textContent=room?(sameHeight&&d<10?'Penjaga dekat. Tetap di kelas sampai ia lewat.':'Kelas melindungimu. Periksa koridor sebelum keluar.'):(sameHeight&&d<15?'Langkah berat mendekat. Masuk sepenuhnya ke ruang kelas!':'Cari 5 item di sudut kelas, koridor, dan tepi tembok.');
 $('threatVignette').style.opacity=String(room?hunterThreat*.12:hunterThreat*.42);
}
function failMission(){
 if(failed||won)return;const summary='Sebelum tertangkap: '+finished+'/9 anomali, '+foundItems+'/5 item, waktu '+time(elapsed)+'.';
 clearTimeout(answerTimer);reset();failed=true;active=nearby=null;nearItem=null;clearKeys();
 hideSurvivalPrompt();$('start').classList.add('hidden');$('failReason').textContent=summary;$('fail').classList.remove('hidden');
 if(ambienceGain&&audio)ambienceGain.gain.setTargetAtTime(0,audio.currentTime,.12);
 if(locked())document.exitPointerLock();hud();buzz();
}
function hideSurvivalPrompt(){$('cross').classList.add('hidden');$('prompt').classList.add('hidden')}
$('retry').onclick=()=>{audioStart();reset();started=true;$('start').classList.add('hidden');lock()};
// SURVIVAL_END

const fs=require('fs');
let base=fs.readFileSync('work/check-horror-runtime.cjs','utf8');
base=base.slice(0,base.indexOf('const q=context.qa;'));
base=base.replace('outputs/sekolah-anomali-3d.html','outputs/sekolah-anomali-survival.html');
base=base.replace('class Geometry{setAttribute()', 'class Geometry{constructor(...args){this.args=args}setAttribute()');
base=base.replace('CylinderGeometry:Geometry,','CylinderGeometry:Geometry,TorusGeometry:Geometry,SphereGeometry:Geometry,');
base=base.replace('Raycaster:class{}',`Raycaster:class{set(o){this.o={...o}}intersectObjects(items){return items.filter(m=>{const a=m.geometry.args,p=m.position;return this.o.x>=p.x-a[0]/2&&this.o.x<=p.x+a[0]/2&&this.o.z>=p.z-a[2]/2&&this.o.z<=p.z+a[2]/2&&p.y+a[1]/2<=this.o.y&&this.o.y-p.y-a[1]/2<=this.far}).map(m=>({face:{normal:{y:1}},point:{y:m.position.y+m.geometry.args[1]/2}})).sort((a,b)=>b.point.y-a.point.y)}}`);
base=base.replace('globalThis.qa={reset,openQuiz,answer,parseBulk,mood,toggleFlash,getState:()=>({ready,npcs,finished,correct,wrong,won,flashOn,flashlight,slots,customBank,active})}',`globalThis.qa={reset,openQuiz,answer,parseBulk,mood,toggleFlash,updatePatrol,collectItem,safeRoom,canCapture,failMission,checkVictory,animate,blocked,lineBlocked,updateSurvivalHUD,nearest,getState:()=>({ready,npcs,finished,correct,wrong,won,failed,foundItems,pickups,hunter,patrolRoute,itemCandidates,safeRooms,player,flashOn,flashlight,slots,customBank,active,elapsed,started}),start(){started=true;document.pointerLockElement=$('world')},setPlayer(x,y,z){player.set(x,y,z)},setHunter(x,y,z){hunter.g.position.set(x,y,z);hunter.pathPosition.set(x,y,z)}}`);
base+=`
const q=context.qa;assert(q.getState().ready,'Setup failed: '+elements.status.textContent);
q.reset();q.start();let st=q.getState();
assert.equal(st.npcs.length,9);assert.equal(new Set(st.npcs.map(n=>n.slot.room)).size,9);
assert.equal(new Set(st.npcs.flatMap(n=>n.questions.map(x=>x.q))).size,63);
assert.equal(st.safeRooms.length,24);assert.equal(st.pickups.length,5);
// Every candidate is reachable at player radius, away from furniture/walls.
for(const p of st.itemCandidates)assert(!q.blocked(p.x,p.z,p.y+.006),'Blocked item spot '+p.id);
for(let run=0;run<45;run++){
 q.reset();st=q.getState();assert.equal(new Set(st.pickups.map(p=>p.location.id)).size,5);
 assert.equal(new Set(st.pickups.map(p=>p.location.floor)).size,4);
 assert(st.pickups.filter(p=>p.location.kind==='room').length>=2);
 assert(st.pickups.filter(p=>p.location.kind==='hall').length>=2);
}
q.start();st=q.getState();
for(const r of st.safeRooms){q.setPlayer((r.minX+r.maxX)/2,r.y,(r.minZ+r.maxZ)/2);assert(q.safeRoom());q.setHunter(q.getState().player.x,r.y,q.getState().player.z);assert(!q.canCapture(),'Class is not safe')}
q.setPlayer(14,0,0);q.setHunter(14,0,.3);assert(q.canCapture(),'Hall contact not detected');
q.setPlayer(14,4.5,0);assert(!q.canCapture(),'Captured through upper floor');
q.setPlayer(14,1,0);assert(q.canCapture(),'Jumping incorrectly grants invulnerability');
// Patrol moves continuously through stairs to all four floors and back.
q.reset();q.start();st=q.getState();const room=st.safeRooms[0];q.setPlayer(-20,0,(room.minZ+room.maxZ)/2);
const seenFloors=new Set(),routeIndices=new Set();let previous={...st.hunter.g.position},previousIndex=st.hunter.index;
for(let i=0;i<18000;i++){
 q.updatePatrol(.05);st=q.getState();assert(!st.failed,'Monster entered classroom');
 const p=st.hunter.g.position;assert(Math.hypot(p.x-previous.x,p.z-previous.z)<.26,'Patrol teleported horizontally');assert(Math.abs(p.y-previous.y)<.31,'Patrol teleported vertically');
 seenFloors.add(Math.max(0,Math.min(3,Math.floor((p.y+.1)/4.5))));routeIndices.add(st.hunter.index);
 assert(Math.abs(p.x)<16,'Monster entered classroom x range');previous={...p};previousIndex=st.hunter.index;
 if(routeIndices.size===st.patrolRoute.length)break;
}
assert.equal(seenFloors.size,4);assert.equal(routeIndices.size,st.patrolRoute.length,'Patrol did not complete ascending/descending loop');
// Pause freezes patrol. Quizzes inside a class allow the patrol to continue.
const before={...st.hunter.g.position};document.pointerLockElement=null;q.updatePatrol(1);assert.equal(st.hunter.g.position.x,before.x);assert.equal(st.hunter.g.position.z,before.z);
const npc=st.npcs[0];q.setPlayer(npc.slot.x,npc.slot.y,npc.slot.z);q.openQuiz(npc);assert(q.getState().active);const beforeMove=st.hunter.moved;q.updatePatrol(.05);assert(st.hunter.moved>beforeMove);elements.leaveQuiz.onclick();q.start();
// Items cannot be collected at a distance or across floors/walls.
q.reset();q.start();st=q.getState();const first=st.pickups[0];q.setPlayer(0,0,-6.3);q.collectItem(first);assert.equal(q.getState().foundItems,0);
for(const item of st.pickups){q.setPlayer(item.location.x,item.location.y,item.location.z);q.collectItem(item);q.collectItem(item)}
assert.equal(q.getState().foundItems,5);assert(!q.getState().won,'Items alone incorrectly won game');
// Complete 9 x 7 quizzes, keeping all questions unique.
for(const n of q.getState().npcs){q.setPlayer(n.slot.x,n.slot.y,n.slot.z);q.openQuiz(n);assert(q.getState().active);for(let i=0;i<7;i++){q.answer(n.questions[i].right);const callback=timers.pop();assert(callback);callback()}}
st=q.getState();assert(st.won);assert.equal(st.correct,63);assert.equal(st.finished,9);assert.equal(st.foundItems,5);
// Reverse completion order also requires both objectives.
q.reset();q.start();for(const n of q.getState().npcs){q.setPlayer(n.slot.x,n.slot.y,n.slot.z);q.openQuiz(n);for(let i=0;i<7;i++){q.answer(n.questions[i].right);timers.pop()()}}
assert(!q.getState().won,'Quizzes alone incorrectly won game');
for(const p of q.getState().pickups){q.setPlayer(p.location.x,p.location.y,p.location.z);q.collectItem(p)}assert(q.getState().won);
// Failure clears all progress immediately. A stale quiz callback cannot restore it.
q.reset();q.start();st=q.getState();const n=st.npcs[0];q.setPlayer(n.slot.x,n.slot.y,n.slot.z);q.openQuiz(n);q.answer(n.questions[0].right);const stale=timers.pop();
q.failMission();st=q.getState();assert(st.failed);assert.equal(st.finished,0);assert.equal(st.foundItems,0);assert.equal(st.correct,0);assert.equal(st.wrong,0);assert.equal(st.elapsed,0);assert(st.npcs.every(n=>!n.done&&n.index===0));assert(st.pickups.every(p=>!p.done));stale();assert.equal(q.getState().correct,0);
elements.retry.onclick();assert(!q.getState().failed);assert.equal(q.getState().foundItems,0);
elements.custom.value=Array.from({length:63},(_,i)=>'English question '+i+' | Answer '+i+' | Wrong A '+i+' | Wrong B '+i+' | Wrong C '+i).join('\\n');elements.save.onclick();q.reset();assert.equal(q.getState().customBank.length,63);assert(q.getState().npcs.flatMap(n=>n.questions).every(q=>q.q.startsWith('English question')));
q.updateSurvivalHUD();q.mood(1000);q.animate(performance.now()+16);
console.log('PASS: mocked setup/frame, 63 unique questions, 24 safe rooms, all item candidates reachable, 45 randomized five-item distributions across four floors, full physical patrol loop, safe/capture/pause/quiz behavior, dual-goal victory in both orders, total failure reset, stale callbacks, retry, and bulk custom preservation.');
`;
fs.writeFileSync('work/check-survival.cjs',base);

const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(process.argv[2] || 'outputs/sekolah-kartun-3d.html','utf8');
const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const geometry=script.slice(script.indexOf('function school(){'),script.indexOf('const names='));
const physics=script.split('// PHYSICS_START')[1].split('// PHYSICS_END')[0];
const bank=script.slice(script.indexOf('function makeBank(){'),script.indexOf('let pressTimer;'));
const ctx={console,assert,Math,Number,Set,performance,localStorage:{getItem:()=>''},$:()=>({value:''})};
vm.createContext(ctx);
vm.runInContext(`
const FH=4.5,RADIUS=.29,HEIGHT=1.78,STEP=.23;
const colliders=[],walkables=[],slots=[],safeRooms=[],keys={};
const player={x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z})}};
let vy=0,grounded=true,yaw=0,footClock=0;
const colors=[1,2,3,4],wallMat={},woodMat={},metalMat={},glassMat={},stairMat={};
const mat=()=>({}),scene={add(){}},THREE={Mesh:class{constructor(){this.position={set(){}}}},IcosahedronGeometry:class{}};
function label(){return{position:{set(){}},scale:{set(){}}}}
function box(w,h,d,x,y,z,m,solid=false,walk=false){const c={minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,minZ:z-d/2,maxZ:z+d/2};if(solid)colliders.push(c);if(walk)walkables.push(c);return{rotation:{}}}
function wall(w,h,d,x,y,z,m){return box(w,h,d,x,y,z,m,true)}
function slab(x1,x2,z1,z2,y){box(x2-x1,.24,z2-z1,(x1+x2)/2,y-.12,(z1+z2)/2,{},true,true)}
const origin={x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z})}},down={};
const ray={set(o){this.o={...o}},intersectObjects(items){return items.filter(c=>this.o.x>=c.minX&&this.o.x<=c.maxX&&this.o.z>=c.minZ&&this.o.z<=c.maxZ&&c.maxY<=this.o.y&&this.o.y-c.maxY<=this.far).sort((a,b)=>b.maxY-a.maxY).map(c=>({face:{normal:{y:1}},point:{y:c.maxY}}))}};
function footstep(){}
${geometry}
${physics}
school();
assert.equal(slots.length,24);
function travel(x,z,y,speed=1,frames=1000){player.set(x,y,z);grounded=true;vy=0;keys.KeyD=true;keys.KeyW=false;keys.ShiftLeft=speed===2;for(let i=0;i<frames&&player.x<10.5;i++)physics(1/120);keys.KeyD=false;return{x:player.x,y:player.y}}
for(let floor=0;floor<3;floor++)for(let speed of [1,2]){
 const result=travel(-10.5,-11,floor*4.5,speed);
 assert(result.x>=10.5,'Ascent blocked: '+JSON.stringify({floor,speed,result}));
 assert(Math.abs(result.y-(floor+1)*4.5)<.01,'Wrong landing height');
}
// Return corridor at every landing must connect right and left entrances.
for(let f=1;f<4;f++){
 player.set(10.5,f*4.5,-11);grounded=true;vy=0;keys.KeyS=true;
 for(let i=0;i<145;i++)physics(1/120);keys.KeyS=false;
 assert(player.z> -7.2,'Exit path blocked');keys.KeyA=true;
 for(let i=0;i<690;i++)physics(1/120);keys.KeyA=false;
 assert(player.x< -10,'Return corridor blocked');
 assert(Math.abs(player.y-f*4.5)<.01,'Return corridor loses floor');
}
// Descent and exterior wall collision.
player.set(10.5,4.5,-11);grounded=true;vy=0;keys.KeyA=true;
for(let i=0;i<750;i++)physics(1/120);keys.KeyA=false;
assert(player.x< -10&&Math.abs(player.y)<.01,'Descent blocked');
player.set(-22,0,-11);grounded=true;keys.KeyA=true;
for(let i=0;i<300;i++)physics(1/120);keys.KeyA=false;
assert(player.x> -24,'Exterior wall crossed');
${bank}
assert.equal(bank.length,184);
assert.equal(new Set(bank.map(q=>q.q)).size,bank.length);
assert.equal(parseBulk('Q | A | B | C | D\\nQ2 | E | F | G | H').questions.length,2);
assert.equal(parseBulk('Q | A | A | C | D').errors.length,1);
assert.equal(parseBulk('Q | A | B').errors.length,1);
console.log('PASS: JavaScript syntax, 24 slots, six stair ascent cases, three return corridors, descent, wall collision, 184 unique questions, bulk parsing.');
`,ctx);

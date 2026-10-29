const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('outputs/sekolah-anomali-3d.html','utf8');
let source=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
source=source.replace(/\}\)\(\);\s*$/,`globalThis.qa={reset,openQuiz,answer,parseBulk,mood,toggleFlash,getState:()=>({ready,npcs,finished,correct,wrong,won,flashOn,flashlight,slots,customBank,active})};})();`);
class V{constructor(x=0,y=0,z=0){this.set(x,y,z)}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
class Object3D{constructor(){this.position=new V();this.rotation=new V();this.scale=new V(1,1,1);this.children=[];this.visible=true;this.shadow={mapSize:{set(){}},camera:{}}}add(...o){this.children.push(...o)}remove(o){this.children=this.children.filter(x=>x!==o)}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}updateMatrixWorld(){}lookAt(){}}
class Geometry{setAttribute(){return this}dispose(){}}
class Material{constructor(p={}){Object.assign(this,p)}dispose(){}}
class Mesh extends Object3D{constructor(g,m){super();this.geometry=g;this.material=m}}
class Texture{constructor(c){this.repeat={set(){}}}clone(){return new Texture()}dispose(){}}
class Light extends Object3D{constructor(c,intensity){super();this.intensity=intensity}}
class Renderer{constructor(){this.shadowMap={}}setPixelRatio(){}setSize(){}render(){}}
class Camera extends Object3D{updateProjectionMatrix(){}}
const THREE={Vector3:V,Object3D,Group:Object3D,Scene:Object3D,Mesh,Points:Mesh,Sprite:class extends Object3D{constructor(m){super();this.material=m}},MeshStandardMaterial:Material,SpriteMaterial:Material,PointsMaterial:Material,BoxGeometry:Geometry,CylinderGeometry:Geometry,IcosahedronGeometry:Geometry,BufferGeometry:Geometry,BufferAttribute:class{},CanvasTexture:Texture,Raycaster:class{},WebGLRenderer:Renderer,PerspectiveCamera:Camera,Color:class{},FogExp2:class{},HemisphereLight:Light,DirectionalLight:Light,PointLight:Light,SpotLight:Light};
const drawing=new Proxy({},{get:()=>()=>{}});
function element(){const classes=new Set();return{value:'',textContent:'',style:{},children:[],classList:{add(...a){a.forEach(x=>classes.add(x))},remove(...a){a.forEach(x=>classes.delete(x))},contains(c){return classes.has(c)},toggle(c,force){if(force===undefined)force=!classes.has(c);if(force)classes.add(c);else classes.delete(c);return force}},addEventListener(){},setPointerCapture(){},getContext:()=>drawing,append(...a){this.children.push(...a)},appendChild(a){this.children.push(a)},replaceChildren(){this.children=[]},matches(){return false}}}
const elements={};for(const m of html.matchAll(/id="([^"]+)"/g))elements[m[1]]=element();
const timers=[],storage={};let frame;
const document={getElementById:id=>elements[id],createElement:()=>element(),addEventListener(){},exitPointerLock(){this.pointerLockElement=null},pointerLockElement:null,hidden:false};
const context={THREE,document,console,performance,Math,Number,Set,Float32Array,devicePixelRatio:1,innerWidth:1280,innerHeight:720,requestAnimationFrame:f=>frame=f,setTimeout:f=>{timers.push(f);return timers.length},clearTimeout(){},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]}};
context.window=context;context.addEventListener=()=>{};
vm.createContext(context);vm.runInContext(source,context);
const q=context.qa;assert(q.getState().ready,'Setup failed: '+elements.status.textContent);
q.reset();let state=q.getState();
assert.equal(state.npcs.length,9);assert.equal(new Set(state.npcs.map(n=>n.slot.room)).size,9);
assert.equal(new Set(state.npcs.flatMap(n=>n.questions.map(q=>q.q))).size,63);
assert.equal(new Set(state.npcs.map(n=>n.name)).size,9);
for(const n of state.npcs){q.openQuiz(n);for(let i=0;i<7;i++){q.answer(n.questions[i].right);const f=timers.pop();assert(f);f()}}
state=q.getState();assert.equal(state.finished,9);assert.equal(state.correct,63);assert.equal(state.wrong,0);assert(state.won);
assert(state.npcs.every(n=>n.done));
q.mood(1000);q.toggleFlash();assert(!q.getState().flashOn);
elements.custom.value='Custom one | A | B | C | D\nCustom two | E | F | G | H';elements.save.onclick();assert.equal(q.getState().customBank.length,2);
q.reset();state=q.getState();assert.equal(state.finished,0);assert(state.flashOn);assert.equal(state.npcs.flatMap(n=>n.questions).filter(q=>q.q.startsWith('Custom')).length,2);
q.openQuiz(state.npcs[0]);q.answer((state.npcs[0].questions[0].right+1)%4);timers.pop()();assert.equal(q.getState().wrong,1);
console.log('PASS: mocked runtime setup, nine distinct anomalies/rooms, 63 unique questions, full victory, removal flags, restart, flashlight, teacher storage and priority, wrong-answer flow.');

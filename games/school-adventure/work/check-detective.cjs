const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('outputs/english-detective.html','utf8');
let source=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
new vm.Script(source);
source=source.replace(/\}\)\(\);\s*$/,`globalThis.qa={cases,startGame,interact,navigate,movement,choose,parse,animate,getState:()=>({ready,playing,caseIndex,step,current,collected,reviewQueue,correctFirst,totalFirst,totalReviewed,caseReview,plan,player,near,stationData,stationGroups})};})();`);
class V{constructor(x=0,y=0,z=0){this.set(x,y,z)}set(x,y,z){Object.assign(this,{x,y,z});return this}setScalar(s){return this.set(s,s,s)}lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this}}
class Object3D{constructor(){this.position=new V();this.rotation=new V();this.scale=new V(1,1,1);this.children=[];this.userData={};this.shadow={mapSize:{set(){}},camera:{}}}add(...a){a.forEach(o=>{this.children.push(o);o.parent=this})}lookAt(){}updateProjectionMatrix(){}}
class Geometry{}class Material{constructor(p){Object.assign(this,p)}}
class Mesh extends Object3D{constructor(g,m){super();this.geometry=g;this.material=m}}
class Texture{}class Renderer{constructor(){this.shadowMap={}}setPixelRatio(){}setSize(){}render(){}}
const THREE={Vector3:V,Vector2:V,Group:Object3D,Scene:Object3D,Mesh,Sprite:class extends Object3D{constructor(m){super();this.material=m}},MeshStandardMaterial:Material,SpriteMaterial:Material,BoxGeometry:Geometry,SphereGeometry:Geometry,ConeGeometry:Geometry,CylinderGeometry:Geometry,IcosahedronGeometry:Geometry,CanvasTexture:Texture,Raycaster:class{},WebGLRenderer:Renderer,PerspectiveCamera:Object3D,Color:class{},Fog:class{},HemisphereLight:Object3D,DirectionalLight:Object3D};
const drawing=new Proxy({},{get:()=>()=>{}});
function element(){const classes=new Set();return{value:'',textContent:'',style:{},children:[],classList:{add(...a){a.forEach(x=>classes.add(x))},remove(...a){a.forEach(x=>classes.delete(x))},contains(c){return classes.has(c)},toggle(c,force){if(force===undefined)force=!classes.has(c);if(force)classes.add(c);else classes.delete(c);return force}},addEventListener(){},getContext:()=>drawing,append(...a){this.children.push(...a)},appendChild(a){this.children.push(a)},replaceChildren(){this.children=[]},get lastChild(){return this.children.at(-1)},matches(){return false},click(){if(this.onclick)this.onclick()}}}
const elements={};for(const m of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)){const e=element(),cl=m[0].match(/class="([^"]+)"/);if(cl)e.classList.add(...cl[1].split(' '));elements[m[1]]=e}elements.level.value='junior';
const document={getElementById:id=>elements[id],createElement:()=>element(),addEventListener(){},querySelectorAll:()=>[],hidden:false};
const context={THREE,document,console,performance,Math,Number,Set,devicePixelRatio:1,innerWidth:1280,innerHeight:720,requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},localStorage:{getItem:()=>null,setItem(){},removeItem(){}}};context.window=context;context.addEventListener=()=>{};
vm.createContext(context);vm.runInContext(source,context);const q=context.qa;assert(q.getState().ready,elements.loadStatus.textContent);
for(const c of q.cases){for(const mode of ['junior','senior']){assert.equal(c[mode].length,5);for(const task of c[mode]){assert.equal(new Set([task.answer,...task.wrong]).size,4);assert(task.en&&task.meaning&&task.why&&task.topic)}}assert.equal(c.clues.length,5)}
function arrive(){const st=q.getState();const target=st.stationData[st.step<5?st.step:5];st.player.x=target.x;st.player.z=target.z;q.movement(0);q.interact()}
function choose(text){const button=elements.options.children.find(b=>b.lastChild.textContent===text);assert(button,'Missing answer button');q.choose(text,button)}
function correct(){choose(q.getState().current.answer);elements.next.onclick()}
for(const mode of ['junior','senior']){
 elements.level.value=mode;q.startGame();
 for(let c=0;c<4;c++){
  for(let i=0;i<5;i++){arrive();correct()}
  arrive();correct();assert(!elements.resultLayer.classList.contains('hidden'));
  if(c<3)elements.nextCase.onclick();
 }
 assert.equal(q.getState().correctFirst,20);assert.equal(q.getState().totalFirst,20);assert.equal(q.getState().totalReviewed,0);
}
// All wrong on first attempt, then review. Each wrong review stays queued.
q.startGame();for(let i=0;i<5;i++){arrive();choose(q.getState().current.wrong[0]);elements.next.onclick()}
assert.equal(q.getState().reviewQueue.length,5);arrive();choose(q.getState().current.wrong[0]);assert.equal(q.getState().reviewQueue.length,5);
for(let i=0;i<5;i++)correct();assert.equal(q.getState().totalReviewed,5);assert.equal(q.getState().reviewQueue.length,0);correct();assert.equal(q.getState().correctFirst,0);
elements.custom.value='What is a cat? | Kucing | Anjing | Burung | Ikan';elements.saveCustom.onclick();q.startGame();assert.equal(q.getState().plan[0][0].answer,'Kucing');
assert.equal(q.parse('Q | A | A | C | D').errors.length,1);
// Autowalk uses the open central path, including across town.
q.navigate(4);for(let i=0;i<1200;i++)q.movement(1/120);assert(Math.hypot(q.getState().player.x+13,q.getState().player.z-12)<.1);
q.animate(performance.now()+16);
console.log('PASS: mocked 3D setup/frame, 40 lesson tasks, four deductions, both grade paths, all-wrong review/retry flow, score accounting, custom priority/parser, and cross-town autowalk.');

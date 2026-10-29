const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('outputs/supermarket-quest.html','utf8');
let source=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
new vm.Script(source);
source=source.replace(/\}\)\(\);\s*$/,`globalThis.qa={products,missions,product,startGame,selectProduct,openShelf,openCheckout,interact,navigate,movement,choose,parse,animate,total,quantityName,getState:()=>({ready,playing,missionIndex,basket,activeTask,questionMode,quantity,reviewQueue,correctFirst,totalFirst,totalReview,quantityErrors,selectionErrors,completedItems,plan,player,near,stationData,stationGroups})};})();`);
class V{constructor(x=0,y=0,z=0){this.set(x,y,z)}set(x,y,z){Object.assign(this,{x,y,z});return this}setScalar(s){return this.set(s,s,s)}lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this}}
class Object3D{constructor(){this.position=new V();this.rotation=new V();this.scale=new V(1,1,1);this.children=[];this.userData={};this.shadow={mapSize:{set(){}},camera:{}}}add(...a){a.forEach(o=>{this.children.push(o);o.parent=this})}lookAt(){}updateProjectionMatrix(){}}
class Geometry{}class Material{constructor(p){Object.assign(this,p)}}
class Mesh extends Object3D{constructor(g,m){super();this.geometry=g;this.material=m}}
class Texture{constructor(){this.repeat={set(){}}}}class Renderer{constructor(){this.shadowMap={}}setPixelRatio(){}setSize(){}render(){}}
const THREE={Vector3:V,Vector2:V,Group:Object3D,Scene:Object3D,Mesh,Sprite:class extends Object3D{constructor(m){super();this.material=m}},MeshStandardMaterial:Material,SpriteMaterial:Material,BoxGeometry:Geometry,SphereGeometry:Geometry,ConeGeometry:Geometry,CylinderGeometry:Geometry,IcosahedronGeometry:Geometry,CanvasTexture:Texture,Raycaster:class{},WebGLRenderer:Renderer,PerspectiveCamera:Object3D,Color:class{},Fog:class{},HemisphereLight:Object3D,DirectionalLight:Object3D};
const drawing=new Proxy({},{get:()=>()=>{}});
function element(){const classes=new Set();return{value:'',textContent:'',style:{},children:[],classList:{add(...a){a.forEach(x=>classes.add(x))},remove(...a){a.forEach(x=>classes.delete(x))},contains(c){return classes.has(c)},toggle(c,force){if(force===undefined)force=!classes.has(c);if(force)classes.add(c);else classes.delete(c);return force}},addEventListener(){},getContext:()=>drawing,append(...a){this.children.push(...a)},appendChild(a){this.children.push(a)},replaceChildren(){this.children=[]},get lastChild(){return this.children.at(-1)},matches(){return false},click(){if(this.onclick)this.onclick()}}}
const elements={};for(const m of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)){const e=element(),cl=m[0].match(/class="([^"]+)"/);if(cl)e.classList.add(...cl[1].split(' '));elements[m[1]]=e}elements.level.value='junior';
const document={getElementById:id=>elements[id],createElement:()=>element(),addEventListener(){},querySelectorAll:()=>[],hidden:false};
const context={THREE,document,console,performance,Math,Number,Set,devicePixelRatio:1,innerWidth:1280,innerHeight:720,requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},localStorage:{getItem:()=>null,setItem(){},removeItem(){}}};context.window=context;context.addEventListener=()=>{};
vm.createContext(context);vm.runInContext(source,context);
const q=context.qa;assert(q.getState().ready,elements.loadStatus.textContent);
for(const m of q.missions){assert.equal(m.items.length,3);assert(m.pay>m.items.reduce((s,[id,n])=>s+q.product(id).price*n,0));for(const mode of ['junior','senior'])for(const t of m[mode])assert.equal(new Set([t.answer,...t.wrong]).size,4)}
assert.equal(q.products.length,12);
function choose(text){const b=elements.options.children.find(b=>b.lastChild.textContent===text);assert(b,'Missing option '+text);q.choose(text,b)}
function collect(id,qty,wrong=false){q.openShelf(q.product(id).aisle);q.selectProduct(id);choose(wrong?q.getState().activeTask.wrong[0]:q.getState().activeTask.answer);for(let i=1;i<qty;i++)elements.plus.onclick();elements.addBasket.onclick()}
function answerCashier(wrong=false){choose(wrong?q.getState().activeTask.wrong[0]:q.getState().activeTask.answer);elements.next.onclick()}
for(const mode of ['junior','senior']){
 elements.level.value=mode;q.startGame();
 for(let mi=0;mi<4;mi++){
  q.openCheckout();assert(elements.quizLayer.classList.contains('hidden'),'Incomplete basket allowed checkout');
  for(const [id,qty]of [...q.missions[mi].items].reverse())collect(id,qty);
  assert.equal(q.getState().basket.length,3);q.openCheckout();answerCashier();answerCashier();
  assert(!elements.resultLayer.classList.contains('hidden'));
  assert.equal(q.getState().totalFirst,(mi+1)*5);
  if(mi<3)elements.nextMission.onclick();
 }
 assert.equal(q.getState().correctFirst,20);assert.equal(q.getState().totalReview,0);
}
q.startGame();q.openShelf(1);q.selectProduct('cake');assert.equal(q.getState().selectionErrors,1);assert.equal(q.getState().basket.length,0);
q.openShelf(0);q.selectProduct('apple');choose(q.getState().activeTask.answer);elements.addBasket.onclick();assert.equal(q.getState().quantityErrors,1);assert.equal(q.getState().basket.length,0);
elements.plus.onclick();elements.addBasket.onclick();assert.equal(q.getState().basket.length,1);
// Re-selecting a product must not score it or add it twice.
q.selectProduct('apple');assert.equal(q.getState().basket.length,1);assert.equal(q.getState().totalFirst,1);
// Both product review and cashier review must terminate.
q.startGame();for(const [id,n]of q.missions[0].items)collect(id,n,true);
q.openCheckout();assert.equal(q.getState().questionMode,'review');choose(q.getState().activeTask.wrong[0]);assert.equal(q.getState().reviewQueue.length,3);
for(let i=0;i<3;i++)answerCashier();assert.equal(q.getState().questionMode,'cashier');
answerCashier(true);answerCashier(true);assert.equal(q.getState().questionMode,'review');answerCashier();answerCashier();
assert(!elements.resultLayer.classList.contains('hidden'),'Cashier review failed to finish mission');assert.equal(q.getState().totalFirst,5);assert.equal(q.getState().totalReview,5);assert.equal(q.getState().correctFirst,0);
elements.custom.value='What is an apple? | Apel | Pisang | Jeruk | Roti';elements.saveCustom.onclick();q.startGame();assert.equal(q.getState().plan[0][0].answer,'Apel');
assert.equal(q.parse('Q | A | A | B | C').errors.length,1);assert.equal(q.parse('Q | A | B').errors.length,1);
q.navigate(0);for(let i=0;i<1100;i++)q.movement(1/120);assert(Math.hypot(q.getState().player.x+11,q.getState().player.z+8)<.1);
q.animate(performance.now()+16);
console.log('PASS: mocked 3D setup/frame, 12 products, both grade paths/all four missions, shopping out of order, totals/change, incomplete checkout, wrong product/quantity, duplicate protection, item and cashier review, custom parser/priority, navigation.');

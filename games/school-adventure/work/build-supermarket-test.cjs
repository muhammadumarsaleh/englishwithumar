const fs=require('fs');
let base=fs.readFileSync('work/check-detective.cjs','utf8');
base=base.slice(0,base.indexOf('const q=context.qa;'));
base=base.replace('outputs/english-detective.html','outputs/supermarket-quest.html');
base=base.replace('class Texture{}','class Texture{constructor(){this.repeat={set(){}}}}');
base=base.replace('globalThis.qa={cases,startGame,interact,navigate,movement,choose,parse,animate,getState:()=>({ready,playing,caseIndex,step,current,collected,reviewQueue,correctFirst,totalFirst,totalReviewed,caseReview,plan,player,near,stationData,stationGroups})}', 'globalThis.qa={products,missions,product,startGame,selectProduct,openShelf,openCheckout,interact,navigate,movement,choose,parse,animate,total,quantityName,getState:()=>({ready,playing,missionIndex,basket,activeTask,questionMode,quantity,reviewQueue,correctFirst,totalFirst,totalReview,quantityErrors,selectionErrors,completedItems,plan,player,near,stationData,stationGroups})}');
base+=`
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
`;
fs.writeFileSync('work/check-supermarket.cjs',base);

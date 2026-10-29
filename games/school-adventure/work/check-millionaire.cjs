const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('outputs/millionaire-classroom-fixed.html','utf8');let source=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(source);
source=source.replace(/\}\)\(\);\s*$/,`globalThis.qa={state,parseBank,records,identity,poolForSource,makeDeck,startMatch,nextQuestion,answer,resolve,tick,setPause,points,useHelp,openTeacher,saveDraft,finishMatch,validateDraft,DEFAULT_QUESTIONS};})();`);
function element(tag='div'){const classes=new Set(),listeners={};return{tagName:tag.toUpperCase(),value:'',textContent:'',children:[],dataset:{},disabled:false,style:{setProperty(k,v){this[k]=v}},className:'',classList:{add(...a){a.forEach(x=>classes.add(x))},remove(...a){a.forEach(x=>classes.delete(x))},contains(c){return classes.has(c)},toggle(c,f){if(f===undefined)f=!classes.has(c);if(f)classes.add(c);else classes.delete(c);return f}},append(...a){this.children.push(...a)},appendChild(a){this.children.push(a)},replaceChildren(){this.children=[]},setAttribute(k,v){this[k]=v},addEventListener(k,fn){listeners[k]=fn},click(){if(this.onclick&&!this.disabled)this.onclick({target:this})},matches(){return false},get listeners(){return listeners}}}
const elements={};for(const m of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>/g)){const e=element(m[1]),cl=m[0].match(/class="([^"]+)"/),val=m[0].match(/value="([^"]+)"/);if(cl)e.classList.add(...cl[1].split(' '));if(val)e.value=val[1];elements[m[2]]=e}
Object.assign(elements.source,{value:'default'});elements.duration.value='20';
const docListeners={},storage={},intervals=new Map();let now=10000,id=0;
const document={getElementById:id=>elements[id],createElement:element,querySelectorAll:q=>q==='.answer'?elements.answers.children:[],addEventListener(k,f){docListeners[k]=f},hidden:false};
const context={document,console,Math,Number,Set,Map,JSON,String,Array,performance:{now:()=>now},setTimeout(){return++id},clearTimeout(){},setInterval:f=>{intervals.set(++id,f);return id},clearInterval:i=>intervals.delete(i),localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},TextDecoder,Uint8Array,URL,Blob};context.window=context;vm.createContext(context);vm.runInContext(source,context);const q=context.qa;
function parse(text){return q.parseBank(text)}
let r=parse('\ufeffWhat is a cat? | Kucing | Anjing | Burung | Ikan\r\nWhat is a dog? | Anjing | Kucing | Ikan | Burung');assert.equal(r.questions.length,2);assert.equal(r.errors.length,0);
r=parse('Q | A | B | C | D | 0\nQ2 | A | B | C | D | D');assert.equal(r.questions[1].c,3);
assert.equal(parse('Q | A | B | C | D | 1abc').errors.length,1);
assert.equal(parse('Q | A | B | C | D | 4').errors.length,1);
assert.equal(parse('Q | A | A | B | C').errors.length,1);
r=parse('Question\tCorrect Answer\tWrong 1\tWrong 2\tWrong 3\nQ\tA\tB\tC\tD');assert.equal(r.questions.length,1);assert.equal(r.errors.length,0);
r=parse('"What colour, Mia?",Blue,Red,Green,Yellow\r\n"Read this:\nWhat is a cat?",Kucing,Anjing,Ikan,Burung');assert.equal(r.questions.length,2);assert.equal(r.errors.length,0);
r=parse('"Which word means ""buku""?";Book;Bag;Pen;Chair');assert.equal(r.questions.length,1);assert(r.questions[0].q.includes('"buku"'));
assert(parse('"Unclosed | A | B | C | D').errors.length>0);
r=parse('Q? | A | B | C | D\n q. | D | C | A | B | 2');assert.equal(r.questions.length,1);assert.equal(r.duplicates.length,1);assert.equal(r.errors.length,0);
r=parse('Q | A | B | C | D\nQ | B | A | C | D');assert.equal(r.errors.length,1);
r=parse('[{"q":"Q","a":["A","B","C","D"],"c":2},{"question":"Q2","options":["A","B","C","D"],"correctAnswer":"B"}]');assert.equal(r.questions[0].c,2);assert.equal(r.questions[1].c,1);
r=parse('{"questions":[{"question":"Q","correctAnswer":"A","wrongAnswers":["B","C","D"]}]}');assert.equal(r.questions.length,1);
assert(parse('{not json}').errors.length);
assert.equal(new Set(q.DEFAULT_QUESTIONS.map(x=>q.identity(x.q))).size,q.DEFAULT_QUESTIONS.length);
function configure(n=20,source='default'){elements.rounds.value=String(n);elements.source.value=source;q.startMatch();assert(q.state.active,elements.setupError.textContent)}
function advance(){elements.nextBtn.click()}
for(const n of [1,5,16,20,40,100]){configure(n);const seen=new Set();while(q.state.active){assert(!seen.has(q.state.current.id),'Question repeated');seen.add(q.state.current.id);const answer=q.state.current.c;q.answer(answer);q.answer(answer);advance()}assert.equal(seen.size,2*n);assert.equal(q.state.teams[0].total,n);assert.equal(q.state.teams[1].total,n);assert.equal(q.points(q.state.teams[0]),1000000);assert(elements.winnerTitle.textContent.includes('sama hebat'));assert.equal(intervals.size,0)}
configure(5);while(q.state.active){q.answer(q.state.turn===0?q.state.current.c:(q.state.current.c+1)%4);advance()}assert.equal(q.state.teams[0].correct,5);assert.equal(q.state.teams[1].correct,0);assert(elements.winnerTitle.textContent.includes(q.state.teams[0].name));
configure(3);q.setPause('manual',true);const oldLeft=q.state.left,oldPointer=q.state.pointer;now+=60000;q.tick();assert.equal(q.state.pointer,oldPointer);assert(!q.state.answered);q.openTeacher();elements.closeTeacher.click();assert(q.state.pauses.has('manual'));assert.equal(intervals.size,0);q.setPause('manual',false);assert.equal(intervals.size,1);assert.equal(q.state.left,oldLeft);
// Change duration while paused; this question retains its original duration.
q.openTeacher();elements.tmDuration.value='60';elements.tmDuration.onchange({target:elements.tmDuration});assert.equal(q.state.questionDuration,20);elements.closeTeacher.click();now=q.state.deadline+1;q.tick();q.tick();assert.equal(q.state.teams[0].total,1);advance();assert.equal(q.state.questionDuration,60);
q.useHelp(1,'teacher');assert(q.state.pauses.has('help'));assert(!q.state.teams[1].lifelines.teacher);elements.closeHelp.click();assert.equal(q.state.pauses.size,0);q.useHelp(1,'audience');assert(q.state.pauses.has('help'));assert.equal(elements.helpContent.children.length,4);elements.closeHelp.click();
q.openTeacher();elements.tmSkip.click();elements.tmSkip.click();assert.equal(q.state.teams[1].total,1);assert.equal(q.state.skips,1);elements.closeTeacher.click();advance();
const before=q.state.teams[0].correct;q.openTeacher();elements.tmBonus0.click();assert.equal(q.state.teams[0].correct,before);assert.equal(q.state.teams[0].bonus,1);elements.closeTeacher.click();
// Invalid import cannot replace the existing bank.
elements.bulkInput.value='Custom Q | A | B | C | D';assert(q.saveDraft());assert(storage['millionaire-classroom-bank-v2']);elements.bulkInput.value='Bad | A | A | C | D';assert(!q.saveDraft());assert.equal(q.poolForSource('custom').length,1);
elements.rounds.value='5';elements.source.value='custom';q.startMatch();assert(elements.setupError.textContent.includes('10 soal unik'));
configure(5,'mixed');assert.equal(q.state.deck.filter(x=>x.q==='Custom Q').length,1);
assert.equal(new Set(q.state.deck.map(x=>x.id)).size,10);
const customRows=Array.from({length:60},(_,i)=>'Imported question '+i+' | Correct '+i+' | Wrong A '+i+' | Wrong B '+i+' | Wrong C '+i).join('\n');elements.bulkInput.value=customRows;assert(q.saveDraft());configure(20,'custom');assert.equal(q.state.deck.length,40);assert(q.state.deck.every(x=>x.q.startsWith('Imported question')));
for(const item of q.state.deck)assert(item.a[item.c].startsWith('Correct '),'Shuffled key is wrong');
// Pause on hidden document, and preserve a separate manual pause.
q.setPause('manual',true);document.hidden=true;docListeners.visibilitychange();q.setPause('manual',false);assert(q.state.pauses.has('hidden'));assert.equal(intervals.size,0);document.hidden=false;docListeners.visibilitychange();assert.equal(intervals.size,1);
q.finishMatch('test');assert.equal(intervals.size,0);
assert(!/<script[^>]*\bsrc=/.test(html),'Unexpected external runtime dependency');
assert(html.includes('minmax(36px,auto)'));assert(!/zoom\s*:|font-size:\s*(?:8|9)px/.test(html));
(async()=>{
const text='UTF question | Correct | Wrong 1 | Wrong 2 | Wrong 3';
for(const bytes of [Buffer.from('\ufeff'+text,'utf8'),Buffer.concat([Buffer.from([255,254]),Buffer.from(text,'utf16le')])]){
 const target={files:[{name:'questions.txt',arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}],value:'questions.txt'};
 await elements.fileInput.listeners.change({target});
 assert.equal(q.validateDraft().questions.length,1);assert.equal(q.validateDraft().errors.length,0);assert.equal(target.value,'');
}
const beforeBank=q.poolForSource('custom').length;
const bytes=Buffer.from('Invalid row | Too few');
await elements.fileInput.listeners.change({target:{files:[{name:'bad.txt',arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}],value:'bad.txt'}});
assert(q.validateDraft().errors.length);assert(!q.saveDraft());assert.equal(q.poolForSource('custom').length,beforeBank);
console.log('PASS: parser edge cases, UTF-8/UTF-16 file imports, 1–100 rounds/team without repeats, shuffled keys, custom isolation/priority, double-click protection, balanced turns/draws, timeout, nested pauses, lifelines, skip/bonus, invalid-bank save protection, offline dependencies/layout guards.');
})().catch(e=>{console.error(e);process.exitCode=1});

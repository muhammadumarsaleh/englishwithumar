// Keadaan percobaan terpisah dari bank soal pengajar.
let failed=false,attemptToken=0,foundItems=0,nearItem=null,hunter=null;
let pickups=[],itemCandidates=[],patrolRoute=[],hunterThreat=0;
const safeRooms=[];
const itemTypes=[
 {name:'Silver Key',meaning:'Kunci perak',kind:'key',color:0xbac9c1},
 {name:'Old Notebook',meaning:'Buku catatan tua',kind:'book',color:0x9a8263},
 {name:'Pocket Watch',meaning:'Jam saku',kind:'watch',color:0xc5ac73},
 {name:'Wax Candle',meaning:'Lilin',kind:'candle',color:0xd5c7a5},
 {name:'Music Box',meaning:'Kotak musik',kind:'box',color:0x8d6972}
];

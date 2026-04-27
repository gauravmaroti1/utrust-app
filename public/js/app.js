
var fbDb=null;
try{
  firebase.initializeApp({apiKey:"AIzaSyDazZSs72-ObVlMWcfCryKh7hwTtUmQ_LA",authDomain:"utrust-app.firebaseapp.com",projectId:"utrust-app"});
  fbDb=firebase.firestore();
}catch(e){console.warn("Firebase:",e.message);}

function compressImg(url,maxW,q){
  return new Promise(function(res){
    if(!url||!url.startsWith('data:')){res(url);return;}
    var img=new Image();img.onload=function(){
      var sc=Math.min(1,(maxW||640)/img.width);
      var c=document.createElement('canvas');c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',q||0.42));
    };img.onerror=function(){res(url);};img.src=url;
  });
}
function compressPhotos(photos){
  var keys=Object.keys(photos||{});var out={};var chain=Promise.resolve();
  keys.forEach(function(k){chain=chain.then(function(){return photos[k]?compressImg(photos[k]):Promise.resolve(null);}).then(function(v){out[k]=v;});});
  return chain.then(function(){return out;});
}
var FB={
  listen:function(col,cb){
    if(!fbDb)return function(){};
    return fbDb.collection(col).orderBy('createdAt','desc').onSnapshot(function(snap){
      cb(snap.docs.map(function(d){return Object.assign({},d.data(),{id:d.id});}));
    },function(e){console.error('FS:',e);});
  },
  save:function(col,doc){
    if(!fbDb)return Promise.resolve('local_'+Date.now());
    var d=Object.assign({},doc);delete d.id;
    d.createdAt=firebase.firestore.FieldValue.serverTimestamp();
    if(d.photos){return compressPhotos(d.photos).then(function(cp){var fp={};Object.keys(cp).forEach(function(k){if(cp[k])fp[k]=cp[k];});d.photos=fp;return fbDb.collection(col).add(d).then(function(r){return r.update({id:r.id}).then(function(){return r.id;});});});}
    return fbDb.collection(col).add(d).then(function(r){return r.update({id:r.id}).then(function(){return r.id;});});
  },
  update:function(col,id,u){
    if(!fbDb)return Promise.resolve();
    if(u.photos){return compressPhotos(u.photos).then(function(cp){return fbDb.collection(col).doc(id).update(Object.assign({},u,{photos:cp}));});}
    return fbDb.collection(col).doc(id).update(u);
  },
  del:function(col,id){if(!fbDb)return Promise.resolve();return fbDb.collection(col).doc(id).delete();}
};



var DEFAULT_CREDS=[
  {id:'U001',username:'admin',password:'Admin@1234',name:'Utrust Admin',role:'admin',email:'admin@utrust.in',avatar:'UA',branch:'HQ',phone:''},
  {id:'U002',username:'dilnawaz.purnea',password:'Utrust@2025',name:'Dilnawaz Ahmad',role:'leader',email:'dilnawaz@utrust.in',avatar:'DA',branch:'Purnea',phone:'6287796605'},
  {id:'U003',username:'sajan.purnea',password:'Utrust@2025',name:'Sajan Kr Saha',role:'officer',email:'sajan@utrust.in',avatar:'SS',branch:'Purnea',phone:'9264476721'},
  {id:'U004',username:'ravi.purnea',password:'Utrust@2025',name:'Ravi Yadav',role:'officer',email:'ravi.y@utrust.in',avatar:'RY',branch:'Purnea',phone:'9264476725'},
  {id:'U005',username:'intkhab.forbesganj',password:'Utrust@2025',name:'Intkhab Alam',role:'officer',email:'intkhab@utrust.in',avatar:'IA',branch:'Forbesganj',phone:'6287796615'},
  {id:'U006',username:'awinash.forbesganj',password:'Utrust@2025',name:'Awinash Singh',role:'officer',email:'awinash@utrust.in',avatar:'AS',branch:'Forbesganj',phone:'9264476713'},
  {id:'U007',username:'sonu.bhagalpur',password:'Utrust@2025',name:'Sonu Ghosh',role:'officer',email:'sonu@utrust.in',avatar:'SG',branch:'Bhagalpur',phone:'9264476729'},
  {id:'U008',username:'kundan.bhagalpur',password:'Utrust@2025',name:'Kundan Kumar',role:'officer',email:'kundan@utrust.in',avatar:'KK',branch:'Bhagalpur',phone:'9264476727'},
  {id:'U009',username:'faiyaz.kishanganj',password:'Utrust@2025',name:'Faiyaz Alam',role:'officer',email:'faiyaz@utrust.in',avatar:'FA',branch:'Kishanganj',phone:'6287796620'},
  {id:'U010',username:'mukesh.katihar',password:'Utrust@2025',name:'Mukesh Karmakar',role:'officer',email:'mukesh.k@utrust.in',avatar:'MK',branch:'Katihar',phone:'9264476737'},
  {id:'U011',username:'nitin.saharsa',password:'Utrust@2025',name:'Nitin Kumar',role:'officer',email:'nitin@utrust.in',avatar:'NK',branch:'Saharsa',phone:'9264476745'},
  {id:'U012',username:'amresh.supaul',password:'Utrust@2025',name:'Amresh Kumar',role:'officer',email:'amresh@utrust.in',avatar:'AK',branch:'Supaul',phone:'9122676789'},
  {id:'U013',username:'kunal.khagaria',password:'Utrust@2025',name:'Kunal Anand',role:'officer',email:'kunal@utrust.in',avatar:'KA',branch:'Khagaria',phone:'6204234330'},
  {id:'U014',username:'neha.banka',password:'Utrust@2025',name:'Neha Kumari',role:'officer',email:'neha@utrust.in',avatar:'NK',branch:'Banka',phone:'9264476746'},
  {id:'U015',username:'deepak.saharsa',password:'Utrust@2025',name:'Deepak Kumar',role:'officer',email:'deepak@utrust.in',avatar:'DK',branch:'Saharsa',phone:'9304511215'}
];
function loadCreds(){try{var s=localStorage.getItem('utrust_creds_v2');if(s){var p=JSON.parse(s);if(p&&p.length>0)return p;}}catch(e){}return DEFAULT_CREDS.slice();}
var CRED_LIST=loadCreds();
function saveCreds(list){CRED_LIST.length=0;list.forEach(function(u){CRED_LIST.push(u);});try{localStorage.setItem('utrust_creds_v2',JSON.stringify(list));}catch(e){}}

var BRANDS={'Maruti Suzuki':['Alto','Alto K10','WagonR','Swift','Dzire','Baleno','Ertiga','Brezza','Celerio','Ignis','Ciaz','S-Presso','Fronx','Grand Vitara','XL6','Eeco'],'Hyundai':['Santro','i10','Grand i10 Nios','i20','Aura','Verna','Creta','Venue','Tucson','Alcazar'],'Tata':['Tiago','Tigor','Nexon','Nexon EV','Harrier','Safari','Altroz','Punch'],'Mahindra':['Bolero','Bolero Neo','Scorpio','Scorpio N','Thar','XUV300','XUV700','KUV100'],'Honda':['Amaze','Jazz','WR-V','City','Elevate'],'Toyota':['Etios','Innova Crysta','Innova HyCross','Fortuner','Glanza','Hyryder'],'Kia':['Seltos','Sonet','Carens','Carnival'],'Renault':['Kwid','Kiger','Duster','Triber'],'Nissan':['Magnite'],'Volkswagen':['Polo','Vento','Taigun','Virtus'],'Skoda':['Kushaq','Slavia','Kylaq'],'MG':['Hector','Astor','Windsor'],'Jeep':['Compass','Meridian'],'BMW':['3 Series','5 Series','X1','X3','X5'],'Mercedes-Benz':['C-Class','E-Class','GLC'],'Other':['-- Type Manually --']};
var CITIES=['Purnea','Patna','Bhagalpur','Forbesganj','Kishanganj','Katihar','Banka','Khagaria','Saharsa','Supaul','Guwahati','Siliguri','Ranchi'];
var BRANCHES=['Purnea','Bhagalpur','Forbesganj','Kishanganj','Katihar','Banka','Khagaria','Saharsa','Supaul'];
var CITY_ADJ={'Patna':1.06,'Guwahati':1.04,'Siliguri':1.03,'Ranchi':1.02,'Purnea':0.97,'Bhagalpur':0.96,'Kishanganj':0.95,'Katihar':0.95,'Forbesganj':0.94,'Banka':0.93,'Khagaria':0.93,'Saharsa':0.94,'Supaul':0.93};
var REPAIR_COSTS={engine:{Excellent:{cost:0,label:'No repair needed'},Good:{cost:3000,label:'Minor service'},Fair:{cost:18000,label:'Major service'},Poor:{cost:55000,label:'Major mechanical repair'}},tyres:{Excellent:{cost:0,label:'All good'},Good:{cost:2500,label:'Balancing + alignment'},Fair:{cost:18000,label:'2 tyres replacement'},Worn:{cost:36000,label:'All 4 tyres replacement'}},battery:{Excellent:{cost:0,label:'No action'},Good:{cost:500,label:'Check only'},Weak:{cost:8000,label:'Battery replacement'},Dead:{cost:9500,label:'New battery + alternator check'}},electricals:{Excellent:{cost:0,label:'No action'},Good:{cost:1000,label:'Minor check'},Issues:{cost:12000,label:'Electrical diagnosis + fix'},Dead:{cost:28000,label:'Major electrical overhaul'}},exterior:{Excellent:{cost:0,label:'No paintwork'},Good:{cost:5000,label:'Minor touch-ups'},Fair:{cost:22000,label:'Panel denting + painting'},Poor:{cost:55000,label:'Full body repair'}},interior:{Excellent:{cost:0,label:'Clean'},Good:{cost:2000,label:'Deep cleaning'},Fair:{cost:12000,label:'Seat covers + cleaning'},Poor:{cost:30000,label:'Full interior refurbishment'}}};

function calcAlgo(p){
  var idv=parseFloat(p.idv)||0,purchaseVal=parseFloat(p.purchase_value)||0,year=parseInt(p.year)||0,insExpired=p.insurance_expired,accidental=p.accidental,claimHistory=p.claim_history||'None',odometer=parseInt(p.odometer)||0,engine=p.engine||'Good',fuel=p.fuel||'Petrol',challanAmt=parseFloat(p.challan_amount)||0,volumeCC=parseInt(p.volume_cc)||0,city=p.city||'Purnea',repairCost=parseFloat(p.total_repair_cost)||0,serviceHistory=p.service_history||'Unknown';
  var base=insExpired?purchaseVal:idv;
  if(!base||base<1000||!year)return null;
  var age=new Date().getFullYear()-year;
  if(age<0||age>30)return null;
  var price=base,steps=[];
  steps.push({label:'Base '+(insExpired?'purchase value':'IDV'),val:price,type:'base'});
  if(insExpired){var nip=price*0.10;price-=nip;steps.push({label:'No insurance penalty (10%)',val:-nip,type:'minus'});}
  var depN=[0,0.05,0.10,0.15,0.20,0.25,0.30,0.38,0.46,0.52,0.58,0.63,0.67,0.70,0.73,0.76,0.78,0.80,0.82,0.84,0.86];
  var depE=[0,0.08,0.14,0.20,0.27,0.33,0.40,0.48,0.55,0.61,0.66,0.71,0.75,0.78,0.81,0.84,0.86,0.88,0.89,0.90,0.91];
  var depTable=insExpired?depE:depN,depIdx=Math.min(Math.max(age,0),20),dep=depTable[depIdx]!==undefined?depTable[depIdx]:0.86;
  var depAmt=price*dep;price-=depAmt;steps.push({label:'Depreciation ('+age+'yr, '+Math.round(dep*100)+'%)',val:-depAmt,type:'minus'});
  if(volumeCC>0){var volAdj=0;if(volumeCC>2000&&fuel==='Diesel')volAdj=0.04;else if(volumeCC>1500)volAdj=0.02;else if(volumeCC<1000)volAdj=-0.02;if(volAdj!==0){var vadj=price*volAdj;price+=vadj;steps.push({label:'Engine volume ('+volumeCC+'cc)',val:vadj,type:volAdj>0?'plus':'minus'});}}
  if(odometer){var diff=odometer-age*12000;if(diff>0){var pen=Math.min(diff*0.8,price*0.08);price-=pen;steps.push({label:'High odometer penalty',val:-pen,type:'minus'});}else if(diff<-5000){var bon=Math.min(Math.abs(diff)*0.3,price*0.04);price+=bon;steps.push({label:'Low odometer bonus',val:bon,type:'plus'});}}
  if(accidental==='Yes'){var ap=price*0.12;price-=ap;steps.push({label:'Accidental history penalty',val:-ap,type:'minus'});}
  var clMap={'None':0,'1 Minor':0.04,'1 Major':0.10,'2+ Claims':0.15,'Unknown':0.06};var cp=clMap[claimHistory]||0;
  if(cp>0){var cpen=price*cp;price-=cpen;steps.push({label:'Claim history ('+claimHistory+')',val:-cpen,type:'minus'});}
  var sMap={'Full records':0.03,'Partial':0,'Unknown':-0.02,'No records':-0.04};var sa=sMap[serviceHistory]||0;
  if(sa!==0){var sadj=price*sa;price+=sadj;steps.push({label:'Service history ('+serviceHistory+')',val:sadj,type:sa>0?'plus':'minus'});}
  var engMap={Excellent:0.03,Good:0,Fair:-0.05,Poor:-0.12};var ea=engMap[engine]||0;
  if(ea!==0){var eadj=price*ea;price+=eadj;steps.push({label:'Engine condition ('+engine+')',val:eadj,type:ea>0?'plus':'minus'});}
  var fMap={Diesel:0.03,Electric:0.05,Hybrid:0.04,CNG:-0.02,Petrol:0,LPG:-0.03};var fa=fMap[fuel]||0;
  if(fa!==0){var fadj=price*fa;price+=fadj;steps.push({label:'Fuel type ('+fuel+')',val:fadj,type:fa>0?'plus':'minus'});}
  var cityMult=CITY_ADJ[city]||0.95;if(cityMult!==1){var cadj=price*(cityMult-1);price+=cadj;steps.push({label:'City factor ('+city+')',val:cadj,type:cadj>0?'plus':'minus'});}
  var margin=price*0.08;price-=margin;steps.push({label:'Dealer margin (8%)',val:-margin,type:'minus'});
  if(challanAmt>0){price-=challanAmt;steps.push({label:'Pending challans deduction',val:-challanAmt,type:'minus'});}
  if(repairCost>0){price-=repairCost;steps.push({label:'Estimated repair cost',val:-repairCost,type:'minus'});}
  price=Math.max(price,10000);
  steps.push({label:'Recommended Purchase Price',val:price,type:'result'});
  return{price:Math.round(price),min:Math.round(price*0.92),max:Math.round(price*1.06),steps:steps};
}
function calcRepairTotal(cond){
  var total=0;
  ['engine','tyres','battery','electricals','exterior','interior'].forEach(function(k){if(cond[k]&&REPAIR_COSTS[k]&&REPAIR_COSTS[k][cond[k]])total+=REPAIR_COSTS[k][cond[k]].cost;});
  return total;
}
var fmt=function(n){return n?'\u20B9'+Math.round(n).toLocaleString('en-IN'):'\u2014';};
var fmtL=function(n){if(!n||n<100)return'\u2014';if(n<100000)return'\u20B9'+Math.round(n).toLocaleString('en-IN');return'\u20B9'+(n/100000).toFixed(2)+'L';};
var today=function(){return new Date().toISOString().slice(0,10);};
var daysAgo=function(d){return Math.floor((Date.now()-new Date(d).getTime())/86400000);};



var h=React.createElement,useState=React.useState,useEffect=React.useEffect,useRef=React.useRef;

function StatusBadge(p){var m={pending:'b-pend',approved:'b-appr',rejected:'b-rejt',draft:'b-drft',review:'b-pend',hot:'b-hot',warm:'b-warm',cold:'b-cold',won:'b-won',lost:'b-lost',new:'b-pend'};var l={pending:'PENDING',approved:'APPROVED',rejected:'REJECTED',draft:'DRAFT',review:'REVIEW',hot:'\uD83D\uDD25 HOT',warm:'WARM',cold:'COLD',won:'\u2713 WON',lost:'LOST',new:'NEW'};return h('span',{className:'badge '+(m[p.status]||'b-drft')},l[p.status]||(p.status||'').toUpperCase());}
function Toast(p){useEffect(function(){var t=setTimeout(p.onClose,3500);return function(){clearTimeout(t);};},[]);return h('div',{className:'toast '+p.type},h('span',null,p.type==='success'?'\u2713':p.type==='error'?'\u2715':'\u2139'),p.message);}
function Modal(p){return h('div',{className:'modal-bg',onClick:function(e){if(e.target===e.currentTarget)p.onClose();}},h('div',{className:'modal'},h('div',{className:'modal-ttl'},p.title),p.sub&&h('div',{className:'modal-sub'},p.sub),p.children));}
function BarRow(p){var pct=p.max?Math.round(p.val/p.max*100):0;return h('div',{className:'bar-row'},h('div',{className:'bar-lbl',style:{width:p.wide?110:85}},p.label),h('div',{style:{flex:1}},h('div',{className:'bar-track'},h('div',{className:'bar-fill',style:{width:pct+'%',background:p.color||'var(--acc)'}})),p.sub&&h('div',{style:{fontSize:9,color:'var(--tx3)',marginTop:1}},p.sub)),h('div',{className:'bar-val'},p.val));}

function CameraCapture(p){
  var videoRef=useRef(null),canvasRef=useRef(null),streamRef=useRef(null);
  var _s=useState(false);var open=_s[0];var setOpen=_s[1];
  var _e=useState('');var err=_e[0];var setErr=_e[1];
  var _f=useState('environment');var facing=_f[0];var setFacing=_f[1];
  var _gps=useState(null);var gps=_gps[0];var setGps=_gps[1];
  function kill(){if(streamRef.current){streamRef.current.getTracks().forEach(function(t){t.stop();});streamRef.current=null;}if(videoRef.current)videoRef.current.srcObject=null;}
  function start(f){
    setErr('');kill();var t=f||'environment';
    if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(pos){setGps({lat:pos.coords.latitude.toFixed(5),lng:pos.coords.longitude.toFixed(5)});},function(){setGps(null);},{timeout:5000});}
    var tries=[{video:{facingMode:{exact:t},width:{ideal:1280}}},{video:{facingMode:t}},{video:true}];
    var i=0;
    function next(){if(i>=tries.length){setErr('Camera unavailable');return;}
      navigator.mediaDevices.getUserMedia(tries[i++]).then(function(stream){streamRef.current=stream;setFacing(t);setOpen(true);requestAnimationFrame(function(){if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play().catch(function(){});}});}).catch(function(){next();});
    }
    next();
  }
  function stop(){kill();setOpen(false);}
  function capture(){
    var v=videoRef.current,c=canvasRef.current;if(!v||!c)return;
    c.width=v.videoWidth||640;c.height=v.videoHeight||480;
    var ctx=c.getContext('2d');ctx.drawImage(v,0,0,c.width,c.height);
    var ts=new Date().toLocaleString('en-IN');var gpsStr=gps?(' | GPS: '+gps.lat+','+gps.lng):'';
    var bh=Math.max(26,Math.round(c.height*0.058));
    ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,c.height-bh,c.width,bh);
    ctx.fillStyle='#f5a623';ctx.font='bold '+Math.round(bh*0.48)+'px monospace';
    ctx.fillText('\uD83D\uDCCD '+ts+gpsStr+' | Utrust',7,c.height-Math.round(bh*0.16));
    var url=c.toDataURL('image/jpeg',0.88);stop();p.onCapture(url);
  }
  useEffect(function(){return function(){kill();};},[]);
  return h('div',null,
    h('div',{className:'cam-slot'+(p.captured?' captured':''),onClick:function(){if(!p.captured)start('environment');}},
      h('div',{className:'cam-preview'},p.captured?h('img',{src:p.captured,alt:p.label,style:{width:'100%',height:'100%',objectFit:'cover'}}):h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',padding:12}},h('span',{style:{fontSize:22,marginBottom:5}},'\uD83D\uDCF7'),h('span',{style:{fontSize:10,color:err?'var(--red)':'var(--tx3)',textAlign:'center'}},err||'Tap to capture'))),
      h('div',{className:'cam-lbl'},p.label+(p.captured?' \u2713':''))
    ),
    p.captured&&h('button',{className:'btn btn-danger btn-sm',style:{width:'100%',marginTop:3},onClick:function(e){e.stopPropagation();p.onCapture(null);start('environment');}},'\uD83D\uDD04 Retake'),
    open&&h('div',{className:'cam-modal'},
      h('div',{style:{color:'#fff',fontSize:13,fontWeight:700,marginBottom:6}},p.label),
      gps&&h('div',{style:{fontSize:10,color:'var(--grn)',fontFamily:'monospace',marginBottom:4}},'\uD83D\uDCCD GPS: '+gps.lat+', '+gps.lng),
      h('div',{style:{width:'100%',maxWidth:460,borderRadius:10,overflow:'hidden',background:'#000'}},h('video',{ref:videoRef,autoPlay:true,playsInline:true,muted:true,style:{width:'100%',display:'block'}}),h('canvas',{ref:canvasRef,style:{display:'none'}})),
      h('div',{style:{display:'flex',gap:12,alignItems:'center',marginTop:8}},h('button',{className:'btn btn-ghost',onClick:stop},'\u2715 Cancel'),h('div',{className:'shutter',onClick:capture},'\uD83D\uDCF8'),h('button',{className:'btn btn-ghost',onClick:function(){start(facing==='environment'?'user':'environment');}},'\uD83D\uDD04 Flip'))
    )
  );
}

function Login(p){
  var _u=useState('');var user=_u[0];var setUser=_u[1];
  var _pw=useState('');var pass=_pw[0];var setPass=_pw[1];
  var _e=useState('');var err=_e[0];var setErr=_e[1];
  function doLogin(){var u=CRED_LIST.find(function(c){return c.username===user.trim()&&c.password===pass;});if(u)p.onLogin(Object.assign({},u));else setErr('Invalid username or password.');}
  return h('div',{className:'login-screen'},h('div',{className:'login-card'},
    h('div',{className:'login-logo'},h('div',{className:'login-logo-icon'},'\uD83D\uDE97'),h('div',null,h('div',{style:{fontSize:20,fontWeight:800,letterSpacing:'-0.01em'}},'Utrust CRM'),h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',letterSpacing:'0.1em'}},'VEHICLE MANAGEMENT SYSTEM v2.0'))),
    h('div',{style:{fontSize:20,fontWeight:800,marginBottom:3}},'Sign In'),
    h('div',{style:{fontSize:12,color:'var(--tx2)',marginBottom:20}},'Enter your assigned credentials'),
    h('div',{className:'field'},h('label',null,'Username'),h('input',{className:'inp',value:user,onChange:function(e){setUser(e.target.value);},autoComplete:'off',onKeyDown:function(e){if(e.key==='Enter')doLogin();},placeholder:'e.g. admin'})),
    h('div',{className:'field'},h('label',null,'Password'),h('input',{className:'inp',type:'password',value:pass,onChange:function(e){setPass(e.target.value);},autoComplete:'new-password',onKeyDown:function(e){if(e.key==='Enter')doLogin();},placeholder:'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'})),
    err&&h('div',{style:{background:'var(--rdim)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'var(--r)',padding:'9px 12px',fontSize:11,color:'var(--red)',marginBottom:12}},'\u26A0 '+err),
    h('button',{className:'btn-primary',onClick:doLogin},'Sign In \u2192'),
    h('div',{style:{textAlign:'center',marginTop:12,fontSize:10,color:'var(--tx3)'}},'Contact Utrust Incharge for credentials')
  ));
}

function Sidebar(p){
  var user=p.user,page=p.page,pc=p.pendingCount,lc=p.leadCount;
  var roleLabel={admin:'ADMINISTRATOR',leader:'UTRUST INCHARGE',officer:'EVALUATOR'};
  var navAdmin=[{id:'dash',icon:'\u2B21',label:'Dashboard'},{id:'vehicles',icon:'\uD83D\uDE97',label:'Procurement'},{id:'approval',icon:'\u2705',label:'Approvals',badge:pc},{id:'inventory',icon:'\uD83C\uDFAA',label:'Inventory'},{id:'sales',icon:'\uD83D\uDCB0',label:'Sales CRM',badge:lc,badgeCls:'acc'},{id:'projections',icon:'\uD83D\uDCCA',label:'Projections'},{id:'mis',icon:'\uD83D\uDCC8',label:'MIS & Reports'},{id:'users',icon:'\uD83D\uDC65',label:'Employees'}];
  var navLeader=[{id:'dash',icon:'\u2B21',label:'Dashboard'},{id:'vehicles',icon:'\uD83D\uDE97',label:'Procurement'},{id:'approval',icon:'\u2705',label:'Approvals',badge:pc},{id:'inventory',icon:'\uD83C\uDFAA',label:'Inventory'},{id:'sales',icon:'\uD83D\uDCB0',label:'Sales CRM',badge:lc,badgeCls:'acc'},{id:'projections',icon:'\uD83D\uDCCA',label:'Projections'},{id:'mis',icon:'\uD83D\uDCC8',label:'MIS'}];
  var navOfficer=[{id:'dash',icon:'\u2B21',label:'Dashboard'},{id:'vehicles',icon:'\uD83D\uDE97',label:'My Vehicles'},{id:'add',icon:'\u2795',label:'New Eval'},{id:'sales',icon:'\uD83D\uDCB0',label:'Sales'},{id:'projections',icon:'\uD83D\uDCCA',label:'Targets'}];
  var nav=user.role==='admin'?navAdmin:user.role==='leader'?navLeader:navOfficer;
  return h('div',{className:'sb'},
    h('div',{className:'sb-logo'},h('div',{className:'sb-icon'},'\uD83D\uDE97'),h('div',null,h('div',{className:'sb-name'},'Utrust'),h('div',{className:'sb-ver'},'CRM v2.0'))),
    h('div',{className:'sb-user'},h('div',{className:'av '+user.role},user.avatar),h('div',{style:{minWidth:0}},h('div',{className:'sb-uname'},user.name),h('div',{className:'sb-urole'},roleLabel[user.role]),h('div',{className:'sb-ubranch'},'\uD83D\uDCCD '+user.branch))),
    h('div',{className:'nav-area'},h('div',{className:'sb-sec'},'Navigation'),nav.map(function(n){return h('div',{key:n.id,className:'nav-it'+(page===n.id?' active':''),onClick:function(){p.setPage(n.id);}},h('span',{className:'nav-ic'},n.icon),h('span',{className:'nav-txt'},n.label),n.badge>0&&h('span',{className:'nav-bd'+(n.badgeCls?' '+n.badgeCls:'')},n.badge));})),
    h('div',{className:'sb-foot'},
      h('div',{className:'db-status'},h('div',{className:'db-dot pulse',style:{background:p.dbLive?'var(--grn)':'var(--tx3)'}}),p.saving?'Saving...':p.dbLive?'Cloud Connected':'Offline'),
      h('button',{className:'logout-btn',onClick:p.onLogout},h('span',null,'\u21D0'),h('span',null,'Sign Out'))
    )
  );
}

function Dashboard(p){
  var vs=p.vehicles,leads=p.leads,user=p.user;
  var mine=user.role==='officer'?vs.filter(function(v){return v.officerId===user.id;}):vs;
  var total=mine.length,appr=mine.filter(function(v){return v.status==='approved';}).length,pend=mine.filter(function(v){return v.status==='pending'||v.status==='review';}).length;
  var thisMonth=mine.filter(function(v){return v.submitted&&v.submitted.slice(0,7)===today().slice(0,7);});
  var myLeads=user.role==='officer'?leads.filter(function(l){return l.officerId===user.id;}):leads;
  var hotLeads=myLeads.filter(function(l){return l.stage==='hot';}).length;
  var wonLeads=myLeads.filter(function(l){return l.stage==='won';});
  var totalRevenue=wonLeads.reduce(function(a,l){return a+(l.sale_price||0);},0);
  var aging=vs.filter(function(v){return v.status==='approved'&&!v.sold&&daysAgo(v.submitted)>30;}).length;
  return h('div',null,
    h('div',{className:'sg'},[{l:'Evaluations',v:total,i:'\uD83D\uDE97',s:thisMonth.length+' this month',c:'var(--acc)'},{l:'Approved',v:appr,i:'\u2705',s:total?Math.round(appr/total*100)+'% rate':'',c:'var(--grn)'},{l:'Hot Leads',v:hotLeads,i:'\uD83D\uDD25',s:'In pipeline',c:'var(--red)'},{l:'Revenue',v:fmtL(totalRevenue),i:'\uD83D\uDCB0',s:wonLeads.length+' vehicles sold',c:'var(--blu)'}].map(function(s,i){return h('div',{key:i,className:'sc'},h('div',{className:'sc-lbl'},s.l),h('div',{className:'sc-val',style:{color:s.c}},s.v),h('div',{className:'sc-sub'},s.s),h('div',{className:'sc-ico'},s.i));})),
    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}},
      h('div',{className:'card'},h('div',{className:'card-hdr'},h('div',{className:'card-ttl'},'\u26A1 Quick Actions')),h('div',{style:{padding:'12px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},[{l:'New Inspection',pg:'add',icon:'\uD83D\uDCCB'},{l:'Add Lead',pg:'sales',icon:'\uD83D\uDC64'},{l:'View Approvals',pg:'approval',icon:'\u2705'},{l:'MIS Report',pg:'mis',icon:'\uD83D\uDCC8'}].map(function(a){return h('button',{key:a.l,style:{padding:'10px',background:'var(--sur2)',border:'1px solid var(--bdr)',borderRadius:'var(--r)',cursor:'pointer',textAlign:'left',transition:'all 0.15s',display:'flex',alignItems:'center',gap:8},onClick:function(){p.setPage(a.pg);}},h('span',{style:{fontSize:18}},a.icon),h('span',{style:{fontSize:11,fontWeight:600,color:'var(--txt)'}},a.l));}))),
      h('div',{className:'card'},h('div',{className:'card-hdr'},h('div',{className:'card-ttl'},'\uD83D\uDCCB Pending Actions')),h('div',{style:{padding:'12px'}},[{l:'Approvals pending',v:pend,c:'var(--red)',i:'\u23F3'},{l:'Hot leads to follow',v:hotLeads,c:'var(--acc)',i:'\uD83D\uDD25'},{l:'Aging inventory >30d',v:aging,c:'var(--pur)',i:'\u26A0\uFE0F'},{l:'Draft evaluations',v:mine.filter(function(v){return v.status==='draft';}).length,c:'var(--tx2)',i:'\uD83D\uDCDD'}].map(function(item){return h('div',{key:item.l,style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--bdr)',fontSize:12}},h('span',{style:{color:'var(--tx2)',display:'flex',alignItems:'center',gap:5}},item.i,' ',item.l),h('span',{style:{fontWeight:700,color:item.v>0?item.c:'var(--tx3)',fontFamily:'monospace'}},item.v));})))
    ),
    h('div',{style:{display:'grid',gridTemplateColumns:'3fr 2fr',gap:14}},
      h('div',{className:'card'},h('div',{className:'card-hdr'},h('div',{className:'card-ttl'},'\uD83D\uDE97 Recent Evaluations'),h('button',{className:'btn btn-ghost btn-sm',onClick:function(){p.setPage('vehicles');}},'View All \u2192')),h('div',{className:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Reg','Vehicle','Evaluator','Price','Status'].map(function(t){return h('th',{key:t},t);}))),h('tbody',null,mine.slice(0,6).map(function(v){return h('tr',{key:v.id},h('td',null,h('span',{style:{fontFamily:'monospace',color:'var(--acc)',fontSize:11}},v.reg)),h('td',null,h('b',{style:{fontSize:12}},v.brand+' '+v.model)),h('td',{style:{fontSize:11,color:'var(--tx2)'}},v.officer),h('td',{style:{fontFamily:'monospace',fontWeight:700,color:'var(--grn)',fontSize:11}},fmtL(v.price)),h('td',null,h(StatusBadge,{status:v.status})));}),[mine.length===0&&h('tr',{key:'empty'},h('td',{colSpan:5,style:{textAlign:'center',padding:30,color:'var(--tx3)'}},'No evaluations yet'))])))),
      h('div',{className:'card'},h('div',{className:'card-hdr'},h('div',{className:'card-ttl'},'\uD83D\uDCB0 Sales Pipeline')),h('div',{style:{padding:'12px'}},['new','hot','warm','cold','won','lost'].map(function(stage){var cnt=myLeads.filter(function(l){return l.stage===stage;}).length;var clr={new:'var(--tx2)',hot:'var(--red)',warm:'var(--acc)',cold:'var(--blu)',won:'var(--grn)',lost:'var(--tx3)'};return h('div',{key:stage,style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--bdr)',fontSize:12}},h('span',{style:{color:clr[stage],fontWeight:600,textTransform:'capitalize'}},stage==='new'?'\uD83C\uDD95 New':stage==='hot'?'\uD83D\uDD25 Hot':stage==='warm'?'\uD83D\uDFE1 Warm':stage==='cold'?'\uD83D\uDD35 Cold':stage==='won'?'\u2705 Won':'\u274C Lost'),h('span',{style:{fontWeight:700,fontFamily:'monospace'}},cnt));})))
    )
  );
}

function NewInspection(p){
  var user=p.user;
  var _step=useState(0);var step=_step[0];var setStep=_step[1];
  var _mBrand=useState('');var mBrand=_mBrand[0];var setMBrand=_mBrand[1];
  var _mModel=useState('');var mModel=_mModel[0];var setMModel=_mModel[1];
  var _mVariant=useState('');var mVariant=_mVariant[0];var setMVariant=_mVariant[1];
  var _mYear=useState('');var mYear=_mYear[0];var setMYear=_mYear[1];
  var _mTrans=useState('');var mTrans=_mTrans[0];var setMTrans=_mTrans[1];
  var blank={reg:'',seller_name:'',seller_phone:'',brand:'',model:'',variant:'',year:'',fuel:'',transmission:'',ownership:'1st',volume_cc:'',city:CITY_ADJ[user.branch]?user.branch:'Purnea',odometer:'',service_history:'Unknown',insurance_expired:false,insurance_valid_od:'',insurance_valid_tp:'',idv:'',purchase_value:'',claim_history:'None',engine:'',tyres:'',battery:'',electricals:'',exterior:'',interior:'',rating:7,challan_verified:null,challan_amount:'',challan_details:'',accidental:'',flood:'',customer_expectation:'',price:'',remarks:'',photos:{front:null,rear:null,left:null,right:null,interior1:null,interior2:null,engine:null,chassis:null,odometer_photo:null},docs:{rc:null,insurance:null,pollution:null,form29:null,form30:null,bank_noc:null,seller_id:null,address_proof:null,service_records:null,hypothecation:null},checklist:{both_keys:null,rc_received:null,insurance_copy:null,bank_noc:null,form29_30:null,seller_id:null,address_proof:null,service_records:null,hypothecation_proof:null}};
  var _d=useState(blank);var data=_d[0];var setData=_d[1];
  function set(k,v){setData(function(pr){return Object.assign({},pr,{[k]:v});});}
  function setPhoto(k,v){setData(function(pr){var p2=Object.assign({},pr.photos);p2[k]=v;return Object.assign({},pr,{photos:p2});});}
  function setDocVal(k,v){setData(function(pr){var d2=Object.assign({},pr.docs);d2[k]=v;return Object.assign({},pr,{docs:d2});});}
  function setCheck(k,v){setData(function(pr){var c2=Object.assign({},pr.checklist);c2[k]=v;return Object.assign({},pr,{checklist:c2});});}
  var brandList=Object.keys(BRANDS);
  var modelList=data.brand&&data.brand!=='Other'?(BRANDS[data.brand]||[]):[];
  var years=[2026,2025,2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010,'-- Enter Manually --'];
  var fBrand=data.brand==='Other'?mBrand:data.brand;
  var fModel=data.model==='-- Type Manually --'?mModel:data.model;
  var fVariant=data.variant==='-- Type Manually --'?mVariant:data.variant;
  var fYear=data.year==='-- Enter Manually --'?mYear:data.year;
  var fTrans=data.transmission==='-- Enter Manually --'?mTrans:data.transmission;
  var repairCost=calcRepairTotal({engine:data.engine,tyres:data.tyres,battery:data.battery,electricals:data.electricals,exterior:data.exterior,interior:data.interior});
  var algoParams=Object.assign({},data,{brand:fBrand||mBrand,model:fModel||mModel,year:fYear||data.year,transmission:fTrans||data.transmission,total_repair_cost:repairCost});
  var algo=calcAlgo(algoParams);
  var photoDone=['front','rear','left','right','interior1','interior2','engine','chassis'].filter(function(k){return !!data.photos[k];}).length;
  var iStyle={width:'100%',background:'var(--sur2)',border:'1px solid var(--bdr)',borderRadius:'var(--r)',padding:'9px 12px',color:'var(--txt)',fontSize:13,outline:'none',fontFamily:'inherit'};
  var stepNames=['Basic','Odometer','Photos','Docs','Insurance','Condition','Checklist','Pricing','Submit'];
  var checklistItems=[{k:'both_keys',l:'Both Keys Received',req:true},{k:'rc_received',l:'RC (Registration Certificate)',req:true},{k:'insurance_copy',l:'Valid Insurance Copy',req:true},{k:'bank_noc',l:'Bank NOC (if financed)',req:false},{k:'form29_30',l:'Form 29 & 30 / Transfer Docs',req:true},{k:'seller_id',l:'Seller ID Proof',req:true},{k:'address_proof',l:'Seller Address Proof',req:true},{k:'service_records',l:'Service Records',req:false},{k:'hypothecation_proof',l:'Hypothecation Closure Proof',req:false}];

  function handleSubmit(isDraft){
    if(!isDraft){
      if(!data.reg){p.showToast('Registration number required','error');return;}
      if(!fBrand&&!mBrand){p.showToast('Brand required','error');return;}
      if(!data.price||parseInt(data.price)<=0){p.showToast('Enter your estimated price','error');return;}
      if(!data.photos.odometer_photo){p.showToast('Odometer photo mandatory','error');return;}
    }
    var docsClean={};Object.keys(data.docs).forEach(function(k){var d=data.docs[k];docsClean[k]=d?{name:d.name,type:d.type}:null;});
    p.onSubmit(Object.assign({},data,{id:'V'+Date.now(),brand:fBrand||mBrand,model:fModel||mModel,variant:fVariant||mVariant||'',year:fYear||data.year,transmission:fTrans||data.transmission,odometer:parseInt(data.odometer)||0,price:parseInt(data.price)||0,algo_price:algo?algo.price:0,algo_min:algo?algo.min:0,algo_max:algo?algo.max:0,idv:parseInt(data.idv)||0,purchase_value:parseInt(data.purchase_value)||0,volume_cc:parseInt(data.volume_cc)||0,customer_expectation:parseInt(data.customer_expectation)||0,challan_amount:parseFloat(data.challan_amount)||0,total_repair_cost:repairCost,officer:user.name,officerId:user.id,branch:user.branch,docs:docsClean,status:isDraft?'draft':'pending',submitted:today(),sold:false}));
  }

  function renderStep(){
    if(step===0)return h('div',{className:'fcard'},
      h('div',{className:'fcard-ttl'},'\uD83D\uDE97 Vehicle & Seller Details'),h('div',{className:'fcard-sub'},'Registration, seller info, and vehicle basics'),
      h('div',{className:'fg'},
        h('div',{className:'field s2'},h('label',null,'Registration Number *'),h('input',{style:Object.assign({},iStyle,{fontFamily:'monospace',letterSpacing:'0.12em',fontSize:16}),value:data.reg,onChange:function(e){set('reg',e.target.value.toUpperCase());},placeholder:'e.g. BR04AB1234'})),
        h('div',{className:'field'},h('label',null,'Seller Name'),h('input',{style:iStyle,value:data.seller_name,onChange:function(e){set('seller_name',e.target.value);},placeholder:'Vehicle owner name'})),
        h('div',{className:'field'},h('label',null,'Seller Phone'),h('input',{style:iStyle,type:'tel',value:data.seller_phone||'',onChange:function(e){set('seller_phone',e.target.value);},placeholder:'10-digit mobile'})),
        h('div',{className:'field'},h('label',null,'City / Location'),h('select',{style:iStyle,value:data.city,onChange:function(e){set('city',e.target.value);}},CITIES.map(function(c){return h('option',{key:c},c);}))),
        h('div',{className:'field'},h('label',null,'Brand *'),h('select',{style:iStyle,value:data.brand,onChange:function(e){set('brand',e.target.value);set('model','');}},h('option',{value:''},'Select Brand'),brandList.map(function(b){return h('option',{key:b},b);})),data.brand==='Other'&&h('input',{style:Object.assign({},iStyle,{marginTop:6,borderColor:'var(--acc)'}),value:mBrand,onChange:function(e){setMBrand(e.target.value);},placeholder:'Type brand name...'})),
        h('div',{className:'field'},h('label',null,'Model *'),data.brand&&data.brand!=='Other'?h('div',null,h('select',{style:iStyle,value:data.model,onChange:function(e){set('model',e.target.value);}},h('option',{value:''},'Select Model'),modelList.map(function(m){return h('option',{key:m},m);}),h('option',{value:'-- Type Manually --'},'-- Type --')),data.model==='-- Type Manually --'&&h('input',{style:Object.assign({},iStyle,{marginTop:6,borderColor:'var(--acc)'}),value:mModel,onChange:function(e){setMModel(e.target.value);},placeholder:'Model name...'})):h('input',{style:iStyle,value:mModel,onChange:function(e){setMModel(e.target.value);},placeholder:'Type model...'})),
        h('div',{className:'field'},h('label',null,'Variant'),h('input',{style:iStyle,value:mVariant,onChange:function(e){setMVariant(e.target.value);},placeholder:'e.g. ZXI, SX, XT+'})),
        h('div',{className:'field'},h('label',null,'Year *'),h('select',{style:iStyle,value:data.year,onChange:function(e){set('year',e.target.value);}},h('option',{value:''},'Select Year'),years.map(function(y){return h('option',{key:y},y);})),data.year==='-- Enter Manually --'&&h('input',{style:Object.assign({},iStyle,{marginTop:6,borderColor:'var(--acc)',fontFamily:'monospace'}),value:mYear,onChange:function(e){setMYear(e.target.value);},placeholder:'e.g. 2017'})),
        h('div',{className:'field'},h('label',null,'Fuel Type *'),h('select',{style:iStyle,value:data.fuel,onChange:function(e){set('fuel',e.target.value);}},h('option',{value:''},'Select'),['Petrol','Diesel','CNG','Electric','Hybrid','LPG'].map(function(f){return h('option',{key:f},f);}))),
        h('div',{className:'field'},h('label',null,'Transmission'),h('select',{style:iStyle,value:data.transmission,onChange:function(e){set('transmission',e.target.value);}},h('option',{value:''},'Select'),['Manual','Automatic','CVT','AMT','DCT','iMT','-- Enter Manually --'].map(function(t){return h('option',{key:t},t);})),data.transmission==='-- Enter Manually --'&&h('input',{style:Object.assign({},iStyle,{marginTop:6}),value:mTrans,onChange:function(e){setMTrans(e.target.value);},placeholder:'Type transmission...'})),
        h('div',{className:'field'},h('label',null,'Ownership'),h('select',{style:iStyle,value:data.ownership,onChange:function(e){set('ownership',e.target.value);}},['1st','2nd','3rd','4th+'].map(function(o){return h('option',{key:o},o);}))),
        h('div',{className:'field'},h('label',null,'Engine Volume (cc)'),h('input',{style:Object.assign({},iStyle,{fontFamily:'monospace'}),type:'number',value:data.volume_cc,onChange:function(e){set('volume_cc',e.target.value);},placeholder:'e.g. 1197'})),
        h('div',{className:'field'},h('label',null,'Service History'),h('select',{style:iStyle,value:data.service_history,onChange:function(e){set('service_history',e.target.value);}},['Full records','Partial','Unknown','No records'].map(function(s){return h('option',{key:s},s);})))
      )
    );
    if(step===1)return h('div',{className:'fcard'},
      h('div',{className:'fcard-ttl'},'\uD83D\uDCCD Odometer Reading'),h('div',{className:'fcard-sub'},'Enter reading + capture photo — GPS & timestamp auto-stamped'),
      h('div',{className:'field',style:{marginBottom:16}},h('label',null,'Odometer Reading (km) *'),h('input',{style:Object.assign({},iStyle,{fontFamily:'monospace',fontSize:22,padding:'13px'}),type:'number',value:data.odometer,onChange:function(e){set('odometer',e.target.value);},placeholder:'e.g. 42000'})),
      h(CameraCapture,{label:'Odometer Photo (mandatory)',onCapture:function(v){setPhoto('odometer_photo',v);},captured:data.photos.odometer_photo})
    );
    if(step===2)return h('div',{className:'fcard'},
      h('div',{className:'fcard-ttl'},'\uD83D\uDCF7 Inspection Photos'),h('div',{className:'fcard-sub'},photoDone+'/8 captured \u2014 GPS auto-tagged'),
      h('div',{style:{fontSize:9,fontWeight:700,color:'var(--tx3)',marginBottom:8,letterSpacing:'0.08em',textTransform:'uppercase'}},'Exterior'),
      h('div',{className:'cam-grid',style:{marginBottom:14}},[['front','Front View'],['rear','Rear View'],['left','Left Side'],['right','Right Side']].map(function(pr){return h(CameraCapture,{key:pr[0],label:pr[1],onCapture:function(v){setPhoto(pr[0],v);},captured:data.photos[pr[0]]});})),
      h('div',{style:{fontSize:9,fontWeight:700,color:'var(--tx3)',marginBottom:8,letterSpacing:'0.08em',textTransform:'uppercase'}},'Interior & Under Hood'),
      h('div',{className:'cam-grid',style:{marginBottom:14}},h(CameraCapture,{label:'Dashboard',onCapture:function(v){setPhoto('interior1',v);},captured:data.photos.interior1}),h(CameraCapture,{label:'Rear Seats',onCapture:function(v){setPhoto('interior2',v);},captured:data.photos.interior2}),h(CameraCapture,{label:'Engine Bay',onCapture:function(v){setPhoto('engine',v);},captured:data.photos.engine}),h(CameraCapture,{label:'Chassis/VIN',onCapture:function(v){setPhoto('chassis',v);},captured:data.photos.chassis})),
      h('div',{className:'field'},h('label',null,'Remarks / Damage Notes'),h('textarea',{rows:3,style:Object.assign({},iStyle,{resize:'vertical'}),value:data.remarks,onChange:function(e){set('remarks',e.target.value);},placeholder:'Scratches, dents, modifications...'}))
    );
    if(step===3)return h('div',{className:'fcard'},
      h('div',{className:'fcard-ttl'},'\uD83D\uDCCB Documents'),h('div',{className:'fcard-sub'},'Upload copies of all available documents'),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}},[['rc','\uD83D\uDCC4','RC Certificate *'],['insurance','\uD83D\uDEE1','Insurance *'],['pollution','\uD83C\uDF3F','PUC Certificate'],['form29','\uD83D\uDCDD','Form 29'],['form30','\uD83D\uDCDD','Form 30'],['bank_noc','\uD83C\uDFE6','Bank NOC'],['seller_id','\uD83E\uDEAA','Seller ID Proof'],['address_proof','\uD83C\uDFE0','Address Proof'],['service_records','\uD83D\uDD27','Service Records'],['hypothecation','\uD83D\uDCCC','Hypothecation Closure']].map(function(item){
        var k=item[0];var val=data.docs[k];
        return h('div',{key:k},
          h('input',{type:'file',id:'doc-'+k,accept:'image/*,application/pdf',style:{display:'none'},onChange:function(e){var file=e.target.files[0];if(!file)return;var r=new FileReader();r.onload=function(ev){setDocVal(k,{name:file.name,type:file.type,data:ev.target.result});};r.readAsDataURL(file);}}),
          h('div',{className:'upzone'+(val?' done':''),onClick:function(){document.getElementById('doc-'+k).click();}},h('div',{style:{fontSize:18,marginBottom:4}},val?'\u2705':item[1]),h('div',{style:{fontSize:11,fontWeight:600,color:'var(--tx2)'}},val?'Uploaded':'Tap to Upload'),h('div',{style:{fontSize:9,color:'var(--tx3)',marginTop:2,wordBreak:'break-all'}},val?val.name:item[2])),
          val&&h('button',{className:'btn btn-danger btn-sm',style:{width:'100%',marginTop:3},onClick:function(){setDocVal(k,null);}},'\u2715 Remove')
        );
      }))
    );
    if(step===4)return h('div',{className:'fcard'},
      h('div',{className:'fcard-ttl'},'\uD83D\uDEE1 Insurance & IDV'),h('div',{className:'fcard-sub'},'IDV is the base for the valuation algorithm'),
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 13px',background:data.insurance_expired?'var(--rdim)':'var(--sur2)',border:'1px solid '+(data.insurance_expired?'rgba(239,68,68,0.3)':'var(--bdr)'),borderRadius:'var(--r)',marginBottom:12}},
        h('div',null,h('div',{style:{fontSize:12,fontWeight:600}},'Insurance Expired / Not Available'),h('div',{style:{fontSize:10,color:'var(--tx3)',marginTop:1}},'Switches to purchase-value pricing')),
        h('div',{style:{display:'flex',gap:6}},h('button',{className:'ck-btn'+((!data.insurance_expired)?' good':''),onClick:function(){set('insurance_expired',false);}},'Active'),h('button',{className:'ck-btn'+(data.insurance_expired?' bad':''),onClick:function(){set('insurance_expired',true);}},'Expired'))
      ),
      !data.insurance_expired&&h('div',{className:'fg',style:{marginBottom:12}},h('div',{className:'field',style:{marginBottom:0}},h('label',null,'OD Valid Until'),h('input',{style:iStyle,type:'date',value:data.insurance_valid_od,onChange:function(e){set('insurance_valid_od',e.target.value);}})),h('div',{className:'field',style:{marginBottom:0}},h('label',null,'TP Valid Until'),h('input',{style:iStyle,type:'date',value:data.insurance_valid_tp,onChange:function(e){set('insurance_valid_tp',e.target.value);}}))),
      h('div',{className:'fg'},
        !data.insurance_expired?h('div',{className:'field'},h('label',null,'IDV (\u20B9) *'),h('input',{style:Object.assign({},iStyle,{fontFamily:'monospace',fontSize:16}),type:'number',value:data.idv,onChange:function(e){set('idv',e.target.value);},placeholder:'Insured Declared Value'})):h('div',{className:'field s2'},h('label',null,'Original Purchase Value (\u20B9) *'),h('input',{style:Object.assign({},iStyle,{fontFamily:'monospace',fontSize:16}),type:'number',value:data.purchase_value,onChange:function(e){set('purchase_value',e.target.value);},placeholder:'e.g. 900000'})),
        h('div',{className:'field'},h('label',null,'Claim History'),h('select',{style:iStyle,value:data.claim_history,onChange:function(e){set('claim_history',e.target.value);}},['None','1 Minor','1 Major','2+ Claims','Unknown'].map(function(c){return h('option',{key:c},c);})))
      )
    );
    if(step===5){
      var condItems=[{lbl:'Engine Condition',k:'engine',opts:['Excellent','Good','Fair','Poor'],goodOpts:['Excellent','Good'],badOpts:['Poor']},{lbl:'Tyres',k:'tyres',opts:['Excellent','Good','Fair','Worn'],goodOpts:['Excellent','Good'],badOpts:['Worn']},{lbl:'Battery',k:'battery',opts:['Excellent','Good','Weak','Dead'],goodOpts:['Excellent','Good'],badOpts:['Dead']},{lbl:'Electricals',k:'electricals',opts:['Excellent','Good','Issues','Dead'],goodOpts:['Excellent','Good'],badOpts:['Dead']},{lbl:'Exterior Body',k:'exterior',opts:['Excellent','Good','Fair','Poor'],goodOpts:['Excellent','Good'],badOpts:['Poor']},{lbl:'Interior',k:'interior',opts:['Excellent','Good','Fair','Poor'],goodOpts:['Excellent','Good'],badOpts:['Poor']}];
      return h('div',{className:'fcard'},
        h('div',{className:'fcard-ttl'},'\uD83D\uDD0D Condition Assessment & Repair Estimate'),h('div',{className:'fcard-sub'},'Rate each component \u2014 repair cost auto-calculated'),
        condItems.map(function(c){
          var rc=data[c.k]&&REPAIR_COSTS[c.k]&&REPAIR_COSTS[c.k][data[c.k]]?REPAIR_COSTS[c.k][data[c.k]]:null;
          return h('div',{key:c.k,className:'ck-item'},
            h('div',{style:{flex:1}},h('span',{className:'ck-lbl'},c.lbl),rc&&rc.cost>0&&h('div',{style:{fontSize:9,color:'var(--red)',fontFamily:'monospace',marginTop:2}},'Est. repair: \u20B9'+rc.cost.toLocaleString('en-IN')+' \u2014 '+rc.label)),
            h('div',{className:'ck-btns'},c.opts.map(function(o){var isGood=c.goodOpts.includes(o);var isBad=c.badOpts.includes(o);var cls=data[c.k]===o?(isGood?'good':isBad?'bad':'warn'):'';return h('button',{key:o,className:'ck-btn '+cls,onClick:function(){set(c.k,o);}},o);}))
          );
        }),
        [{lbl:'Accidental History',k:'accidental'},{lbl:'Flood Damage',k:'flood'}].map(function(c){return h('div',{key:c.k,className:'ck-item'},h('span',{className:'ck-lbl'},c.lbl),h('div',{className:'ck-btns'},['Yes','No','Unknown'].map(function(o){var cls=data[c.k]===o?(o==='No'?'good':o==='Yes'?'bad':'warn'):'';return h('button',{key:o,className:'ck-btn '+cls,onClick:function(){set(c.k,o);}},o);})));}),
        h('div',{style:{marginTop:14}}),
        h('div',{style:{fontSize:9,fontWeight:700,color:'var(--tx3)',marginBottom:8,letterSpacing:'0.08em',textTransform:'uppercase'}},'Overall Rating (1\u201310)'),
        h('div',{className:'rating'},[1,2,3,4,5,6,7,8,9,10].map(function(n){return h('button',{key:n,className:'r-btn'+(data.rating===n?' sel':''),onClick:function(){set('rating',n);}},n);})),
        h('div',{style:{marginTop:14,background:'var(--rdim)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'var(--r2)',padding:'14px'}},
          h('div',{style:{fontSize:13,fontWeight:700,marginBottom:8}},'\uD83D\uDE94 Pending Traffic Challans'),
          h('div',{style:{display:'flex',gap:6,marginBottom:10}},h('button',{className:'ck-btn'+(data.challan_verified===false?' good':''),onClick:function(){set('challan_verified',false);set('challan_amount','');}},'No Challans'),h('button',{className:'ck-btn'+(data.challan_verified===true?' bad':''),onClick:function(){set('challan_verified',true);}},'Has Challans'),h('button',{className:'ck-btn'+(data.challan_verified===null?' warn':''),onClick:function(){set('challan_verified',null);}},'Not Checked')),
          data.challan_verified===true&&h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},h('div',{className:'field',style:{marginBottom:0}},h('label',null,'Challan Amount (\u20B9)'),h('input',{style:iStyle,type:'number',value:data.challan_amount,onChange:function(e){set('challan_amount',e.target.value);},placeholder:'e.g. 5000'})),h('div',{className:'field',style:{marginBottom:0}},h('label',null,'Details'),h('input',{style:iStyle,value:data.challan_details,onChange:function(e){set('challan_details',e.target.value);},placeholder:'Speed, red light...'}))),
          data.challan_verified===null&&h('div',{style:{fontSize:10,color:'var(--acc)',padding:'5px 8px',background:'var(--adim)',borderRadius:'var(--r)'}},'Verify on Parivahan.gov.in')
        ),
        repairCost>0&&h('div',{style:{marginTop:12,background:'var(--sur3)',border:'1px solid var(--bdr2)',borderRadius:'var(--r)',padding:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}},h('div',null,h('div',{style:{fontSize:10,color:'var(--tx3)',fontFamily:'monospace',marginBottom:2}},'ESTIMATED TOTAL REPAIR COST'),h('div',{style:{fontSize:9,color:'var(--tx3)'}},'Deducted from purchase price')),h('div',{style:{fontSize:18,fontWeight:800,color:'var(--red)',fontFamily:'monospace'}},'\u20B9'+repairCost.toLocaleString('en-IN')))
      );
    }
    if(step===6){
      var criticalMissing=checklistItems.filter(function(item){return item.req&&data.checklist[item.k]!=='received';}).length;
      return h('div',{className:'fcard'},
        h('div',{className:'fcard-ttl'},'\u2705 Procurement Checklist'),h('div',{className:'fcard-sub'},'Mark each item \u2014 required items must be received before deal closure'),
        criticalMissing>0&&h('div',{style:{background:'var(--rdim)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'var(--r)',padding:'9px 12px',fontSize:11,color:'var(--red)',marginBottom:12}},'\u26A0 '+criticalMissing+' critical item(s) not yet received \u2014 deal cannot be closed.'),
        checklistItems.map(function(item){
          var v=data.checklist[item.k];
          return h('div',{key:item.k,className:'ck-item'},
            h('div',{style:{flex:1}},h('span',{className:'ck-lbl'},item.l),item.req&&h('span',{className:'ck-req'},'*REQUIRED')),
            h('div',{className:'ck-btns'},['received','pending','na'].map(function(opt){var cls=v===opt?(opt==='received'?'good':opt==='pending'?'warn':''):'';var lbl=opt==='received'?'\u2713 Got':opt==='pending'?'\u23F3 Pending':'N/A';return h('button',{key:opt,className:'ck-btn '+cls,onClick:function(){setCheck(item.k,opt);}},lbl);}))
          );
        })
      );
    }
    if(step===7){
      var priceDiff=data.price&&algo?((parseInt(data.price)-algo.price)/algo.price*100):null;
      return h('div',{className:'fcard'},
        h('div',{className:'fcard-ttl'},'\uD83D\uDCB0 Price Estimate'),h('div',{className:'fcard-sub'},'Your estimate first \u2014 then see algorithm comparison'),
        h('div',{style:{background:'var(--sur2)',border:'1px solid var(--bdr)',borderRadius:'var(--r2)',padding:'13px',marginBottom:13}},
          h('div',{style:{fontSize:9,fontWeight:700,color:'var(--tx3)',marginBottom:7,letterSpacing:'0.08em',textTransform:'uppercase'}},"Seller's Expected Price"),
          h('input',{style:Object.assign({},iStyle,{fontFamily:'monospace',fontSize:17}),type:'number',value:data.customer_expectation,onChange:function(e){set('customer_expectation',e.target.value);},placeholder:'What is seller asking?'}),
          data.customer_expectation&&h('div',{style:{fontSize:12,color:'var(--pur)',fontFamily:'monospace',fontWeight:600,marginTop:5}},'Seller expects: '+fmtL(data.customer_expectation))
        ),
        h('div',{style:{background:'var(--sur2)',border:'2px solid var(--acc)',borderRadius:'var(--r2)',padding:'16px',marginBottom:16}},
          h('div',{style:{fontSize:9,fontWeight:700,color:'var(--acc)',marginBottom:9,letterSpacing:'0.08em',textTransform:'uppercase'}},'Your Estimated Purchase Price *'),
          h('input',{style:Object.assign({},iStyle,{fontFamily:'monospace',fontSize:21,padding:'12px'}),type:'number',value:data.price,onChange:function(e){set('price',e.target.value);},placeholder:'Your valuation in \u20B9'}),
          data.price&&h('div',{style:{marginTop:7,fontSize:13,fontWeight:700,color:'var(--grn)',fontFamily:'monospace'}},'= '+fmtL(data.price))
        ),
        data.price&&algo&&h('div',null,
          h('div',{className:'price-band'},h('div',{className:'pb-card pb-min'},h('div',{className:'pb-lbl'},'MINIMUM'),h('div',{className:'pb-val'},fmtL(algo.min)),h('div',{className:'pb-sub'},'Floor price')),h('div',{className:'pb-card pb-ideal'},h('div',{className:'pb-lbl'},'IDEAL PRICE'),h('div',{className:'pb-val'},fmtL(algo.price)),h('div',{className:'pb-sub'},'Recommended')),h('div',{className:'pb-card pb-max'},h('div',{className:'pb-lbl'},'MAXIMUM'),h('div',{className:'pb-val'},fmtL(algo.max)),h('div',{className:'pb-sub'},'Resale potential'))),
          h('div',{className:'algo-box'},
            h('div',{style:{fontSize:13,fontWeight:700,marginBottom:3}},'\uD83E\uDDEE Algorithm Breakdown'),
            h('div',{style:{fontSize:10,color:'var(--tx3)',marginBottom:12}},'Incl. depreciation, city factor, repair cost, challans'),
            algo.steps.map(function(s,i){return h('div',{key:i,className:'algo-row'},h('span',{className:'algo-key'},s.label),h('span',{className:'algo-val',style:{color:s.type==='result'?'var(--acc)':s.type==='minus'?'var(--red)':'var(--grn)'}},s.type==='base'?fmt(s.val):s.type==='result'?fmtL(s.val):(s.val>=0?'+':'')+fmt(s.val)));}),
            h('div',{style:{marginTop:10,padding:'10px',background:'var(--sur2)',borderRadius:'var(--r)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},h('div',{style:{textAlign:'center'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:3}},'YOUR ESTIMATE'),h('div',{style:{fontSize:18,fontWeight:800,color:'var(--grn)'}},fmtL(data.price))),h('div',{style:{textAlign:'center'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:3}},'ALGORITHM'),h('div',{style:{fontSize:18,fontWeight:800,color:'var(--acc)'}},fmtL(algo.price)))),
            priceDiff!==null&&h('div',{style:{marginTop:7,textAlign:'center',fontSize:11,fontWeight:600,color:Math.abs(priceDiff)<=5?'var(--grn)':Math.abs(priceDiff)<=15?'var(--acc)':'var(--red)'}},Math.abs(priceDiff)<=5?'\u2713 Very close to algorithm':'\u26A1 '+Math.round(Math.abs(priceDiff))+'% '+(priceDiff>0?'above':'below')+' algorithm')
          )
        )
      );
    }
    if(step===8){
      var reviewItems=[['Reg',data.reg||'\u2014'],['Seller',data.seller_name||'\u2014'],['City',data.city||'\u2014'],['Vehicle',(fBrand||mBrand)+' '+(fModel||mModel)],['Year',fYear||data.year||'\u2014'],['Fuel',data.fuel||'\u2014'],['Volume',data.volume_cc?data.volume_cc+'cc':'\u2014'],['Odometer',data.odometer?parseInt(data.odometer).toLocaleString('en-IN')+' km':'\u2014'],['Photos',photoDone+'/8'],['Repair Est.','\u20B9'+(repairCost||0).toLocaleString('en-IN')],['Challans',data.challan_verified===true?'\u26A0 \u20B9'+(data.challan_amount||0):data.challan_verified===false?'None':'?'],['Seller Expects',data.customer_expectation?fmtL(data.customer_expectation):'\u2014'],['Your Price',fmtL(data.price)]];
      return h('div',{className:'fcard'},
        h('div',{className:'fcard-ttl'},'\u2705 Review & Submit'),h('div',{className:'fcard-sub'},'Confirm all details before sending for approval'),
        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}},reviewItems.map(function(item){var isWarn=String(item[1]).startsWith('\u26A0');return h('div',{key:item[0],style:{padding:'8px 10px',background:'var(--sur2)',borderRadius:'var(--r)',border:'1px solid var(--bdr)'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',letterSpacing:'0.07em',textTransform:'uppercase'}},item[0]),h('div',{style:{fontSize:11,fontWeight:600,marginTop:2,color:isWarn?'var(--red)':'var(--txt)',wordBreak:'break-word'}},item[1]));})),
        h('div',{style:{background:'var(--adim)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:'var(--r)',padding:'9px 12px',fontSize:11,color:'var(--acc)'}},' Submits to Utrust Incharge for review & final price approval.')
      );
    }
    return null;
  }
  return h('div',{style:{maxWidth:860}},
    h('div',{className:'steps'},stepNames.map(function(name,i){return h('div',{key:i,className:'step'+(i===step?' active':i<step?' done':''),onClick:function(){if(i<step)setStep(i);}},h('span',{className:'step-n'},i<step?'\u2713':i+1),name);})),
    renderStep(),
    h('div',{style:{display:'flex',justifyContent:'space-between',gap:8,marginTop:8}},
      h('button',{className:'btn btn-ghost',onClick:function(){step===0?p.onCancel():setStep(step-1);}},step===0?'Cancel':'\u2190 Back'),
      h('div',{style:{display:'flex',gap:7}},
        h('button',{className:'btn btn-ghost',onClick:function(){handleSubmit(true);}},'\uD83D\uDCBE Draft'),
        step<8?h('button',{className:'btn btn-acc',onClick:function(){setStep(step+1);}},'Next \u2192'):h('button',{className:'btn btn-acc btn-lg',onClick:function(){handleSubmit(false);}},'\uD83D\uDE80 Submit')
      )
    )
  );
}

function VehiclesList(p){
  var vs=p.vehicles,user=p.user;
  var _s=useState('');var search=_s[0];var setSearch=_s[1];
  var _f=useState('all');var filter=_f[0];var setFilter=_f[1];
  var _b=useState('all');var branch=_b[0];var setBranch=_b[1];
  var mine=user.role==='officer'?vs.filter(function(v){return v.officerId===user.id;}):vs;
  var filtered=mine.filter(function(v){var q=search.toLowerCase();var ms=!q||(v.reg||'').toLowerCase().includes(q)||(v.brand||'').toLowerCase().includes(q)||(v.seller_name||'').toLowerCase().includes(q);var mf=filter==='all'||v.status===filter;var mb=branch==='all'||v.branch===branch;return ms&&mf&&mb;});
  return h('div',null,
    h('div',{style:{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap',alignItems:'center'}},
      h('div',{className:'search-bar',style:{flex:1,minWidth:160}},h('span',null,'\uD83D\uDD0D'),h('input',{placeholder:'Search reg, vehicle, seller...',value:search,onChange:function(e){setSearch(e.target.value);}})),
      user.role!=='officer'&&h('select',{value:branch,onChange:function(e){setBranch(e.target.value);},className:'inp',style:{width:'auto',padding:'7px 10px'}},h('option',{value:'all'},'All Branches'),BRANCHES.map(function(b){return h('option',{key:b},b);})),
      h('div',{style:{display:'flex',gap:3,flexWrap:'wrap'}},['all','pending','approved','rejected','draft'].map(function(f){return h('button',{key:f,className:'btn btn-sm '+(filter===f?'btn-acc':'btn-ghost'),onClick:function(){setFilter(f);},style:{textTransform:'uppercase',fontSize:9}},f);})),
      h('button',{className:'btn btn-acc btn-sm',onClick:p.onAddNew},'\u2795 New')
    ),
    h('div',{className:'card'},
      h('div',{className:'card-hdr'},h('div',{className:'card-ttl'},'Vehicle Evaluations ',h('span',{style:{color:'var(--tx3)',fontWeight:400,fontSize:10,fontFamily:'monospace'}},'('+filtered.length+')'))),
      h('div',{className:'tbl-wrap'},h('table',null,
        h('thead',null,h('tr',null,['Reg','Vehicle','Year','Odo','Repair Est.','Branch','Price','Status','Action'].map(function(t){return h('th',{key:t},t);}))),
        h('tbody',null,
          filtered.length===0&&h('tr',null,h('td',{colSpan:9,style:{textAlign:'center',padding:36,color:'var(--tx3)'}},'No records found')),
          filtered.map(function(v){return h('tr',{key:v.id},h('td',null,h('span',{style:{fontFamily:'monospace',color:'var(--acc)',fontSize:11}},v.reg)),h('td',null,h('b',{style:{fontSize:12}},v.brand+' '+v.model),h('br'),h('span',{style:{fontSize:9,color:'var(--tx3)'}},v.variant||'')),h('td',{style:{color:'var(--tx2)'}},v.year),h('td',{style:{fontFamily:'monospace',fontSize:11}},(v.odometer||0).toLocaleString('en-IN')),h('td',{style:{fontFamily:'monospace',fontSize:11,color:v.total_repair_cost>0?'var(--red)':'var(--tx3)'}},v.total_repair_cost>0?'\u20B9'+v.total_repair_cost.toLocaleString('en-IN'):'\u2014'),h('td',null,h('span',{className:'btag'},v.branch)),h('td',{style:{fontFamily:'monospace',fontWeight:700,color:'var(--grn)',fontSize:11}},fmtL(v.price)),h('td',null,h(StatusBadge,{status:v.status})),h('td',null,h('div',{style:{display:'flex',gap:3}},h('button',{className:'btn btn-ghost btn-sm',onClick:function(){p.setSelectedVehicle(v);p.setPage('detail');}},'View'),user.role==='admin'&&h('button',{className:'btn btn-danger btn-sm',onClick:function(){p.onDelete(v.id);}},'\uD83D\uDDD1'))));})
        )
      ))
    )
  );
}

function Approvals(p){
  var vs=p.vehicles;
  var pending=vs.filter(function(v){return v.status==='pending'||v.status==='review';});
  var _c=useState('');var comment=_c[0];var setComment=_c[1];
  var _pr=useState('');var price=_pr[0];var setPrice=_pr[1];
  var _a=useState(null);var active=_a[0];var setActive=_a[1];
  var _ac=useState(null);var action=_ac[0];var setAction=_ac[1];
  return h('div',null,
    h('div',{style:{marginBottom:12,color:'var(--tx3)',fontSize:12}},pending.length+' awaiting review'),
    pending.length===0&&h('div',{style:{textAlign:'center',padding:50,color:'var(--tx3)'}},h('div',{style:{fontSize:40,marginBottom:12}},'\u2705'),h('div',{style:{fontSize:15,fontWeight:700,color:'var(--tx2)'}},'All caught up!')),
    pending.map(function(v){
      var algo=calcAlgo(Object.assign({},v,{total_repair_cost:v.total_repair_cost||0}));
      var critDocs=v.checklist?Object.entries(v.checklist).filter(function(e){return ['both_keys','rc_received','insurance_copy','form29_30','seller_id','address_proof'].includes(e[0])&&e[1]!=='received';}).length:0;
      return h('div',{key:v.id,className:'card',style:{padding:14,marginBottom:10}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:9}},
          h('div',{style:{flex:1,minWidth:200}},
            h('div',{style:{fontFamily:'monospace',color:'var(--acc)',fontSize:11,marginBottom:2}},v.reg+' \u00B7 '+v.branch),
            h('div',{style:{fontSize:14,fontWeight:700,marginBottom:6}},v.brand+' '+v.model+' '+v.variant,' ',h('span',{style:{color:'var(--tx3)',fontWeight:400,fontSize:12}},v.year)),
            h('div',{style:{display:'flex',gap:4,flexWrap:'wrap',marginBottom:7}},[v.fuel,v.transmission,(v.odometer||0).toLocaleString('en-IN')+' km',v.ownership+' Owner','\u2605 '+v.rating+'/10'].map(function(t,i){return h('span',{key:i,style:{padding:'2px 6px',borderRadius:3,background:'var(--sur2)',border:'1px solid var(--bdr)',fontSize:9,color:'var(--tx3)',fontFamily:'monospace'}},t);}),v.accidental==='Yes'&&h('span',{style:{padding:'2px 6px',borderRadius:3,background:'var(--rdim)',border:'1px solid rgba(239,68,68,0.3)',fontSize:9,color:'var(--red)',fontFamily:'monospace'}},'\u26A0 Accidental'),v.challan_verified&&v.challan_amount>0&&h('span',{style:{padding:'2px 6px',borderRadius:3,background:'var(--rdim)',border:'1px solid rgba(239,68,68,0.3)',fontSize:9,color:'var(--red)',fontFamily:'monospace'}},'\uD83D\uDE94 Challan \u20B9'+Number(v.challan_amount).toLocaleString('en-IN'))),
            critDocs>0&&h('div',{style:{background:'var(--rdim)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'var(--r)',padding:'5px 9px',fontSize:10,color:'var(--red)',marginBottom:7}},'\u26A0 '+critDocs+' required doc(s) not received'),
            h('div',{style:{display:'flex',gap:14,alignItems:'baseline',flexWrap:'wrap'}},
              h('div',null,h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:1}},'EVALUATOR'),h('div',{style:{fontSize:16,fontWeight:800,color:'var(--grn)'}},fmtL(v.price))),
              algo&&h('div',null,h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:1}},'ALGORITHM'),h('div',{style:{fontSize:14,fontWeight:700,color:'var(--acc)'}},fmtL(algo.price))),
              v.customer_expectation>0&&h('div',null,h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:1}},'SELLER ASKS'),h('div',{style:{fontSize:14,fontWeight:700,color:'var(--pur)'}},fmtL(v.customer_expectation))),
              v.total_repair_cost>0&&h('div',null,h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:1}},'REPAIR EST.'),h('div',{style:{fontSize:14,fontWeight:700,color:'var(--red)'}},fmtL(v.total_repair_cost)))
            ),
            h('div',{style:{fontSize:9,color:'var(--tx3)',marginTop:4}},'By '+v.officer+' on '+v.submitted+(v.seller_name?' \u00B7 Seller: '+v.seller_name:''))
          ),
          h('div',{style:{display:'flex',flexDirection:'column',gap:6}},
            h('button',{className:'btn btn-ghost btn-sm',onClick:function(){p.setSelectedVehicle(v);p.setPage('detail');}},'\uD83D\uDC41 Details'),
            h('button',{className:'btn btn-success btn-sm',onClick:function(){setActive(v);setAction('approve');}},'\u2713 Approve'),
            h('button',{className:'btn btn-danger btn-sm',onClick:function(){setActive(v);setAction('reject');}},'\u2717 Reject')
          )
        )
      );
    }),
    active&&h(Modal,{title:action==='approve'?'Approve & Set Price':'Reject',sub:active.brand+' '+active.model+' \u2014 '+active.reg,onClose:function(){setActive(null);}},
      action==='approve'&&h('div',null,
        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,padding:'10px',background:'var(--sur2)',borderRadius:'var(--r)',marginBottom:12}},h('div',{style:{textAlign:'center'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:2}},'EVALUATOR'),h('div',{style:{fontSize:15,fontWeight:800,color:'var(--acc)'}},fmtL(active.price))),h('div',{style:{textAlign:'center'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:2}},'ALGORITHM'),h('div',{style:{fontSize:15,fontWeight:700,color:'var(--tx2)'}},active.algo_price?fmtL(active.algo_price):'\u2014')),h('div',{style:{textAlign:'center'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:2}},'SELLER ASKS'),h('div',{style:{fontSize:15,fontWeight:700,color:'var(--pur)'}},active.customer_expectation?fmtL(active.customer_expectation):'\u2014'))),
        h('div',{className:'field'},h('label',null,'Final Approved Price (\u20B9) *'),h('input',{className:'inp',type:'number',value:price,onChange:function(e){setPrice(e.target.value);},placeholder:'e.g. '+active.price,style:{fontFamily:'monospace',fontSize:17}}),price&&h('div',{style:{fontSize:10,color:'var(--grn)',marginTop:3}},'= '+fmtL(price)))
      ),
      h('div',{className:'field'},h('label',null,'Comments'),h('textarea',{className:'inp',rows:2,value:comment,onChange:function(e){setComment(e.target.value);},placeholder:action==='approve'?'Notes...':'Reason for rejection...'})),
      h('div',{className:'modal-acts'},h('button',{className:'btn btn-ghost',onClick:function(){setActive(null);}},'Cancel'),h('button',{className:'btn '+(action==='approve'?'btn-success':'btn-danger'),onClick:function(){if(action==='approve')p.onApprove(active.id,comment,parseInt(price)||active.price);else p.onReject(active.id,comment);setActive(null);setComment('');setPrice('');}},action==='approve'?'\u2713 Confirm':'\u2717 Reject'))
    )
  );
}

function Inventory(p){
  var vs=p.vehicles;
  var _s=useState('');var search=_s[0];var setSearch=_s[1];
  var inStock=vs.filter(function(v){return v.status==='approved'&&!v.sold;});
  var filtered=inStock.filter(function(v){var q=search.toLowerCase();return !q||(v.reg||'').toLowerCase().includes(q)||(v.brand||'').toLowerCase().includes(q);});
  var totalVal=inStock.reduce(function(a,v){return a+(v.approved_price||v.price||0);},0);
  var aging30=inStock.filter(function(v){return daysAgo(v.submitted)>30;}).length;
  var aging60=inStock.filter(function(v){return daysAgo(v.submitted)>60;}).length;
  function agColor(d){return d>60?'var(--red)':d>30?'var(--acc)':'var(--grn)';}
  return h('div',null,
    h('div',{className:'sg'},[{l:'In Stock',v:inStock.length,i:'\uD83D\uDE97',c:'var(--acc)'},{l:'Total Value',v:fmtL(totalVal),i:'\uD83D\uDCB0',c:'var(--grn)'},{l:'Aging >30d',v:aging30,i:'\u26A0\uFE0F',c:'var(--acc)'},{l:'Aging >60d',v:aging60,i:'\uD83D\uDD34',c:'var(--red)'}].map(function(s,i){return h('div',{key:i,className:'sc'},h('div',{className:'sc-lbl'},s.l),h('div',{className:'sc-val',style:{color:s.c}},s.v),h('div',{className:'sc-ico'},s.i));})),
    h('div',{style:{marginBottom:12}},h('div',{className:'search-bar'},h('span',null,'\uD83D\uDD0D'),h('input',{placeholder:'Search inventory...',value:search,onChange:function(e){setSearch(e.target.value);}}))),
    h('div',{className:'card'},h('div',{className:'card-hdr'},h('div',{className:'card-ttl'},'\uD83C\uDFAA Current Inventory ',h('span',{style:{color:'var(--tx3)',fontWeight:400,fontSize:10,fontFamily:'monospace'}},'('+filtered.length+')'))),
      h('div',{className:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Reg','Vehicle','Year','Odometer','Days in Stock','Branch','Price','Aging','Action'].map(function(t){return h('th',{key:t},t);}))),h('tbody',null,
        filtered.length===0&&h('tr',null,h('td',{colSpan:9,style:{textAlign:'center',padding:36,color:'var(--tx3)'}},'No vehicles in stock')),
        filtered.map(function(v){var days=daysAgo(v.submitted);return h('tr',{key:v.id},h('td',null,h('span',{style:{fontFamily:'monospace',color:'var(--acc)',fontSize:11}},v.reg)),h('td',null,h('b',{style:{fontSize:12}},v.brand+' '+v.model),h('br'),h('span',{style:{fontSize:9,color:'var(--tx3)'}},v.variant||'')),h('td',{style:{color:'var(--tx2)'}},v.year),h('td',{style:{fontFamily:'monospace',fontSize:11}},(v.odometer||0).toLocaleString('en-IN')+' km'),h('td',{style:{fontFamily:'monospace',fontWeight:700,color:agColor(days)}},days+' days'),h('td',null,h('span',{className:'btag'},v.branch)),h('td',{style:{fontFamily:'monospace',fontWeight:700,color:'var(--grn)',fontSize:11}},fmtL(v.approved_price||v.price)),h('td',null,days>60?h('span',{className:'badge b-rejt'},'Critical'):days>30?h('span',{className:'badge b-pend'},'Aging'):h('span',{className:'badge b-appr'},'Fresh')),h('td',null,h('button',{className:'btn btn-success btn-sm',onClick:function(){p.onMarkSold(v.id,v.approved_price||v.price);}},'\uD83D\uDCB0 Mark Sold')));})
      )))
    )
  );
}

function SalesCRM(p){
  var leads=p.leads,user=p.user;
  var _tab=useState('pipeline');var tab=_tab[0];var setTab=_tab[1];
  var _modal=useState(false);var modal=_modal[0];var setModal=_modal[1];
  var _edit=useState(null);var edit=_edit[0];var setEdit=_edit[1];
  var blankForm={name:'',phone:'',email:'',source:'Walk-in',vehicle_interest:'',budget:'',stage:'new',notes:'',follow_up_date:'',officer:user.name,officerId:user.id,branch:user.branch,created:today()};
  var _form=useState(blankForm);var form=_form[0];var setForm=_form[1];
  function setF(k,v){setForm(function(pr){return Object.assign({},pr,{[k]:v});});}
  var myLeads=user.role==='officer'?leads.filter(function(l){return l.officerId===user.id;}):leads;
  var stages=['new','hot','warm','cold','test_drive','booking','won','lost'];
  var stageLabel={new:'\uD83C\uDD95 New',hot:'\uD83D\uDD25 Hot',warm:'\uD83D\uDFE1 Warm',cold:'\uD83D\uDD35 Cold',test_drive:'\uD83D\uDE97 Test Drive',booking:'\uD83D\uDCDD Booking',won:'\u2705 Won',lost:'\u274C Lost'};
  var stageColors={new:'var(--tx2)',hot:'var(--red)',warm:'var(--acc)',cold:'var(--blu)',test_drive:'var(--cyn)',booking:'var(--pur)',won:'var(--grn)',lost:'var(--tx3)'};
  var sources=['Walk-in','CarDekho','OLX Autos','Cars24','Website','WhatsApp','Referral','Phone Call','Instagram','Facebook','Other'];
  function saveLead(){
    if(!form.name.trim()||!form.phone.trim()){p.showToast('Name and phone required','error');return;}
    var lead=Object.assign({},form,{id:edit?edit.id:'L'+Date.now(),updated:today()});
    if(edit){p.updateLead(lead);p.showToast('Lead updated','success');}else{p.addLead(lead);p.showToast('Lead added','success');}
    setModal(false);setEdit(null);
  }
  function openAdd(){setForm(blankForm);setEdit(null);setModal(true);}
  function openEdit(l){setForm(Object.assign({},l));setEdit(l);setModal(true);}
  var srcStats={};myLeads.forEach(function(l){srcStats[l.source]=(srcStats[l.source]||0)+1;});
  var maxSrc=Math.max.apply(null,Object.values(srcStats).concat([1]));
  return h('div',null,
    h('div',{className:'tabs'},[['pipeline','\uD83C\uDFAF Pipeline'],['list','\uD83D\uDCCB All Leads'],['follow-ups','\uD83D\uDCC5 Follow-ups'],['sources','\uD83D\uDCCA Lead Sources']].map(function(t){return h('div',{key:t[0],className:'tab'+(tab===t[0]?' active':''),onClick:function(){setTab(t[0]);}},t[1]);})),
    tab==='pipeline'&&h('div',null,
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}},h('b',null,'Sales Pipeline'),h('button',{className:'btn btn-acc btn-sm',onClick:openAdd},'\u2795 Add Lead')),
      h('div',{className:'kanban'},stages.filter(function(s){return s!=='lost';}).map(function(stage){
        var lds=myLeads.filter(function(l){return l.stage===stage;});
        return h('div',{key:stage,className:'kanban-col'},
          h('div',{className:'kanban-hdr',style:{color:stageColors[stage]}},stageLabel[stage],h('span',{style:{background:'var(--sur3)',padding:'1px 6px',borderRadius:10,fontSize:9,color:'var(--tx3)'}},lds.length)),
          h('div',{className:'kanban-body'},lds.map(function(l){return h('div',{key:l.id,className:'lead-card',onClick:function(){openEdit(l);}},h('div',{className:'lead-name'},l.name),h('div',{style:{fontSize:10,color:'var(--tx3)',marginBottom:5}},l.vehicle_interest||'No vehicle'),h('div',{style:{display:'flex',justifyContent:'space-between',fontSize:9}},h('span',{className:'btag'},l.source||'\u2014'),h('span',{style:{fontFamily:'monospace'}},l.budget?'\u20B9'+parseInt(l.budget).toLocaleString('en-IN'):'\u2014')),l.follow_up_date&&h('div',{style:{fontSize:9,color:'var(--acc)',marginTop:4}},'\uD83D\uDCC5 '+l.follow_up_date));}),lds.length===0&&h('div',{style:{textAlign:'center',padding:'20px 8px',color:'var(--tx4)',fontSize:11}},'No leads'))
        );
      }))
    ),
    tab==='list'&&h('div',null,
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}},h('b',null,myLeads.length+' Total Leads'),h('button',{className:'btn btn-acc btn-sm',onClick:openAdd},'\u2795 Add Lead')),
      h('div',{className:'card'},h('div',{className:'tbl-wrap'},h('table',null,
        h('thead',null,h('tr',null,['Name','Phone','Vehicle Interest','Source','Budget','Stage','Follow-up','Action'].map(function(t){return h('th',{key:t},t);}))),
        h('tbody',null,myLeads.length===0&&h('tr',null,h('td',{colSpan:8,style:{textAlign:'center',padding:36,color:'var(--tx3)'}},'No leads yet \u2014 add your first lead!')),myLeads.map(function(l){return h('tr',{key:l.id},h('td',{style:{fontWeight:600,fontSize:12}},l.name),h('td',{style:{fontFamily:'monospace',fontSize:11,color:'var(--tx2)'}},l.phone),h('td',{style:{fontSize:11}},l.vehicle_interest||'\u2014'),h('td',null,h('span',{className:'btag'},l.source||'\u2014')),h('td',{style:{fontFamily:'monospace',fontSize:11}},l.budget?fmtL(l.budget):'\u2014'),h('td',null,h('span',{style:{fontSize:11,fontWeight:600,color:stageColors[l.stage]||'var(--tx2)'}},stageLabel[l.stage]||l.stage)),h('td',{style:{fontSize:11,color:l.follow_up_date&&l.follow_up_date<today()?'var(--red)':'var(--tx2)'}},l.follow_up_date||'\u2014'),h('td',null,h('div',{style:{display:'flex',gap:3}},h('button',{className:'btn btn-ghost btn-sm',onClick:function(){openEdit(l);}},'\u270F\uFE0F'),h('button',{className:'btn btn-danger btn-sm',onClick:function(){p.deleteLead(l.id);}},'\uD83D\uDDD1'))));})))))
    ),
    tab==='follow-ups'&&h('div',{className:'card'},
      h('div',{className:'card-hdr'},h('div',{className:'card-ttl'},"\uD83D\uDCC5 Today's & Overdue Follow-ups")),
      h('div',{style:{padding:14}},myLeads.filter(function(l){return l.follow_up_date&&l.follow_up_date<=today()&&l.stage!=='won'&&l.stage!=='lost';}).length===0?h('div',{style:{textAlign:'center',padding:30,color:'var(--tx3)'}},'No pending follow-ups today \uD83C\uDF89'):myLeads.filter(function(l){return l.follow_up_date&&l.follow_up_date<=today()&&l.stage!=='won'&&l.stage!=='lost';}).map(function(l){var ov=l.follow_up_date<today();return h('div',{key:l.id,style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'var(--sur2)',borderRadius:'var(--r)',border:'1px solid '+(ov?'rgba(239,68,68,0.3)':'var(--bdr)'),marginBottom:8,cursor:'pointer'},onClick:function(){openEdit(l);}},h('div',null,h('div',{style:{fontSize:13,fontWeight:600}},l.name),h('div',{style:{fontSize:10,color:'var(--tx3)',marginTop:2}},l.vehicle_interest||'No vehicle specified')),h('div',{style:{textAlign:'right'}},h('div',{style:{fontSize:11,fontWeight:700,color:ov?'var(--red)':'var(--acc)'}},ov?'OVERDUE':'TODAY'),h('div',{style:{fontSize:10,color:'var(--tx3)'}},l.follow_up_date)));}))),
    tab==='sources'&&h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}},
      h('div',{className:'card',style:{padding:16}},h('div',{className:'card-ttl',style:{marginBottom:14}},'\uD83D\uDCCA Lead Sources'),h('div',{className:'bar-chart'},Object.entries(srcStats).sort(function(a,b){return b[1]-a[1];}).map(function(e){return h(BarRow,{key:e[0],label:e[0],val:e[1],max:maxSrc,wide:true});})),Object.keys(srcStats).length===0&&h('div',{style:{textAlign:'center',padding:24,color:'var(--tx3)',fontSize:12}},'No lead data yet')),
      h('div',{className:'card',style:{padding:16}},h('div',{className:'card-ttl',style:{marginBottom:14}},'\uD83C\uDFC6 Stage Summary'),stages.map(function(s){var cnt=myLeads.filter(function(l){return l.stage===s;}).length;return h('div',{key:s,style:{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--bdr)',fontSize:12}},h('span',{style:{color:stageColors[s],fontWeight:600}},stageLabel[s]),h('span',{style:{fontFamily:'monospace',fontWeight:700}},cnt));}))
    ),
    modal&&h(Modal,{title:edit?'Edit Lead':'Add New Lead',sub:'Sales pipeline entry',onClose:function(){setModal(false);}},
      h('div',{className:'fg'},
        h('div',{className:'field'},h('label',null,'Customer Name *'),h('input',{className:'inp',value:form.name,onChange:function(e){setF('name',e.target.value);},placeholder:'Full name'})),
        h('div',{className:'field'},h('label',null,'Phone *'),h('input',{className:'inp',type:'tel',value:form.phone,onChange:function(e){setF('phone',e.target.value);},placeholder:'Mobile number'})),
        h('div',{className:'field'},h('label',null,'Email'),h('input',{className:'inp',type:'email',value:form.email,onChange:function(e){setF('email',e.target.value);},placeholder:'Optional'})),
        h('div',{className:'field'},h('label',null,'Lead Source'),h('select',{className:'inp',value:form.source,onChange:function(e){setF('source',e.target.value);}},sources.map(function(s){return h('option',{key:s},s);}))),
        h('div',{className:'field'},h('label',null,'Vehicle Interest'),h('input',{className:'inp',value:form.vehicle_interest,onChange:function(e){setF('vehicle_interest',e.target.value);},placeholder:'e.g. Hyundai Creta 2022'})),
        h('div',{className:'field'},h('label',null,'Budget (\u20B9)'),h('input',{className:'inp',type:'number',value:form.budget,onChange:function(e){setF('budget',e.target.value);},placeholder:'e.g. 800000'})),
        h('div',{className:'field'},h('label',null,'Pipeline Stage'),h('select',{className:'inp',value:form.stage,onChange:function(e){setF('stage',e.target.value);}},stages.map(function(s){return h('option',{key:s,value:s},stageLabel[s]||s);}))),
        h('div',{className:'field'},h('label',null,'Follow-up Date'),h('input',{className:'inp',type:'date',value:form.follow_up_date,onChange:function(e){setF('follow_up_date',e.target.value);}})),
        h('div',{className:'field s2'},h('label',null,'Notes / Negotiation History'),h('textarea',{className:'inp',rows:2,value:form.notes,onChange:function(e){setF('notes',e.target.value);},placeholder:'Previous discussions, requirements, offers...'}))
      ),
      h('div',{className:'modal-acts'},h('button',{className:'btn btn-ghost',onClick:function(){setModal(false);}},'Cancel'),h('button',{className:'btn btn-acc',onClick:saveLead},edit?'Save Changes':'Add Lead'))
    )
  );
}

function Projections(p){
  var user=p.user,vehicles=p.vehicles,leads=p.leads;
  var _tab=useState('team');var tab=_tab[0];var setTab=_tab[1];
  var _proj=useState({inspections_target:5,purchases_target:2,sales_target:1,pipeline_target:10});var proj=_proj[0];var setProj=_proj[1];
  function setP(k,v){setProj(function(pr){return Object.assign({},pr,{[k]:v});});}
  var todayStr=today(),monthStr=todayStr.slice(0,7);
  var todayInsp=vehicles.filter(function(v){return v.submitted===todayStr&&(user.role==='officer'?v.officerId===user.id:true);}).length;
  var todayBuys=vehicles.filter(function(v){return v.status==='approved'&&v.approved===todayStr;}).length;
  var monthInsp=vehicles.filter(function(v){return v.submitted&&v.submitted.startsWith(monthStr)&&(user.role==='officer'?v.officerId===user.id:true);}).length;
  var monthSales=leads.filter(function(l){return l.stage==='won'&&l.updated&&l.updated.startsWith(monthStr);}).length;
  var officers=CRED_LIST.filter(function(u){return u.role==='officer';});
  var leaderboard=officers.map(function(o){
    var ov=vehicles.filter(function(v){return v.officerId===o.id&&v.submitted&&v.submitted.startsWith(monthStr);});
    var ol=leads.filter(function(l){return l.officerId===o.id;});
    return{name:o.name,branch:o.branch,insp:ov.length,approved:ov.filter(function(v){return v.status==='approved';}).length,leads:ol.length,hot:ol.filter(function(l){return l.stage==='hot';}).length};
  }).sort(function(a,b){return b.insp-a.insp;});
  return h('div',null,
    h('div',{className:'tabs'},[['team','\uD83D\uDCCA Team Performance'],['my','\uD83C\uDFAF My Targets'],['leaderboard','\uD83C\uDFC6 Leaderboard']].map(function(t){return h('div',{key:t[0],className:'tab'+(tab===t[0]?' active':''),onClick:function(){setTab(t[0]);}},t[1]);})),
    tab==='my'&&h('div',null,
      h('div',{className:'sg',style:{gridTemplateColumns:'1fr 1fr'}},[{l:'Today Inspections',act:todayInsp,tgt:proj.inspections_target},{l:'Today Purchases',act:todayBuys,tgt:proj.purchases_target},{l:'Month Inspections',act:monthInsp,tgt:proj.inspections_target*22},{l:'Month Sales',act:monthSales,tgt:proj.sales_target*22}].map(function(item,i){var pct=item.tgt?Math.min(Math.round(item.act/item.tgt*100),100):0;return h('div',{key:i,className:'sc'},h('div',{className:'sc-lbl'},item.l),h('div',{className:'sc-val',style:{color:pct>=80?'var(--grn)':pct>=50?'var(--acc)':'var(--red)'}},item.act+' / '+item.tgt),h('div',{className:'sc-bar'},h('div',{className:'sc-bar-fill',style:{width:pct+'%',background:pct>=80?'var(--grn)':pct>=50?'var(--acc)':'var(--red)'}})));})),
      h('div',{className:'card',style:{padding:16}},h('div',{className:'card-ttl',style:{marginBottom:14}},'\uD83C\uDFAF Set Daily Targets'),
        h('div',{className:'fg'},h('div',{className:'field'},h('label',null,'Daily Inspection Target'),h('input',{className:'inp',type:'number',value:proj.inspections_target,onChange:function(e){setP('inspections_target',parseInt(e.target.value)||0);},placeholder:'e.g. 5'})),h('div',{className:'field'},h('label',null,'Daily Purchase Target'),h('input',{className:'inp',type:'number',value:proj.purchases_target,onChange:function(e){setP('purchases_target',parseInt(e.target.value)||0);},placeholder:'e.g. 2'})),h('div',{className:'field'},h('label',null,'Daily Sales Target'),h('input',{className:'inp',type:'number',value:proj.sales_target,onChange:function(e){setP('sales_target',parseInt(e.target.value)||0);},placeholder:'e.g. 1'})),h('div',{className:'field'},h('label',null,'Pipeline Count Target'),h('input',{className:'inp',type:'number',value:proj.pipeline_target,onChange:function(e){setP('pipeline_target',parseInt(e.target.value)||0);},placeholder:'e.g. 10'}))),
        h('button',{className:'btn btn-acc',onClick:function(){p.showToast('Targets saved','success');}},'\uD83D\uDCBE Save Targets')
      )
    ),
    tab==='team'&&h('div',null,
      h('div',{className:'sg'},[{l:'Month Inspections',v:monthInsp,i:'\uD83D\uDE97'},{l:'Month Sales',v:monthSales,i:'\uD83D\uDCB0'},{l:'Active Officers',v:CRED_LIST.filter(function(u){return u.role==='officer';}).length,i:'\uD83D\uDC65'},{l:'Hot Leads',v:leads.filter(function(l){return l.stage==='hot';}).length,i:'\uD83D\uDD25'}].map(function(s,i){return h('div',{key:i,className:'sc'},h('div',{className:'sc-lbl'},s.l),h('div',{className:'sc-val'},s.v),h('div',{className:'sc-ico'},s.i));})),
      h('div',{className:'card',style:{padding:16}},h('div',{className:'card-ttl',style:{marginBottom:14}},'\uD83D\uDCCA Branch Inspections This Month'),h('div',{className:'bar-chart'},BRANCHES.map(function(b){var cnt=vehicles.filter(function(v){return v.branch===b&&v.submitted&&v.submitted.startsWith(monthStr);}).length;return h(BarRow,{key:b,label:b,val:cnt,max:Math.max(monthInsp,1),wide:true});})))
    ),
    tab==='leaderboard'&&h('div',{className:'card'},
      h('div',{className:'card-hdr'},h('div',{className:'card-ttl'},'\uD83C\uDFC6 Evaluator Leaderboard \u2014 '+monthStr)),
      h('div',{className:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Rank','Evaluator','Branch','Inspections','Approved','Rate','Leads','Hot'].map(function(t){return h('th',{key:t},t);}))),h('tbody',null,leaderboard.map(function(e,i){var rate=e.insp?Math.round(e.approved/e.insp*100):0;return h('tr',{key:e.name},h('td',null,h('span',{style:{fontWeight:800,color:i===0?'var(--acc)':i===1?'var(--tx2)':i===2?'var(--ora)':'var(--tx3)',fontSize:13}},i===0?'\uD83E\uDD47':i===1?'\uD83E\uDD48':i===2?'\uD83E\uDD49':(i+1)+'.')),h('td',{style:{fontWeight:600,fontSize:12}},e.name),h('td',null,h('span',{className:'btag'},e.branch)),h('td',{style:{textAlign:'center',fontFamily:'monospace',fontWeight:700,color:'var(--acc)'}},e.insp),h('td',{style:{textAlign:'center',color:'var(--grn)',fontFamily:'monospace',fontWeight:700}},e.approved),h('td',{style:{textAlign:'center',fontWeight:700,color:rate>=70?'var(--grn)':rate>=50?'var(--acc)':'var(--red)'}},rate+'%'),h('td',{style:{textAlign:'center',fontFamily:'monospace'}},e.leads),h('td',{style:{textAlign:'center',fontWeight:700,color:'var(--red)'}},e.hot||0));}),leaderboard.length===0&&h('tr',null,h('td',{colSpan:8,style:{textAlign:'center',padding:36,color:'var(--tx3)'}},'No data yet')))))
    )
  );
}

function MIS(p){
  var vs=p.vehicles,leads=p.leads;
  var _tab=useState('overview');var tab=_tab[0];var setTab=_tab[1];
  var monthStr=today().slice(0,7);
  var appr=vs.filter(function(v){return v.status==='approved';});
  var sold=vs.filter(function(v){return v.sold;});
  var totalProcCost=appr.reduce(function(a,v){return a+(v.approved_price||v.price||0);},0);
  var totalSaleRev=sold.reduce(function(a,v){return a+(v.sale_price||0);},0);
  var totalRepair=appr.reduce(function(a,v){return a+(v.total_repair_cost||0);},0);
  var evalMap={};
  vs.forEach(function(v){if(!v.officer)return;if(!evalMap[v.officer])evalMap[v.officer]={name:v.officer,branch:v.branch,total:0,appr:0,evalSum:0,algoSum:0,cnt:0,repairEst:0};var e=evalMap[v.officer];e.total++;if(v.status==='approved')e.appr++;if(v.price>0&&v.algo_price>0){e.evalSum+=v.price;e.algoSum+=v.algo_price;e.cnt++;}if(v.total_repair_cost>0)e.repairEst+=v.total_repair_cost;});
  var evalList=Object.values(evalMap).sort(function(a,b){return b.total-a.total;});
  return h('div',null,
    h('div',{className:'tabs'},[['overview','\uD83D\uDCCA Overview'],['margins','\uD83D\uDCB0 Margins'],['evaluators','\uD83D\uDC65 Evaluators'],['repair','\uD83D\uDD27 Repair Analysis']].map(function(t){return h('div',{key:t[0],className:'tab'+(tab===t[0]?' active':''),onClick:function(){setTab(t[0]);}},t[1]);})),
    tab==='overview'&&h('div',null,
      h('div',{className:'sg'},[{l:'Total Evaluated',v:vs.length,i:'\uD83D\uDE97'},{l:'Total Approved',v:appr.length,i:'\u2705'},{l:'Sold',v:sold.length,i:'\uD83D\uDCB0'},{l:'Procurement Cost',v:fmtL(totalProcCost),i:'\uD83D\uDCC9'}].map(function(s,i){return h('div',{key:i,className:'sc'},h('div',{className:'sc-lbl'},s.l),h('div',{className:'sc-val'},s.v),h('div',{className:'sc-ico'},s.i));})),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}},
        h('div',{className:'card',style:{padding:16}},h('div',{className:'card-ttl',style:{marginBottom:14}},'Branch Performance'),h('div',{className:'bar-chart'},BRANCHES.map(function(b){var bv=vs.filter(function(v){return v.branch===b;});return h(BarRow,{key:b,label:b,val:bv.length,max:Math.max(vs.length,1),wide:true,sub:bv.filter(function(v){return v.status==='approved';}).length+' approved'});}))),
        h('div',{className:'card',style:{padding:16}},h('div',{className:'card-ttl',style:{marginBottom:14}},'Lead Source Performance'),h('div',{className:'bar-chart'},['Walk-in','CarDekho','OLX Autos','WhatsApp','Referral'].map(function(src){var cnt=leads.filter(function(l){return l.source===src;}).length;var won=leads.filter(function(l){return l.source===src&&l.stage==='won';}).length;return h(BarRow,{key:src,label:src,val:cnt,max:Math.max(leads.length,1),wide:true,sub:won+' won',color:'var(--blu)'});})))
      )
    ),
    tab==='margins'&&h('div',null,
      h('div',{className:'sg',style:{gridTemplateColumns:'repeat(3,1fr)'}},[{l:'Procurement Cost',v:fmtL(totalProcCost),c:'var(--red)'},{l:'Sale Revenue',v:fmtL(totalSaleRev),c:'var(--grn)'},{l:'Gross Margin',v:totalSaleRev&&totalProcCost?fmtL(totalSaleRev-totalProcCost):'\u2014',c:'var(--acc)'}].map(function(s,i){return h('div',{key:i,className:'sc'},h('div',{className:'sc-lbl'},s.l),h('div',{className:'sc-val',style:{fontSize:18,color:s.c}},s.v));})),
      h('div',{className:'card'},h('div',{className:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Vehicle','Procurement','Repair Est.','Sale Price','Margin %'].map(function(t){return h('th',{key:t},t);}))),h('tbody',null,appr.slice(0,20).map(function(v){var sale=v.sale_price||0;var proc=v.approved_price||v.price||0;var margin=proc&&sale?((sale-proc)/proc*100):null;return h('tr',{key:v.id},h('td',null,h('b',{style:{fontSize:12}},v.brand+' '+v.model),h('br'),h('span',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace'}},v.reg)),h('td',{style:{fontFamily:'monospace',fontSize:11}},fmtL(proc)),h('td',{style:{fontFamily:'monospace',fontSize:11,color:'var(--red)'}},v.total_repair_cost?fmtL(v.total_repair_cost):'\u2014'),h('td',{style:{fontFamily:'monospace',fontSize:11,color:'var(--grn)'}},sale?fmtL(sale):'Not sold'),h('td',{style:{textAlign:'right',fontWeight:700,color:margin===null?'var(--tx3)':margin>=10?'var(--grn)':margin>=0?'var(--acc)':'var(--red)'}},margin!==null?(margin>0?'+':'')+margin.toFixed(1)+'%':'\u2014'));}),appr.length===0&&h('tr',null,h('td',{colSpan:5,style:{textAlign:'center',padding:36,color:'var(--tx3)'}},'No data'))))))
    ),
    tab==='evaluators'&&h('div',{className:'card'},h('div',{className:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Evaluator','Branch','Evaluated','Approved','Rate','Eval vs Algo','Repair Est.'].map(function(t){return h('th',{key:t},t);}))),h('tbody',null,evalList.map(function(e){var rate=e.total?Math.round(e.appr/e.total*100):0;var avgEval=e.cnt?e.evalSum/e.cnt:0;var avgAlgo=e.cnt?e.algoSum/e.cnt:0;var trend=avgEval&&avgAlgo?((avgEval-avgAlgo)/avgAlgo*100):null;return h('tr',{key:e.name},h('td',{style:{fontWeight:600,fontSize:12}},e.name),h('td',null,h('span',{className:'btag'},e.branch)),h('td',{style:{textAlign:'center',fontFamily:'monospace',fontWeight:700}},e.total),h('td',{style:{textAlign:'center',color:'var(--grn)',fontFamily:'monospace',fontWeight:700}},e.appr),h('td',{style:{textAlign:'center',fontWeight:700,color:rate>=70?'var(--grn)':rate>=50?'var(--acc)':'var(--red)'}},rate+'%'),h('td',{style:{textAlign:'center',fontSize:11,fontWeight:600,color:trend===null?'var(--tx3)':Math.abs(trend)<=5?'var(--grn)':Math.abs(trend)<=15?'var(--acc)':'var(--red)'}},trend!==null?((trend>0?'\u25B2':'\u25BC')+Math.abs(trend).toFixed(1)+'% vs algo'):'\u2014'),h('td',{style:{textAlign:'right',fontFamily:'monospace',fontSize:11,color:'var(--red)'}},e.repairEst?fmtL(e.repairEst):'\u2014'));}),evalList.length===0&&h('tr',null,h('td',{colSpan:7,style:{textAlign:'center',padding:36,color:'var(--tx3)'}},'No data')))))),
    tab==='repair'&&h('div',null,
      h('div',{className:'sg',style:{gridTemplateColumns:'1fr 1fr 1fr'}},[{l:'Total Repair Est.',v:fmtL(totalRepair),c:'var(--red)'},{l:'Avg Repair/Vehicle',v:appr.length?fmtL(totalRepair/appr.length):'\u2014',c:'var(--acc)'},{l:'Vehicles w/ Repair',v:appr.filter(function(v){return v.total_repair_cost>0;}).length,c:'var(--pur)'}].map(function(s,i){return h('div',{key:i,className:'sc'},h('div',{className:'sc-lbl'},s.l),h('div',{className:'sc-val',style:{fontSize:18,color:s.c}},s.v),h('div',{className:'sc-ico'},'\uD83D\uDD27'));})),
      h('div',{className:'card',style:{padding:16}},h('div',{className:'card-ttl',style:{marginBottom:14}},'Repair Cost Breakdown by Component'),h('div',{className:'bar-chart'},['engine','tyres','battery','electricals','exterior','interior'].map(function(comp){var vwi=appr.filter(function(v){return v[comp]&&REPAIR_COSTS[comp]&&REPAIR_COSTS[comp][v[comp]]&&REPAIR_COSTS[comp][v[comp]].cost>0;});var ct=vwi.reduce(function(a,v){return a+(REPAIR_COSTS[comp][v[comp]]?REPAIR_COSTS[comp][v[comp]].cost:0);},0);return h(BarRow,{key:comp,label:comp.charAt(0).toUpperCase()+comp.slice(1),val:vwi.length,max:Math.max(appr.length,1),wide:true,sub:ct>0?'\u20B9'+ct.toLocaleString('en-IN')+' total':''});})))
    )
  );
}

function EmployeeDB(p){
  var _users=useState(function(){return CRED_LIST.slice();});var users=_users[0];var setUsers=_users[1];
  var _modal=useState(false);var modal=_modal[0];var setModal=_modal[1];
  var _edit=useState(null);var editing=_edit[0];var setEditing=_edit[1];
  var _search=useState('');var search=_search[0];var setSearch=_search[1];
  var _showPwd=useState({});var showPwd=_showPwd[0];var setShowPwd=_showPwd[1];
  var _form=useState({name:'',username:'',password:'Utrust@2025',role:'officer',branch:'Purnea',email:'',phone:''});var form=_form[0];var setForm=_form[1];
  function setF(k,v){setForm(function(pr){return Object.assign({},pr,{[k]:v});});}
  function persist(list){saveCreds(list);setUsers(list.slice());}
  function save(){
    if(!form.name.trim()||!form.username.trim()||!form.password.trim()){p.showToast('Name, username, password required','error');return;}
    var dup=users.find(function(u){return u.username===form.username.trim()&&u.id!==editing;});
    if(dup){p.showToast('Username already exists','error');return;}
    var clean=Object.assign({},form,{username:form.username.trim().toLowerCase(),name:form.name.trim(),avatar:form.name.trim().split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase()});
    var newList;
    if(editing){newList=users.map(function(u){return u.id===editing?Object.assign({},u,clean):u;});p.showToast(clean.name+' updated','success');}
    else{newList=users.concat([Object.assign({},clean,{id:'U'+Date.now()})]);p.showToast(clean.name+' added','success');}
    persist(newList);setModal(false);
  }
  function del(id){if(id==='U001'){p.showToast('Cannot delete admin','error');return;}var u=users.find(function(x){return x.id===id;});if(!window.confirm('Remove '+u.name+'?'))return;persist(users.filter(function(x){return x.id!==id;}));p.showToast(u.name+' removed','info');}
  var filtered=users.filter(function(u){var q=search.toLowerCase();return !q||u.name.toLowerCase().includes(q)||u.username.toLowerCase().includes(q);});
  var BLIST=['Purnea','Bhagalpur','Forbesganj','Kishanganj','Katihar','Banka','Khagaria','Saharsa','Supaul','HQ'];
  return h('div',null,
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}},
      h('div',{style:{color:'var(--tx3)',fontSize:12}},users.length+' employees'),
      h('div',{style:{display:'flex',gap:6}},h('button',{className:'btn btn-ghost btn-sm',onClick:function(){persist(DEFAULT_CREDS.slice());p.showToast('Reset to default','info');},style:{fontSize:10}},'\u21BA Reset'),h('button',{className:'btn btn-acc btn-sm',onClick:function(){setForm({name:'',username:'',password:'Utrust@2025',role:'officer',branch:'Purnea',email:'',phone:''});setEditing(null);setModal(true);}},'\u2795 Add'))
    ),
    h('div',{className:'search-bar',style:{marginBottom:12}},h('span',null,'\uD83D\uDD0D'),h('input',{placeholder:'Search employees...',value:search,onChange:function(e){setSearch(e.target.value);}})),
    ['admin','leader','officer'].map(function(role){
      var ru=filtered.filter(function(u){return u.role===role;});
      if(!ru.length)return null;
      var lbl={admin:'Admin',leader:'Utrust Incharge',officer:'Evaluator'};
      return h('div',{key:role,style:{marginBottom:20}},
        h('div',{style:{fontSize:9,fontWeight:700,color:'var(--tx3)',fontFamily:'monospace',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8,paddingBottom:5,borderBottom:'1px solid var(--bdr)'}},lbl[role]+' ('+ru.length+')'),
        ru.map(function(u){return h('div',{key:u.id,style:{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:'var(--r2)',marginBottom:8,flexWrap:'wrap'}},
          h('div',{className:'av '+u.role},u.avatar),
          h('div',{style:{flex:1,minWidth:0}},h('div',{style:{fontSize:12,fontWeight:600}},u.name),h('div',{style:{display:'flex',gap:7,flexWrap:'wrap',marginTop:2}},h('span',{style:{fontFamily:'monospace',fontSize:10,color:'var(--acc)'}},'@'+u.username),u.phone&&h('span',{style:{fontSize:10,color:'var(--tx3)'}},'\uD83D\uDCDE '+u.phone),u.branch&&h('span',{className:'btag'},'\uD83D\uDCCD '+u.branch)),h('div',{style:{display:'flex',alignItems:'center',gap:4,marginTop:3}},h('span',{style:{fontSize:9,color:'var(--tx3)'}},'pwd:'),h('span',{style:{fontFamily:'monospace',fontSize:10,color:showPwd[u.id]?'var(--txt)':'var(--bdr2)'}},showPwd[u.id]?u.password:'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'),h('button',{style:{background:'none',border:'none',cursor:'pointer',fontSize:12,padding:'0 2px'},onClick:function(){setShowPwd(function(pr){var n=Object.assign({},pr);n[u.id]=!n[u.id];return n;});}},showPwd[u.id]?'\uD83D\uDE48':'\uD83D\uDC41'))),
          h('div',{style:{display:'flex',gap:5}},h('button',{className:'btn btn-ghost btn-sm',onClick:function(){setForm(Object.assign({},u));setEditing(u.id);setModal(true);}},'\u270F\uFE0F'),u.id!=='U001'&&h('button',{className:'btn btn-danger btn-sm',onClick:function(){del(u.id);}},'\uD83D\uDDD1'))
        );})
      );
    }),
    modal&&h(Modal,{title:editing?'Edit Employee':'Add Employee',onClose:function(){setModal(false);}},
      h('div',{className:'fg'},h('div',{className:'field s2'},h('label',null,'Full Name *'),h('input',{className:'inp',value:form.name,onChange:function(e){setF('name',e.target.value);},placeholder:'Employee full name'})),h('div',{className:'field'},h('label',null,'Username *'),h('input',{className:'inp',value:form.username,onChange:function(e){setF('username',e.target.value.toLowerCase());},placeholder:'e.g. ravi.purnea'})),h('div',{className:'field'},h('label',null,'Password *'),h('input',{className:'inp',value:form.password,onChange:function(e){setF('password',e.target.value);}})),h('div',{className:'field'},h('label',null,'Role'),h('select',{className:'inp',value:form.role,onChange:function(e){setF('role',e.target.value);}},h('option',{value:'officer'},'Evaluator'),h('option',{value:'leader'},'Utrust Incharge'),h('option',{value:'admin'},'Admin'))),h('div',{className:'field'},h('label',null,'Branch'),h('select',{className:'inp',value:form.branch,onChange:function(e){setF('branch',e.target.value);}},BLIST.map(function(b){return h('option',{key:b},b);}))),h('div',{className:'field'},h('label',null,'Phone'),h('input',{className:'inp',value:form.phone,onChange:function(e){setF('phone',e.target.value);},placeholder:'10-digit'})),h('div',{className:'field'},h('label',null,'Email'),h('input',{className:'inp',value:form.email,onChange:function(e){setF('email',e.target.value);},placeholder:'email@utrust.in'}))),
      h('div',{className:'modal-acts'},h('button',{className:'btn btn-ghost',onClick:function(){setModal(false);}},'Cancel'),h('button',{className:'btn btn-acc',onClick:save},editing?'Save Changes':'Add Employee'))
    )
  );
}

function VehicleDetail(p){
  var vehicle=p.vehicle,user=p.user;
  var _comment=useState('');var comment=_comment[0];var setComment=_comment[1];
  var _ap=useState('');var approvedPrice=_ap[0];var setApprovedPrice=_ap[1];
  var _modal=useState(null);var modal=_modal[0];var setModal=_modal[1];
  if(!vehicle)return h('div',{style:{textAlign:'center',padding:50,color:'var(--tx3)'}},'No vehicle selected');
  var pm=vehicle.photos||{};
  var photoKeys=['front','rear','left','right','interior1','interior2','engine','chassis'];
  var photoLabels={front:'FRONT',rear:'REAR',left:'LEFT',right:'RIGHT',interior1:'INT-1',interior2:'INT-2',engine:'ENGINE',chassis:'CHASSIS'};
  var algo=calcAlgo(Object.assign({},vehicle,{total_repair_cost:vehicle.total_repair_cost||0}));
  var canApprove=(user.role==='leader'||user.role==='admin')&&(vehicle.status==='pending'||vehicle.status==='review');
  return h('div',null,
    h('div',{style:{display:'flex',alignItems:'flex-start',gap:9,marginBottom:16,flexWrap:'wrap'}},
      h('button',{className:'btn btn-ghost btn-sm',onClick:p.onBack},'\u2190 Back'),
      h('div',{style:{flex:1}},h('div',{style:{fontFamily:'monospace',color:'var(--acc)',fontSize:11}},vehicle.reg+' \u00B7 '+vehicle.branch),h('div',{style:{fontSize:16,fontWeight:800}},vehicle.brand+' '+vehicle.model+' '+vehicle.variant)),
      h('div',{style:{display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}},h(StatusBadge,{status:vehicle.status}),canApprove&&h('button',{className:'btn btn-success btn-sm',onClick:function(){setModal('approve');}},'\u2713 Approve'),canApprove&&h('button',{className:'btn btn-danger btn-sm',onClick:function(){setModal('reject');}},'\u2717 Reject'))
    ),
    h('div',{className:'detail-grid'},
      h('div',null,
        h('div',{className:'detail-card',style:{marginBottom:12}},h('div',{className:'detail-card-ttl'},'\uD83D\uDE97 Vehicle Details'),
          [['Reg',vehicle.reg],['Seller',vehicle.seller_name||'\u2014'],['Phone',vehicle.seller_phone||'\u2014'],['City',vehicle.city||'\u2014'],['Brand',vehicle.brand],['Model',vehicle.model],['Year',vehicle.year],['Fuel',vehicle.fuel],['Volume',vehicle.volume_cc?vehicle.volume_cc+'cc':'\u2014'],['Transmission',vehicle.transmission],['Odometer',(vehicle.odometer||0).toLocaleString('en-IN')+' km'],['Ownership',vehicle.ownership],['Service',vehicle.service_history||'\u2014'],['Branch',vehicle.branch],['Evaluator',vehicle.officer]].map(function(item){return h('div',{key:item[0],className:'drow'},h('span',{className:'dkey'},item[0]),h('span',{className:'dval'},item[1]||'\u2014'));})),
        h('div',{className:'detail-card'},h('div',{className:'detail-card-ttl'},'\uD83D\uDCB0 Pricing'),
          vehicle.customer_expectation>0&&h('div',{style:{marginBottom:8,padding:'7px 10px',background:'var(--sur2)',borderRadius:'var(--r)',textAlign:'center'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace'}},'SELLER EXPECTS'),h('div',{style:{fontSize:15,fontWeight:700,color:'var(--pur)'}},fmtL(vehicle.customer_expectation))),
          vehicle.total_repair_cost>0&&h('div',{style:{marginBottom:8,padding:'7px 10px',background:'var(--rdim)',borderRadius:'var(--r)',textAlign:'center',border:'1px solid rgba(239,68,68,0.2)'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace'}},'REPAIR ESTIMATE'),h('div',{style:{fontSize:15,fontWeight:700,color:'var(--red)'}},fmtL(vehicle.total_repair_cost))),
          h('div',{style:{textAlign:'center',padding:'10px 0'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:2}},'EVALUATOR ESTIMATE'),h('div',{style:{fontSize:20,fontWeight:800,color:'var(--acc)'}},fmtL(vehicle.price)),vehicle.algo_price>0&&h('div',{style:{marginTop:4,fontSize:11,color:'var(--tx3)'}},'Algorithm: ',h('b',{style:{color:'var(--tx2)'}},fmtL(vehicle.algo_price))),vehicle.algo_min>0&&h('div',{style:{fontSize:10,color:'var(--tx3)',marginTop:2}},'Band: '+fmtL(vehicle.algo_min)+' \u2014 '+fmtL(vehicle.algo_max)),vehicle.approved_price>0&&h('div',{style:{marginTop:10,paddingTop:10,borderTop:'1px solid var(--bdr)'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:2}},'INCHARGE APPROVED'),h('div',{style:{fontSize:20,fontWeight:800,color:'var(--grn)'}},fmtL(vehicle.approved_price))))
        )
      ),
      h('div',null,
        h('div',{className:'detail-card',style:{marginBottom:12}},h('div',{className:'detail-card-ttl'},'\uD83D\uDCF7 Photos'),h('div',{className:'photo-grid'},photoKeys.map(function(k){var src=pm[k];return h('div',{key:k},h('div',{className:'photo-thumb',onClick:function(){if(src){var w=window.open('','_blank');w.document.write('<img src="'+src+'" style="max-width:100%;max-height:100vh">');w.document.close();}}},src?h('img',{src:src,alt:k,style:{width:'100%',height:'100%',objectFit:'cover'}}):h('span',{style:{fontSize:14,opacity:0.3}},'\uD83D\uDCF7')),h('div',{style:{fontSize:8,color:src?'var(--grn)':'var(--tx3)',textAlign:'center',marginTop:2,fontFamily:'monospace'}},photoLabels[k]+(src?' \u2713':'')));}))  ),
        h('div',{className:'detail-card',style:{marginBottom:12}},h('div',{className:'detail-card-ttl'},'\uD83D\uDD0D Condition'),[['Engine',vehicle.engine],['Tyres',vehicle.tyres],['Battery',vehicle.battery],['Electricals',vehicle.electricals],['Exterior',vehicle.exterior],['Interior',vehicle.interior],['Accidental',vehicle.accidental],['Flood',vehicle.flood],['Challans',vehicle.challan_verified===true?('\u26A0 \u20B9'+(vehicle.challan_amount||0)):vehicle.challan_verified===false?'None':'Not Checked'],['Rating',(vehicle.rating||0)+'/10']].map(function(item){var bad=item[1]==='Worn'||item[1]==='Dead'||item[1]==='Issues'||item[1]==='Yes'||item[1]==='Poor'||String(item[1]).startsWith('\u26A0');var good=item[1]==='Excellent'||item[1]==='Good'||item[1]==='No'||item[1]==='None';return h('div',{key:item[0],className:'drow'},h('span',{className:'dkey'},item[0]),h('span',{className:'dval',style:{color:bad?'var(--red)':good?'var(--grn)':'var(--acc)'}},item[1]||'\u2014'));})),
        h('div',{className:'detail-card'},h('div',{className:'detail-card-ttl'},'\uD83D\uDCCB Procurement Checklist'),vehicle.checklist?Object.entries(vehicle.checklist).map(function(entry){var k=entry[0];var v=entry[1];var lbl={both_keys:'Both Keys',rc_received:'RC',insurance_copy:'Insurance',bank_noc:'Bank NOC',form29_30:'Form 29/30',seller_id:'Seller ID',address_proof:'Address Proof',service_records:'Service Records',hypothecation_proof:'Hypothecation'};return h('div',{key:k,className:'drow'},h('span',{className:'dkey'},lbl[k]||k),h('span',{className:'dval',style:{color:v==='received'?'var(--grn)':v==='pending'?'var(--acc)':'var(--tx3)',fontSize:10}},v==='received'?'\u2713 Received':v==='pending'?'\u23F3 Pending':v==='na'?'N/A':'\u2014'));}):[])
      )
    ),
    modal&&h(Modal,{title:modal==='approve'?'Approve Vehicle':'Reject Vehicle',sub:vehicle.brand+' '+vehicle.model,onClose:function(){setModal(null);}},
      modal==='approve'&&h('div',null,h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,padding:'10px',background:'var(--sur2)',borderRadius:'var(--r)',marginBottom:12}},h('div',{style:{textAlign:'center'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:2}},'EVALUATOR'),h('div',{style:{fontSize:17,fontWeight:800,color:'var(--acc)'}},fmtL(vehicle.price))),h('div',{style:{textAlign:'center'}},h('div',{style:{fontSize:9,color:'var(--tx3)',fontFamily:'monospace',marginBottom:2}},'ALGORITHM'),h('div',{style:{fontSize:17,fontWeight:700,color:'var(--tx2)'}},algo?fmtL(algo.price):'\u2014'))),h('div',{className:'field'},h('label',null,'Final Approved Price (\u20B9) *'),h('input',{className:'inp',type:'number',value:approvedPrice,onChange:function(e){setApprovedPrice(e.target.value);},style:{fontFamily:'monospace',fontSize:16}}),approvedPrice&&h('div',{style:{fontSize:10,color:'var(--grn)',marginTop:3}},'= '+fmtL(approvedPrice)))),
      h('div',{className:'field'},h('label',null,'Comments'),h('textarea',{className:'inp',rows:2,value:comment,onChange:function(e){setComment(e.target.value);}})),
      h('div',{className:'modal-acts'},h('button',{className:'btn btn-ghost',onClick:function(){setModal(null);}},'Cancel'),h('button',{className:'btn '+(modal==='approve'?'btn-success':'btn-danger'),onClick:function(){if(modal==='approve')p.onApprove(vehicle.id,comment,parseInt(approvedPrice)||vehicle.price);else p.onReject(vehicle.id,comment);setModal(null);setComment('');setApprovedPrice('');}},modal==='approve'?'\u2713 Approve':'\u2717 Reject'))
    )
  );
}

function App(){
  var _user=useState(null);var user=_user[0];var setUser=_user[1];
  var _page=useState('dash');var page=_page[0];var setPage=_page[1];
  var _vehicles=useState([]);var vehicles=_vehicles[0];var setVehicles=_vehicles[1];
  var _leads=useState([]);var leads=_leads[0];var setLeads=_leads[1];
  var _sel=useState(null);var selVehicle=_sel[0];var setSelVehicle=_sel[1];
  var _toast=useState(null);var toast=_toast[0];var setToast=_toast[1];
  var _dbLive=useState(false);var dbLive=_dbLive[0];var setDbLive=_dbLive[1];
  var _saving=useState(false);var saving=_saving[0];var setSaving=_saving[1];
  function showToast(msg,type){setToast({msg:msg,type:type||'success'});}
  useEffect(function(){
    if(!fbDb)return;
    var u1=FB.listen('vehicles',function(docs){setDbLive(true);if(docs.length>0)setVehicles(docs);});
    var u2=FB.listen('leads',function(docs){setLeads(docs);});
    return function(){if(u1)u1();if(u2)u2();};
  },[]);
  var pendingCount=vehicles.filter(function(v){return v.status==='pending'||v.status==='review';}).length;
  var hotLeadCount=leads.filter(function(l){return l.stage==='hot';}).length;
  function handleApprove(id,comment,approvedPrice){
    var u={status:'approved',approved:today(),approved_price:approvedPrice,approval_comment:comment};
    setVehicles(function(vs){return vs.map(function(v){return v.id===id?Object.assign({},v,u):v;});});
    if(selVehicle&&selVehicle.id===id)setSelVehicle(function(v){return Object.assign({},v,u);});
    FB.update('vehicles',id,u).catch(function(e){console.error(e);});
    showToast('Approved! Price: '+fmtL(approvedPrice),'success');
  }
  function handleReject(id,comment){
    var u={status:'rejected',rejection_comment:comment};
    setVehicles(function(vs){return vs.map(function(v){return v.id===id?Object.assign({},v,u):v;});});
    if(selVehicle&&selVehicle.id===id)setSelVehicle(function(v){return Object.assign({},v,u);});
    FB.update('vehicles',id,u).catch(function(e){console.error(e);});
    showToast('Inspection rejected','error');
  }
  function handleDelete(id){setVehicles(function(vs){return vs.filter(function(v){return v.id!==id;});});FB.del('vehicles',id).catch(function(e){console.error(e);});showToast('Deleted','info');}
  function handleNewVehicle(vehicle){
    setSaving(true);setVehicles(function(vs){return [vehicle].concat(vs);});setPage('vehicles');
    FB.save('vehicles',vehicle).then(function(newId){setVehicles(function(vs){return vs.map(function(v){return v.id===vehicle.id?Object.assign({},v,{id:newId}):v;});});setSaving(false);showToast(vehicle.status==='draft'?'\u2713 Draft saved!':'\u2713 Submitted for approval!','success');}).catch(function(err){setSaving(false);var msg=err&&err.message?err.message:'';if(msg.includes('permission')||msg.includes('PERMISSION_DENIED'))showToast('Firestore rules \u2014 set allow read, write: if true','error');else showToast('Save issue: '+(msg||'check connection'),'error');});
  }
  function handleMarkSold(id,salePrice){var u={sold:true,sale_price:salePrice,sold_date:today()};setVehicles(function(vs){return vs.map(function(v){return v.id===id?Object.assign({},v,u):v;});});FB.update('vehicles',id,u).catch(function(e){console.error(e);});showToast('Marked as sold!','success');}
  function addLead(lead){setLeads(function(ls){return [lead].concat(ls);});FB.save('leads',lead).then(function(newId){setLeads(function(ls){return ls.map(function(l){return l.id===lead.id?Object.assign({},l,{id:newId}):l;});});}).catch(function(e){console.error(e);});}
  function updateLead(lead){setLeads(function(ls){return ls.map(function(l){return l.id===lead.id?lead:l;});});FB.update('leads',lead.id,lead).catch(function(e){console.error(e);});}
  function deleteLead(id){setLeads(function(ls){return ls.filter(function(l){return l.id!==id;});});FB.del('leads',id).catch(function(e){console.error(e);});showToast('Lead removed','info');}
  var titles={dash:'Dashboard',vehicles:'Procurement Evaluations',add:'New Inspection',approval:'Pending Approvals',inventory:'Vehicle Inventory',sales:'Sales CRM',projections:'Team Projections',mis:'MIS & Reports',users:'Employee Database',detail:'Vehicle Detail'};
  if(!user)return h(Login,{onLogin:function(u){setUser(u);setPage('dash');}});
  function renderPage(){
    if(page==='dash')return h(Dashboard,{vehicles:vehicles,leads:leads,user:user,setPage:setPage});
    if(page==='vehicles')return h(VehiclesList,{vehicles:vehicles,user:user,setPage:setPage,setSelectedVehicle:setSelVehicle,onAddNew:function(){setPage('add');},onDelete:handleDelete});
    if(page==='add')return h(NewInspection,{user:user,onSubmit:handleNewVehicle,onCancel:function(){setPage('vehicles');},showToast:showToast});
    if(page==='approval')return h(Approvals,{vehicles:vehicles,user:user,onApprove:handleApprove,onReject:handleReject,setPage:setPage,setSelectedVehicle:setSelVehicle});
    if(page==='inventory')return h(Inventory,{vehicles:vehicles,user:user,onMarkSold:handleMarkSold});
    if(page==='sales')return h(SalesCRM,{leads:leads,vehicles:vehicles,user:user,addLead:addLead,updateLead:updateLead,deleteLead:deleteLead,showToast:showToast});
    if(page==='projections')return h(Projections,{vehicles:vehicles,leads:leads,user:user,showToast:showToast});
    if(page==='mis')return h(MIS,{vehicles:vehicles,leads:leads,user:user});
    if(page==='users')return h(EmployeeDB,{vehicles:vehicles,showToast:showToast});
    if(page==='detail')return h(VehicleDetail,{vehicle:selVehicle,user:user,onBack:function(){setPage('vehicles');},onApprove:handleApprove,onReject:handleReject});
    return h(Dashboard,{vehicles:vehicles,leads:leads,user:user,setPage:setPage});
  }
  return h('div',{style:{display:'flex',minHeight:'100vh',width:'100%'}},
    h(Sidebar,{user:user,page:page,setPage:setPage,onLogout:function(){setUser(null);setPage('dash');},pendingCount:pendingCount,leadCount:hotLeadCount,dbLive:dbLive,saving:saving}),
    h('div',{className:'main'},
      h('div',{className:'topbar'},h('div',null,h('div',{className:'tb-title'},titles[page]||'Utrust CRM'),h('div',{className:'tb-sub'},'Utrust 2.0 \u00B7 Prakash Toyota \u00B7 '+user.branch)),h('div',{style:{display:'flex',gap:7,alignItems:'center'}},page!=='add'&&(user.role==='officer'||user.role==='admin')&&h('button',{className:'btn btn-acc btn-sm',onClick:function(){setPage('add');}},'\u2795 Inspect'))),
      h('div',{className:'content'},renderPage())
    ),
    toast&&h(Toast,{message:toast.msg,type:toast.type,onClose:function(){setToast(null);}})
  );
}

if(window.React&&window.ReactDOM){
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
}else{
  window.addEventListener('load',function(){setTimeout(function(){if(window.React&&window.ReactDOM)ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));},200);});
}

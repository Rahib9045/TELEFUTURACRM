import { useState, useCallback, useEffect, memo } from "react";


// ═══════════════════════════════════════════════════════════════
// v9 ENHANCEMENTS: Auto-save, Smart Defaults, Validation, Marginalità
// ═══════════════════════════════════════════════════════════════

// ── AUTO-SAVE ──
const useAutoSave=(key,state)=>{useEffect(()=>{try{sessionStorage.setItem(key,JSON.stringify(state))}catch(e){}},[key,state])};
const loadDraft=(key)=>{try{const d=sessionStorage.getItem(key);return d?JSON.parse(d):null}catch(e){return null}};
const clearDraft=(key)=>{try{sessionStorage.removeItem(key)}catch(e){}};

// ── VALIDATION ──
const vIMEI=(v)=>{if(!v)return null;const d=v.replace(/\D/g,"");if(!d.length)return null;if(d.length!==15)return{ok:false,msg:`${d.length}/15`};let s=0;for(let i=0;i<14;i++){let n=parseInt(d[i]);if(i%2===1)n*=2;if(n>9)n-=9;s+=n}return{ok:(10-s%10)%10===parseInt(d[14]),msg:d.length===15?"✓ Valido":""}};
const vICCID=(v)=>{if(!v)return null;const d=v.replace(/\D/g,"");if(!d.length)return null;return{ok:d.length>=19&&d.length<=20,msg:d.length>=19?`✓ ${d.length}`:`${d.length}/19-20`}};
const vCF=(v)=>{if(!v)return null;const u=v.toUpperCase().replace(/\s/g,"");if(!u.length)return null;if(u.length===11&&/^\d{11}$/.test(u))return{ok:true,msg:"P.IVA"};if(u.length!==16)return{ok:false,msg:`${u.length}/16`};return{ok:/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(u),msg:u.length===16?"✓":"err"}};

// ── MARGINALITÀ DATA ──
const MARG_PRODUCTS=[
  {cat:"📦 Prodotti",items:[
    {id:"plx",name:"PLX",price:null,fixedMargin:8,hasQty:true,icon:"📦",type:"fixed"},
    {id:"family_ontop",name:"Family+ On Top",price:null,fixedMargin:10,icon:"👨‍👩‍👧",type:"fixed"},
    {id:"cncp",name:"CN/CP",price:null,fixedMargin:2,hasQty:true,icon:"💳",type:"fixed"},
    {id:"new_cover",name:"New Cover",price:null,fixedMargin:8,hasQty:true,icon:"🔲",type:"fixed"},
    {id:"mem_pen",name:"Mem / Pen",price:null,fixedMargin:11,icon:"💾",type:"fixed"},
    {id:"salva_scontrino",name:"Salva Scontrino",price:null,fixedMargin:3,icon:"🧾",type:"fixed"},
    {id:"orologio",name:"Orologio Cash",price:null,fixedMargin:25,icon:"⌚",type:"fixed"},
    {id:"miband",name:"Mi Band 6",price:null,fixedMargin:15,icon:"⌚",type:"fixed"},
    {id:"powerbank",name:"PowerBank",price:null,fixedMargin:8,icon:"🔋",type:"fixed"},
  ]},
  {cat:"🔧 Servizi",items:[
    {id:"assistenza",name:"Assistenza Tecnico",price:null,pctMargin:81.97,icon:"🔧",type:"pct"},
    {id:"backup",name:"Backup",price:null,pctMargin:81.97,icon:"💿",type:"pct"},
    {id:"riparazione",name:"Riparazione",price:null,pctMargin:24.59,needsModel:true,icon:"🔨",type:"pct"},
    {id:"vendita_usato",name:"Vendita Usato",price:null,pctMargin:13.00,needsModel:true,needsImei:true,icon:"♻️",type:"pct"},
    {id:"chiusura",name:"Chiusura Sim/Fisso",price:null,pctMargin:81.97,icon:"✂️",type:"pct"},
    {id:"etelefono",name:"E.Telefono",price:null,pctMargin:81.97,icon:"📞",type:"pct"},
    {id:"accessori",name:"Accessori",price:null,pctMargin:24.59,hasQty:true,icon:"🎧",type:"pct"},
    {id:"extra_acc",name:"Extra Acc. Compass",price:null,pctMargin:65.00,icon:"🧭",type:"pct"},
    {id:"tel_senior",name:"Telefoni Senior",price:null,pctMargin:12.30,needsModel:true,icon:"📱",type:"pct"},
    {id:"earbuds",name:"Ear Buds",price:null,pctMargin:40.98,icon:"🎵",type:"pct"},
  ]},
  {cat:"🛡️ Kasko",items:[
    {id:"extra_kasko",name:"Extra Margine Kasko",price:null,pctMargin:40.00,icon:"🛡️",type:"pct"},
    {id:"plkasko",name:"PLKasko",price:null,pctMargin:60.00,icon:"🏷️",type:"pct"},
    {id:"kasko_sv",name:"Kasko SV",price:null,pctMargin:60.00,icon:"🔖",type:"pct"},
  ]},
  {cat:"📶 SIM",items:[
    {id:"sim1",name:"Sim 1€",price:1,fixedMargin:-4,linked:true,icon:"📶",type:"fixed"},
    {id:"sim5",name:"Sim 5€",price:5,fixedMargin:-7,linked:true,icon:"📶",type:"fixed"},
    {id:"sim_w3",name:"Sim Wind3",price:null,fixedMargin:-5,linked:true,icon:"📶",type:"fixed"},
    {id:"sim_fw",name:"Sim Fastweb",price:0,fixedMargin:-23,linked:true,icon:"📶",type:"fixed"},
    {id:"sost_fw",name:"Sost Fastweb",price:0,fixedMargin:0,linked:true,icon:"🔄",type:"fixed"},
    {id:"sim_iliad",name:"Sim Iliad",price:0,fixedMargin:-10,linked:true,icon:"📶",type:"fixed"},
    {id:"sost_vod",name:"Sost Vodafone",price:0,fixedMargin:-10,linked:true,icon:"🔄",type:"fixed"},
    {id:"sost_w3",name:"Sost Wind3",price:0,fixedMargin:-15,linked:true,icon:"🔄",type:"fixed"},
    {id:"sim_very",name:"Sim Very",price:0,fixedMargin:-7,linked:true,icon:"📶",type:"fixed"},
    {id:"sim_l",name:"Sim L",price:0,fixedMargin:-15,linked:true,icon:"📶",type:"fixed"},
    {id:"sim_next",name:"Sim Next",price:0,fixedMargin:-7,linked:true,icon:"📶",type:"fixed"},
    {id:"subentro",name:"Subentro/Reale Util.",price:0,fixedMargin:-10,linked:true,icon:"🔄",type:"fixed"},
  ]},
];

// ── MARGINALITÀ POS OVERLAY ──
const calcMargLabel=(selProd,price,qty)=>{
  if(!selProd)return"";
  const pVal=selProd.price!==null?selProd.price:parseFloat(price)||0;
  const mVal=selProd.type==="fixed"?(selProd.fixedMargin||0):selProd.type==="pct"?(pVal*(selProd.pctMargin||0)/100):0;
  const q=parseInt(qty)||1;
  const label=selProd.type==="pct"?`${selProd.pctMargin}% di €${pVal.toFixed(2)} = €${mVal.toFixed(2)}`:`€${mVal.toFixed(2)}`;
  return`${label}${q>1?` × ${q} = €${(mVal*q).toFixed(2)}`:""}`;
};
const MargPOS=memo(({show,onClose,venditore,negozio,onAdd})=>{
  const [selCat,setSelCat]=useState(0);
  const [selProd,setSelProd]=useState(null);
  const [price,setPrice]=useState("");
  const [qty,setQty]=useState("1");
  const [model,setModel]=useState("");
  const [imei,setImei]=useState("");
  if(!show)return null;
  const handleAdd=()=>{
    if(!selProd)return;
    const p=selProd;
    const pVal=p.price!==null?p.price:parseFloat(price)||0;
    const mVal=p.type==="fixed"?(p.fixedMargin||0):p.type==="pct"?(pVal*(p.pctMargin||0)/100):0;
    onAdd({product:p.name,productId:p.id,price:pVal,qty:parseInt(qty)||1,margin:mVal,totalMargin:mVal*(parseInt(qty)||1),model:model||null,imei:imei||null,venditore,negozio,date:new Date().toISOString().split("T")[0],linked:p.linked||false});
    setSelProd(null);setPrice("");setQty("1");setModel("");setImei("");
  };
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <style>{`@keyframes margSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:640,maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 -4px 30px rgba(0,0,0,.2)",animation:"margSlideUp 0.32s cubic-bezier(0.22,1,0.36,1)"}}>
      <div style={{padding:"16px 20px",borderBottom:"2px solid #f0f0f0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:16,fontWeight:800,color:"#1a1a2e"}}>📦 Registra Prodotto</div><div style={{fontSize:11,color:"#888"}}>{venditore||"—"} • {negozio||"—"} • {new Date().toLocaleDateString("it-IT")}</div></div>
        <button onClick={onClose} style={{padding:"6px 14px",borderRadius:8,border:"1px solid #ccc",background:"#fff",color:"#555",fontSize:12,fontWeight:600,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:4,padding:"10px 16px",overflowX:"auto",borderBottom:"1px solid #f0f0f0"}}>
        {MARG_PRODUCTS.map((cat,ci)=>(<button key={ci} onClick={()=>{setSelCat(ci);setSelProd(null)}} style={{padding:"6px 14px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",border:selCat===ci?"2px solid #6f42c1":"2px solid #e0e0e0",background:selCat===ci?"#f0ebff":"#fff",color:selCat===ci?"#6f42c1":"#555"}}>{cat.cat}</button>))}
      </div>
      <div style={{flex:1,overflow:"auto",padding:16}}>
        {!selProd?(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:8}}>
          {MARG_PRODUCTS[selCat].items.map(p=>(<button key={p.id} onClick={()=>{setSelProd(p);if(p.price!==null)setPrice(String(p.price))}} style={{padding:"14px 8px",borderRadius:12,border:"1px solid #e8e8e8",background:"#fafbfc",cursor:"pointer",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <span style={{fontSize:22}}>{p.icon}</span>
            <span style={{fontSize:10,fontWeight:600,color:"#333",lineHeight:1.2}}>{p.name}</span>
            {p.type==="fixed"&&p.fixedMargin!==null&&<span style={{fontSize:9,color:p.fixedMargin>=0?"#28a745":"#dc3545",fontWeight:700}}>€{p.fixedMargin}</span>}
            {p.type==="pct"&&p.pctMargin!==null&&<span style={{fontSize:9,color:"#2E75B6",fontWeight:700}}>{p.pctMargin}%</span>}
          </button>))}
        </div>):(<div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <button onClick={()=>setSelProd(null)} style={{background:"none",border:"none",color:"#6f42c1",fontSize:13,cursor:"pointer",fontWeight:600}}>← Indietro</button>
            <span style={{fontSize:22}}>{selProd.icon}</span>
            <span style={{fontSize:16,fontWeight:800,color:"#333"}}>{selProd.name}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div><div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Prezzo € {selProd.price!==null&&<span style={{color:"#6f42c1"}}>(fisso: €{selProd.price})</span>}</div>
              <input value={price} onChange={e=>setPrice(e.target.value)} type="number" step="0.01" disabled={selProd.price!==null&&selProd.type==="fixed"&&selProd.fixedMargin!==null} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #d0d0d0",fontSize:14,fontWeight:700,boxSizing:"border-box"}}/></div>
            {selProd.hasQty&&<div><div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Quantità</div>
              <input value={qty} onChange={e=>setQty(e.target.value)} type="number" min="1" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #d0d0d0",fontSize:14,fontWeight:700,boxSizing:"border-box"}}/></div>}
          </div>
          {selProd.needsModel&&<div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Modello</div><input value={model} onChange={e=>setModel(e.target.value)} placeholder="es. iPhone 15..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #d0d0d0",fontSize:13,boxSizing:"border-box"}}/></div>}
          {selProd.needsImei&&<div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>IMEI</div><input value={imei} onChange={e=>setImei(e.target.value)} placeholder="15 cifre" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #d0d0d0",fontSize:13,boxSizing:"border-box",fontFamily:"monospace"}}/></div>}
          <div style={{padding:12,background:"#f0f7ff",borderRadius:10,border:"1px solid #b8d4f0",marginBottom:14,display:"flex",justifyContent:"space-between",fontSize:12}}>
            <span style={{color:"#555"}}>Margine:</span>
            <span style={{fontWeight:700,color:selProd.type==="fixed"?(selProd.fixedMargin>=0?"#28a745":"#dc3545"):"#2E75B6"}}>{calcMargLabel(selProd,price,qty)}</span>
          </div>
          <button onClick={handleAdd} style={{width:"100%",padding:14,borderRadius:12,border:"none",background:"linear-gradient(135deg,#6f42c1,#9b59b6)",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>✅ Registra {selProd.name}</button>
        </div>)}
      </div>
    </div>
  </div>);
});

const MargList=memo(({items,onRemove,show,onClose})=>{
  if(!show)return null;
  const total=items.reduce((s,i)=>s+i.totalMargin,0);
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:500,maxHeight:"80vh",overflow:"auto",padding:20,boxShadow:"0 8px 30px rgba(0,0,0,.2)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontSize:16,fontWeight:800,color:"#1a1a2e"}}>📦 Prodotti ({items.length})</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:16}}>✕</button>
      </div>
      {items.length===0?<div style={{textAlign:"center",padding:20,color:"#999"}}>Nessun prodotto</div>:items.map((it,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
          <div><div style={{fontSize:12,fontWeight:600,color:"#333"}}>{it.product} {it.qty>1&&`×${it.qty}`}</div><div style={{fontSize:10,color:"#888"}}>{it.model||""}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,fontWeight:700,color:it.totalMargin>=0?"#28a745":"#dc3545"}}>€{it.totalMargin.toFixed(2)}</span>
            <button onClick={()=>onRemove(i)} style={{background:"none",border:"none",color:"#dc3545",cursor:"pointer",fontSize:11}}>✕</button>
          </div>
        </div>
      ))}
      {items.length>0&&<div style={{marginTop:12,padding:12,background:"#f0f7ff",borderRadius:10,display:"flex",justifyContent:"space-between"}}>
        <span style={{fontWeight:700}}>Totale margine</span>
        <span style={{fontWeight:900,fontSize:18,color:total>=0?"#28a745":"#dc3545"}}>€{total.toFixed(2)}</span>
      </div>}
    </div>
  </div>);
});


const BRANDS = [
  { id: "windtre", label: "WindTre", short: "W3", color: "#FF6B00", gradient: "linear-gradient(135deg, #1B3A5C 0%, #2E75B6 100%)", icon: "📶", desc: "Mobile, Fisso, Luce & Gas, Assicurazioni, Protecta", ready: true },
  { id: "sky", label: "Sky", short: "SKY", color: "#0072C6", gradient: "linear-gradient(135deg, #003366 0%, #0072C6 100%)", icon: "📺", desc: "TV, Fibra, Mobile, Glass, Pacchetti combinati", ready: true },
  { id: "vodafone", label: "Vodafone", short: "VF", color: "#E60000", gradient: "linear-gradient(135deg, #990000 0%, #E60000 100%)", icon: "📱", desc: "Mobile, Fisso, Luce & Gas, Assicurazioni, Protecta", ready: true },
  { id: "fastweb", label: "Fastweb", short: "FW", color: "#FFD800", gradient: "linear-gradient(135deg, #CC9900 0%, #FFD800 100%)", icon: "⚡", desc: "Mobile, Fisso, Energy", ready: false },
  { id: "iliad", label: "Iliad", short: "IL", color: "#C00028", gradient: "linear-gradient(135deg, #800018 0%, #C00028 100%)", icon: "📡", desc: "Mobile e Fisso (Fibra)", ready: false },
  { id: "energy", label: "Energy", short: "EN", color: "#28a745", gradient: "linear-gradient(135deg, #1a6b2d 0%, #28a745 100%)", icon: "🔋", desc: "Forniture Luce e Gas (S4, Barton)", ready: false },
];
const codiciW3 = ["Magliana","Libia","San Paolo","Mazzini","Donna","Promontori","Collatina"];
const venditori = ["Alberto","Alex","Alin","Asad","Ben Aziza","Cristhian","Cristi","Damiano","Daniel","Daniele2","Denise","Dimitri","Eloise","Eros","Fadel","Federico","Francesca","Francesco","George","Giacomo","Gian","Giulia","Giuseppe B.","Ilaria","Lorenzo","Manu","Marta","Marta2","Marta3","Matteo","Michele","Riccardo","Roberto","Samantha","Sheekell","Tommaso","Veronica"];
const negozi = ["Magliana","Donna","Libia","Collatina","Mazzini","San Paolo","Garbatella","Promontori","Acilia","Baleniere","Castani","Merulana","Telefonico"];
const opProv = ["WindTre","Vodafone","Tim","Fastweb","Iliad","Enel","Eni","A2A","Edison","Hera","Sorgenia","Plenitude","Altro"];
const brandMNP = ["TIM","Vodafone","WindTre","Iliad","Fastweb Mobile","PosteMobile","ho. Mobile","Kena Mobile","Very Mobile","CoopVoce","Spusu","Lyca Mobile","1Mobile","Tiscali Mobile","Digi Mobil","Noitel","Optima Mobile","Feder Mobile","Rabona Mobile","Elimobile","BT Italia","Segnoverde Mobile","Uno Mobile","Saily","Visitel","Ops! Mobile"];
const SKY_P = { privato: ["TV","TV 14,90","Sky Glass","Fibra","3P","4P","Sky Mobile"], business: ["Sky TV Uffici","Sky Fibra P.IVA"] };
const SKY_TV = ["TV","TV 14,90","Sky Glass"];
const SKY_FIBRA = ["Fibra","3P","4P"];
const SKY_BRAND_FIBRA = ["TIM","Vodafone","Fastweb","WINDTRE","Tiscali","Sky","BT Enia","Ehiweb","Open Fiber","Infratel","Vianova","Isiline","Convergenze","Full Telecom","Optima","Fibra.tn"];
const emS = () => ({active:true,fields:{},contract:{},gnp:false,gnpNum:"",gnpOp:"",secondaLinea:false,gnp2L:null,gnp2LBrand:"",gnp2LNum:"",domiciliazione:false,opProvenienza:"",codiceOverride:"",addons:{},domiciliato:null,convergente:null,tipMob:null,mnp:null,easyPay:null,tnpGa:null,tnpTipo:"",tnpModello:"",tnpImei:"",tnpCount:null,tnpModelli:[],tnpImeis:[],packAccessori:null,packAccessoriVal:"",packAccessoriQta:"",cbTnp:false,cbTnpTipo:"",cbTnpModello:"",cbTnpImei:"",cbTnpCount:null,cbTnpModelli:[],cbTnpImeis:[],cbPackAccessori:null,cbPackAccessoriVal:"",cbPackAccessoriQta:"",cbTnpCell:"",cbTnpCC:"",cbTnpCodIns:"",cbTnpReload:null,cbTnpReloadSel:{},cbCambio:false,cbCambioVal:"",cbCambioCell:"",cbCambioCC:"",cbCambioCodIns:"",cbAddonSel:{},rfModello:"",rfImei:"",cbRf:false,cbAddonCodIns:"",cbRfCodIns:"",tnpGaReload:null,tnpGaReloadSel:{},reloadForever:null,securitySel:{},voceCasaCb:null,vfOffers:{},vfContratti:{}});

const SMARTPHONES = ["Samsung Galaxy S25 Ultra","Samsung Galaxy S25+","Samsung Galaxy S25","Samsung Galaxy S24 FE","Samsung Galaxy A56","Samsung Galaxy A36","Samsung Galaxy A16","iPhone 16 Pro Max","iPhone 16 Pro","iPhone 16 Plus","iPhone 16","iPhone 15","iPhone SE 4","Xiaomi 15 Ultra","Xiaomi 15 Pro","Xiaomi 15","Xiaomi 14T Pro","Xiaomi Redmi Note 14 Pro+","Xiaomi Redmi Note 14 Pro","Xiaomi Redmi Note 14","OPPO Find X8 Pro","OPPO Reno 12 Pro","OPPO A80","Google Pixel 9 Pro","Google Pixel 9","Google Pixel 8a","Motorola Edge 50 Ultra","Motorola Edge 50 Pro","Motorola Moto G85","Honor Magic 7 Pro","Honor 200 Pro","Nothing Phone (2a)","Realme GT 7 Pro"];

const getW3 = (tc) => {
  const biz = tc === "business";
  return [
    { id:"mobile", title:"MOBILE", icon:"📱", color:"#2E75B6", radio:true, subs:[
      { id:"ga", title:"MOBILE", hasContract:true, ct:"ga",
        isMobile: !biz,
        isMobileBiz: biz,
        bizOffers: biz ? ["FWA Indoor PIVA","Professional Full","Professional Staff","Professional Special","Professional Flexy/Sim Dati","Professional World"] : null,
        mobOffers: biz ? null : {
          "Underground_Sì": ["EP LOCAL 4,99","EP LOCAL 5,99","EP LOCAL 6,99","EP LOCAL 7,99","EP LOCAL 8,99","EP LOCAL 9,99","EP LOCAL 10,99"],
          "Underground_No": ["RIC LOCAL 4,99","RIC LOCAL 5,99","RIC LOCAL 6,99","RIC LOCAL 7,99","RIC LOCAL 8,99","RIC LOCAL 9,99","RIC LOCAL 10,99"],
          "Mass Market_Sì": ["SPECIAL 5G","START UNLIMITED 5G","UNLIMITED 5G","UNLIMITED PRO 5G","UNLIMITED 5G SUPER FIBRA","FAMILY UNLIMITED 200","MULTISERVICE","SUPER 5G UNDER 14 6.99","SUPER 5G UNDER 14 9.99","CYC UNLIMITED PLUS","CYC UNLIMITED SUPER","CYC UNLIMITED ULTRA","CYC UNLIMITED FULL","CYC UNLIMITED MARTISOR","CYC UNLIMITED RAMADAM","PACK 5G RELOAD EXCHANGE","GIGA SPECIAL","FWA INDOOR"],
          "Mass Market_No": ["SPECIAL 5G","START UNLIMITED 5G","UNLIMITED 5G","UNLIMITED PRO 5G","UNLIMITED 5G SUPER FIBRA","FAMILY UNLIMITED 200","MULTISERVICE","SUPER 5G UNDER 14 6.99","SUPER 5G UNDER 14 9.99","CYC UNLIMITED PLUS","CYC UNLIMITED SUPER","CYC UNLIMITED ULTRA","CYC UNLIMITED FULL","CYC UNLIMITED MARTISOR","CYC UNLIMITED RAMADAM","PACK 5G RELOAD EXCHANGE","GIGA 150 5G","GIGA 250 5G","GIGA UNLIMITED 5G","GIGA START&STOP","SMART SECURITY"],
        },
        fields: [{key:"offerta",label:"Offerta Mobile",values:[]}]
      },
      ...(biz?[]:[{ id:"cb", title:"CB", isCB:true,
          cbTnpVals:["Rata 0","Finanziamento 0","Rata >0","Finanziamento > 0"],
          cbCambioVals:["Caring","CL0","CL1","CL1 EP","CL2","CL2 EP","CL3","CL3 EP","Migrazione FTTH"],
          cbAddonVals:["Add-on","Security Ric","Security EP","Security Pro Ric","Security Pro EP","Home Protect Fisso","Netflix Fisso"],
          fields:[]}]
      ),
      ...(biz?[{ id:"cb", title:"CB", isCB:true, isCBBiz:true,
          cbTnpVals:["Rata 0","Rata >0"],
          cbCambioVals:["CL1 EP"],
          cbAddonVals:["Security"],
          fields:[]}]:[]),
    ]},
    { id:"fisso", title:"FISSO", icon:"🏠", color:"#28a745", radio:true, subs:[
      { id:"fisso_std", title:"FISSO", hasContract:true, ct:"fisso", isFisso:true, hasGnpQ:true, has2LQ:biz, hasAddons:true, addonList:biz?["Più Sicuri Ufficio","FTTH","DNS DINAMICO","FritzBox"]:["Netflix","Home Protect","FTTH","Chiamate Illimitate","CYC HOME"], fields:[]},
      { id:"fisso_cb", title:"FISSO CB", hasContract:true, ct:"fisso", isFisso:true, hasGnpQ:true, has2LQ:biz, hasVoceCasaQ:!biz, hasAddons:true, addonList:biz?["Più Sicuri Ufficio","FTTH","DNS DINAMICO","FritzBox"]:["Netflix","Home Protect","FTTH","Chiamate Illimitate","CYC HOME"], fields:[]},
      { id:"fwa_indoor", title:"FWA INDOOR 2P", hasContract:true, ct:"fisso", isFisso:true, hasGnpQ:true, has2LQ:biz, hasAddons:true, hasFwaImei:true, domLocked:true, addonList:biz?["Più Sicuri Ufficio","FTTH","DNS DINAMICO","FritzBox"]:["Netflix","Home Protect","FTTH","Chiamate Illimitate","CYC HOME"], fields:[]},
      { id:"fwa_outdoor", title:"FWA OUTDOOR", hasContract:true, ct:"fisso", isFisso:true, hasGnpQ:true, has2LQ:biz, hasAddons:true, domLocked:true, addonList:biz?["Più Sicuri Ufficio","FTTH","DNS DINAMICO","FritzBox"]:["Netflix","Home Protect","FTTH","Chiamate Illimitate","CYC HOME"], fields:[]},
      ...(!biz?[{ id:"voce_casa", title:"VOCE CASA", hasContract:true, ct:"fisso", isFisso:true, isVoceCasa:true, hasGnpQ:true, has2LQ:false, fields:[]}]:[]),
    ]},
    { id:"luce_gas", title:"LUCE E GAS", icon:"💡", color:"#fd7e14", radio:true, subs:[
      { id:"luce", title:"Luce", hasContract:true, ct:"lg", hasDom:true, hasConvLG:true, fields:[]},
      { id:"gas", title:"Gas", hasContract:true, ct:"lg", hasDom:true, hasConvLG:true, fields:[]},
    ]},
    { id:"multi", title:"MULTI-SERVIZI", icon:"🛡️", color:"#6f42c1", radio:true, subs:[
      ...(!biz?[{id:"assicurazioni",title:"Assicurazioni",hasAddons:true,hasContract:true,ct:"multi",addonList:["Casa Start","Casa Plus","Casa Full","Sport","Micio e Fido","Viaggi","Sport Famiglia","Elettrodomestici"],fields:[]}]:[]),
      ...(biz?[{id:"assicurazioni",title:"Assicurazioni",isAssicBiz:true,hasContract:true,ct:"multi",fields:[]}]:[]),
      { id:"protecta", title:"Protecta", isProtecta:true, isBizProtecta:biz, hasContract:true, ct:"multi", fields:[]},
    ]},
  ];
};

const getVF = (tc) => {
  const biz = tc === "business";
  return [
    { id:"mobile", title:"MOBILE", icon:"📱", color:"#E60000", radio:true, subs:[
      { id:"ga", title:"MOBILE", hasContract:true, ct:"ga",
        isVFMobile: !biz,
        isMobileBiz: biz,
        bizOffers: biz ? ["Business S","Business M","Business L","Business XL","Professional","Professional Plus","Professional Max"] : null,
        vfOffers: !biz ? ["Start","Pro","Power","Ultra","Call Max","Call Power","Dolcevita","Dolcevita+"] : null,
        fields: [{key:"offerta",label:"Offerta Mobile",values:[]}]
      },
      ...(biz?[]:[{ id:"cb", title:"CB", isCB:true,
          cbTnpVals:["Rata 0","Finanziamento 0","Rata >0","Finanziamento > 0"],
          cbCambioVals:["Caring","CL0","CL1","CL1 EP","CL2","CL2 EP","CL3","CL3 EP","Migrazione FTTH"],
          cbAddonVals:["Add-on","Security Ric","Security EP","Security Pro Ric","Security Pro EP","Home Protect Fisso","Netflix Fisso"],
          fields:[]}]
      ),
      ...(biz?[{ id:"cb", title:"CB", isCB:true, isCBBiz:true,
          cbTnpVals:["Rata 0","Rata >0"],
          cbCambioVals:["CL1 EP"],
          cbAddonVals:["Security"],
          fields:[]}]:[]),
    ]},
    { id:"fisso", title:"FISSO", icon:"🏠", color:"#28a745", radio:true, subs:[
      { id:"fisso_std", title:"FISSO", hasContract:true, ct:"fisso", isFisso:true, hasGnpQ:true, has2LQ:biz, hasAddons:true, addonList:biz?["Vodafone TV","Sicurezza Rete","Static IP","Office 365"]:["Vodafone TV","Home Protect","Chiamate Illimitate","Netflix"], fields:[]},
      { id:"fisso_cb", title:"FISSO CB", hasContract:true, ct:"fisso", isFisso:true, hasGnpQ:true, has2LQ:biz, hasVoceCasaQ:!biz, hasAddons:true, addonList:biz?["Vodafone TV","Sicurezza Rete","Static IP","Office 365"]:["Vodafone TV","Home Protect","Chiamate Illimitate","Netflix"], fields:[]},
      { id:"fwa_indoor", title:"FWA INDOOR 2P", hasContract:true, ct:"fisso", isFisso:true, hasGnpQ:true, has2LQ:biz, hasAddons:true, hasFwaImei:true, domLocked:true, addonList:biz?["Vodafone TV","Sicurezza Rete","Static IP","Office 365"]:["Vodafone TV","Home Protect","Chiamate Illimitate","Netflix"], fields:[]},
      { id:"fwa_outdoor", title:"FWA OUTDOOR", hasContract:true, ct:"fisso", isFisso:true, hasGnpQ:true, has2LQ:biz, hasAddons:true, domLocked:true, addonList:biz?["Vodafone TV","Sicurezza Rete","Static IP","Office 365"]:["Vodafone TV","Home Protect","Chiamate Illimitate","Netflix"], fields:[]},
      ...(!biz?[{ id:"voce_casa", title:"VOCE CASA", hasContract:true, ct:"fisso", isFisso:true, isVoceCasa:true, hasGnpQ:true, has2LQ:false, fields:[]}]:[]),
    ]},
    ...(biz?[{ id:"luce_gas", title:"SOLUZIONI DIGITALI", icon:"💼", color:"#6f42c1", radio:true, subs:[
      { id:"luce", title:"Luce", hasContract:true, ct:"lg", hasDom:true, hasConvLG:true, fields:[]},
      { id:"gas", title:"Gas", hasContract:true, ct:"lg", hasDom:true, hasConvLG:true, fields:[]},
    ]}]:[]),
    { id:"multi", title:"MULTI-SERVIZI", icon:"🛡️", color:"#6f42c1", radio:true, subs:[
      ...(!biz?[{id:"assicurazioni",title:"Assicurazioni",hasAddons:true,hasContract:true,ct:"multi",addonList:["Casa Start","Casa Plus","Casa Full","Sport","Micio e Fido","Viaggi","Sport Famiglia","Elettrodomestici"],fields:[]}]:[]),
      ...(biz?[{id:"assicurazioni",title:"Assicurazioni",isAssicBiz:true,hasContract:true,ct:"multi",fields:[]}]:[]),
      { id:"protecta", title:"Protecta", isProtecta:true, isBizProtecta:biz, hasContract:true, ct:"multi", fields:[]},
    ]},
  ];
};


// ── Small components (no return keyword needed with arrow implicit) ──────

const YN = ({val,onCh,label}) => (
  <div style={{marginTop:8,padding:10,background:"#f8fafc",borderRadius:8,border:"1px solid #e0e0e0"}}>
    <div style={{fontSize:12,fontWeight:700,color:"#333",marginBottom:6}}>{label}</div>
    <div style={{display:"flex",gap:8}}>
      <button onClick={()=>onCh(true)} style={{padding:"6px 20px",borderRadius:6,border:val===true?"2px solid #28a745":"2px solid #e0e0e0",background:val===true?"#d4edda":"#fff",color:val===true?"#155724":"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>Sì</button>
      <button onClick={()=>onCh(false)} style={{padding:"6px 20px",borderRadius:6,border:val===false?"2px solid #dc3545":"2px solid #e0e0e0",background:val===false?"#f8d7da":"#fff",color:val===false?"#721c24":"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>No</button>
    </div>
  </div>
);

const TF = ({l,r,v,o,p,pf,dis,nt}) => (
  <div>
    <div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>{l} {r&&<span style={{color:"#dc3545"}}>*</span>}</div>
    <input value={v||""} onChange={e=>o&&o(e.target.value)} placeholder={p} disabled={dis} readOnly={dis}
      style={{width:"100%",padding:"7px 10px",borderRadius:6,border:dis?"2px solid #17a2b8":pf?"2px solid #28a745":"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box",background:dis?"#e8f4f8":pf?"#f0fff0":"#fff",color:dis?"#17a2b8":"#333",fontStyle:dis?"italic":"normal"}} />
    {nt&&<div style={{fontSize:10,color:dis?"#17a2b8":"#888",marginTop:2}}>{nt}</div>}
  </div>
);

const DD = ({l,r,v,o,vals,nt}) => (
  <div>
    <div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>{l} {r&&<span style={{color:"#dc3545"}}>*</span>}</div>
    <select value={v||""} onChange={e=>o&&o(e.target.value)} style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}>
      <option value="">— Seleziona —</option>
      {vals.map(x=><option key={x} value={x}>{x}</option>)}
    </select>
    {nt&&<div style={{fontSize:10,color:"#888",marginTop:2}}>{nt}</div>}
  </div>
);

const SCd = ({session,codici,val,onCh}) => {
  const actual=val||session||"";
  const isOv=val&&val!==session;
  const content = (
    <div>
      <div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Codice <span style={{color:"#dc3545"}}>*</span></div>
      <select value={actual} onChange={e=>onCh(e.target.value)} style={{width:"100%",padding:"7px 10px",borderRadius:6,fontSize:12,border:actual?"2px solid #28a745":"1px solid #d0d0d0",background:actual&&!isOv?"#f0fff0":"#fff"}}>
        <option value="">— Seleziona —</option>
        {codici.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
      {actual&&!isOv&&<div style={{fontSize:10,color:"#28a745",marginTop:2}}>✓ Da codice inserimento</div>}
      {isOv&&<div style={{fontSize:10,color:"#fd7e14",marginTop:2}}>⚠ Modificato</div>}
    </div>
  );
  return content;
};

const CartItem = ({it,ii,gi,total,expI,setExpI}) => {
  const exp = expI[gi+"_"+ii];
  const dets = it.details ? Object.entries(it.details).filter(([k,v])=>v&&k!=="hasContract") : [];
  const content = (
    <div style={{borderBottom:ii<total-1?"1px solid #f0f0f0":"none"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}>
        <span style={{fontSize:14}}>{it.macroIcon}</span><span style={{fontSize:12,fontWeight:600,color:it.macroColor}}>{it.macro}</span><span style={{color:"#ccc"}}>›</span><span style={{fontSize:12,color:"#333"}}>{it.sub}</span>
        {it.details&&it.details.hasContract&&<span style={{fontSize:9,fontWeight:600,color:"#fff",background:it.macroColor,padding:"1px 6px",borderRadius:4}}>CONTRATTO</span>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,color:"#bbb"}}>V.#{it.saleNum}</span>
          <button onClick={()=>setExpI(p=>({...p,[gi+"_"+ii]:!p[gi+"_"+ii]}))} style={{background:exp?"#f0f7ff":"#f8f9fa",border:exp?"1px solid #2E75B6":"1px solid #e0e0e0",borderRadius:5,padding:"3px 10px",fontSize:10,fontWeight:600,cursor:"pointer",color:exp?"#2E75B6":"#888"}}>{exp?"▲ Nascondi":"👁 Mostra"}</button>
        </div>
      </div>
      {exp&&<div style={{padding:"8px 12px 12px 32px"}}><div style={{background:"#f8fafc",borderRadius:8,padding:12,border:"1px solid #e8edf2"}}><div style={{fontSize:11,fontWeight:700,color:it.macroColor,marginBottom:8}}>📋 {it.sub}</div>
        {dets.length>0?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px"}}>{dets.map(([k,v])=><div key={k}><span style={{fontSize:10,fontWeight:600,color:"#888",textTransform:"uppercase"}}>{k}</span><div style={{fontSize:12,color:"#333",marginTop:1}}>{String(v)}</div></div>)}</div>
        :<div style={{fontSize:12,color:"#999"}}>Nessun dettaglio — premi ✏️ Modifica</div>}
      </div></div>}
    </div>
  );
  return content;
};

// ── SubCard: renders one active product sub-section ──────────────────────


// Compact binary choice that shrinks after selection
const MiniC = ({label,val,onCh,opts,locked,lockVal}) => {
  const isSet = val !== null && val !== undefined;
  const o1 = opts ? opts[0] : "Sì";
  const o2 = opts ? opts[1] : "No";
  const actual = locked ? lockVal : val;
  const content = (
    <div style={{marginBottom:isSet?4:8}}>
      {isSet ? (
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0"}}>
          <span style={{fontSize:10,fontWeight:600,color:"#888"}}>{label}:</span>
          <span style={{fontSize:11,fontWeight:700,color:(actual===o1||actual===true)?"#2E75B6":"#555",background:(actual===o1||actual===true)?"#e8f0fe":"#f5f5f5",padding:"2px 10px",borderRadius:4}}>{actual===true?o1:actual===false?o2:String(actual)}</span>
          {!locked&&<button onClick={()=>onCh(null)} style={{background:"none",border:"none",fontSize:10,color:"#bbb",cursor:"pointer",padding:0}}>✎</button>}
          {locked&&<span style={{fontSize:9,color:"#999",fontStyle:"italic"}}>fisso</span>}
        </div>
      ) : (
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"#333",marginBottom:4}}>{label}</div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>onCh(opts?o1:true)} style={{padding:"7px 18px",borderRadius:6,border:"2px solid #e0e0e0",background:"#fff",color:"#555",fontSize:12,fontWeight:700,cursor:"pointer"}}>{o1}</button>
            <button onClick={()=>onCh(opts?o2:false)} style={{padding:"7px 18px",borderRadius:6,border:"2px solid #e0e0e0",background:"#fff",color:"#555",fontSize:12,fontWeight:700,cursor:"pointer"}}>{o2}</button>
          </div>
        </div>
      )}
    </div>
  );
  return content;
};

const SubCard = ({sub,rawSd,group,si,sessionCode,sale,uF,uC,uP,catSales,anaCel,onOpenVFModal}) => {
  const _r = rawSd || {};
  const sd = {active:true,fields:_r.fields||{},contract:_r.contract||{},gnp:_r.gnp||false,gnpNum:_r.gnpNum||"",gnpOp:_r.gnpOp||"",secondaLinea:_r.secondaLinea||false,gnp2L:_r.gnp2L!=null?_r.gnp2L:null,gnp2LBrand:_r.gnp2LBrand||"",gnp2LNum:_r.gnp2LNum||"",domiciliazione:_r.domiciliazione||false,opProvenienza:_r.opProvenienza||"",codiceOverride:_r.codiceOverride||"",addons:_r.addons||{},domiciliato:_r.domiciliato!=null?_r.domiciliato:null,convergente:_r.convergente!=null?_r.convergente:null,tipMob:_r.tipMob!=null?_r.tipMob:null,mnp:_r.mnp!=null?_r.mnp:null,easyPay:_r.easyPay!=null?_r.easyPay:null,tnpGa:_r.tnpGa!=null?_r.tnpGa:null,tnpTipo:_r.tnpTipo||"",tnpModello:_r.tnpModello||"",tnpImei:_r.tnpImei||"",tnpCount:_r.tnpCount||null,tnpModelli:_r.tnpModelli||[],tnpImeis:_r.tnpImeis||[],packAccessori:_r.packAccessori!=null?_r.packAccessori:null,packAccessoriVal:_r.packAccessoriVal||"",packAccessoriQta:_r.packAccessoriQta||"",domiciliazione:_r.domiciliazione||false,opProvenienza:_r.opProvenienza||"",codiceOverride:_r.codiceOverride||"",addons:_r.addons||{},domiciliato:_r.domiciliato!=null?_r.domiciliato:null,convergente:_r.convergente!=null?_r.convergente:null,tipMob:_r.tipMob!=null?_r.tipMob:null,mnp:_r.mnp!=null?_r.mnp:null,easyPay:_r.easyPay!=null?_r.easyPay:null,tnpGa:_r.tnpGa!=null?_r.tnpGa:null,tnpTipo:_r.tnpTipo||"",tnpModello:_r.tnpModello||"",tnpImei:_r.tnpImei||"",cbTnp:_r.cbTnp||false,cbTnpTipo:_r.cbTnpTipo||"",cbTnpModello:_r.cbTnpModello||"",cbTnpImei:_r.cbTnpImei||"",cbTnpCount:_r.cbTnpCount||null,cbTnpModelli:_r.cbTnpModelli||[],cbTnpImeis:_r.cbTnpImeis||[],cbPackAccessori:_r.cbPackAccessori!=null?_r.cbPackAccessori:null,cbPackAccessoriVal:_r.cbPackAccessoriVal||"",cbPackAccessoriQta:_r.cbPackAccessoriQta||"",cbTnpCell:_r.cbTnpCell||"",cbTnpCC:_r.cbTnpCC||"",cbTnpCodIns:_r.cbTnpCodIns||"",cbTnpReload:_r.cbTnpReload!=null?_r.cbTnpReload:null,cbTnpReloadSel:_r.cbTnpReloadSel||{},cbCambio:_r.cbCambio||false,cbCambioVal:_r.cbCambioVal||"",cbCambioCell:_r.cbCambioCell||"",cbCambioCC:_r.cbCambioCC||"",cbCambioCodIns:_r.cbCambioCodIns||"",cbAddonSel:_r.cbAddonSel||{},rfModello:_r.rfModello||"",rfImei:_r.rfImei||"",cbRf:_r.cbRf||false,cbAddonCodIns:_r.cbAddonCodIns||"",cbRfCodIns:_r.cbRfCodIns||"",tnpGaReload:_r.tnpGaReload!=null?_r.tnpGaReload:null,tnpGaReloadSel:_r.tnpGaReloadSel||{},reloadForever:_r.reloadForever!=null?_r.reloadForever:null,securitySel:_r.securitySel||{},voceCasaCb:_r.voceCasaCb!=null?_r.voceCasaCb:null,vfOffers:_r.vfOffers||{},vfContratti:_r.vfContratti||{}};
  const f=sd.fields;
  const c=sd.contract;
  const gaOn=sale.ga&&sale.ga.active;
  const gaC=gaOn&&sale.ga.contract?sale.ga.contract:{};
  const toggleAddon=(name)=>{const cur=sd.addons[name];uP(group.id,si,sub.id,"addons",{...sd.addons,[name]:!cur})};
  const fissoDefVal = (sd.gnp && sd.gnpNum) ? sd.gnpNum : (c.num_fisso_def || "");
  const fissoDefLocked = !!(sd.gnp && sd.gnpNum);
  const lgConvLocked = (() => {
    if (!sub.hasConvLG || !catSales) return false;
    for (let sx = 0; sx < catSales.length; sx++) {
      const s = catSales[sx]; if (!s) continue;
      const ids = ["luce","gas"];
      for (let k = 0; k < ids.length; k++) { const d = s[ids[k]]; if (d && d.active && d.convergente === true && (sx !== si || ids[k] !== sub.id)) return true; }
    }
    return false;
  })();
  const isUnd = sd.tipMob === "Underground";
  const mnpVal = isUnd ? true : sd.mnp;
  const showMnpF = mnpVal === true || mnpVal === "Sì";
  const mobDone = sd.tipMob !== null && (isUnd || sd.mnp !== null) && sd.easyPay !== null;
  const bizMnpDone = sd.mnp !== null;
  const bizMobDone = bizMnpDone && !!(sub.bizOffers && f.offerta);
  const isVCMode = sub.isVoceCasa || (sub.hasVoceCasaQ && (sd.voceCasaCb === true || sd.voceCasaCb === "Sì"));
  const bizDomLocked = sub.domLocked === true;

  const content = (
    <div style={{marginBottom:10,padding:10,background:"#fff",borderRadius:8,border:"1px solid "+group.color+"30"}}>
      <div style={{fontSize:11,fontWeight:700,color:group.color,marginBottom:6}}>{sub.title}</div>

      {/* MOBILE flow: Tipologia → MNP → EasyPay → Dropdown */}
      {sub.isMobile&&(
        <div>
          <MiniC label="Tipologia Mobile" val={sd.tipMob} onCh={v=>{uP(group.id,si,sub.id,"tipMob",v);if(v==="Underground"){uP(group.id,si,sub.id,"mnp",true);uP(group.id,si,sub.id,"easyPay","Sì")}else if(v==="Mass Market"){uP(group.id,si,sub.id,"mnp","Sì");uP(group.id,si,sub.id,"easyPay","Sì")};if(v!==sd.tipMob)uF(group.id,si,sub.id,"offerta","")}} opts={["Underground","Mass Market"]}/>
          {sd.tipMob!==null&&(
            isUnd
              ? <MiniC label="MNP" val={true} onCh={()=>{}} locked lockVal={true} opts={["Sì","No"]}/>
              : <MiniC label="MNP" val={sd.mnp} onCh={v=>uP(group.id,si,sub.id,"mnp",v)} opts={["Sì","No"]}/>
          )}
          {sd.tipMob!==null&&(isUnd||sd.mnp!==null)&&(
            <MiniC label="Easy Pay" val={sd.easyPay} onCh={v=>{uP(group.id,si,sub.id,"easyPay",v);uF(group.id,si,sub.id,"offerta","");if(v==="No"||v===false){uP(group.id,si,sub.id,"tnpGa",null)}else{uP(group.id,si,sub.id,"tnpGa","Sì")}}} opts={["Sì","No"]}/>
          )}
          {mobDone&&(
            sub.mobOffers
              ? <div style={{marginTop:6}}><DD l="Offerta Mobile" v={f.offerta||""} o={v=>uF(group.id,si,sub.id,"offerta",v)} vals={sub.mobOffers[sd.tipMob+"_"+sd.easyPay]||[]}/></div>
              : sub.fields&&sub.fields.length>0&&<div style={{marginTop:6}}>{sub.fields.map(fl=><DD key={fl.key} l={fl.label} v={f[fl.key]||""} o={v=>uF(group.id,si,sub.id,fl.key,v)} vals={fl.values}/>)}</div>
          )}
          {/* Security when Easy Pay = No (after Offerta Mobile) */}
          {mobDone&&(sd.easyPay==="No"||sd.easyPay===false)&&(
            <div style={{marginTop:8,padding:8,background:"#f8fafc",borderRadius:6,border:"1px solid #e0e0e0"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:6}}>Security</div>
              <div style={{display:"flex",gap:6}}>
                {["Security","Security PRO"].map(s=>
                  <button key={s} onClick={()=>uP(group.id,si,sub.id,"securitySel",sd.securitySel[s]?{}:{[s]:true})} style={{padding:"5px 14px",borderRadius:6,border:sd.securitySel[s]?"2px solid #fd7e14":"2px solid #e0e0e0",background:sd.securitySel[s]?"#fff3e0":"#fff",color:sd.securitySel[s]?"#e8590c":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                    <span>{sd.securitySel[s]?"◉":"○"}</span>{s}
                  </button>
                )}
              </div>
            </div>
          )}
          {/* TNP GA: only when Easy Pay = Sì */}
          {mobDone&&(sd.easyPay==="Sì"||sd.easyPay===true)&&(
            <div style={{marginTop:8}}>
              <MiniC label="TNP GA" val={sd.tnpGa} onCh={v=>{uP(group.id,si,sub.id,"tnpGa",v);if(v==="No"||v===false){uP(group.id,si,sub.id,"tnpTipo","");uP(group.id,si,sub.id,"tnpModello","");uP(group.id,si,sub.id,"tnpImei","");uP(group.id,si,sub.id,"tnpGaReload",null);uP(group.id,si,sub.id,"tnpGaReloadSel",{})}}} opts={["Sì","No"]}/>
              {(sd.tnpGa==="Sì"||sd.tnpGa===true)&&(
                <div style={{padding:10,background:"#f0f7ff",borderRadius:8,border:"1px solid #b8d4f0",marginTop:4}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#2E75B6",marginBottom:8,textTransform:"uppercase"}}>Dati TNP GA</div>
                  <div style={{display:"flex",gap:6,marginBottom:sd.tnpTipo?8:0}}>
                    {["Rata 5G","Finanziamento > 600€","Finanziamento < 600€"].map(opt=>
                      <button key={opt} onClick={()=>uP(group.id,si,sub.id,"tnpTipo",opt)} style={{padding:"6px 14px",borderRadius:6,border:sd.tnpTipo===opt?"2px solid #2E75B6":"2px solid #e0e0e0",background:sd.tnpTipo===opt?"#2E75B6":"#fff",color:sd.tnpTipo===opt?"#fff":"#555",fontSize:11,fontWeight:700,cursor:"pointer"}}>{opt}</button>
                    )}
                  </div>
                  {sd.tnpTipo&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px"}}>
                      {!sd.tnpTipo.startsWith("Finanziamento")&&<DD l="Modello Terminale" r v={sd.tnpModello||""} o={v=>uP(group.id,si,sub.id,"tnpModello",v)} vals={SMARTPHONES}/>}
                      {!sd.tnpTipo.startsWith("Finanziamento")&&<TF l="IMEI" r v={sd.tnpImei||""} o={v=>uP(group.id,si,sub.id,"tnpImei",v)} p="15 cifre" nt="Barcode 📷"/>}
                    </div>
                  )}
                  {/* Quanti TNP finanziati — solo per Finanziamento */}
                  {sd.tnpTipo&&sd.tnpTipo.startsWith("Finanziamento")&&(
                    <div style={{marginTop:8}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#2E75B6",marginBottom:6}}>Quanti TNP hai finanziato?</div>
                      <div style={{display:"flex",gap:6,marginBottom:8}}>
                        {[1,2,3].map(n=>
                          <button key={n} onClick={()=>uP(group.id,si,sub.id,"tnpCount",sd.tnpCount===n?null:n)} style={{width:40,height:40,borderRadius:8,border:sd.tnpCount===n?"2px solid #2E75B6":"2px solid #e0e0e0",background:sd.tnpCount===n?"#2E75B6":"#fff",color:sd.tnpCount===n?"#fff":"#555",fontSize:14,fontWeight:700,cursor:"pointer"}}>{n}</button>
                        )}
                      </div>
                      {sd.tnpCount&&[...Array(sd.tnpCount)].map((_,idx)=>(
                        <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px",marginBottom:8,padding:8,background:"#fff",borderRadius:6,border:"1px solid #e0e0e0"}}>
                          <div style={{gridColumn:"1/-1",fontSize:10,fontWeight:700,color:"#2E75B6",marginBottom:2}}>Terminale {sd.tnpCount>1?idx+1:""}</div>
                          <DD l="Modello Terminale" r v={(sd.tnpModelli&&sd.tnpModelli[idx])||""} o={v=>{const m=[...(sd.tnpModelli||[])];m[idx]=v;uP(group.id,si,sub.id,"tnpModelli",m)}} vals={SMARTPHONES}/>
                          <TF l="IMEI" r v={(sd.tnpImeis&&sd.tnpImeis[idx])||""} o={v=>{const im=[...(sd.tnpImeis||[])];im[idx]=v;uP(group.id,si,sub.id,"tnpImeis",im)}} p="15 cifre" nt="Barcode 📷"/>
                        </div>
                      ))}
                      {sd.tnpCount&&(
                        <div style={{marginTop:4,padding:8,background:"#fff",borderRadius:6,border:"1px solid #e0e0e0"}}>
                          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                            <YN val={sd.packAccessori} onCh={v=>uP(group.id,si,sub.id,"packAccessori",v)} label="Pack Accessori?"/>
                            {(sd.packAccessori===true)&&(
                              <TF l="Quanti accessori?" v={sd.packAccessoriQta||""} o={v=>uP(group.id,si,sub.id,"packAccessoriQta",v)} p="es. 2"/>
                            )}
                          </div>
                          {(sd.packAccessori===true)&&(
                            <div style={{marginTop:10}}>
                              <div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:6}}>Importo Pack Accessori <span style={{color:"#2E75B6",fontWeight:700}}>€{sd.packAccessoriVal||29}</span></div>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <input type="range" min={29} max={240} value={sd.packAccessoriVal||29} onChange={e=>uP(group.id,si,sub.id,"packAccessoriVal",parseInt(e.target.value))} style={{flex:1,accentColor:"#2E75B6"}}/>
                                <input type="number" min={29} max={240} value={sd.packAccessoriVal||""} onChange={e=>uP(group.id,si,sub.id,"packAccessoriVal",e.target.value===""?"":parseInt(e.target.value))} onBlur={e=>{const raw=parseInt(e.target.value);if(!isNaN(raw))uP(group.id,si,sub.id,"packAccessoriVal",Math.min(240,Math.max(29,raw)));else uP(group.id,si,sub.id,"packAccessoriVal",29)}} style={{width:72,padding:"5px 8px",borderRadius:6,border:"1px solid #b8d4f0",fontSize:12,fontWeight:600,textAlign:"center"}} placeholder="29-240"/>
                                <span style={{fontSize:11,color:"#888"}}>€</span>
                              </div>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#aaa",marginTop:2}}><span>€29</span><span>€240</span></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Reload inside TNP GA */}
                  {sd.tnpTipo&&(
                    <div style={{marginTop:10,padding:8,background:"#fff",borderRadius:6,border:"1px solid #e0e0e0"}}>
                      <YN val={sd.tnpGaReload} onCh={v=>{uP(group.id,si,sub.id,"tnpGaReload",v);if(!v)uP(group.id,si,sub.id,"tnpGaReloadSel",{})}} label="Reload?"/>
                      {(sd.tnpGaReload===true)&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                          {["Reload","Reload Plus","Reload Exchange"].map(rl=>
                            <button key={rl} onClick={()=>uP(group.id,si,sub.id,"tnpGaReloadSel",sd.tnpGaReloadSel[rl]?{}:{[rl]:true})} style={{padding:"5px 12px",borderRadius:6,border:sd.tnpGaReloadSel[rl]?"2px solid #28a745":"2px solid #e0e0e0",background:sd.tnpGaReloadSel[rl]?"#d4edda":"#fff",color:sd.tnpGaReloadSel[rl]?"#155724":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                              <span>{sd.tnpGaReloadSel[rl]?"◉":"○"}</span>{rl}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Security for TNP GA = Sì: OUTSIDE blue box, before dati contratto */}
              {(sd.tnpGa==="Sì"||sd.tnpGa===true)&&sd.tnpTipo&&(
                <div style={{marginTop:8,padding:8,background:"#f8fafc",borderRadius:6,border:"1px solid #e0e0e0"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:6}}>Security</div>
                  <div style={{display:"flex",gap:6}}>
                    {["Security","Security PRO"].map(s=>
                      <button key={s} onClick={()=>uP(group.id,si,sub.id,"securitySel",sd.securitySel[s]?{}:{[s]:true})} style={{padding:"5px 14px",borderRadius:6,border:sd.securitySel[s]?"2px solid #fd7e14":"2px solid #e0e0e0",background:sd.securitySel[s]?"#fff3e0":"#fff",color:sd.securitySel[s]?"#e8590c":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                        <span>{sd.securitySel[s]?"◉":"○"}</span>{s}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Reload Forever: when TNP GA = No, before dati contratto */}
          {mobDone&&(sd.easyPay==="Sì"||sd.easyPay===true)&&(sd.tnpGa==="No"||sd.tnpGa===false)&&(
            <div style={{marginTop:6}}>
              <YN val={sd.reloadForever} onCh={v=>uP(group.id,si,sub.id,"reloadForever",v)} label="Reload Forever?"/>
              {/* Security when TNP GA = No (after Reload Forever) */}
              <div style={{marginTop:8,padding:8,background:"#f8fafc",borderRadius:6,border:"1px solid #e0e0e0"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:6}}>Security</div>
                <div style={{display:"flex",gap:6}}>
                  {["Security","Security PRO"].map(s=>
                    <button key={s} onClick={()=>uP(group.id,si,sub.id,"securitySel",sd.securitySel[s]?{}:{[s]:true})} style={{padding:"5px 14px",borderRadius:6,border:sd.securitySel[s]?"2px solid #fd7e14":"2px solid #e0e0e0",background:sd.securitySel[s]?"#fff3e0":"#fff",color:sd.securitySel[s]?"#e8590c":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                      <span>{sd.securitySel[s]?"◉":"○"}</span>{s}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VF MOBILE flow: 8 offer radio buttons + qty modal per offerta + N dati contratto */}
      {sub.isVFMobile&&(
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"#888",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Seleziona offerta/e</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:4}}>
            {(sub.vfOffers||[]).map(offer=>{
              const qty=sd.vfOffers&&sd.vfOffers[offer]?sd.vfOffers[offer]:0;
              const isActive=qty>0;
              return (
                <div key={offer} style={{position:"relative",display:"inline-block"}}>
                  <button onClick={()=>onOpenVFModal&&onOpenVFModal({catId:group.id,si,subId:sub.id,offer})} style={{padding:"10px 18px",borderRadius:10,border:isActive?"2px solid #E60000":"2px solid #e0e0e0",background:isActive?"#E60000":"#fff",color:isActive?"#fff":"#555",fontSize:13,fontWeight:700,cursor:"pointer",minWidth:88,transition:"all .15s"}}>
                    {offer}
                  </button>
                  {isActive&&<span style={{position:"absolute",top:-7,right:-7,background:"#28a745",color:"#fff",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,border:"2px solid #fff",zIndex:2}}>{qty}</span>}
                </div>
              );
            })}
          </div>
          {sd.vfOffers&&Object.keys(sd.vfOffers).filter(o=>sd.vfOffers[o]>0).map(offer=>{
            const qty=sd.vfOffers[offer];
            const contratti=sd.vfContratti&&sd.vfContratti[offer]?sd.vfContratti[offer]:[];
            return (
              <div key={offer} style={{marginTop:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{background:"#E60000",color:"#fff",borderRadius:6,padding:"3px 12px",fontSize:11,fontWeight:800}}>{offer}</div>
                  <div style={{fontSize:11,color:"#888",fontWeight:600}}>{qty} SIM</div>
                  <button onClick={()=>onOpenVFModal&&onOpenVFModal({catId:group.id,si,subId:sub.id,offer})} style={{background:"none",border:"1px solid #e0e0e0",borderRadius:6,padding:"2px 8px",fontSize:10,color:"#999",cursor:"pointer"}}>✎ modifica</button>
                </div>
                {Array.from({length:qty},(_,i)=>{
                  const ct=contratti[i]||{};
                  const upd=(field,val)=>{
                    const newC=[...contratti];
                    if(!newC[i])newC[i]={};
                    newC[i]={...newC[i],[field]:val};
                    const newVfC={...(sd.vfContratti||{}),[offer]:newC};
                    uP(group.id,si,sub.id,"vfContratti",newVfC);
                  };
                  return (
                    <div key={i} style={{background:"#FFF5F5",border:"1px solid #F5C6C6",borderRadius:8,padding:12,marginBottom:8}}>
                      <div style={{fontSize:11,fontWeight:800,color:"#E60000",marginBottom:10}}>📋 SIM #{i+1}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px"}}>
                        <TF l="Cod. Inserimento" r v={ct.codIns||""} o={v=>upd("codIns",v)} p="Codice ins."/>
                        <TF l="Codice Contratto" r v={ct.codContratto||""} o={v=>upd("codContratto",v)} p="es. 167942"/>
                        <TF l="Numero Provvisorio" v={ct.numProv||""} o={v=>upd("numProv",v)} p="393XXX"/>
                        <TF l="ICCID" v={ct.iccid||""} o={v=>upd("iccid",v)} p="893..." nt="Barcode 📷"/>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* MOBILE BUSINESS flow: MNP → Brand MNP → Offerta → TNP GA → Security */}
      {sub.isMobileBiz&&(
        <div>
          <MiniC label="MNP" val={sd.mnp} onCh={v=>{uP(group.id,si,sub.id,"mnp",v);if(v==="No"||v===false)uC(group.id,si,sub.id,"brand_mnp","")}} opts={["Sì","No"]}/>
          {bizMnpDone&&(sd.mnp==="Sì"||sd.mnp===true)&&(
            <div style={{marginTop:6}}>
              <DD l="Brand MNP" r v={f.brandMnpBiz||""} o={v=>uF(group.id,si,sub.id,"brandMnpBiz",v)} vals={brandMNP}/>
            </div>
          )}
          {bizMnpDone&&(
            <div style={{marginTop:6}}>
              <DD l="Offerta Mobile" r v={f.offerta||""} o={v=>uF(group.id,si,sub.id,"offerta",v)} vals={(sub.bizOffers||[]).filter(o=>(sd.mnp==="Sì"||sd.mnp===true)?o!=="FWA Indoor PIVA":true)}/>
            </div>
          )}
          {bizMobDone&&(
            <div style={{marginTop:8}}>
              <MiniC label="TNP GA" val={sd.tnpGa} onCh={v=>{uP(group.id,si,sub.id,"tnpGa",v);if(v==="No"||v===false){uP(group.id,si,sub.id,"tnpTipo","");uP(group.id,si,sub.id,"tnpModello","");uP(group.id,si,sub.id,"tnpImei","");uP(group.id,si,sub.id,"tnpGaReload",null);uP(group.id,si,sub.id,"tnpGaReloadSel",{})}}} opts={["Sì","No"]}/>
              {(sd.tnpGa==="Sì"||sd.tnpGa===true)&&(
                <div style={{marginTop:8}}>
                  <div style={{padding:8,background:"#f8fafc",borderRadius:6,border:"1px solid #e0e0e0"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:6}}>Security / Reload</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <button onClick={()=>uP(group.id,si,sub.id,"securitySel",sd.securitySel["Security"]?{}:{"Security":true})} style={{padding:"5px 14px",borderRadius:6,border:sd.securitySel["Security"]?"2px solid #fd7e14":"2px solid #e0e0e0",background:sd.securitySel["Security"]?"#fff3e0":"#fff",color:sd.securitySel["Security"]?"#e8590c":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                        <span>{sd.securitySel["Security"]?"☑":"☐"}</span>Security
                      </button>
                      {["Reload","Reload EU"].map(rl=>
                        <button key={rl} onClick={()=>uP(group.id,si,sub.id,"tnpGaReloadSel",sd.tnpGaReloadSel[rl]?{}:{[rl]:true})} style={{padding:"5px 14px",borderRadius:6,border:sd.tnpGaReloadSel[rl]?"2px solid #28a745":"2px solid #e0e0e0",background:sd.tnpGaReloadSel[rl]?"#d4edda":"#fff",color:sd.tnpGaReloadSel[rl]?"#155724":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                          <span>{sd.tnpGaReloadSel[rl]?"◉":"○"}</span>{rl}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {(sd.tnpGa==="No"||sd.tnpGa===false)&&(
                <div style={{marginTop:8,padding:8,background:"#f8fafc",borderRadius:6,border:"1px solid #e0e0e0"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:6}}>Security / Reload</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <button onClick={()=>uP(group.id,si,sub.id,"securitySel",sd.securitySel["Security"]?{}:{"Security":true})} style={{padding:"5px 14px",borderRadius:6,border:sd.securitySel["Security"]?"2px solid #fd7e14":"2px solid #e0e0e0",background:sd.securitySel["Security"]?"#fff3e0":"#fff",color:sd.securitySel["Security"]?"#e8590c":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                      <span>{sd.securitySel["Security"]?"◉":"○"}</span>Security
                    </button>
                    <button onClick={()=>uP(group.id,si,sub.id,"tnpGaReloadSel",sd.tnpGaReloadSel["Reload Open"]?{}:{"Reload Open":true})} style={{padding:"5px 14px",borderRadius:6,border:sd.tnpGaReloadSel["Reload Open"]?"2px solid #28a745":"2px solid #e0e0e0",background:sd.tnpGaReloadSel["Reload Open"]?"#d4edda":"#fff",color:sd.tnpGaReloadSel["Reload Open"]?"#155724":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                      <span>{sd.tnpGaReloadSel["Reload Open"]?"◉":"○"}</span>Reload Open
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {sub.isProtecta&&(
        sub.isBizProtecta
          ? <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:8,background:"#f0ebff",border:"2px solid #6f42c1"}}>
              <span style={{fontSize:16}}>✅</span>
              <span style={{fontSize:13,fontWeight:700,color:"#6f42c1"}}>Protecta PRO attivato</span>
            </div>
          : <div style={{display:"flex",gap:8}}>
              {["Kit Base","Kit Plus"].map(k=>
                <button key={k} onClick={()=>uF(group.id,si,sub.id,"protectaKit",f.protectaKit===k?"":k)} style={{padding:"8px 18px",borderRadius:8,border:f.protectaKit===k?"2px solid #6f42c1":"2px solid #e0e0e0",background:f.protectaKit===k?"#6f42c1":"#fff",color:f.protectaKit===k?"#fff":"#555",fontSize:12,fontWeight:700,cursor:"pointer"}}>{k}</button>
              )}
            </div>
      )}

      {/* Assicurazioni Business: radio esclusivo */}
      {sub.isAssicBiz&&(
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Protezione PRO Negozi - Affittuario","Protezione PRO Negozi - Proprietario"].map(opt=>
            <button key={opt} onClick={()=>uF(group.id,si,sub.id,"assicBizSel",f.assicBizSel===opt?"":opt)} style={{padding:"8px 16px",borderRadius:8,border:f.assicBizSel===opt?"2px solid #6f42c1":"2px solid #e0e0e0",background:f.assicBizSel===opt?"#6f42c1":"#fff",color:f.assicBizSel===opt?"#fff":"#555",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>{f.assicBizSel===opt?"◉":"○"}</span>{opt}
            </button>
          )}
        </div>
      )}


      {sub.isCB&&(
        <div>
          {/* Three toggleable sub-options */}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={()=>{const on=!sd.cbTnp;uP(group.id,si,sub.id,"cbTnp",on);if(on){if(!sd.cbTnpCell){const pre=sd.cbCambioCell||anaCel||"";if(pre)uP(group.id,si,sub.id,"cbTnpCell",pre)};if(!sd.cbTnpCC){const pre=sd.cbCambioCC||(c.codice_contratto||"");if(pre)uP(group.id,si,sub.id,"cbTnpCC",pre)}}}} style={{padding:"8px 16px",borderRadius:8,border:sd.cbTnp?"2px solid #2E75B6":"2px solid #e0e0e0",background:sd.cbTnp?"#2E75B6":"#fff",color:sd.cbTnp?"#fff":"#555",fontSize:12,fontWeight:700,cursor:"pointer"}}>TNP CB</button>
            <button onClick={()=>{const on=!sd.cbCambio;uP(group.id,si,sub.id,"cbCambio",on);if(on){if(!sd.cbCambioCell){const pre=sd.cbTnpCell||anaCel||"";if(pre)uP(group.id,si,sub.id,"cbCambioCell",pre)};if(!sd.cbCambioCC){const pre=sd.cbTnpCC||(c.codice_contratto||"");if(pre)uP(group.id,si,sub.id,"cbCambioCC",pre)}}}} style={{padding:"8px 16px",borderRadius:8,border:sd.cbCambio?"2px solid #6f42c1":"2px solid #e0e0e0",background:sd.cbCambio?"#6f42c1":"#fff",color:sd.cbCambio?"#fff":"#555",fontSize:12,fontWeight:700,cursor:"pointer"}}>Cambio Offerta</button>
            {!sub.isCBBiz&&<button onClick={()=>uP(group.id,si,sub.id,"cbRf",!sd.cbRf)} style={{padding:"8px 16px",borderRadius:8,border:sd.cbRf?"2px solid #28a745":"2px solid #e0e0e0",background:sd.cbRf?"#28a745":"#fff",color:sd.cbRf?"#fff":"#555",fontSize:12,fontWeight:700,cursor:"pointer"}}>Reload Forever</button>}
          </div>

          {/* TNP CB section */}
          {sd.cbTnp&&(
            <div style={{padding:10,background:"#f0f7ff",borderRadius:8,border:"1px solid #b8d4f0",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,color:"#2E75B6",marginBottom:8,textTransform:"uppercase"}}>Dati TNP CB</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px 14px",marginBottom:8}}>
                <SCd session={sessionCode} codici={codiciW3} val={sd.cbTnpCodIns||""} onCh={v=>uP(group.id,si,sub.id,"cbTnpCodIns",v)}/>
                <TF l="Cellulare" r v={sd.cbTnpCell||""} o={v=>{uP(group.id,si,sub.id,"cbTnpCell",v);if(sd.cbCambio)uP(group.id,si,sub.id,"cbCambioCell",v)}} p="3XXXXXXXXX" nt={sd.cbTnpCell===anaCel&&anaCel?"Da anagrafica":""}/>
                <TF l="Codice Contratto" r v={sd.cbTnpCC||""} o={v=>{uP(group.id,si,sub.id,"cbTnpCC",v);if(sd.cbCambio)uP(group.id,si,sub.id,"cbCambioCC",v)}} p="es. 167942"/>
              </div>
              {sub.isCBBiz&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px",marginBottom:8}}>
                  <DD l="Modello Terminale" r v={sd.cbTnpModello||""} o={v=>uP(group.id,si,sub.id,"cbTnpModello",v)} vals={SMARTPHONES}/>
                  <TF l="IMEI" r v={sd.cbTnpImei||""} o={v=>uP(group.id,si,sub.id,"cbTnpImei",v)} p="15 cifre" nt="Barcode 📷"/>
                </div>
              )}
              <div style={{display:"flex",gap:6,marginBottom:sd.cbTnpTipo?8:0}}>
                {!sub.isCBBiz&&sub.cbTnpVals.map(opt=>
                  <button key={opt} onClick={()=>uP(group.id,si,sub.id,"cbTnpTipo",opt)} style={{padding:"6px 14px",borderRadius:6,border:sd.cbTnpTipo===opt?"2px solid #2E75B6":"2px solid #e0e0e0",background:sd.cbTnpTipo===opt?"#2E75B6":"#fff",color:sd.cbTnpTipo===opt?"#fff":"#555",fontSize:11,fontWeight:700,cursor:"pointer"}}>{opt}</button>
                )}
              </div>
              {!sub.isCBBiz&&sd.cbTnpTipo&&(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px"}}>
                    {!sd.cbTnpTipo.startsWith("Finanziamento")&&<DD l="Modello Terminale" r v={sd.cbTnpModello||""} o={v=>uP(group.id,si,sub.id,"cbTnpModello",v)} vals={SMARTPHONES}/>}
                    {!sd.cbTnpTipo.startsWith("Finanziamento")&&<TF l="IMEI" r v={sd.cbTnpImei||""} o={v=>uP(group.id,si,sub.id,"cbTnpImei",v)} p="15 cifre" nt="Barcode 📷"/>}
                  </div>
                  {sd.cbTnpTipo.startsWith("Finanziamento")&&(
                    <div style={{marginTop:8}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#2E75B6",marginBottom:6}}>Quanti TNP hai finanziato?</div>
                      <div style={{display:"flex",gap:6,marginBottom:8}}>
                        {[1,2,3].map(n=>
                          <button key={n} onClick={()=>uP(group.id,si,sub.id,"cbTnpCount",sd.cbTnpCount===n?null:n)} style={{width:40,height:40,borderRadius:8,border:sd.cbTnpCount===n?"2px solid #2E75B6":"2px solid #e0e0e0",background:sd.cbTnpCount===n?"#2E75B6":"#fff",color:sd.cbTnpCount===n?"#fff":"#555",fontSize:14,fontWeight:700,cursor:"pointer"}}>{n}</button>
                        )}
                      </div>
                      {sd.cbTnpCount&&[...Array(sd.cbTnpCount)].map((_,idx)=>(
                        <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px",marginBottom:8,padding:8,background:"#fff",borderRadius:6,border:"1px solid #e0e0e0"}}>
                          <div style={{gridColumn:"1/-1",fontSize:10,fontWeight:700,color:"#2E75B6",marginBottom:2}}>Terminale {sd.cbTnpCount>1?idx+1:""}</div>
                          <DD l="Modello Terminale" r v={(sd.cbTnpModelli&&sd.cbTnpModelli[idx])||""} o={v=>{const m=[...(sd.cbTnpModelli||[])];m[idx]=v;uP(group.id,si,sub.id,"cbTnpModelli",m)}} vals={SMARTPHONES}/>
                          <TF l="IMEI" r v={(sd.cbTnpImeis&&sd.cbTnpImeis[idx])||""} o={v=>{const im=[...(sd.cbTnpImeis||[])];im[idx]=v;uP(group.id,si,sub.id,"cbTnpImeis",im)}} p="15 cifre" nt="Barcode 📷"/>
                        </div>
                      ))}
                      {sd.cbTnpCount&&(
                        <div style={{marginTop:4,padding:8,background:"#fff",borderRadius:6,border:"1px solid #e0e0e0"}}>
                          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                            <YN val={sd.cbPackAccessori} onCh={v=>uP(group.id,si,sub.id,"cbPackAccessori",v)} label="Pack Accessori?"/>
                            {(sd.cbPackAccessori===true)&&(
                              <TF l="Quanti accessori?" v={sd.cbPackAccessoriQta||""} o={v=>uP(group.id,si,sub.id,"cbPackAccessoriQta",v)} p="es. 2"/>
                            )}
                          </div>
                          {(sd.cbPackAccessori===true)&&(
                            <div style={{marginTop:10}}>
                              <div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:6}}>Importo Pack Accessori <span style={{color:"#2E75B6",fontWeight:700}}>€{sd.cbPackAccessoriVal||29}</span></div>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <input type="range" min={29} max={240} value={sd.cbPackAccessoriVal||29} onChange={e=>uP(group.id,si,sub.id,"cbPackAccessoriVal",parseInt(e.target.value))} style={{flex:1,accentColor:"#2E75B6"}}/>
                                <input type="number" min={29} max={240} value={sd.cbPackAccessoriVal||""} onChange={e=>uP(group.id,si,sub.id,"cbPackAccessoriVal",e.target.value===""?"":parseInt(e.target.value))} onBlur={e=>{const raw=parseInt(e.target.value);if(!isNaN(raw))uP(group.id,si,sub.id,"cbPackAccessoriVal",Math.min(240,Math.max(29,raw)));else uP(group.id,si,sub.id,"cbPackAccessoriVal",29)}} style={{width:72,padding:"5px 8px",borderRadius:6,border:"1px solid #b8d4f0",fontSize:12,fontWeight:600,textAlign:"center"}} placeholder="29-240"/>
                                <span style={{fontSize:11,color:"#888"}}>€</span>
                              </div>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#aaa",marginTop:2}}><span>€29</span><span>€240</span></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Reload inside TNP CB */}
              <div style={{marginTop:8,padding:8,background:"#fff",borderRadius:6,border:"1px solid #e0e0e0"}}>
                <YN val={sd.cbTnpReload} onCh={v=>{uP(group.id,si,sub.id,"cbTnpReload",v);if(!v)uP(group.id,si,sub.id,"cbTnpReloadSel",{})}} label="Reload?"/>
                {(sd.cbTnpReload===true)&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                    {(sub.isCBBiz?["Reload","Reload EU"]:["Reload","Reload Plus","Reload Exchange"]).map(rl=>
                      <button key={rl} onClick={()=>uP(group.id,si,sub.id,"cbTnpReloadSel",sd.cbTnpReloadSel[rl]?{}:{[rl]:true})} style={{padding:"5px 12px",borderRadius:6,border:sd.cbTnpReloadSel[rl]?"2px solid #28a745":"2px solid #e0e0e0",background:sd.cbTnpReloadSel[rl]?"#d4edda":"#fff",color:sd.cbTnpReloadSel[rl]?"#155724":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                        <span>{sd.cbTnpReloadSel[rl]?"◉":"○"}</span>{rl}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cambio Offerta section */}
          {sd.cbCambio&&(
            <div style={{padding:10,background:"#f5f0ff",borderRadius:8,border:"1px solid #d4c5f0",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,color:"#6f42c1",marginBottom:8,textTransform:"uppercase"}}>Cambio Offerta</div>
              <div style={{marginBottom:8,maxWidth:250}}>
                <SCd session={sessionCode} codici={codiciW3} val={sd.cbCambioCodIns||""} onCh={v=>uP(group.id,si,sub.id,"cbCambioCodIns",v)}/>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                {sub.cbCambioVals.map(opt=>
                  <button key={opt} onClick={()=>uP(group.id,si,sub.id,"cbCambioVal",sd.cbCambioVal===opt?"":opt)} style={{padding:"6px 14px",borderRadius:6,border:sd.cbCambioVal===opt?"2px solid #6f42c1":"2px solid #e0e0e0",background:sd.cbCambioVal===opt?"#6f42c1":"#fff",color:sd.cbCambioVal===opt?"#fff":"#555",fontSize:11,fontWeight:700,cursor:"pointer"}}>{opt}</button>
                )}
              </div>
              {sd.cbCambioVal&&(
                <div style={{display:"grid",gridTemplateColumns:["Caring","CL0","CL1","CL2","CL3"].indexOf(sd.cbCambioVal)>=0?"1fr":"1fr 1fr",gap:"8px 14px"}}>
                  <TF l="Cellulare" r v={sd.cbCambioCell||""} o={v=>{uP(group.id,si,sub.id,"cbCambioCell",v);if(sd.cbTnp)uP(group.id,si,sub.id,"cbTnpCell",v)}} p="3XXXXXXXXX" nt={sd.cbCambioCell===anaCel&&anaCel?"Da anagrafica":""}/>
                  {["Caring","CL0","CL1","CL2","CL3"].indexOf(sd.cbCambioVal)<0&&(
                    <TF l="Codice Contratto" r v={sd.cbCambioCC||""} o={v=>{uP(group.id,si,sub.id,"cbCambioCC",v);if(sd.cbTnp)uP(group.id,si,sub.id,"cbTnpCC",v)}} p="es. 167942"/>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add-on section inside CB */}
          {sub.cbAddonVals&&(
            <div style={{padding:10,background:"#f0faf0",borderRadius:8,border:"1px solid #c3e6c3",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,color:"#28a745",marginBottom:8,textTransform:"uppercase"}}>{sub.isCBBiz?"Add-on / Security":"Add-on"}</div>
              <div style={{marginBottom:8,maxWidth:250}}>
                <SCd session={sessionCode} codici={codiciW3} val={sd.cbAddonCodIns||(sd.cbTnpCodIns||sd.cbCambioCodIns||"")} onCh={v=>uP(group.id,si,sub.id,"cbAddonCodIns",v)}/>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {sub.cbAddonVals.map(opt=>
                  <button key={opt} onClick={()=>{const cur=sd.cbAddonSel[opt];uP(group.id,si,sub.id,"cbAddonSel",{...sd.cbAddonSel,[opt]:!cur})}} style={{padding:"6px 14px",borderRadius:6,border:sd.cbAddonSel[opt]?"2px solid #28a745":"2px solid #e0e0e0",background:sd.cbAddonSel[opt]?"#d4edda":"#fff",color:sd.cbAddonSel[opt]?"#155724":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                    <span>{sd.cbAddonSel[opt]?"☑":"☐"}</span>{opt}
                  </button>
                )}
                {sub.isCBBiz&&(!sd.cbTnp||(sd.cbTnp&&sd.cbCambio&&(sd.cbTnpReload===false||sd.cbTnpReload===null)))&&(
                  <button onClick={()=>{const cur=sd.cbAddonSel["Reload Open"];uP(group.id,si,sub.id,"cbAddonSel",{...sd.cbAddonSel,"Reload Open":!cur})}} style={{padding:"6px 14px",borderRadius:6,border:sd.cbAddonSel["Reload Open"]?"2px solid #28a745":"2px solid #e0e0e0",background:sd.cbAddonSel["Reload Open"]?"#d4edda":"#fff",color:sd.cbAddonSel["Reload Open"]?"#155724":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                    <span>{sd.cbAddonSel["Reload Open"]?"☑":"☐"}</span>Reload Open
                  </button>
                )}
              </div>
            </div>
          )}
          {!sub.isCBBiz&&sd.cbRf&&(
            <div style={{padding:10,background:"#f0f7ff",borderRadius:8,border:"1px solid #b8d4f0",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,color:"#2E75B6",marginBottom:8,textTransform:"uppercase"}}>Dati Reload Forever</div>
              <div style={{marginBottom:8,maxWidth:250}}>
                <SCd session={sessionCode} codici={codiciW3} val={sd.cbRfCodIns||(sd.cbTnpCodIns||sd.cbCambioCodIns||"")} onCh={v=>uP(group.id,si,sub.id,"cbRfCodIns",v)}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px"}}>
                <DD l="Modello Terminale" r v={sd.rfModello||""} o={v=>uP(group.id,si,sub.id,"rfModello",v)} vals={SMARTPHONES}/>
                <TF l="IMEI" r v={sd.rfImei||""} o={v=>uP(group.id,si,sub.id,"rfImei",v)} p="15 cifre" nt="Barcode 📷"/>
              </div>
            </div>
          )}
        </div>
      )}
      {!sub.isMobile&&!sub.isMobileBiz&&!sub.isProtecta&&!sub.isFisso&&!sub.isCB&&!sub.hasAddons&&sub.fields&&sub.fields.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:sub.fields.length>1?"1fr 1fr":"1fr",gap:"8px 14px"}}>
          {sub.fields.map(fl=><DD key={fl.key} l={fl.label} v={f[fl.key]||""} o={v=>uF(group.id,si,sub.id,fl.key,v)} vals={fl.values}/>)}
        </div>
      )}

      {/* Fisso: VoceCasaCB question (only FISSO CB) */}
      {sub.hasVoceCasaQ&&(
        <div style={{marginBottom:8}}>
          <YN val={sd.voceCasaCb} onCh={v=>{uP(group.id,si,sub.id,"voceCasaCb",v);if(v===true||v==="Sì")uP(group.id,si,sub.id,"domiciliato",true)}} label="Trattasi di Voce Casa CB?"/>
        </div>
      )}

      {/* Fisso: DOMICILIATO + CONVERGENTE */}
      {sub.isFisso&&(
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:140}}><div style={{fontSize:12,fontWeight:700,color:(isVCMode||bizDomLocked)?"#999":"#333",marginBottom:6}}>Domiciliato?</div><div style={{display:"flex",gap:8}}>
            {(isVCMode||bizDomLocked)?(
              <div style={{display:"flex",alignItems:"center",gap:6}}><button disabled style={{padding:"6px 20px",borderRadius:6,border:"2px solid #28a745",background:"#d4edda",color:"#155724",fontSize:12,fontWeight:700,cursor:"not-allowed"}}>Sì</button><span style={{fontSize:10,color:"#999",fontStyle:"italic"}}>{isVCMode||sub.domLocked?"Obbligatorio":"Business"}</span></div>
            ):(<>
              <button onClick={()=>uP(group.id,si,sub.id,"domiciliato",true)} style={{padding:"6px 20px",borderRadius:6,border:sd.domiciliato===true?"2px solid #28a745":"2px solid #e0e0e0",background:sd.domiciliato===true?"#d4edda":"#fff",color:sd.domiciliato===true?"#155724":"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>Sì</button>
              <button onClick={()=>uP(group.id,si,sub.id,"domiciliato",false)} style={{padding:"6px 20px",borderRadius:6,border:sd.domiciliato===false?"2px solid #dc3545":"2px solid #e0e0e0",background:sd.domiciliato===false?"#f8d7da":"#fff",color:sd.domiciliato===false?"#721c24":"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>No</button>
            </>)}
          </div></div>
          <div style={{flex:1,minWidth:140}}><div style={{fontSize:12,fontWeight:700,color:"#333",marginBottom:6}}>Convergente?</div><div style={{display:"flex",gap:8}}>
            <button onClick={()=>uP(group.id,si,sub.id,"convergente",true)} style={{padding:"6px 20px",borderRadius:6,border:sd.convergente===true?"2px solid #28a745":"2px solid #e0e0e0",background:sd.convergente===true?"#d4edda":"#fff",color:sd.convergente===true?"#155724":"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>Sì</button>
            <button onClick={()=>uP(group.id,si,sub.id,"convergente",false)} style={{padding:"6px 20px",borderRadius:6,border:sd.convergente===false?"2px solid #dc3545":"2px solid #e0e0e0",background:sd.convergente===false?"#f8d7da":"#fff",color:sd.convergente===false?"#721c24":"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>No</button>
          </div></div>
        </div>
      )}

      {/* GNP */}
      {sub.hasGnpQ&&<><YN val={sd.gnp} onCh={v=>uP(group.id,si,sub.id,"gnp",v)} label="C'è una GNP?"/>
        {sd.gnp&&<div style={{padding:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px"}}>
          <TF l="N. Definitivo da portare" r v={sd.gnpNum||""} o={v=>uP(group.id,si,sub.id,"gnpNum",v)} p="Numero"/>
          <DD l="Op. provenienza GNP" r v={sd.gnpOp||""} o={v=>uP(group.id,si,sub.id,"gnpOp",v)} vals={opProv}/>
        </div>}</>}

      {sub.has2LQ&&<YN val={sd.secondaLinea} onCh={v=>uP(group.id,si,sub.id,"secondaLinea",v)} label="C'è una seconda linea?"/>}
      {sub.has2LQ&&(sd.secondaLinea===true||sd.secondaLinea==="Sì")&&(
        <div style={{padding:10,background:"#f0f7ff",borderRadius:8,border:"1px solid #b8d4f0",marginTop:4}}>
          <div style={{fontSize:10,fontWeight:700,color:"#2E75B6",marginBottom:8,textTransform:"uppercase"}}>2° Linea</div>
          <MiniC label="GNP 2° Linea" val={sd.gnp2L} onCh={v=>{uP(group.id,si,sub.id,"gnp2L",v);if(v==="No"||v===false){uP(group.id,si,sub.id,"gnp2LBrand","");uP(group.id,si,sub.id,"gnp2LNum","")}}} opts={["Sì","No"]}/>
          {(sd.gnp2L==="Sì"||sd.gnp2L===true)&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px",marginTop:6}}>
              <DD l="Brand MNP 2° Linea" r v={sd.gnp2LBrand||""} o={v=>uP(group.id,si,sub.id,"gnp2LBrand",v)} vals={["TIM","Vodafone","Fastweb","Sky","Tiscali","WINDTRE","BT Enia","Ehiweb","Infratel","Vianova","Isiline","Convergenze","Full Telecom","Optima","Fibra.tn"]}/>
              <TF l="N. Fisso Portabilità 2° Linea" r v={sd.gnp2LNum||""} o={v=>uP(group.id,si,sub.id,"gnp2LNum",v)} p="06XXXXXXXX"/>
            </div>
          )}
        </div>
      )}

      {/* Addon/Checklist checkboxes (hidden for Voce Casa) */}
      {sub.hasAddons&&sub.addonList&&!isVCMode&&(
        <div style={{marginTop:10,padding:10,background:"#f8fafc",borderRadius:8,border:"1px solid #e0e0e0"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#333",marginBottom:8}}>{sub.isFisso?"Add-on Fisso":"Seleziona prodotti"}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {sub.addonList.map(ad=>
              <button key={ad} onClick={()=>toggleAddon(ad)} style={{padding:"6px 14px",borderRadius:6,border:sd.addons[ad]?"2px solid #28a745":"2px solid #e0e0e0",background:sd.addons[ad]?"#d4edda":"#fff",color:sd.addons[ad]?"#155724":"#555",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:14}}>{sd.addons[ad]?"☑":"☐"}</span>{ad}
              </button>
            )}
          </div>
        </div>
      )}

      {sub.hasDom&&<YN val={sd.domiciliazione} onCh={v=>uP(group.id,si,sub.id,"domiciliazione",v)} label="Domiciliazione bancaria?"/>}

      {/* LG Convergente */}
      {sub.hasConvLG&&(
        <div style={{marginTop:8,padding:10,background:lgConvLocked?"#f5f5f5":"#f8fafc",borderRadius:8,border:"1px solid #e0e0e0"}}>
          <div style={{fontSize:12,fontWeight:700,color:lgConvLocked?"#999":"#333",marginBottom:6}}>Convergente?</div>
          {lgConvLocked?<div style={{display:"flex",alignItems:"center",gap:8}}><button disabled style={{padding:"6px 20px",borderRadius:6,border:"2px solid #dc3545",background:"#f8d7da",color:"#721c24",fontSize:12,fontWeight:700,cursor:"not-allowed",opacity:.7}}>No</button><span style={{fontSize:10,color:"#999",fontStyle:"italic"}}>Già selezionato altrove</span></div>
          :<div style={{display:"flex",gap:8}}>
            <button onClick={()=>uP(group.id,si,sub.id,"convergente",true)} style={{padding:"6px 20px",borderRadius:6,border:sd.convergente===true?"2px solid #28a745":"2px solid #e0e0e0",background:sd.convergente===true?"#d4edda":"#fff",color:sd.convergente===true?"#155724":"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>Sì</button>
            <button onClick={()=>uP(group.id,si,sub.id,"convergente",false)} style={{padding:"6px 20px",borderRadius:6,border:sd.convergente===false?"2px solid #dc3545":"2px solid #e0e0e0",background:sd.convergente===false?"#f8d7da":"#fff",color:sd.convergente===false?"#721c24":"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>No</button>
          </div>}
        </div>
      )}

      {/* Contract data */}
      {sub.hasContract&&(
        <div style={{borderTop:"1px solid "+group.color+"20",paddingTop:8,marginTop:8}}>
          <div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:6,textTransform:"uppercase"}}>Dati contratto</div>
          <div style={{marginBottom:8,maxWidth:250}}><SCd session={sessionCode} codici={codiciW3} val={sd.codiceOverride||""} onCh={v=>uP(group.id,si,sub.id,"codiceOverride",v)}/></div>
          {sub.ct==="ga"&&<div style={{display:"grid",gridTemplateColumns:showMnpF&&!sub.isMobileBiz?"1fr 1fr 1fr":"1fr 1fr",gap:"8px 14px"}}>
            <TF l="Codice Contratto" r v={c.codice_contratto||""} o={v=>uC(group.id,si,sub.id,"codice_contratto",v)} p="es. 167942"/>
            <TF l="Numero Provvisorio" v={c.num_provvisorio||""} o={v=>uC(group.id,si,sub.id,"num_provvisorio",v)} p="393XXX"/>
            {showMnpF&&!sub.isMobileBiz&&<TF l="N. Definitivo MNP" v={c.num_definitivo||""} o={v=>uC(group.id,si,sub.id,"num_definitivo",v)} p="Portare"/>}
            {showMnpF&&!sub.isMobileBiz&&<DD l="Brand MNP" v={c.brand_mnp||""} o={v=>uC(group.id,si,sub.id,"brand_mnp",v)} vals={brandMNP}/>}
            {showMnpF&&sub.isMobileBiz&&<TF l="N. Definitivo MNP" v={c.num_definitivo||""} o={v=>uC(group.id,si,sub.id,"num_definitivo",v)} p="Portare"/>}
            <TF l="ICCID" v={c.iccid||""} o={v=>uC(group.id,si,sub.id,"iccid",v)} p="893..." nt="Barcode 📷"/>
            {sub.isMobileBiz&&(sd.tnpGa==="Sì"||sd.tnpGa===true)&&sd.tnpTipo&&<DD l="Modello Terminale" r v={c.modello||""} o={v=>uC(group.id,si,sub.id,"modello",v)} vals={SMARTPHONES}/>}
            {sub.isMobileBiz&&(sd.tnpGa==="Sì"||sd.tnpGa===true)&&sd.tnpTipo&&<TF l="IMEI" r v={c.imei||""} o={v=>uC(group.id,si,sub.id,"imei",v)} p="15 cifre" nt="Barcode 📷"/>}
          </div>}
          {sub.ct==="tnp_ga"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px 14px"}}>
            <TF l="Codice Contratto" r v={gaOn?(gaC.codice_contratto||""):(c.codice_contratto||"")} o={v=>uC(group.id,si,sub.id,"codice_contratto",v)} p={gaOn?"← da Mobile GA":"es. 167942"} dis={gaOn} nt={gaOn?"Auto da Mobile GA":""}/>
            <TF l="Modello Terminale" v={c.modello||""} o={v=>uC(group.id,si,sub.id,"modello",v)} p="Samsung S25"/>
            <TF l="IMEI" v={c.imei||""} o={v=>uC(group.id,si,sub.id,"imei",v)} p="15 cifre" nt="Barcode 📷"/>
          </div>}
          {sub.ct==="tnp_cb"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px 14px"}}>
            <TF l="Codice Contratto" r v={c.codice_contratto||""} o={v=>uC(group.id,si,sub.id,"codice_contratto",v)} p="es. 167942"/>
            <TF l="Modello Terminale" v={c.modello||""} o={v=>uC(group.id,si,sub.id,"modello",v)} p="iPhone 16"/>
            <TF l="IMEI" v={c.imei||""} o={v=>uC(group.id,si,sub.id,"imei",v)} p="15 cifre" nt="Barcode 📷"/>
          </div>}
          {sub.ct==="fisso"&&!isVCMode&&<div style={{display:"grid",gridTemplateColumns:sub.hasFwaImei?"1fr 1fr 1fr 1fr":"1fr 1fr 1fr",gap:"8px 14px"}}>
            <TF l="Codice Contratto" r v={c.codice_contratto||""} o={v=>uC(group.id,si,sub.id,"codice_contratto",v)} p="es. 167942"/>
            <TF l="N. Fisso Provvisorio" v={c.num_fisso_prov||""} o={v=>uC(group.id,si,sub.id,"num_fisso_prov",v)} p="06XXXX"/>
            <TF l="N. Fisso Definitivo" v={fissoDefVal} o={v=>uC(group.id,si,sub.id,"num_fisso_def",v)} p="Portare" dis={fissoDefLocked} nt={fissoDefLocked?"Auto da GNP":""}/>
            {sub.hasFwaImei&&<TF l="IMEI" v={c.imei||""} o={v=>uC(group.id,si,sub.id,"imei",v)} p="15 cifre" nt="Barcode 📷"/>}
          </div>}
          {sub.ct==="fisso"&&isVCMode&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px 14px"}}>
            <TF l="Codice Contratto" r v={c.codice_contratto||""} o={v=>uC(group.id,si,sub.id,"codice_contratto",v)} p="es. 167942"/>
            <TF l="N. Fisso Provvisorio" v={c.num_fisso_prov||""} o={v=>uC(group.id,si,sub.id,"num_fisso_prov",v)} p="06XXXX"/>
            <TF l="N. Fisso Definitivo" v={fissoDefVal} o={v=>uC(group.id,si,sub.id,"num_fisso_def",v)} p="Portare" dis={fissoDefLocked} nt={fissoDefLocked?"Auto da GNP":""}/>
            <TF l="IMEI" v={c.imei||""} o={v=>uC(group.id,si,sub.id,"imei",v)} p="15 cifre" nt="Barcode 📷"/>
          </div>}
          {sub.ct==="lg"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px 14px"}}>
            <DD l="Operatore provenienza" r v={sd.opProvenienza||""} o={v=>uP(group.id,si,sub.id,"opProvenienza",v)} vals={opProv}/>
            <TF l="Codice Contratto" r v={c.codice_contratto||""} o={v=>uC(group.id,si,sub.id,"codice_contratto",v)} p="es. 167942"/>
            {sub.id==="luce"&&<TF l="POD" v={c.pod||""} o={v=>uC(group.id,si,sub.id,"pod",v.toUpperCase().replace(/[^A-Z0-9]/g,""))} p="IT001E..." nt="Alfanumerico"/>}
            {sub.id==="gas"&&<TF l="PDR" v={c.pdr||""} o={v=>uC(group.id,si,sub.id,"pdr",v.replace(/[^A-Za-z0-9]/g,""))} p="Codice PDR" nt="Alfanumerico"/>}
          </div>}
          {sub.ct==="multi"&&(sub.isAssicBiz||sub.id==="assicurazioni")&&(
            <div style={{maxWidth:260}}>
              <TF l="Numero Polizza" v={c.nPolizza||""} o={v=>uC(group.id,si,sub.id,"nPolizza",v)} p="es. 12345678"/>
            </div>
          )}
        </div>
      )}
    </div>
  );
  return content;
};

const NoteStep = () => {
  const [show,setShow]=useState(false);
  const content = (
    <div style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,borderLeft:"4px solid #e83e8c"}}>
      <div style={{fontSize:11,fontWeight:700,color:"#e83e8c",marginBottom:14,textTransform:"uppercase"}}>📝 Step 7 — Note / Promemoria</div>
      <div style={{textAlign:"center",marginBottom:show?16:0}}>
        <div style={{fontSize:13,fontWeight:600,color:"#333",marginBottom:10}}>Nota o promemoria?</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={()=>setShow(true)} style={{padding:"8px 28px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",border:show?"2px solid #28a745":"2px solid #e0e0e0",background:show?"#d4edda":"#fff",color:show?"#155724":"#666"}}>Sì</button>
          <button onClick={()=>setShow(false)} style={{padding:"8px 28px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",border:!show?"2px solid #dc3545":"2px solid #e0e0e0",background:!show?"#f8d7da":"#fff",color:!show?"#721c24":"#666"}}>No</button>
        </div>
      </div>
      {show&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{border:"1px solid #e0e0e0",borderRadius:10,padding:14,background:"#fafbfc"}}><div style={{fontSize:13,fontWeight:700,marginBottom:8}}>📋 Nota</div><textarea placeholder="Nota…" rows={3} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
        <div style={{border:"1px solid #e0e0e0",borderRadius:10,padding:14,background:"#fafbfc"}}><div style={{fontSize:13,fontWeight:700,marginBottom:8}}>📅 Promemoria</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Data</div><input type="date" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div><div><div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Ora</div><input type="time" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div></div>
          <div style={{marginTop:8}}><DD l="Negozio" vals={negozi}/></div>
          <div style={{marginTop:8}}><div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Descrizione</div><textarea placeholder="Dettagli…" rows={2} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
        </div>
      </div>}
    </div>
  );
  return content;
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

export default function CRM() {
  const [brand,setBrand]=useState(null);
  const [showMargPOS,setShowMargPOS]=useState(false);
  const [showMargList,setShowMargList]=useState(false);
  const [margItems,setMargItems]=useState([]);
  const [draftLoaded,setDraftLoaded]=useState(false);
  const [showCart,setShowCart]=useState(false);
  const [toast,setToast]=useState(null);
  const [expI,setExpI]=useState({});
  const [tipoCliente,setTipoCliente]=useState(null);
  const [lookupValue,setLookupValue]=useState("");
  const [clienteFound,setClienteFound]=useState(false);
  const [showAna,setShowAna]=useState(false);
  const [ana,setAna]=useState({nome:"",cognome:"",cellulare:"",email:"",via:"",cap:"",citta:"",ragioneSociale:"",nomeRef:"",cognomeRef:"",recapito:""});
  const [sales,setSales]=useState({});
  const [sesCode,setSesCode]=useState("");
  const [cart,setCart]=useState([]);

  const [selVend,setSelVend]=useState("Alberto");
  const [selNeg,setSelNeg]=useState("Magliana");
  const [confirmReset,setConfirmReset]=useState(false);
  const [showStep4,setShowStep4]=useState(false);
  const [vfQtyModal,setVfQtyModal]=useState(null);

  const bObj=brand?BRANDS.find(b=>b.id===brand):null;
  const cats=(brand==="windtre"?getW3(tipoCliente):brand==="vodafone"?getVF(tipoCliente):[]);
  const sT=m=>{setToast(m);setTimeout(()=>setToast(null),3500)};
  const uA=(k,v)=>setAna(p=>({...p,[k]:v}));
  const gS=catId=>sales[catId]||[{}];

  const togSub=(catId,si,subId,radioSubs)=>{setSales(p=>{const cs=[...(p[catId]||[{}])];if(!cs[si])cs[si]={};const cur=cs[si][subId];if(cur&&cur.active){cs[si]={...cs[si],[subId]:null}}else{if(radioSubs){const updated={...cs[si]};radioSubs.forEach(rs=>{if(rs!==subId)updated[rs]=null});updated[subId]=emS();cs[si]=updated}else{cs[si]={...cs[si],[subId]:emS()}}};return{...p,[catId]:cs}})};
  const uF=(catId,si,subId,fk,val)=>{setSales(p=>{const cs=[...(p[catId]||[{}])];if(!cs[si])cs[si]={};const sub=cs[si][subId]||emS();cs[si]={...cs[si],[subId]:{...sub,fields:{...(sub.fields||{}),[fk]:val}}};return{...p,[catId]:cs}})};
  const uC=(catId,si,subId,fk,val)=>{setSales(p=>{const cs=[...(p[catId]||[{}])];if(!cs[si])cs[si]={};const sub=cs[si][subId]||emS();cs[si]={...cs[si],[subId]:{...sub,contract:{...(sub.contract||{}),[fk]:val}}};return{...p,[catId]:cs}})};
  const uP=(catId,si,subId,prop,val)=>{setSales(p=>{const cs=[...(p[catId]||[{}])];if(!cs[si])cs[si]={};const sub=cs[si][subId]||emS();cs[si]={...cs[si],[subId]:{...sub,[prop]:val}};return{...p,[catId]:cs}})};
  const addSl=catId=>setSales(p=>({...p,[catId]:[...(p[catId]||[{}]),{}]}));
  const rmSl=(catId,idx)=>setSales(p=>{const c=[...(p[catId]||[{}])];c.splice(idx,1);return{...p,[catId]:c.length?c:[{}]}});
  const [skyS,setSkyS]=useState([{tvSel:null,tvCC:"",fibraSel:null,fibraCC:"",fibraGnp:null,fibraGnpBrand:"",fibraGnpNum:"",mobileSel:false,mobMnp:null,mobNumProv:"",mobNumDef:"",mobBrandMnp:"",mobIccid:"",mobNum:"",mobIccidNo:""}]);
  const uSkyF=(si,field,val)=>setSkyS(p=>{const n=[...p];n[si]={...n[si],[field]:val};return n});
  const togSky=(si,pr)=>{setSkyS(p=>{const n=[...p];const s={...n[si]};if(SKY_TV.indexOf(pr)>=0){s.tvSel=s.tvSel===pr?null:pr;s.tvCC="";}else if(SKY_FIBRA.indexOf(pr)>=0){s.fibraSel=s.fibraSel===pr?null:pr;s.fibraCC="";s.fibraGnp=null;s.fibraGnpBrand="";s.fibraGnpNum="";}else if(pr==="Sky Mobile"){s.mobileSel=!s.mobileSel;s.mobMnp=null;s.mobNumProv="";s.mobNumDef="";s.mobBrandMnp="";s.mobIccid="";s.mobNum="";s.mobIccidNo="";}n[si]=s;return n;});};
  const openVFModal=({catId,si,subId,offer})=>{const cur=((sales[catId]||[{}])[si]||{})[subId];const existQty=cur&&cur.vfOffers&&cur.vfOffers[offer]?cur.vfOffers[offer]:1;setVfQtyModal({catId,si,subId,offer,tempQty:existQty});};
  const confirmVFQty=()=>{if(!vfQtyModal)return;const{catId,si,subId,offer,tempQty}=vfQtyModal;const cur=((sales[catId]||[{}])[si]||{})[subId];const baseO=(cur&&cur.vfOffers)||{};const newVfOffers={...baseO};if(tempQty>0)newVfOffers[offer]=tempQty;else delete newVfOffers[offer];const existC=(cur&&cur.vfContratti&&cur.vfContratti[offer])||[];const newC=Array.from({length:tempQty},(_,i)=>existC[i]||{codIns:"",codContratto:"",numProv:"",iccid:""});const newVfC={...((cur&&cur.vfContratti)||{}),[offer]:newC};uP(catId,si,subId,"vfOffers",newVfOffers);uP(catId,si,subId,"vfContratti",newVfC);setVfQtyModal(null);};

  const colItems=useCallback(()=>{
    const items=[];
    if(brand==="windtre"||brand==="vodafone"){const getCats=brand==="windtre"?getW3(tipoCliente):getVF(tipoCliente);getCats.forEach(g=>{(sales[g.id]||[{}]).forEach((sale,si)=>{g.subs.forEach(sub=>{const d=sale[sub.id];if(d&&d.active){const det={...(d.fields||{}),...(d.contract||{}),hasContract:!!sub.hasContract};if(d.tipMob)det["Tipologia"]=d.tipMob;if(d.mnp!=null)det["MNP"]=d.mnp===true||d.mnp==="Sì"?"Sì":"No";if(d.easyPay!=null)det["EasyPay"]=d.easyPay==="Sì"||d.easyPay===true?"Sì":"No";if(d.tnpGa==="Sì"||d.tnpGa===true){det["TNP GA"]="Sì";if(d.tnpTipo)det["Tipo TNP"]=d.tnpTipo;if(d.tnpModello)det["Terminale"]=d.tnpModello;if(d.tnpImei)det["IMEI TNP"]=d.tnpImei;if(d.tnpTipo&&d.tnpTipo.startsWith("Finanziamento"))det["Finanziamento"]="Approvato"};const gaRl=d.tnpGaReloadSel?Object.keys(d.tnpGaReloadSel).filter(k=>d.tnpGaReloadSel[k]):[];if(gaRl.length)det["Reload GA"]=gaRl.join(", ");if(d.reloadForever)det["Reload Forever"]="Sì";const secK=d.securitySel?Object.keys(d.securitySel).filter(k=>d.securitySel[k]):[];if(secK.length)det["Security"]=secK.join(", ");if(d.cbTnp){det["TNP CB"]="Sì";if(d.cbTnpCodIns)det["Cod.Ins.CB"]=d.cbTnpCodIns;if(d.cbTnpCell)det["Cell.CB"]=d.cbTnpCell;if(d.cbTnpCC)det["CC.CB"]=d.cbTnpCC;if(d.cbTnpTipo)det["Tipo CB"]=d.cbTnpTipo;if(d.cbTnpModello)det["Term.CB"]=d.cbTnpModello;if(d.cbTnpImei)det["IMEI CB"]=d.cbTnpImei;if(d.cbTnpTipo&&d.cbTnpTipo.startsWith("Finanziamento"))det["Fin.CB"]="Approvato"};const cbRl=d.cbTnpReloadSel?Object.keys(d.cbTnpReloadSel).filter(k=>d.cbTnpReloadSel[k]):[];if(cbRl.length)det["Reload CB"]=cbRl.join(", ");if(d.cbCambio&&d.cbCambioVal){det["Cambio Off."]=d.cbCambioVal;if(d.cbCambioCodIns)det["Cod.Ins.Cambio"]=d.cbCambioCodIns;if(d.cbCambioCell)det["Cell.Cambio"]=d.cbCambioCell;if(d.cbCambioCC)det["CC.Cambio"]=d.cbCambioCC};const cbAd=d.cbAddonSel?Object.keys(d.cbAddonSel).filter(k=>d.cbAddonSel[k]):[];if(cbAd.length)det["Add-on CB"]=cbAd.join(", ");if(d.gnp)det.GNP="Sì";if(d.gnpNum)det["N.GNP"]=d.gnpNum;if(d.gnpOp)det["Op.GNP"]=d.gnpOp;if(d.secondaLinea)det["2°Linea"]="Sì";if(d.domiciliazione)det["Domic."]="Sì";if(d.opProvenienza)det["Op.Prov."]=d.opProvenienza;if(d.domiciliato!=null)det["Domiciliato"]=d.domiciliato?"Sì":"No";if(d.voceCasaCb===true||d.voceCasaCb==="Sì")det["Voce Casa CB"]="Sì";if(d.convergente!=null)det["Convergente"]=d.convergente?"Sì":"No";const adks=d.addons?Object.keys(d.addons).filter(k=>d.addons[k]):[];if(adks.length)det["Add-on"]=adks.join(", ");items.push({macro:g.title,macroColor:g.color,macroIcon:g.icon,sub:sub.title,saleNum:si+1,details:det})}})})})
    }else if(brand==="sky"){skyS.forEach((s,si)=>{if(s.tvSel)items.push({macro:"SKY TV",macroColor:"#0072C6",macroIcon:"📺",sub:s.tvSel,saleNum:si+1,details:{hasContract:true,"Codice Contratto":s.tvCC||""}});if(s.fibraSel){const det={hasContract:true,"Codice Contratto":s.fibraCC||"","GNP":s.fibraGnp==="Sì"?"Sì":"No"};if(s.fibraGnp==="Sì"){det["Brand GNP"]=s.fibraGnpBrand||"";det["N.Fisso Portabilità"]=s.fibraGnpNum||""}items.push({macro:"SKY FIBRA",macroColor:"#0072C6",macroIcon:"🌐",sub:s.fibraSel,saleNum:si+1,details:det})}if(s.mobileSel){const det={hasContract:false,"MNP":s.mobMnp==="Sì"?"Sì":"No"};if(s.mobMnp==="Sì"){det["N.Provvisorio"]=s.mobNumProv||"";det["N.Definitivo"]=s.mobNumDef||"";det["Brand MNP"]=s.mobBrandMnp||"";det["ICCID"]=s.mobIccid||""}else if(s.mobMnp==="No"){det["Numero"]=s.mobNum||"";det["ICCID"]=s.mobIccidNo||""}items.push({macro:"SKY MOBILE",macroColor:"#0072C6",macroIcon:"📱",sub:"Sky Mobile",saleNum:si+1,details:det})}});}
    return items;
  },[brand,sales,skyS,tipoCliente]);

  const addCart=()=>{
    const items=colItems();
    if(items.length>0&&bObj){const snap={sales:JSON.parse(JSON.stringify(sales)),sesCode,skyS:JSON.parse(JSON.stringify(skyS))};setCart(p=>[...p,{brandId:brand,brandLabel:bObj.label,brandIcon:bObj.icon,brandColor:bObj.color,items,sv:snap}]);sT("✅ "+items.length+" prodotti "+bObj.label)}
    setSales({});setSesCode("");setSkyS([{tvSel:null,tvCC:"",fibraSel:null,fibraCC:"",fibraGnp:null,fibraGnpBrand:"",fibraGnpNum:"",mobileSel:false,mobMnp:null,mobNumProv:"",mobNumDef:"",mobBrandMnp:"",mobIccid:"",mobNum:"",mobIccidNo:""}]);setBrand(null);
  };
  const editCG=idx=>{const g=cart[idx];if(!g)return;setBrand(g.brandId);if(g.sv){setSales(g.sv.sales||{});setSesCode(g.sv.sesCode||"");setSkyS(g.sv.skyS||[{tvSel:null,tvCC:"",fibraSel:null,fibraCC:"",fibraGnp:null,fibraGnpBrand:"",fibraGnpNum:"",mobileSel:false,mobMnp:null,mobNumProv:"",mobNumDef:"",mobBrandMnp:"",mobIccid:"",mobNum:"",mobIccidNo:""}])}setCart(p=>p.filter((_,i)=>i!==idx));setShowCart(false);sT("✏️ Modifica "+g.brandLabel)};
  const rmCG=idx=>setCart(p=>p.filter((_,i)=>i!==idx));
  const fullReset=()=>{setBrand(null);setTipoCliente(null);setLookupValue("");setClienteFound(false);setShowAna(false);setSales({});setSesCode("");setSkyS([{tvSel:null,tvCC:"",fibraSel:null,fibraCC:"",fibraGnp:null,fibraGnpBrand:"",fibraGnpNum:"",mobileSel:false,mobMnp:null,mobNumProv:"",mobNumDef:"",mobBrandMnp:"",mobIccid:"",mobNum:"",mobIccidNo:""}]);setCart([]);setShowCart(false);setExpI({});setConfirmReset(false);setShowStep4(false);setMargItems([]);clearDraft("crm_v9");setAna({nome:"",cognome:"",cellulare:"",email:"",via:"",cap:"",citta:"",ragioneSociale:"",nomeRef:"",cognomeRef:"",recapito:""})};
  // ── Auto-save every state change ──
  useAutoSave("crm_v9",{brand,tipoCliente,ana,sales,sesCode,skyS,selVend,selNeg,lookupValue,margItems});
  
  // ── Load draft on mount (once) ──
  useEffect(()=>{if(draftLoaded)return;setDraftLoaded(true);const d=loadDraft("crm_v9");if(d){if(d.tipoCliente)setTipoCliente(d.tipoCliente);if(d.ana)setAna(d.ana);if(d.selVend)setSelVend(d.selVend);if(d.selNeg)setSelNeg(d.selNeg);if(d.margItems)setMargItems(d.margItems)}},[]);
  
  // ── Remember last brand+tipo for next session ──
  useEffect(()=>{if(tipoCliente)try{sessionStorage.setItem("crm_lastTipo",tipoCliente)}catch(e){}},[tipoCliente]);
  
  // ── Marginalità handlers ──
  const addMargItem=(item)=>{setMargItems(p=>[...p,item]);setShowMargPOS(false)};
  const rmMargItem=(idx)=>setMargItems(p=>p.filter((_,i)=>i!==idx));

  const finalSubmit=()=>{const cur=colItems();const fc=[...cart];if(cur.length>0&&bObj)fc.push({brandId:brand,brandLabel:bObj.label,brandIcon:bObj.icon,brandColor:bObj.color,items:cur,sv:{sales:JSON.parse(JSON.stringify(sales)),sesCode,skyS:JSON.parse(JSON.stringify(skyS))}});sT("🎉 Inviato! "+fc.length+" brand, "+fc.reduce((s,g)=>s+g.items.length,0)+" prodotti");setTimeout(fullReset,2000)};
  const doLookup=()=>{setClienteFound(true);setShowAna(true);setShowStep4(false);setAna({nome:"Mario",cognome:"Rossi",cellulare:"333 1234567",email:"mario.rossi@email.com",via:"Via Roma 15",cap:"00100",citta:"Roma",ragioneSociale:"Rossi S.r.l.",nomeRef:"Mario",cognomeRef:"Rossi",recapito:"333 1234567"})};


  const tCI=cart.reduce((s,g)=>s+g.items.length,0)+colItems().length;
  const bC=bObj?bObj.color:"#6b7280";
  const bG=bObj?bObj.gradient:"linear-gradient(135deg,#374151,#6b7280)";
  const gSS=i=>{if(i===0)return brand?"done":"active";if(i===1)return !brand?"pending":tipoCliente?"done":"active";if(i===2)return !tipoCliente?"pending":showAna?"done":"active";return showAna?"active":"pending"};

  // ═══════════ CART ═══════════
  if(showCart){
    const curI=colItems();const allG=[...cart];
    if(curI.length>0&&bObj)allG.push({brandId:brand,brandLabel:bObj.label,brandIcon:bObj.icon,brandColor:bObj.color,items:curI,isCurrent:true});
    const tp=allG.reduce((s,g)=>s+g.items.length,0);
    const cartContent = (
      <div style={{fontFamily:"Inter,-apple-system,sans-serif",background:"#f0f2f5",minHeight:"100vh",padding:16,maxWidth:920,margin:"0 auto"}}>
        {toast&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"#28a745",color:"#fff",padding:"12px 28px",borderRadius:10,fontSize:14,fontWeight:700,boxShadow:"0 6px 20px rgba(0,0,0,.2)",zIndex:9999}}>{toast}</div>}
        <div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",borderRadius:16,padding:"24px 28px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{color:"#fff",fontWeight:800,fontSize:22,marginBottom:4}}>🛒 Carrello</div><div style={{color:"rgba(255,255,255,.6)",fontSize:13}}>{tipoCliente==="privato"?(ana.nome+" "+ana.cognome):ana.ragioneSociale} · {lookupValue}</div></div>
            <div style={{display:"flex",gap:8}}>
              <div style={{background:"rgba(255,255,255,.15)",borderRadius:10,padding:"8px 16px",textAlign:"center"}}><div style={{color:"#fff",fontWeight:800,fontSize:22}}>{allG.length}</div><div style={{color:"rgba(255,255,255,.6)",fontSize:10}}>BRAND</div></div>
              <div style={{background:"rgba(255,255,255,.15)",borderRadius:10,padding:"8px 16px",textAlign:"center"}}><div style={{color:"#fff",fontWeight:800,fontSize:22}}>{tp}</div><div style={{color:"rgba(255,255,255,.6)",fontSize:10}}>PRODOTTI</div></div>
            </div>
          </div>
        </div>
        {allG.length===0?<div style={{background:"#fff",borderRadius:12,padding:40,textAlign:"center",color:"#999"}}><div style={{fontSize:40}}>🛒</div><div style={{fontSize:15,fontWeight:600,marginTop:10}}>Vuoto</div></div>:
          allG.map((g,gi)=>(
            <div key={gi} style={{background:"#fff",borderRadius:12,marginBottom:12,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
              <div style={{background:g.brandColor,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{g.brandIcon}</span><span style={{color:"#fff",fontWeight:700,fontSize:15}}>{g.brandLabel}</span><span style={{background:"rgba(255,255,255,.25)",borderRadius:12,padding:"2px 10px",color:"#fff",fontSize:11,fontWeight:600}}>{g.items.length}</span>{g.isCurrent&&<span style={{background:"#FFD800",borderRadius:12,padding:"2px 10px",color:"#333",fontSize:10,fontWeight:700}}>IN CORSO</span>}</div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>g.isCurrent?setShowCart(false):editCG(gi)} style={{background:"rgba(255,255,255,.25)",border:"none",borderRadius:6,padding:"5px 14px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:700}}>✏️ Modifica</button>
                  {!g.isCurrent&&<button onClick={()=>rmCG(gi)} style={{background:"rgba(255,0,0,.25)",border:"none",borderRadius:6,padding:"5px 14px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:600}}>✕ Rimuovi</button>}
                </div>
              </div>
              <div style={{padding:"6px 16px"}}>
                {g.items.map((it,ii)=><CartItem key={ii} it={it} ii={ii} gi={gi} total={g.items.length} expI={expI} setExpI={setExpI}/>)}              </div>
            </div>
          ))
        }
        {margItems.length>0&&<div style={{background:"#fff",borderRadius:12,padding:16,marginBottom:12,marginTop:12,boxShadow:"0 2px 8px rgba(0,0,0,.06)",overflow:"hidden"}}>
          <div style={{background:"linear-gradient(135deg,#6f42c1,#9b59b6)",padding:"10px 16px",borderRadius:"8px 8px 0 0",margin:"-16px -16px 14px -16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>📦</span><span style={{color:"#fff",fontWeight:700,fontSize:14}}>Prodotti & Marginalità</span><span style={{background:"rgba(255,255,255,.25)",borderRadius:12,padding:"2px 10px",color:"#fff",fontSize:11,fontWeight:600}}>{margItems.length}</span></div>
            <button onClick={()=>setShowMargPOS(true)} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:6,padding:"5px 14px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:700}}>+ Aggiungi</button>
          </div>
          {margItems.map((item,idx)=>(
            <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
              <div>
                <span style={{fontWeight:700,fontSize:13}}>{item.product}</span>
                {item.model&&<span style={{fontSize:11,color:"#888",marginLeft:6}}>{item.model}</span>}
                <span style={{fontSize:11,color:"#6f42c1",marginLeft:8}}>x{item.qty||1}</span>
                <span style={{fontSize:12,fontWeight:600,color:item.totalMargin>=0?"#28a745":"#dc3545",marginLeft:8}}>€{(item.totalMargin||0).toFixed(2)} marg.</span>
              </div>
              <button onClick={()=>{setMargItems(p=>p.filter((_,i)=>i!==idx));setShowMargPOS(true)}} style={{padding:"4px 12px",borderRadius:6,border:"1px solid #6f42c1",background:"#f8f4ff",color:"#6f42c1",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>✏️ Modifica</button>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:10,paddingTop:10,borderTop:"2px solid #f0f0f0"}}>
            <span style={{fontSize:13,fontWeight:700,color:"#555"}}>Totale margine: </span>
            <span style={{fontSize:14,fontWeight:900,color:margItems.reduce((s,i)=>s+i.totalMargin,0)>=0?"#28a745":"#dc3545",marginLeft:8}}>€{margItems.reduce((s,i)=>s+(i.totalMargin||0),0).toFixed(2)}</span>
          </div>
        </div>}
        <div style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,borderLeft:"4px solid #17a2b8",marginTop:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"#17a2b8",marginBottom:14,textTransform:"uppercase"}}>📎 Step 5 — Allegati</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {[{l:"Documento",i:"🪪"},{l:"Contratti",i:"📄"},{l:"Altro",i:"📁"}].map((a,i)=><div key={i} style={{border:"2px dashed #ccc",borderRadius:10,padding:"14px 10px",textAlign:"center",cursor:"pointer",background:"#fafbfc"}}><div style={{fontSize:24,marginBottom:4}}>{a.i}</div><div style={{fontSize:11,fontWeight:700,marginBottom:6}}>{a.l}</div><div style={{display:"inline-block",padding:"4px 12px",borderRadius:6,background:"#17a2b8",color:"#fff",fontSize:10,fontWeight:600}}>Carica</div></div>)}
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,borderLeft:"4px solid #28a745"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#28a745",marginBottom:14,textTransform:"uppercase"}}>🏪 Step 6 — Attribuzione</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px 16px"}}>
            <DD l="Venditore" r v={selVend} o={v=>setSelVend(v)} vals={venditori} nt="Dal login — editabile"/><DD l="Negozio" r v={selNeg} o={v=>setSelNeg(v)} vals={negozi} nt="Dal login — editabile"/>
            <div><div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Data <span style={{color:"#dc3545"}}>*</span></div><input type="date" defaultValue="2026-03-07" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div>
          </div>
        </div>
        <NoteStep/>
        <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
          <button onClick={()=>setShowCart(false)} style={{padding:"12px 24px",borderRadius:10,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:13,fontWeight:600,cursor:"pointer"}}>← Torna</button>
          <button onClick={()=>{if(brand&&colItems().length>0)addCart();else{setBrand(null);setShowCart(false)}}} style={{padding:"12px 24px",borderRadius:10,border:"2px solid #6f42c1",background:"#F3EEFB",color:"#6f42c1",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Altro brand</button>
          <button onClick={finalSubmit} disabled={tp===0} style={{padding:"12px 36px",borderRadius:10,border:"none",background:tp>0?"linear-gradient(135deg,#28a745,#20c997)":"#ccc",color:"#fff",fontSize:14,fontWeight:800,cursor:tp>0?"pointer":"not-allowed",marginLeft:"auto"}}>💾 Salva contratto ({tp})</button>
        </div>
      </div>
    );
    return cartContent;
  }

  // ═══════════ FORM ═══════════
  const formContent = (
    <div style={{fontFamily:"Inter,-apple-system,sans-serif",background:"#f0f2f5",minHeight:"100vh",padding:16,maxWidth:920,margin:"0 auto"}}>
      {toast&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"#28a745",color:"#fff",padding:"12px 28px",borderRadius:10,fontSize:14,fontWeight:700,boxShadow:"0 6px 20px rgba(0,0,0,.2)",zIndex:9999}}>{toast}</div>}
      <div style={{background:bG,borderRadius:12,padding:"14px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:36,height:36,background:"rgba(255,255,255,.2)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{bObj?bObj.icon:"⚡"}</div><div><div style={{color:"#fff",fontWeight:700,fontSize:16}}>CRM - Inserimento Contratto</div><div style={{color:"rgba(255,255,255,.7)",fontSize:11}}>{bObj?bObj.label+" · v5":"Seleziona brand"}{tipoCliente?" · "+(tipoCliente==="privato"?"Privato":"Business"):""}</div></div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setShowMargPOS(true)} title="Registra prodotto" style={{padding:"8px 16px",borderRadius:8,border:"1px solid rgba(255,255,255,.4)",background:"rgba(255,255,255,.15)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>📦 Prodotti{margItems.length>0&&<span style={{background:"#FFD800",color:"#333",borderRadius:8,padding:"1px 7px",fontSize:11,fontWeight:800}}>{margItems.length}</span>}</button><button onClick={()=>setShowCart(true)} style={{background:tCI>0?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.3)",borderRadius:8,padding:"8px 16px",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",gap:6}}>🛒 Carrello{tCI>0&&<span style={{background:"#FFD800",color:"#333",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:800}}>{tCI}</span>}</button>
          {brand&&<button onClick={addCart} style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",borderRadius:8,padding:"8px 14px",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:700}}>📦 Salva brand</button>}
          <button onClick={fullReset} title="Reset tutto" style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.25)",borderRadius:8,padding:"8px 14px",color:"rgba(255,255,255,.85)",fontSize:13,cursor:"pointer",fontWeight:700}}>🔄 Reset</button>
        </div>
      </div>

      <div style={{display:"flex",gap:3,marginBottom:16}}>
        {["Brand","Tipo Cliente","Anagrafica","Prodotti","Allegati","Attribuzione","Note"].map((st,i)=><div key={i} style={{flex:1,textAlign:"center",padding:"7px 2px",borderRadius:6,fontSize:9.5,fontWeight:600,background:gSS(i)==="active"?bC:gSS(i)==="done"?"#28a745":"#e9ecef",color:gSS(i)==="pending"?"#aaa":"#fff"}}>{gSS(i)==="done"?"✓ ":""}{st}</div>)}
      </div>

      {cart.length>0&&<div onClick={()=>setShowCart(true)} style={{background:"linear-gradient(90deg,#1a1a2e,#16213e)",borderRadius:10,padding:"10px 16px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}><span>🛒</span><span style={{color:"#fff",fontSize:12,fontWeight:600}}>Carrello:</span>{cart.map((g,i)=><span key={i} style={{background:g.brandColor,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{g.brandIcon} {g.items.length}</span>)}</div><span style={{color:"rgba(255,255,255,.5)",fontSize:11}}>Vedi →</span></div>}

      {!brand?<div style={{background:"#fff",borderRadius:10,padding:20,marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:14,textTransform:"uppercase"}}>Step 1 — Brand</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {BRANDS.map(b=><button key={b.id} onClick={()=>{if(b.ready){setBrand(b.id);setSales({});setSkyS([{tvSel:null,tvCC:"",fibraSel:null,fibraCC:"",fibraGnp:null,fibraGnpBrand:"",fibraGnpNum:"",mobileSel:false,mobMnp:null,mobNumProv:"",mobNumDef:"",mobBrandMnp:"",mobIccid:"",mobNum:"",mobIccidNo:""}]);setSesCode("")}}} style={{padding:16,borderRadius:12,border:"2px solid #e8e8e8",background:"#fff",cursor:b.ready?"pointer":"default",textAlign:"center",opacity:b.ready?1:.6,position:"relative",overflow:"hidden"}}>
            {!b.ready&&<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(255,255,255,.6)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:2}}><div style={{fontSize:22}}>🔧</div><div style={{fontSize:10,fontWeight:700,color:"#999"}}>Manutenzione</div></div>}
            <div style={{fontSize:30,marginBottom:4}}>{b.icon}</div><div style={{fontWeight:800,fontSize:15,color:b.color}}>{b.label}</div><div style={{fontSize:10,color:"#999",marginTop:3}}>{b.desc}</div>
          </button>)}
        </div>
        <div style={{marginTop:12}}>
          <button onClick={()=>setShowMargPOS(true)} style={{width:"100%",padding:"14px 20px",borderRadius:12,border:"2px dashed #6f42c1",background:"#f8f4ff",cursor:"pointer",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            <span style={{fontSize:24}}>📦</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontWeight:800,fontSize:14,color:"#6f42c1"}}>Prodotti e Marginalità</div>
              <div style={{fontSize:11,color:"#9b59b6",marginTop:2}}>Registra vendite senza attivazione brand</div>
            </div>
            {margItems.length>0&&<span style={{marginLeft:"auto",background:"#6f42c1",color:"#fff",borderRadius:10,padding:"2px 10px",fontSize:12,fontWeight:800}}>{margItems.length}</span>}
          </button>
        </div>
      </div>:<div style={{background:"#fff",borderRadius:10,padding:"12px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:11,fontWeight:700,color:"#28a745"}}>✓ 1</span><span style={{fontSize:13,fontWeight:600}}>Brand: <span style={{color:bObj.color}}>{bObj.icon} {bObj.label}</span></span></div>}

      {brand&&!showStep4&&<div style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,borderLeft:"4px solid #6f42c1"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#6f42c1",marginBottom:12,textTransform:"uppercase"}}>Step 2 — Tipo Cliente</div>
        <div style={{display:"flex",gap:12,marginBottom:tipoCliente?16:0}}>
          {["privato","business"].map(t=><button key={t} onClick={()=>{setTipoCliente(t);setShowAna(false);setClienteFound(false);setLookupValue("");setSales({});setSkyS([{tvSel:null,tvCC:"",fibraSel:null,fibraCC:"",fibraGnp:null,fibraGnpBrand:"",fibraGnpNum:"",mobileSel:false,mobMnp:null,mobNumProv:"",mobNumDef:"",mobBrandMnp:"",mobIccid:"",mobNum:"",mobIccidNo:""}]);setShowStep4(false)}} style={{flex:1,padding:12,borderRadius:10,border:tipoCliente===t?"2px solid #6f42c1":"2px solid #e8e8e8",background:tipoCliente===t?"#F3EEFB":"#fff",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:22,marginBottom:2}}>{t==="privato"?"👤":"🏢"}</div><div style={{fontWeight:700,fontSize:14,color:tipoCliente===t?"#6f42c1":"#333"}}>{t==="privato"?"Privato":"Business"}</div></button>)}
        </div>
        {tipoCliente&&<div style={{background:"#f8f9fa",borderRadius:8,padding:14,position:"relative"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:8}}>{tipoCliente==="privato"?"Codice Fiscale":"Partita IVA"}</div>
          <div style={{display:"flex",gap:8}}>
            <input placeholder={tipoCliente==="privato"?"RSSMRA80A01H501Z":"12345678901"} value={lookupValue} onChange={e=>setLookupValue(e.target.value.toUpperCase())} style={{flex:1,padding:"10px 12px",borderRadius:8,border:"1px solid #d0d0d0",fontSize:14,fontFamily:"monospace",letterSpacing:1.2}}/>
            <button onClick={doLookup} style={{padding:"10px 18px",borderRadius:8,border:"none",background:"#6f42c1",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>🔍 Cerca</button>
          </div>
          {clienteFound&&<div style={{marginTop:10,background:"#d4edda",borderRadius:6,padding:"8px 12px",fontSize:12,color:"#155724"}}>✅ Trovato!</div>}
        </div>}
      </div>}

      {showAna&&!showStep4&&<div style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,borderLeft:"4px solid #1B3A5C"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#1B3A5C",marginBottom:14,textTransform:"uppercase"}}>📝 Step 3 — Anagrafica</div>
        {tipoCliente==="privato"?<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px"}}><TF l="Nome" r v={ana.nome} o={v=>uA("nome",v)} p="Mario" pf={clienteFound}/><TF l="Cognome" r v={ana.cognome} o={v=>uA("cognome",v)} p="Rossi" pf={clienteFound}/><TF l="Cellulare" v={ana.cellulare} o={v=>uA("cellulare",v)} p="333..." pf={clienteFound}/><TF l="Email" v={ana.email} o={v=>uA("email",v)} p="email" pf={clienteFound}/></div><div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #eee",display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"10px 16px"}}><TF l="Via" v={ana.via} o={v=>uA("via",v)} p="Via Roma" pf={clienteFound}/><TF l="CAP" v={ana.cap} o={v=>uA("cap",v)} p="00100" pf={clienteFound}/><TF l="Città" v={ana.citta} o={v=>uA("citta",v)} p="Roma" pf={clienteFound}/></div></>
        :<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px"}}><TF l="Ragione Sociale" r v={ana.ragioneSociale} o={v=>uA("ragioneSociale",v)} p="Rossi Srl" pf={clienteFound}/><TF l="Nome Ref." r v={ana.nomeRef} o={v=>uA("nomeRef",v)} p="Mario" pf={clienteFound}/><TF l="Cognome Ref." r v={ana.cognomeRef} o={v=>uA("cognomeRef",v)} p="Rossi" pf={clienteFound}/><TF l="Recapito" v={ana.recapito} o={v=>uA("recapito",v)} p="333..." pf={clienteFound}/><TF l="Email" v={ana.email} o={v=>uA("email",v)} p="info@" pf={clienteFound}/></div><div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #eee",display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"10px 16px"}}><TF l="Via" v={ana.via} o={v=>uA("via",v)} p="Via Roma" pf={clienteFound}/><TF l="CAP" v={ana.cap} o={v=>uA("cap",v)} p="00100" pf={clienteFound}/><TF l="Città" v={ana.citta} o={v=>uA("citta",v)} p="Roma" pf={clienteFound}/></div></>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:12,borderTop:"1px solid #eee"}}>
          <button onClick={()=>{setAna({nome:"",cognome:"",cellulare:"",email:"",via:"",cap:"",citta:"",ragioneSociale:"",nomeRef:"",cognomeRef:"",recapito:""});setLookupValue("");setClienteFound(false);setShowStep4(false)}} style={{padding:"9px 18px",borderRadius:8,border:"2px solid #dc3545",background:"#fff",color:"#dc3545",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>↺ Reset anagrafica</button>
          <button onClick={()=>setShowStep4(true)} style={{padding:"9px 22px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#2E75B6,#1B3A5C)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>Avanti →</button>
        </div>
      </div>}

      {showAna&&showStep4&&(brand==="windtre"||brand==="vodafone")&&<div style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,borderLeft:"4px solid "+(brand==="vodafone"?"#E60000":"#2E75B6")}}>
        <div style={{fontSize:11,fontWeight:700,color:brand==="vodafone"?"#E60000":"#2E75B6",marginBottom:14,textTransform:"uppercase"}}>📂 Step 4 — Prodotti e Contratto</div>
        <div style={{background:"#f0f7ff",borderRadius:8,padding:10,marginBottom:14,display:"flex",alignItems:"center",gap:12,border:"1px solid #b8d4f0",flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,color:"#1B3A5C"}}>Codice inserimento:</span>
          <select value={sesCode} onChange={e=>setSesCode(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #b8d4f0",fontSize:12,fontWeight:600,background:"#fff",minWidth:140}}><option value="">— Seleziona —</option>{codiciW3.map(c=><option key={c} value={c}>{c}</option>)}</select>
        </div>
        {cats.map(group=><div key={group.id} style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:16}}>{group.icon}</span><span style={{fontSize:13,fontWeight:700,color:group.color,textTransform:"uppercase"}}>{group.title}</span></div>
          {gS(group.id).map((sale,si)=><div key={si} style={{padding:12,borderRadius:8,marginBottom:6,background:"#fafbfc",borderLeft:"3px solid "+group.color}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:700,color:group.color}}>Vendita #{si+1}</span>
              <div style={{display:"flex",gap:6}}>
                {si===gS(group.id).length-1&&<button onClick={()=>addSl(group.id)} style={{padding:"4px 12px",borderRadius:6,border:"1px solid "+group.color,background:"#fff",color:group.color,fontSize:11,fontWeight:700,cursor:"pointer"}}>+</button>}
                {si>0&&<button onClick={()=>rmSl(group.id,si)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #dc3545",background:"#fff",color:"#dc3545",fontSize:10,fontWeight:700,cursor:"pointer"}}>✕</button>}
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:group.subs.some(s=>sale[s.id]&&sale[s.id].active)?10:0}}>
              {group.subs.map(sub=><button key={sub.id} onClick={()=>togSub(group.id,si,sub.id,group.radio?group.subs.map(s=>s.id):null)} style={{padding:"8px 14px",borderRadius:8,border:(sale[sub.id]&&sale[sub.id].active)?"2px solid "+group.color:"2px solid #e0e0e0",background:(sale[sub.id]&&sale[sub.id].active)?group.color:"#fff",color:(sale[sub.id]&&sale[sub.id].active)?"#fff":"#555",cursor:"pointer",fontSize:12,fontWeight:600}}>{sub.title}</button>)}
            </div>
            {group.subs.filter(sub=>sale[sub.id]&&sale[sub.id].active).map(sub=>
              <SubCard key={sub.id} sub={sub} rawSd={sale[sub.id]||{}} group={group} si={si} sessionCode={sesCode} sale={sale} uF={uF} uC={uC} uP={uP} catSales={gS(group.id)} anaCel={ana.cellulare||""} onOpenVFModal={openVFModal}/>
            )}
          </div>)}
        </div>)}
      </div>}

      {showAna&&showStep4&&brand==="sky"&&<div style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,borderLeft:"4px solid #0072C6"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#0072C6",marginBottom:14,textTransform:"uppercase"}}>📺 Step 4 — Sky</div>
        {skyS.map((sale,si)=>{
          const SKY_COLOR="#0072C6";
          const btnSky=(label,active,onClick)=><button onClick={onClick} style={{padding:"10px 18px",borderRadius:8,cursor:"pointer",border:active?"2px solid "+SKY_COLOR:"2px solid #e0e0e0",background:active?SKY_COLOR:"#fff",color:active?"#fff":"#555",fontSize:13,fontWeight:600}}>{label}</button>;
          const ynSky=(val,onYes,onNo)=><div style={{display:"flex",gap:6}}>{[{v:"Sì",fn:onYes},{v:"No",fn:onNo}].map(({v,fn})=><button key={v} onClick={fn} style={{padding:"7px 22px",borderRadius:8,border:val===v?"2px solid "+SKY_COLOR:"2px solid #e0e0e0",background:val===v?SKY_COLOR:"#fff",color:val===v?"#fff":"#555",fontSize:12,fontWeight:700,cursor:"pointer"}}>{v}</button>)}</div>;
          const dBox=(children)=><div style={{marginTop:10,background:"#EEF6FF",borderRadius:8,padding:12,border:"1px solid #BDD7EE"}}><div style={{fontSize:11,fontWeight:700,color:SKY_COLOR,marginBottom:8,textTransform:"uppercase"}}>📄 Dati contratto</div>{children}</div>;
          return (<div key={si} style={{padding:12,borderRadius:8,marginBottom:8,background:"#fafbfc",borderLeft:"3px solid #0072C6"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <span style={{fontSize:11,fontWeight:700,color:"#0072C6"}}>Vendita #{si+1}</span>
              <div style={{display:"flex",gap:6}}>
                {si===skyS.length-1&&<button onClick={()=>setSkyS(p=>[...p,{tvSel:null,tvCC:"",fibraSel:null,fibraCC:"",fibraGnp:null,fibraGnpBrand:"",fibraGnpNum:"",mobileSel:false,mobMnp:null,mobNumProv:"",mobNumDef:"",mobBrandMnp:"",mobIccid:"",mobNum:"",mobIccidNo:""}])} style={{padding:"4px 12px",borderRadius:6,border:"1px solid #0072C6",background:"#fff",color:"#0072C6",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Vendita</button>}
                {si>0&&<button onClick={()=>setSkyS(p=>{const n=[...p];n.splice(si,1);return n})} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #dc3545",background:"#fff",color:"#dc3545",fontSize:10,fontWeight:700,cursor:"pointer"}}>✕</button>}
              </div>
            </div>

            {/* ── MACRO 1: TV ─────────────────────────────────── */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>📺 TV</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {SKY_TV.map(pr=>btnSky(pr,sale.tvSel===pr,()=>togSky(si,pr)))}
              </div>
              {sale.tvSel&&dBox(
                <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>Codice contratto <span style={{color:"#dc3545"}}>*</span></div>
                <input value={sale.tvCC||""} onChange={e=>uSkyF(si,"tvCC",e.target.value)} placeholder="es. 1679428185586" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div>
              )}
            </div>

            {/* ── MACRO 2: FIBRA ──────────────────────────────── */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>🌐 Fibra</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {SKY_FIBRA.map(pr=>btnSky(pr,sale.fibraSel===pr,()=>togSky(si,pr)))}
              </div>
              {sale.fibraSel&&dBox(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 12px"}}>
                <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>Codice contratto <span style={{color:"#dc3545"}}>*</span></div>
                <input value={sale.fibraCC||""} onChange={e=>uSkyF(si,"fibraCC",e.target.value)} placeholder="es. 1679428185586" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div>
                <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>GNP?</div>
                {ynSky(sale.fibraGnp,()=>uSkyF(si,"fibraGnp","Sì"),()=>{uSkyF(si,"fibraGnp","No");uSkyF(si,"fibraGnpBrand","");uSkyF(si,"fibraGnpNum","");})}</div>
                {sale.fibraGnp==="Sì"&&<>
                  <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>Brand GNP</div>
                  <select value={sale.fibraGnpBrand||""} onChange={e=>uSkyF(si,"fibraGnpBrand",e.target.value)} style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12}}>
                    <option value="">— Seleziona —</option>
                    {SKY_BRAND_FIBRA.map(b=><option key={b} value={b}>{b}</option>)}
                  </select></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>Numero fisso in portabilità</div>
                  <input value={sale.fibraGnpNum||""} onChange={e=>uSkyF(si,"fibraGnpNum",e.target.value)} placeholder="es. 060000000" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div>
                </>}
              </div>)}
            </div>

            {/* ── MACRO 3: MOBILE ─────────────────────────────── */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>📱 Mobile</div>
              <div style={{display:"flex",gap:6}}>
                {btnSky("Sky Mobile",sale.mobileSel,()=>togSky(si,"Sky Mobile"))}
              </div>
              {sale.mobileSel&&dBox(<div>
                <div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:4}}>MNP?</div>
                {ynSky(sale.mobMnp,()=>uSkyF(si,"mobMnp","Sì"),()=>{uSkyF(si,"mobMnp","No");uSkyF(si,"mobNumProv","");uSkyF(si,"mobNumDef","");uSkyF(si,"mobBrandMnp","");uSkyF(si,"mobIccid","");})}
                {sale.mobMnp==="Sì"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 12px",marginTop:8}}>
                  <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>Numero provvisorio</div><input value={sale.mobNumProv||""} onChange={e=>uSkyF(si,"mobNumProv",e.target.value)} placeholder="es. 393XXXXXXX" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>Numero definitivo</div><input value={sale.mobNumDef||""} onChange={e=>uSkyF(si,"mobNumDef",e.target.value)} placeholder="Numero da portare" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>Brand MNP</div>
                  <select value={sale.mobBrandMnp||""} onChange={e=>uSkyF(si,"mobBrandMnp",e.target.value)} style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12}}>
                    <option value="">— Seleziona —</option>
                    {["TIM","Vodafone","Fastweb","WINDTRE","Iliad","PosteMobile","CoopVoce","ho.","Very Mobile","Rabona","Lyca","Kena","MVNO altro"].map(b=><option key={b} value={b}>{b}</option>)}
                  </select></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>ICCID</div><input value={sale.mobIccid||""} onChange={e=>uSkyF(si,"mobIccid",e.target.value)} placeholder="893XXXXXXXXXXXXXXXX" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div>
                </div>}
                {sale.mobMnp==="No"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 12px",marginTop:8}}>
                  <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>Numero</div><input value={sale.mobNum||""} onChange={e=>uSkyF(si,"mobNum",e.target.value)} placeholder="es. 393XXXXXXX" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:3}}>ICCID</div><input value={sale.mobIccidNo||""} onChange={e=>uSkyF(si,"mobIccidNo",e.target.value)} placeholder="893XXXXXXXXXXXXXXXX" style={{width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:12,boxSizing:"border-box"}}/></div>
                </div>}
              </div>)}
            </div>

          </div>);
        })}
      </div>}


      
      {/* ── PRODOTTI & MARGINALITÀ ── */}
      {showAna&&showStep4&&<div style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,borderLeft:"4px solid #6f42c1"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:"#6f42c1",textTransform:"uppercase"}}>📦 Prodotti & Marginalità</div>
          <button onClick={()=>setShowMargPOS(true)} style={{padding:"6px 16px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#6f42c1,#9b59b6)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Aggiungi</button>
        </div>
        {margItems.length>0?(<div>
          {margItems.map((it,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f0f0f0"}}>
            <span style={{fontSize:12,color:"#333"}}>{it.product}{it.qty>1?` ×${it.qty}`:""}{it.model?` (${it.model})`:""}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:11,fontWeight:700,color:it.totalMargin>=0?"#28a745":"#dc3545"}}>€{it.totalMargin.toFixed(2)}</span>
              <button onClick={()=>rmMargItem(i)} style={{background:"none",border:"none",color:"#dc3545",cursor:"pointer",fontSize:10}}>✕</button>
            </div>
          </div>))}
          <div style={{marginTop:8,display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid #e0e0e0"}}>
            <span style={{fontSize:12,fontWeight:700,color:"#555"}}>Totale margine</span>
            <span style={{fontSize:15,fontWeight:900,color:margItems.reduce((s,i)=>s+i.totalMargin,0)>=0?"#28a745":"#dc3545"}}>€{margItems.reduce((s,i)=>s+i.totalMargin,0).toFixed(2)}</span>
          </div>
        </div>):(<div style={{textAlign:"center",padding:14,color:"#999",fontSize:12}}>Nessun prodotto. Usa "+ Aggiungi" o 📦 nella topbar.</div>)}
      </div>}
      <MargPOS show={showMargPOS} onClose={()=>setShowMargPOS(false)} venditore={selVend} negozio={selNeg} onAdd={addMargItem}/>
      <MargList items={margItems} onRemove={rmMargItem} show={showMargList} onClose={()=>setShowMargList(false)}/>

{showAna&&showStep4&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:20,marginTop:8,gap:10}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setShowStep4(false)} style={{padding:"11px 20px",borderRadius:10,border:"1px solid #ccc",background:"#fff",color:"#555",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>← Indietro</button>
          {confirmReset
            ? <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:12,fontWeight:600,color:"#dc3545"}}>Sei sicuro?</span>
                <button onClick={fullReset} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#dc3545",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Sì, resetta</button>
                <button onClick={()=>setConfirmReset(false)} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #ccc",background:"#fff",color:"#666",fontSize:12,fontWeight:600,cursor:"pointer"}}>Annulla</button>
              </div>
            : <button onClick={()=>setConfirmReset(true)} style={{padding:"11px 22px",borderRadius:10,border:"2px solid #dc3545",background:"#fff",color:"#dc3545",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>🗑️ Reset form</button>
          }
        </div>
        <button onClick={()=>setShowCart(true)} style={{padding:"11px 26px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1a1a2e,#0f3460)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>🛒 Riepilogo carrello{tCI>0&&<span style={{background:"#FFD800",color:"#333",borderRadius:10,padding:"1px 8px",fontSize:12,fontWeight:800}}>{tCI}</span>}</button>
      </div>}

      {/* ── VF QTY MODAL OVERLAY ─────────────────────────────────────────── */}
      {vfQtyModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setVfQtyModal(null)}}>
          <style>{`@keyframes vfModalIn{from{opacity:0;transform:translateY(48px) scale(0.93)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
          <div style={{background:"#fff",borderRadius:20,padding:32,width:360,boxShadow:"0 24px 80px rgba(0,0,0,0.35)",animation:"vfModalIn .28s cubic-bezier(.22,1,.36,1) both",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:8}}>📱</div>
            <div style={{fontSize:18,fontWeight:800,color:"#1a1a1a",marginBottom:4}}>Quante SIM hai venduto?</div>
            <div style={{fontSize:13,fontWeight:600,color:"#E60000",background:"#FFF0F0",borderRadius:8,padding:"6px 16px",display:"inline-block",marginBottom:24}}>{vfQtyModal.offer}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginBottom:28}}>
              <button onClick={()=>setVfQtyModal(p=>({...p,tempQty:Math.max(1,p.tempQty-1)}))} style={{width:52,height:52,borderRadius:"50%",border:"2px solid #e0e0e0",background:"#f5f5f5",fontSize:26,fontWeight:700,cursor:"pointer",color:"#555",lineHeight:"1",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:52,fontWeight:900,color:"#E60000",lineHeight:1}}>{vfQtyModal.tempQty}</div>
                <div style={{fontSize:11,color:"#888",marginTop:2}}>SIM</div>
              </div>
              <button onClick={()=>setVfQtyModal(p=>({...p,tempQty:Math.min(9,p.tempQty+1)}))} style={{width:52,height:52,borderRadius:"50%",border:"2px solid #E60000",background:"#E60000",fontSize:26,fontWeight:700,cursor:"pointer",color:"#fff",lineHeight:"1",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setVfQtyModal(null)} style={{padding:"11px 28px",borderRadius:10,border:"1px solid #ddd",background:"#f5f5f5",color:"#666",fontSize:13,fontWeight:600,cursor:"pointer"}}>Annulla</button>
              {vfQtyModal&&vfQtyModal.tempQty>0&&((()=>{const cur=((sales[vfQtyModal.catId]||[{}])[vfQtyModal.si]||{})[vfQtyModal.subId];return cur&&cur.vfOffers&&cur.vfOffers[vfQtyModal.offer]>0;})())&&<button onClick={()=>{if(!vfQtyModal)return;const{catId,si,subId,offer}=vfQtyModal;const cur=((sales[catId]||[{}])[si]||{})[subId];const newVfO={...((cur&&cur.vfOffers)||{})};delete newVfO[offer];const newVfC={...((cur&&cur.vfContratti)||{})};delete newVfC[offer];uP(catId,si,subId,"vfOffers",newVfO);uP(catId,si,subId,"vfContratti",newVfC);setVfQtyModal(null);}} style={{padding:"11px 20px",borderRadius:10,border:"1px solid #dc3545",background:"#fff",color:"#dc3545",fontSize:13,fontWeight:600,cursor:"pointer"}}>✕ Rimuovi</button>}
              <button onClick={confirmVFQty} style={{padding:"11px 36px",borderRadius:10,border:"none",background:"#E60000",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 16px rgba(230,0,0,0.35)"}}>Conferma</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
  return formContent;
}
import { useState, memo } from "react";

// ═══════════════════════════════════════════════════════════════
// MARGINALITÀ POS — Demo standalone (estratto dal CRM v9)
// Questo è il modulo Marginalità come lo vedrà il venditore.
// Nel CRM completo è integrato nella topbar + nel form contratto.
// ═══════════════════════════════════════════════════════════════

const PRODUCTS=[
  {cat:"📦 Prodotti",items:[
    {id:"plx",name:"PLX",fixedMargin:8,hasQty:true,icon:"📦",type:"fixed"},
    {id:"family_ontop",name:"Family+ On Top",fixedMargin:10,icon:"👨‍👩‍👧",type:"fixed"},
    {id:"cncp",name:"CN/CP",fixedMargin:2,hasQty:true,icon:"💳",type:"fixed"},
    {id:"new_cover",name:"New Cover",fixedMargin:8,hasQty:true,icon:"🔲",type:"fixed"},
    {id:"mem_pen",name:"Mem / Pen",fixedMargin:11,icon:"💾",type:"fixed"},
    {id:"salva_scontrino",name:"Salva Scontrino",fixedMargin:3,icon:"🧾",type:"fixed"},
    {id:"orologio",name:"Orologio Cash",fixedMargin:25,icon:"⌚",type:"fixed"},
    {id:"miband",name:"Mi Band 6",fixedMargin:15,icon:"⌚",type:"fixed"},
    {id:"powerbank",name:"PowerBank",fixedMargin:8,icon:"🔋",type:"fixed"},
  ]},
  {cat:"🔧 Servizi",items:[
    {id:"assistenza",name:"Assistenza Tecnico",pctMargin:81.97,icon:"🔧",type:"pct"},
    {id:"backup",name:"Backup",pctMargin:81.97,icon:"💿",type:"pct"},
    {id:"riparazione",name:"Riparazione",pctMargin:24.59,needsModel:true,icon:"🔨",type:"pct"},
    {id:"vendita_usato",name:"Vendita Usato",pctMargin:13.00,needsModel:true,needsImei:true,icon:"♻️",type:"pct"},
    {id:"chiusura",name:"Chiusura Sim/Fisso",pctMargin:81.97,icon:"✂️",type:"pct"},
    {id:"etelefono",name:"E.Telefono",pctMargin:81.97,icon:"📞",type:"pct"},
    {id:"accessori",name:"Accessori",pctMargin:24.59,hasQty:true,icon:"🎧",type:"pct"},
    {id:"extra_acc",name:"Extra Acc. Compass",pctMargin:65.00,icon:"🧭",type:"pct"},
    {id:"tel_senior",name:"Telefoni Senior",pctMargin:12.30,needsModel:true,icon:"📱",type:"pct"},
    {id:"earbuds",name:"Ear Buds",pctMargin:40.98,icon:"🎵",type:"pct"},
  ]},
  {cat:"🛡️ Kasko",items:[
    {id:"extra_kasko",name:"Extra Margine Kasko",pctMargin:40.00,icon:"🛡️",type:"pct"},
    {id:"plkasko",name:"PLKasko",pctMargin:60.00,icon:"🏷️",type:"pct"},
    {id:"kasko_sv",name:"Kasko SV",pctMargin:60.00,icon:"🔖",type:"pct"},
  ]},
  {cat:"📶 SIM",items:[
    {id:"sim1",name:"Sim 1€",price:1,fixedMargin:-4,linked:true,icon:"📶",type:"fixed"},
    {id:"sim5",name:"Sim 5€",price:5,fixedMargin:-7,linked:true,icon:"📶",type:"fixed"},
    {id:"sim_w3",name:"Sim Wind3",fixedMargin:-5,linked:true,icon:"📶",type:"fixed"},
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

const calcMargin=(p,price,qty)=>{
  if(p.type==="fixed")return(p.fixedMargin||0)*(qty||1);
  if(p.type==="pct")return(parseFloat(price)||0)*(p.pctMargin||0)/100*(qty||1);
  return 0;
};

export default function MarginalitaDemo(){
  const [items,setItems]=useState([]);
  const [catIdx,setCatIdx]=useState(0);
  const [sel,setSel]=useState(null);
  const [price,setPrice]=useState("");
  const [qty,setQty]=useState("1");
  const [model,setModel]=useState("");
  const [imei,setImei]=useState("");
  const [view,setView]=useState("pos");

  const addItem=()=>{
    if(!sel)return;
    const p=sel;
    const pVal=p.price!=null?p.price:parseFloat(price)||0;
    const margin=calcMargin(p,pVal,parseInt(qty)||1);
    setItems(prev=>[...prev,{
      product:p.name,id:p.id,icon:p.icon,type:p.type,
      price:pVal,qty:parseInt(qty)||1,
      margin:margin/(parseInt(qty)||1),totalMargin:margin,
      pctMargin:p.pctMargin||null,
      model:model||null,imei:imei||null,linked:p.linked||false,
    }]);
    setSel(null);setPrice("");setQty("1");setModel("");setImei("");
  };

  const total=items.reduce((s,i)=>s+i.totalMargin,0);
  const today=new Date().toLocaleDateString("it-IT");

  return(
    <div style={{maxWidth:560,margin:"0 auto",padding:12,fontFamily:"system-ui,sans-serif"}}>
      {/* TOPBAR */}
      <div style={{background:"linear-gradient(135deg,#1a1a2e,#0f3460)",borderRadius:14,padding:"14px 18px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>📦</span>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>Marginalità — POS Rapido</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.6)"}}>Alberto • Magliana • {today}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setView("pos")} style={{padding:"6px 14px",borderRadius:8,border:view==="pos"?"2px solid #FFD800":"1px solid rgba(255,255,255,.3)",background:view==="pos"?"rgba(255,215,0,.15)":"rgba(255,255,255,.1)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>📦 POS</button>
          <button onClick={()=>setView("list")} style={{padding:"6px 14px",borderRadius:8,border:view==="list"?"2px solid #FFD800":"1px solid rgba(255,255,255,.3)",background:view==="list"?"rgba(255,215,0,.15)":"rgba(255,255,255,.1)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>📋 Lista ({items.length})</button>
        </div>
      </div>

      {/* SUMMARY BAR */}
      {items.length>0&&<div style={{background:"#fff",borderRadius:10,padding:"10px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
        <div style={{fontSize:12,color:"#555"}}><b>{items.length}</b> prodotti registrati oggi</div>
        <div style={{fontSize:18,fontWeight:900,color:total>=0?"#28a745":"#dc3545"}}>€{total.toFixed(2)}</div>
      </div>}

      {/* POS VIEW */}
      {view==="pos"&&!sel&&(
        <div>
          <div style={{display:"flex",gap:4,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
            {PRODUCTS.map((cat,ci)=>(
              <button key={ci} onClick={()=>setCatIdx(ci)} style={{padding:"7px 14px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",border:catIdx===ci?"2px solid #6f42c1":"2px solid #e0e0e0",background:catIdx===ci?"#f0ebff":"#fff",color:catIdx===ci?"#6f42c1":"#555"}}>{cat.cat}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(95px,1fr))",gap:6}}>
            {PRODUCTS[catIdx].items.map(p=>(
              <button key={p.id} onClick={()=>{setSel(p);if(p.price!=null)setPrice(String(p.price))}}
                style={{padding:"12px 6px",borderRadius:10,border:"1px solid #eee",background:"#fafbfc",cursor:"pointer",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all .1s"}}>
                <span style={{fontSize:20}}>{p.icon}</span>
                <span style={{fontSize:10,fontWeight:600,color:"#333",lineHeight:1.2}}>{p.name}</span>
                {p.type==="fixed"&&<span style={{fontSize:9,fontWeight:700,color:p.fixedMargin>=0?"#28a745":"#dc3545"}}>€{p.fixedMargin}</span>}
                {p.type==="pct"&&<span style={{fontSize:9,fontWeight:700,color:"#2E75B6"}}>{p.pctMargin}%</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL */}
      {view==="pos"&&sel&&(
        <div style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#6f42c1",fontSize:13,cursor:"pointer",fontWeight:600}}>← Indietro</button>
            <span style={{fontSize:24}}>{sel.icon}</span>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:"#333"}}>{sel.name}</div>
              <div style={{fontSize:11,color:"#888"}}>{sel.type==="fixed"?`Margine fisso: €${sel.fixedMargin}`:`Margine: ${sel.pctMargin}% del prezzo`}</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:sel.hasQty?"1fr 1fr":"1fr",gap:10,marginBottom:12}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Prezzo vendita €</div>
              <input value={price} onChange={e=>setPrice(e.target.value)} type="number" step="0.01"
                placeholder={sel.type==="fixed"?"Opzionale":"Inserisci prezzo"}
                style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #d0d0d0",fontSize:15,fontWeight:700,boxSizing:"border-box"}}/>
            </div>
            {sel.hasQty&&<div>
              <div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Quantità</div>
              <input value={qty} onChange={e=>setQty(e.target.value)} type="number" min="1"
                style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #d0d0d0",fontSize:15,fontWeight:700,boxSizing:"border-box"}}/>
            </div>}
          </div>

          {sel.needsModel&&<div style={{marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>Modello</div>
            <input value={model} onChange={e=>setModel(e.target.value)} placeholder="es. iPhone 15..."
              style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #d0d0d0",fontSize:13,boxSizing:"border-box"}}/>
          </div>}

          {sel.needsImei&&<div style={{marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:600,color:"#555",marginBottom:3}}>IMEI</div>
            <input value={imei} onChange={e=>setImei(e.target.value)} placeholder="15 cifre"
              style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #d0d0d0",fontSize:13,boxSizing:"border-box",fontFamily:"monospace",letterSpacing:1}}/>
          </div>}

          {/* MARGIN PREVIEW */}
          <div style={{padding:12,background:"#f0f7ff",borderRadius:10,border:"1px solid #b8d4f0",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"#555",fontWeight:600}}>Margine</span>
              <div style={{textAlign:"right"}}>
                {sel.type==="pct"&&parseFloat(price)>0&&(
                  <div style={{fontSize:11,color:"#888"}}>{sel.pctMargin}% di €{parseFloat(price).toFixed(2)}</div>
                )}
                <div style={{fontSize:18,fontWeight:900,color:calcMargin(sel,price,qty)>=0?"#28a745":"#dc3545"}}>
                  €{calcMargin(sel,price,qty).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <button onClick={addItem}
            style={{width:"100%",padding:14,borderRadius:12,border:"none",background:"linear-gradient(135deg,#6f42c1,#9b59b6)",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",transition:"all .15s"}}>
            ✅ Registra {sel.name}
          </button>
        </div>
      )}

      {/* LIST VIEW */}
      {view==="list"&&(
        <div style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,.08)"}}>
          {items.length===0?(
            <div style={{textAlign:"center",padding:30,color:"#999"}}>
              <div style={{fontSize:40,marginBottom:8}}>📦</div>
              <div style={{fontSize:14,fontWeight:600}}>Nessun prodotto registrato</div>
              <div style={{fontSize:12,marginTop:4}}>Vai al POS per iniziare</div>
            </div>
          ):(
            <div>
              {items.map((it,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<items.length-1?"1px solid #f0f0f0":"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>{it.icon}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"#333"}}>{it.product}{it.qty>1?` ×${it.qty}`:""}</div>
                      <div style={{fontSize:10,color:"#888"}}>
                        {it.type==="pct"&&it.price>0&&`€${it.price.toFixed(2)} × ${it.pctMargin}%`}
                        {it.type==="fixed"&&it.price>0&&`€${it.price.toFixed(2)}`}
                        {it.model&&` • ${it.model}`}
                        {it.linked&&" 🔗"}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:it.totalMargin>=0?"#28a745":"#dc3545"}}>€{it.totalMargin.toFixed(2)}</span>
                    <button onClick={()=>setItems(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#dc3545",cursor:"pointer",fontSize:12,padding:4}}>✕</button>
                  </div>
                </div>
              ))}
              <div style={{marginTop:12,padding:12,background:"linear-gradient(135deg,#f0f7ff,#f0ebff)",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,color:"#888"}}>Totale giornaliero</div>
                  <div style={{fontSize:11,color:"#888"}}>{items.length} prodotti</div>
                </div>
                <div style={{fontSize:24,fontWeight:900,color:total>=0?"#28a745":"#dc3545"}}>€{total.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

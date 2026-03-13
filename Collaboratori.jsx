// Collaboratori Group — Telefutura CRM
// Sections: Badge (timekeeping), Ferie (leave requests), Malattie (sick leave)

const { useState, useEffect, useRef } = React;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const NEGOZI = ["Tutti","Roma Centro","Roma Est","Roma Nord","Roma Sud","Roma Ovest","Tiburtina","Laurentina","Prenestina","Ostiense","Prati","EUR","Trastevere"];

const COLLABORATORI = [
  { id:1, nome:"Marco Rossi", ruolo:"Store Manager", negozio:"Roma Centro" },
  { id:2, nome:"Giulia Bianchi", ruolo:"Store Specialist", negozio:"Roma Centro" },
  { id:3, nome:"Luca Ferrari", ruolo:"Store Specialist", negozio:"Roma Est" },
  { id:4, nome:"Sara Conti", ruolo:"Store Manager", negozio:"Roma Nord" },
  { id:5, nome:"Andrea Ricci", ruolo:"Agente", negozio:"Roma Sud" },
  { id:6, nome:"Valentina Gallo", ruolo:"Store Specialist", negozio:"Tiburtina" },
  { id:7, nome:"Davide Marino", ruolo:"Coordinatore", negozio:"Roma Ovest" },
  { id:8, nome:"Chiara Bruno", ruolo:"Store Specialist", negozio:"Laurentina" },
  { id:9, nome:"Fabio Greco", ruolo:"Store Specialist", negozio:"Prenestina" },
  { id:10, nome:"Elena Lombardi", ruolo:"Store Manager", negozio:"Ostiense" },
];

const TODAY = new Date();
const fmt = (d) => d.toISOString().slice(0,10);
const fmtIt = (s) => { const d = new Date(s); return d.toLocaleDateString("it-IT"); };
const fmtTime = (s) => s ? s.slice(0,5) : "--:--";
const diffH = (a,b) => { if (!a||!b) return null; const da=new Date("2000-01-01T"+a), db=new Date("2000-01-01T"+b); return ((db-da)/3600000).toFixed(2); };

// ─── BADGE SECTION ────────────────────────────────────────────────────────────
function SezioneBadge({ ruolo }) {
  const isAdmin = ruolo === "admin";

  // Collaborator view state
  const [stato, setStato] = useState("fuori"); // fuori | attivo | pausa
  const [oraInizio, setOraInizio] = useState(null);
  const [oraPausa, setOraPausa] = useState(null);
  const [oraFine, setOraFine] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => { if (stato==="attivo") setElapsed(e=>e+1); }, 1000);
    return () => clearInterval(iv);
  }, [stato]);

  const fmtElapsed = (s) => {
    const h = Math.floor(s/3600).toString().padStart(2,"0");
    const m = Math.floor((s%3600)/60).toString().padStart(2,"0");
    const ss = (s%60).toString().padStart(2,"0");
    return h+":"+m+":"+ss;
  };

  const handleBadge = (azione) => {
    const now = new Date().toTimeString().slice(0,8);
    if (azione==="start") { setStato("attivo"); setOraInizio(now); setElapsed(0); }
    else if (azione==="pausa") { setStato("pausa"); setOraPausa(now); }
    else if (azione==="riprendi") { setStato("attivo"); setOraPausa(null); }
    else if (azione==="fine") { setStato("fuori"); setOraFine(now); setOraInizio(null); setOraPausa(null); setElapsed(0); }
  };

  // Admin view state
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroNegozio, setFiltroNegozio] = useState("Tutti");
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [dataStoricoDa, setDataStoricoDa] = useState(fmt(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)));
  const [dataStoricoA, setDataStoricoA] = useState(fmt(TODAY));

  // Mock active badges
  const activeBadges = [
    { id:1, nome:"Marco Rossi", negozio:"Roma Centro", stato:"attivo", inizio:"08:30:00", pausa:null },
    { id:2, nome:"Giulia Bianchi", negozio:"Roma Centro", stato:"pausa", inizio:"08:15:00", pausa:"10:30:00" },
    { id:3, nome:"Luca Ferrari", negozio:"Roma Est", stato:"attivo", inizio:"09:00:00", pausa:null },
    { id:6, nome:"Valentina Gallo", negozio:"Tiburtina", stato:"attivo", inizio:"08:45:00", pausa:null },
    { id:8, nome:"Chiara Bruno", negozio:"Laurentina", stato:"attivo", inizio:"09:15:00", pausa:null },
  ];

  // Mock storico
  const storicoMock = [
    { data:"2026-03-10", inizio:"08:30", fine:"18:00", pausa:"60min", ore:"8.5" },
    { data:"2026-03-11", inizio:"08:15", fine:"17:45", pausa:"45min", ore:"8.75" },
    { data:"2026-03-12", inizio:"09:00", fine:"18:30", pausa:"60min", ore:"8.5" },
    { data:"2026-03-13", inizio:"08:30", fine:"17:00", pausa:"30min", ore:"8.0" },
  ];

  const filteredActive = activeBadges.filter(b =>
    (filtroNegozio==="Tutti" || b.negozio===filtroNegozio) &&
    (filtroNome==="" || b.nome.toLowerCase().includes(filtroNome.toLowerCase()))
  );

  const totOre = storicoMock.reduce((s,r) => s + parseFloat(r.ore), 0).toFixed(1);

  if (!isAdmin) {
    return (
      <div style={{maxWidth:480,margin:"0 auto",padding:"32px 16px"}}>
        <div style={{background:"#1e2736",borderRadius:16,padding:32,textAlign:"center",border:"1px solid #2d3748"}}>
          <div style={{fontSize:14,color:"#8892a4",marginBottom:8,textTransform:"uppercase",letterSpacing:2}}>Turno di oggi</div>
          <div style={{fontSize:48,fontWeight:700,fontFamily:"monospace",color: stato==="attivo"?"#48bb78":stato==="pausa"?"#ecc94b":"#8892a4",marginBottom:24}}>
            {stato==="attivo" ? fmtElapsed(elapsed) : stato==="pausa" ? "IN PAUSA" : "--:--:--"}
          </div>

          {stato==="fuori" && (
            <button onClick={()=>handleBadge("start")} style={{background:"#48bb78",color:"#fff",border:"none",borderRadius:10,padding:"14px 40px",fontSize:16,fontWeight:600,cursor:"pointer"}}>
              Inizia Turno
            </button>
          )}
          {stato==="attivo" && (
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button onClick={()=>handleBadge("pausa")} style={{background:"#ecc94b",color:"#1a202c",border:"none",borderRadius:10,padding:"14px 32px",fontSize:15,fontWeight:600,cursor:"pointer"}}>
                Pausa
              </button>
              <button onClick={()=>handleBadge("fine")} style={{background:"#fc8181",color:"#fff",border:"none",borderRadius:10,padding:"14px 32px",fontSize:15,fontWeight:600,cursor:"pointer"}}>
                Fine Turno
              </button>
            </div>
          )}
          {stato==="pausa" && (
            <button onClick={()=>handleBadge("riprendi")} style={{background:"#63b3ed",color:"#fff",border:"none",borderRadius:10,padding:"14px 40px",fontSize:16,fontWeight:600,cursor:"pointer"}}>
              Riprendi Turno
            </button>
          )}

          {(oraInizio || oraFine) && (
            <div style={{marginTop:24,display:"flex",gap:24,justifyContent:"center",fontSize:13,color:"#8892a4"}}>
              {oraInizio && <span>Inizio: <b style={{color:"#e2e8f0"}}>{oraInizio.slice(0,5)}</b></span>}
              {oraPausa && <span>Pausa: <b style={{color:"#ecc94b"}}>{oraPausa.slice(0,5)}</b></span>}
              {oraFine && <span>Fine: <b style={{color:"#fc8181"}}>{oraFine.slice(0,5)}</b></span>}
            </div>
          )}
        </div>

        <div style={{marginTop:24,background:"#1e2736",borderRadius:12,padding:20,border:"1px solid #2d3748"}}>
          <div style={{fontSize:13,color:"#8892a4",marginBottom:12,fontWeight:600}}>Storico questa settimana</div>
          {storicoMock.slice(-3).map((r,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #2d3748",fontSize:13}}>
              <span style={{color:"#e2e8f0"}}>{fmtIt(r.data)}</span>
              <span style={{color:"#8892a4"}}>{r.inizio} → {r.fine}</span>
              <span style={{color:"#48bb78",fontWeight:600}}>{r.ore}h</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div style={{padding:"0 0 32px"}}>
      {/* Live badges */}
      <div style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:16,color:"#e2e8f0",fontWeight:600}}>
            Presenti ora
            <span style={{marginLeft:8,background:"#48bb784d",color:"#48bb78",borderRadius:20,padding:"2px 10px",fontSize:12}}>{filteredActive.length}</span>
          </h3>
          <div style={{display:"flex",gap:8}}>
            <input placeholder="Cerca persona..." value={filtroNome} onChange={e=>setFiltroNome(e.target.value)}
              style={{background:"#1e2736",border:"1px solid #2d3748",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:13,width:160}} />
            <select value={filtroNegozio} onChange={e=>setFiltroNegozio(e.target.value)}
              style={{background:"#1e2736",border:"1px solid #2d3748",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:13}}>
              {NEGOZI.map(n=><option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
          {filteredActive.map(b => (
            <div key={b.id} onClick={()=>setSelectedCollab(selectedCollab===b.id?null:b.id)}
              style={{background: selectedCollab===b.id?"#2d3748":"#1e2736",border:"1px solid "+(selectedCollab===b.id?"#63b3ed":"#2d3748"),borderRadius:10,padding:16,cursor:"pointer",transition:"all .15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{b.nome}</span>
                <span style={{fontSize:11,borderRadius:20,padding:"2px 8px",background:b.stato==="attivo"?"#48bb784d":"#ecc94b4d",color:b.stato==="attivo"?"#48bb78":"#ecc94b"}}>
                  {b.stato==="attivo"?"Attivo":"In Pausa"}
                </span>
              </div>
              <div style={{fontSize:12,color:"#8892a4"}}>{b.negozio}</div>
              <div style={{fontSize:12,color:"#8892a4",marginTop:4}}>Entrato: {b.inizio.slice(0,5)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Storico */}
      {selectedCollab && (
        <div style={{background:"#1e2736",borderRadius:12,padding:20,border:"1px solid #2d3748"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h4 style={{margin:0,fontSize:15,color:"#e2e8f0"}}>
              Storico — {activeBadges.find(b=>b.id===selectedCollab).nome}
            </h4>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:"#8892a4"}}>Dal</span>
              <input type="date" value={dataStoricoDa} onChange={e=>setDataStoricoDa(e.target.value)}
                style={{background:"#2d3748",border:"1px solid #4a5568",borderRadius:6,padding:"4px 8px",color:"#e2e8f0",fontSize:12}} />
              <span style={{fontSize:12,color:"#8892a4"}}>Al</span>
              <input type="date" value={dataStoricoA} onChange={e=>setDataStoricoA(e.target.value)}
                style={{background:"#2d3748",border:"1px solid #4a5568",borderRadius:6,padding:"4px 8px",color:"#e2e8f0",fontSize:12}} />
            </div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:"1px solid #2d3748"}}>
                {["Data","Entrata","Pausa","Uscita","Ore lavorate"].map(h=>(
                  <th key={h} style={{padding:"6px 8px",textAlign:"left",color:"#8892a4",fontWeight:500}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storicoMock.map((r,i) => (
                <tr key={i} style={{borderBottom:"1px solid #2d374860"}}>
                  <td style={{padding:"8px",color:"#e2e8f0"}}>{fmtIt(r.data)}</td>
                  <td style={{padding:"8px",color:"#48bb78"}}>{r.inizio}</td>
                  <td style={{padding:"8px",color:"#8892a4"}}>{r.pausa}</td>
                  <td style={{padding:"8px",color:"#fc8181"}}>{r.fine}</td>
                  <td style={{padding:"8px",color:"#63b3ed",fontWeight:600}}>{r.ore}h</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:12,textAlign:"right",fontSize:14,color:"#e2e8f0"}}>
            Totale ore periodo: <strong style={{color:"#63b3ed"}}>{totOre}h</strong>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FERIE SECTION ────────────────────────────────────────────────────────────
function SezioneFerie({ ruolo }) {
  const isAdmin = ruolo === "admin";
  const [view, setView] = useState("dashboard"); // dashboard | richieste
  const [showModal, setShowModal] = useState(false);
  const [filtroNeg, setFiltroNeg] = useState("Tutti");
  const [filtroPersona, setFiltroPersona] = useState("");

  // Modal form state
  const [fDal, setFDal] = useState("");
  const [fAl, setFAl] = useState("");
  const [fMotivo, setFMotivo] = useState("");

  const [richieste, setRichieste] = useState([
    { id:1, nome:"Marco Rossi", negozio:"Roma Centro", dal:"2026-03-20", al:"2026-03-25", motivo:"Vacanza familiare", stato:"accettata", nota:"" },
    { id:2, nome:"Giulia Bianchi", negozio:"Roma Centro", dal:"2026-03-18", al:"2026-03-19", motivo:"Impegni personali", stato:"in_attesa", nota:"" },
    { id:3, nome:"Luca Ferrari", negozio:"Roma Est", dal:"2026-04-01", al:"2026-04-05", motivo:"Ferie estive anticipate", stato:"in_attesa", nota:"" },
    { id:4, nome:"Sara Conti", negozio:"Roma Nord", dal:"2026-03-14", al:"2026-03-14", motivo:"Visita medica", stato:"accettata", nota:"" },
    { id:5, nome:"Andrea Ricci", negozio:"Roma Sud", dal:"2026-03-13", al:"2026-03-16", motivo:"Motivi familiari", stato:"ko", nota:"Personale insufficiente in quel periodo" },
    { id:6, nome:"Valentina Gallo", negozio:"Tiburtina", dal:"2026-03-28", al:"2026-04-02", motivo:"Pasqua", stato:"in_attesa", nota:"" },
  ]);

  const [notaModal, setNotaModal] = useState({ open:false, id:null, azione:null, testo:"" });

  const todayStr = fmt(TODAY);
  const inFerie = richieste.filter(r => r.stato==="accettata" && r.dal<=todayStr && r.al>=todayStr);
  const prossime = richieste.filter(r => r.stato==="accettata" && r.dal>todayStr).sort((a,b)=>a.dal.localeCompare(b.dal));

  const handleStato = (id, azione) => {
    if (azione==="ko" || azione==="sospesa") {
      setNotaModal({ open:true, id, azione, testo:"" });
    } else {
      setRichieste(prev => prev.map(r => r.id===id ? {...r, stato:"accettata"} : r));
    }
  };

  const confirmNota = () => {
    setRichieste(prev => prev.map(r => r.id===notaModal.id ? {...r, stato:notaModal.azione==="ko"?"ko":"sospesa", nota:notaModal.testo} : r));
    setNotaModal({ open:false, id:null, azione:null, testo:"" });
  };

  const submitRichiesta = () => {
    if (!fDal || !fAl || !fMotivo) return;
    const nuova = { id: Date.now(), nome:"Tu", negozio:"Roma Centro", dal:fDal, al:fAl, motivo:fMotivo, stato:"in_attesa", nota:"" };
    setRichieste(prev => [nuova, ...prev]);
    setShowModal(false); setFDal(""); setFAl(""); setFMotivo("");
  };

  const statoBadge = (s) => {
    const map = { accettata:["#48bb784d","#48bb78","Accettata"], in_attesa:["#ecc94b4d","#ecc94b","In Attesa"], ko:["#fc81814d","#fc8181","KO"], sospesa:["#a0aec04d","#a0aec0","Sospesa"] };
    const [bg,col,lbl] = map[s] || ["#a0aec04d","#a0aec0",s];
    return <span style={{fontSize:11,borderRadius:20,padding:"2px 10px",background:bg,color:col,fontWeight:600}}>{lbl}</span>;
  };

  const filteredR = richieste.filter(r =>
    (filtroNeg==="Tutti" || r.negozio===filtroNeg) &&
    (filtroPersona==="" || r.nome.toLowerCase().includes(filtroPersona.toLowerCase()))
  );

  if (!isAdmin) {
    const mieRichieste = richieste.filter(r => r.nome==="Tu");
    return (
      <div style={{padding:"0 0 32px"}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
          <button onClick={()=>setShowModal(true)}
            style={{background:"#63b3ed",color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:600,cursor:"pointer"}}>
            + Nuova Richiesta Ferie
          </button>
        </div>
        <div style={{background:"#1e2736",borderRadius:12,border:"1px solid #2d3748",overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #2d3748",fontSize:14,fontWeight:600,color:"#e2e8f0"}}>Le mie richieste</div>
          {mieRichieste.length===0 && <div style={{padding:32,textAlign:"center",color:"#8892a4",fontSize:14}}>Nessuna richiesta effettuata</div>}
          {mieRichieste.map(r => (
            <div key={r.id} style={{padding:"14px 20px",borderBottom:"1px solid #2d374840",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:14,color:"#e2e8f0",fontWeight:500}}>{fmtIt(r.dal)} — {fmtIt(r.al)}</div>
                <div style={{fontSize:12,color:"#8892a4",marginTop:2}}>{r.motivo}</div>
                {r.nota && <div style={{fontSize:12,color:"#fc8181",marginTop:2}}>Nota: {r.nota}</div>}
              </div>
              {statoBadge(r.stato)}
            </div>
          ))}
        </div>

        {showModal && (
          <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <div style={{background:"#1e2736",borderRadius:14,padding:28,width:400,border:"1px solid #2d3748"}}>
              <h3 style={{margin:"0 0 20px",color:"#e2e8f0"}}>Nuova Richiesta Ferie</h3>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,color:"#8892a4",display:"block",marginBottom:4}}>Dal</label>
                <input type="date" value={fDal} onChange={e=>setFDal(e.target.value)}
                  style={{width:"100%",background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:14,boxSizing:"border-box"}} />
              </div>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,color:"#8892a4",display:"block",marginBottom:4}}>Al</label>
                <input type="date" value={fAl} onChange={e=>setFAl(e.target.value)}
                  style={{width:"100%",background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:14,boxSizing:"border-box"}} />
              </div>
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,color:"#8892a4",display:"block",marginBottom:4}}>Motivo</label>
                <textarea value={fMotivo} onChange={e=>setFMotivo(e.target.value)} rows={3}
                  style={{width:"100%",background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:14,resize:"vertical",boxSizing:"border-box"}} />
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button onClick={()=>setShowModal(false)} style={{background:"transparent",border:"1px solid #4a5568",borderRadius:8,padding:"8px 20px",color:"#8892a4",cursor:"pointer"}}>Annulla</button>
                <button onClick={submitRichiesta} style={{background:"#63b3ed",border:"none",borderRadius:8,padding:"8px 20px",color:"#fff",fontWeight:600,cursor:"pointer"}}>Invia Richiesta</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin view
  return (
    <div style={{padding:"0 0 32px"}}>
      {/* Toggle view */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",background:"#1e2736",borderRadius:8,padding:3,border:"1px solid #2d3748",gap:2}}>
          {[["dashboard","Dashboard"],["richieste","Richieste"]].map(([v,l]) => (
            <button key={v} onClick={()=>setView(v)}
              style={{background:view===v?"#2d3748":"transparent",color:view===v?"#e2e8f0":"#8892a4",border:"none",borderRadius:6,padding:"7px 18px",fontSize:13,fontWeight:500,cursor:"pointer"}}>
              {l}
              {v==="richieste" && <span style={{marginLeft:6,background:"#ecc94b4d",color:"#ecc94b",borderRadius:20,padding:"1px 6px",fontSize:11}}>
                {richieste.filter(r=>r.stato==="in_attesa").length}
              </span>}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input placeholder="Cerca persona..." value={filtroPersona} onChange={e=>setFiltroPersona(e.target.value)}
            style={{background:"#1e2736",border:"1px solid #2d3748",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:13,width:160}} />
          <select value={filtroNeg} onChange={e=>setFiltroNeg(e.target.value)}
            style={{background:"#1e2736",border:"1px solid #2d3748",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:13}}>
            {NEGOZI.map(n=><option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {view==="dashboard" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
            {/* In ferie oggi */}
            <div style={{background:"#1e2736",borderRadius:12,border:"1px solid #2d3748",overflow:"hidden"}}>
              <div style={{padding:"14px 18px",borderBottom:"1px solid #2d3748",display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"#48bb78",fontSize:16}}>🌴</span>
                <span style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>In ferie oggi</span>
                <span style={{marginLeft:"auto",background:"#48bb784d",color:"#48bb78",borderRadius:20,padding:"2px 10px",fontSize:12}}>{inFerie.length}</span>
              </div>
              {inFerie.length===0 ? (
                <div style={{padding:20,textAlign:"center",color:"#8892a4",fontSize:13}}>Nessuno in ferie oggi</div>
              ) : inFerie.map(r => (
                <div key={r.id} style={{padding:"10px 18px",borderBottom:"1px solid #2d374840",fontSize:13}}>
                  <div style={{color:"#e2e8f0",fontWeight:500}}>{r.nome}</div>
                  <div style={{color:"#8892a4",marginTop:2}}>{r.negozio} · fino al {fmtIt(r.al)}</div>
                </div>
              ))}
            </div>
            {/* Prossime ferie */}
            <div style={{background:"#1e2736",borderRadius:12,border:"1px solid #2d3748",overflow:"hidden"}}>
              <div style={{padding:"14px 18px",borderBottom:"1px solid #2d3748",display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"#63b3ed",fontSize:16}}>📅</span>
                <span style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>Prossime ferie</span>
              </div>
              {prossime.slice(0,5).map(r => (
                <div key={r.id} style={{padding:"10px 18px",borderBottom:"1px solid #2d374840",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13}}>
                  <div>
                    <div style={{color:"#e2e8f0",fontWeight:500}}>{r.nome}</div>
                    <div style={{color:"#8892a4"}}>{r.negozio}</div>
                  </div>
                  <div style={{textAlign:"right",color:"#63b3ed",fontSize:12}}>
                    {fmtIt(r.dal)}<br/>{fmtIt(r.al)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ferie approvate (elenco filtrato) */}
          <div style={{background:"#1e2736",borderRadius:12,border:"1px solid #2d3748",overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid #2d3748",fontSize:14,fontWeight:600,color:"#e2e8f0"}}>Ferie approvate</div>
            {filteredR.filter(r=>r.stato==="accettata").map(r => (
              <div key={r.id} style={{padding:"12px 18px",borderBottom:"1px solid #2d374840",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13}}>
                <div>
                  <span style={{color:"#e2e8f0",fontWeight:500}}>{r.nome}</span>
                  <span style={{color:"#8892a4",marginLeft:8}}>{r.negozio}</span>
                </div>
                <div style={{color:"#8892a4"}}>{fmtIt(r.dal)} — {fmtIt(r.al)}</div>
                <span style={{color:"#8892a4",fontSize:12,maxWidth:200,textAlign:"right"}}>{r.motivo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view==="richieste" && (
        <div style={{background:"#1e2736",borderRadius:12,border:"1px solid #2d3748",overflow:"hidden"}}>
          {filteredR.map(r => (
            <div key={r.id} style={{padding:"14px 18px",borderBottom:"1px solid #2d374840"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{r.nome} <span style={{fontWeight:400,color:"#8892a4",fontSize:12}}>· {r.negozio}</span></div>
                  <div style={{fontSize:13,color:"#8892a4",marginTop:2}}>{fmtIt(r.dal)} — {fmtIt(r.al)} · <em>{r.motivo}</em></div>
                  {r.nota && <div style={{fontSize:12,color:"#fc8181",marginTop:4}}>Nota: {r.nota}</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {statoBadge(r.stato)}
                  {r.stato==="in_attesa" && (
                    <div style={{display:"flex",gap:6,marginLeft:8}}>
                      <button onClick={()=>handleStato(r.id,"accettata")} style={{background:"#48bb784d",border:"1px solid #48bb78",borderRadius:6,padding:"4px 10px",color:"#48bb78",fontSize:12,cursor:"pointer"}}>Accetta</button>
                      <button onClick={()=>handleStato(r.id,"sospesa")} style={{background:"#ecc94b4d",border:"1px solid #ecc94b",borderRadius:6,padding:"4px 10px",color:"#ecc94b",fontSize:12,cursor:"pointer"}}>Sospendi</button>
                      <button onClick={()=>handleStato(r.id,"ko")} style={{background:"#fc81814d",border:"1px solid #fc8181",borderRadius:6,padding:"4px 10px",color:"#fc8181",fontSize:12,cursor:"pointer"}}>KO</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {notaModal.open && (
        <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#1e2736",borderRadius:14,padding:28,width:380,border:"1px solid #2d3748"}}>
            <h3 style={{margin:"0 0 16px",color:"#e2e8f0",fontSize:16}}>
              {notaModal.azione==="ko"?"Rifiuta richiesta":"Metti in sospeso"}
            </h3>
            <textarea value={notaModal.testo} onChange={e=>setNotaModal(p=>({...p,testo:e.target.value}))}
              placeholder="Aggiungi una nota (obbligatoria)..." rows={4}
              style={{width:"100%",background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"10px 12px",color:"#e2e8f0",fontSize:13,resize:"vertical",boxSizing:"border-box",marginBottom:16}} />
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setNotaModal({open:false,id:null,azione:null,testo:""})} style={{background:"transparent",border:"1px solid #4a5568",borderRadius:8,padding:"8px 18px",color:"#8892a4",cursor:"pointer"}}>Annulla</button>
              <button onClick={confirmNota} disabled={!notaModal.testo.trim()}
                style={{background:notaModal.azione==="ko"?"#fc8181":"#ecc94b",border:"none",borderRadius:8,padding:"8px 18px",color:"#1a202c",fontWeight:600,cursor:"pointer",opacity:notaModal.testo.trim()?1:0.5}}>
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MALATTIE SECTION ─────────────────────────────────────────────────────────
function SezioneMalattie({ ruolo }) {
  const [showModal, setShowModal] = useState(false);
  const [filtroNeg, setFiltroNeg] = useState("Tutti");
  const [filtroPersona, setFiltroPersona] = useState("");
  const [filtroDal, setFiltroDal] = useState("");
  const [filtroAl, setFiltroAl] = useState("");

  const [malattie, setMalattie] = useState([
    { id:1, nome:"Marco Rossi", negozio:"Roma Centro", dal:"2026-03-05", al:"2026-03-07", nCert:"CRT-2026-001", allegato:null, note:"" },
    { id:2, nome:"Luca Ferrari", negozio:"Roma Est", dal:"2026-03-10", al:"2026-03-12", nCert:"CRT-2026-002", allegato:"certificato_ferrari.pdf", note:"" },
    { id:3, nome:"Chiara Bruno", negozio:"Laurentina", dal:"2026-03-11", al:"2026-03-11", nCert:"", allegato:null, note:"In attesa di certificato" },
    { id:4, nome:"Fabio Greco", negozio:"Prenestina", dal:"2026-02-20", al:"2026-02-22", nCert:"CRT-2026-003", allegato:"cert_greco.pdf", note:"" },
  ]);

  // Form state
  const [mPersona, setMPersona] = useState("");
  const [mDal, setMDal] = useState("");
  const [mAl, setMAl] = useState("");
  const [mNcert, setMNcert] = useState("");
  const [mNote, setMNote] = useState("");
  const [mAllegato, setMAllegato] = useState(null);
  const fileRef = useRef();

  const submitMalattia = () => {
    if (!mPersona || !mDal || !mAl) return;
    const nuova = { id:Date.now(), nome:mPersona, negozio:"—", dal:mDal, al:mAl, nCert:mNcert, allegato:mAllegato?mAllegato.name:null, note:mNote };
    setMalattie(prev => [nuova, ...prev]);
    setShowModal(false);
    setMPersona(""); setMDal(""); setMAl(""); setMNcert(""); setMNote(""); setMAllegato(null);
  };

  const filtered = malattie.filter(m =>
    (filtroNeg==="Tutti" || m.negozio===filtroNeg) &&
    (filtroPersona==="" || m.nome.toLowerCase().includes(filtroPersona.toLowerCase())) &&
    (filtroDal==="" || m.al>=filtroDal) &&
    (filtroAl==="" || m.dal<=filtroAl)
  );

  return (
    <div style={{padding:"0 0 32px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <input placeholder="Cerca persona..." value={filtroPersona} onChange={e=>setFiltroPersona(e.target.value)}
            style={{background:"#1e2736",border:"1px solid #2d3748",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:13,width:150}} />
          <select value={filtroNeg} onChange={e=>setFiltroNeg(e.target.value)}
            style={{background:"#1e2736",border:"1px solid #2d3748",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:13}}>
            {NEGOZI.map(n=><option key={n}>{n}</option>)}
          </select>
          <input type="date" value={filtroDal} onChange={e=>setFiltroDal(e.target.value)}
            placeholder="Dal" style={{background:"#1e2736",border:"1px solid #2d3748",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:13}} />
          <input type="date" value={filtroAl} onChange={e=>setFiltroAl(e.target.value)}
            placeholder="Al" style={{background:"#1e2736",border:"1px solid #2d3748",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:13}} />
        </div>
        <button onClick={()=>setShowModal(true)}
          style={{background:"#fc8181",color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
          + Registra Assenza
        </button>
      </div>

      {/* KPI cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[
          { label:"Assenze questo mese", val:malattie.filter(m=>m.dal.startsWith("2026-03")).length, color:"#fc8181" },
          { label:"Con certificato", val:malattie.filter(m=>m.nCert).length, color:"#48bb78" },
          { label:"Senza certificato", val:malattie.filter(m=>!m.nCert).length, color:"#ecc94b" },
        ].map((k,i) => (
          <div key={i} style={{background:"#1e2736",borderRadius:10,padding:"16px 20px",border:"1px solid #2d3748"}}>
            <div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.val}</div>
            <div style={{fontSize:12,color:"#8892a4",marginTop:2}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{background:"#1e2736",borderRadius:12,border:"1px solid #2d3748",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{borderBottom:"1px solid #2d3748",background:"#17202e"}}>
              {["Collaboratore","Negozio","Dal","Al","Giorni","N. Certificato","Allegato","Note"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",color:"#8892a4",fontWeight:500,fontSize:12}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const gg = Math.round((new Date(m.al)-new Date(m.dal))/86400000)+1;
              return (
                <tr key={m.id} style={{borderBottom:"1px solid #2d374840"}}>
                  <td style={{padding:"10px 14px",color:"#e2e8f0",fontWeight:500}}>{m.nome}</td>
                  <td style={{padding:"10px 14px",color:"#8892a4"}}>{m.negozio}</td>
                  <td style={{padding:"10px 14px",color:"#e2e8f0"}}>{fmtIt(m.dal)}</td>
                  <td style={{padding:"10px 14px",color:"#e2e8f0"}}>{fmtIt(m.al)}</td>
                  <td style={{padding:"10px 14px",color:"#63b3ed",fontWeight:600}}>{gg}</td>
                  <td style={{padding:"10px 14px",color: m.nCert?"#48bb78":"#ecc94b"}}>{m.nCert || "—"}</td>
                  <td style={{padding:"10px 14px"}}>
                    {m.allegato ? (
                      <span style={{color:"#63b3ed",fontSize:12,cursor:"pointer"}}>📎 {m.allegato}</span>
                    ) : <span style={{color:"#4a5568"}}>—</span>}
                  </td>
                  <td style={{padding:"10px 14px",color:"#8892a4",maxWidth:160}}>{m.note||"—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{padding:32,textAlign:"center",color:"#8892a4"}}>Nessuna assenza trovata</div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#1e2736",borderRadius:14,padding:28,width:440,border:"1px solid #2d3748",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{margin:"0 0 20px",color:"#e2e8f0"}}>Registra Assenza per Malattia</h3>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:"#8892a4",display:"block",marginBottom:4}}>Collaboratore *</label>
              <select value={mPersona} onChange={e=>setMPersona(e.target.value)}
                style={{width:"100%",background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:14,boxSizing:"border-box"}}>
                <option value="">Seleziona...</option>
                {COLLABORATORI.map(c=><option key={c.id} value={c.nome}>{c.nome} — {c.negozio}</option>)}
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div>
                <label style={{fontSize:12,color:"#8892a4",display:"block",marginBottom:4}}>Dal *</label>
                <input type="date" value={mDal} onChange={e=>setMDal(e.target.value)}
                  style={{width:"100%",background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:13,boxSizing:"border-box"}} />
              </div>
              <div>
                <label style={{fontSize:12,color:"#8892a4",display:"block",marginBottom:4}}>Al *</label>
                <input type="date" value={mAl} onChange={e=>setMAl(e.target.value)}
                  style={{width:"100%",background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:13,boxSizing:"border-box"}} />
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:"#8892a4",display:"block",marginBottom:4}}>N. Certificato</label>
              <input value={mNcert} onChange={e=>setMNcert(e.target.value)} placeholder="Es. CRT-2026-010"
                style={{width:"100%",background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:14,boxSizing:"border-box"}} />
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:"#8892a4",display:"block",marginBottom:4}}>Allega Certificato</label>
              <input type="file" ref={fileRef} onChange={e=>setMAllegato(e.target.files[0])} accept=".pdf,.jpg,.png"
                style={{display:"none"}} />
              <button onClick={()=>fileRef.current.click()}
                style={{background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"8px 14px",color:"#8892a4",cursor:"pointer",fontSize:13}}>
                {mAllegato ? "📎 "+mAllegato.name : "Seleziona file..."}
              </button>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:"#8892a4",display:"block",marginBottom:4}}>Note</label>
              <textarea value={mNote} onChange={e=>setMNote(e.target.value)} rows={2}
                style={{width:"100%",background:"#2d3748",border:"1px solid #4a5568",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:14,resize:"vertical",boxSizing:"border-box"}} />
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowModal(false)} style={{background:"transparent",border:"1px solid #4a5568",borderRadius:8,padding:"8px 20px",color:"#8892a4",cursor:"pointer"}}>Annulla</button>
              <button onClick={submitMalattia} disabled={!mPersona||!mDal||!mAl}
                style={{background:"#fc8181",border:"none",borderRadius:8,padding:"8px 20px",color:"#fff",fontWeight:600,cursor:"pointer",opacity:(!mPersona||!mDal||!mAl)?0.5:1}}>
                Registra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function CollaboratoriGroup() {
  const [activeSection, setActiveSection] = useState("badge");
  const [ruolo, setRuolo] = useState("admin"); // toggle for demo

  const sections = [
    { key:"badge", label:"Badge", icon:"⏱" },
    { key:"ferie", label:"Ferie", icon:"🌴" },
    { key:"malattie", label:"Malattie", icon:"🏥" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#131b2e",color:"#e2e8f0",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      {/* Top bar */}
      <div style={{background:"#0f1624",borderBottom:"1px solid #1e2736",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:18,fontWeight:700,color:"#e2e8f0",letterSpacing:-0.5}}>Telefutura CRM</span>
          <span style={{color:"#4a5568",fontSize:14}}>/</span>
          <span style={{fontSize:14,color:"#8892a4"}}>Collaboratori</span>
        </div>
        {/* Demo ruolo toggle */}
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#1e2736",borderRadius:8,padding:"4px 6px",border:"1px solid #2d3748"}}>
          <span style={{fontSize:11,color:"#8892a4"}}>Vista:</span>
          <button onClick={()=>setRuolo("collaboratore")}
            style={{background:ruolo==="collaboratore"?"#2d3748":"transparent",color:ruolo==="collaboratore"?"#e2e8f0":"#8892a4",border:"none",borderRadius:5,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>
            Collaboratore
          </button>
          <button onClick={()=>setRuolo("admin")}
            style={{background:ruolo==="admin"?"#2d3748":"transparent",color:ruolo==="admin"?"#e2e8f0":"#8892a4",border:"none",borderRadius:5,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>
            Admin
          </button>
        </div>
      </div>

      <div style={{display:"flex",height:"calc(100vh - 56px)"}}>
        {/* Sidebar */}
        <div style={{width:200,background:"#0f1624",borderRight:"1px solid #1e2736",padding:"16px 0",flexShrink:0}}>
          <div style={{padding:"0 12px 12px",fontSize:10,color:"#4a5568",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>
            Collaboratori
          </div>
          {sections.map(s => (
            <button key={s.key} onClick={()=>setActiveSection(s.key)}
              style={{
                display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 16px",
                background:activeSection===s.key?"#1e2736":"transparent",
                color:activeSection===s.key?"#e2e8f0":"#8892a4",
                border:"none",textAlign:"left",cursor:"pointer",fontSize:14,
                borderLeft: activeSection===s.key?"3px solid #63b3ed":"3px solid transparent",
                transition:"all .15s"
              }}>
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          <div style={{marginBottom:20}}>
            <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:"#e2e8f0"}}>
              {sections.find(s=>s.key===activeSection).icon} {sections.find(s=>s.key===activeSection).label}
            </h2>
            <div style={{fontSize:13,color:"#8892a4"}}>
              {activeSection==="badge" && "Gestione presenze e timbrature"}
              {activeSection==="ferie" && "Richieste e approvazione ferie"}
              {activeSection==="malattie" && "Registro assenze per malattia"}
            </div>
          </div>

          {activeSection==="badge" && <SezioneBadge ruolo={ruolo} />}
          {activeSection==="ferie" && <SezioneFerie ruolo={ruolo} />}
          {activeSection==="malattie" && <SezioneMalattie ruolo={ruolo} />}
        </div>
      </div>
    </div>
  );
}

export default CollaboratoriGroup;

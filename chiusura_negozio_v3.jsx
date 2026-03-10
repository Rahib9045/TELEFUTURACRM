import { useState } from "react";

var STORES = ["Roma Centro", "Roma Tiburtina", "Milano Duomo", "Napoli Vomero", "Torino Porta Nuova"];
var SOCIETA = ["Telefutura", "Telefutura 2SRL"];
var ROLES = ["Amministrazione", "Punto Vendita"];

var DOC_TYPES = [
  { key: "cassa", label: "Chiusura Cassa", icon: "💰", desc: "Report chiusura cassa giornaliero", required: true },
  { key: "pos", label: "Chiusura POS", icon: "💳", desc: "Scontrini e report terminali POS", required: true },
  { key: "ddt_w3", label: "DDT WindTre", icon: "📦", desc: "Documenti di trasporto WindTre", required: false },
  { key: "ddt_vf", label: "DDT Vodafone", icon: "📦", desc: "Documenti di trasporto Vodafone", required: false },
  { key: "fatture", label: "Fatture Clienti", icon: "🧾", desc: "Fatture emesse ai clienti in giornata", required: false },
];

var MOCK_HISTORY = [
  { id: 1, store: "Roma Centro", societa: "Telefutura", date: "2026-03-10", user: "Marco Rossi", docs: { cassa: 1, pos: 2, ddt_w3: 1, ddt_vf: 0, fatture: 3 }, status: "completa", time: "20:45", attachments: [{ name: "chiusura_cassa_100326.pdf", cat: "cassa" }, { name: "pos_report_1.pdf", cat: "pos" }, { name: "pos_report_2.pdf", cat: "pos" }, { name: "ddt_w3_marzo.pdf", cat: "ddt_w3" }, { name: "fatt_0041.pdf", cat: "fatture" }, { name: "fatt_0042.pdf", cat: "fatture" }, { name: "fatt_0043.pdf", cat: "fatture" }] },
  { id: 2, store: "Roma Centro", societa: "Telefutura 2SRL", date: "2026-03-10", user: "Marco Rossi", docs: { cassa: 1, pos: 1, ddt_w3: 0, ddt_vf: 0, fatture: 1 }, status: "incompleta", time: "20:47", attachments: [{ name: "chiusura_cassa_2srl.pdf", cat: "cassa" }, { name: "pos_2srl.pdf", cat: "pos" }, { name: "fatt_2srl_001.pdf", cat: "fatture" }] },
  { id: 3, store: "Milano Duomo", societa: "Telefutura", date: "2026-03-10", user: "Luca Bianchi", docs: { cassa: 1, pos: 1, ddt_w3: 0, ddt_vf: 1, fatture: 2 }, status: "incompleta", time: "21:10", attachments: [{ name: "cassa_mi.pdf", cat: "cassa" }, { name: "pos_mi.pdf", cat: "pos" }, { name: "ddt_vf_mi.pdf", cat: "ddt_vf" }, { name: "fatt_mi_01.pdf", cat: "fatture" }, { name: "fatt_mi_02.pdf", cat: "fatture" }] },
  { id: 4, store: "Roma Tiburtina", societa: "Telefutura", date: "2026-03-10", user: "Sara Verdi", docs: { cassa: 1, pos: 2, ddt_w3: 1, ddt_vf: 1, fatture: 4 }, status: "completa", time: "20:30", attachments: [{ name: "cassa_tib.pdf", cat: "cassa" }, { name: "pos_tib_1.pdf", cat: "pos" }, { name: "pos_tib_2.pdf", cat: "pos" }, { name: "ddt_w3_tib.pdf", cat: "ddt_w3" }, { name: "ddt_vf_tib.pdf", cat: "ddt_vf" }, { name: "fatt_tib_01.pdf", cat: "fatture" }, { name: "fatt_tib_02.pdf", cat: "fatture" }, { name: "fatt_tib_03.pdf", cat: "fatture" }, { name: "fatt_tib_04.pdf", cat: "fatture" }] },
  { id: 5, store: "Roma Tiburtina", societa: "Telefutura 2SRL", date: "2026-03-10", user: "Sara Verdi", docs: { cassa: 1, pos: 1, ddt_w3: 1, ddt_vf: 1, fatture: 2 }, status: "completa", time: "20:32", attachments: [{ name: "cassa_tib_2srl.pdf", cat: "cassa" }, { name: "pos_tib_2srl.pdf", cat: "pos" }, { name: "ddt_w3_tib_2srl.pdf", cat: "ddt_w3" }, { name: "ddt_vf_tib_2srl.pdf", cat: "ddt_vf" }, { name: "fatt_tib_2srl_01.pdf", cat: "fatture" }, { name: "fatt_tib_2srl_02.pdf", cat: "fatture" }] },
  { id: 6, store: "Napoli Vomero", societa: "Telefutura", date: "2026-03-09", user: "Antonio Esposito", docs: { cassa: 1, pos: 1, ddt_w3: 1, ddt_vf: 0, fatture: 1 }, status: "completa", time: "21:00", attachments: [{ name: "cassa_na.pdf", cat: "cassa" }, { name: "pos_na.pdf", cat: "pos" }, { name: "ddt_w3_na.pdf", cat: "ddt_w3" }, { name: "fatt_na_01.pdf", cat: "fatture" }] },
  { id: 7, store: "Roma Centro", societa: "Telefutura", date: "2026-03-09", user: "Marco Rossi", docs: { cassa: 1, pos: 2, ddt_w3: 0, ddt_vf: 1, fatture: 5 }, status: "incompleta", time: "20:55", attachments: [{ name: "cassa_rc_09.pdf", cat: "cassa" }, { name: "pos_rc_09_1.pdf", cat: "pos" }, { name: "pos_rc_09_2.pdf", cat: "pos" }, { name: "ddt_vf_rc_09.pdf", cat: "ddt_vf" }, { name: "fatt_rc_09_01.pdf", cat: "fatture" }, { name: "fatt_rc_09_02.pdf", cat: "fatture" }, { name: "fatt_rc_09_03.pdf", cat: "fatture" }, { name: "fatt_rc_09_04.pdf", cat: "fatture" }, { name: "fatt_rc_09_05.pdf", cat: "fatture" }] },
  { id: 8, store: "Roma Centro", societa: "Telefutura 2SRL", date: "2026-03-09", user: "Marco Rossi", docs: { cassa: 1, pos: 1, ddt_w3: 1, ddt_vf: 0, fatture: 2 }, status: "completa", time: "20:57", attachments: [{ name: "cassa_rc_2srl_09.pdf", cat: "cassa" }, { name: "pos_rc_2srl_09.pdf", cat: "pos" }, { name: "ddt_w3_rc_2srl_09.pdf", cat: "ddt_w3" }, { name: "fatt_rc_2srl_09_01.pdf", cat: "fatture" }, { name: "fatt_rc_2srl_09_02.pdf", cat: "fatture" }] },
  { id: 9, store: "Torino Porta Nuova", societa: "Telefutura", date: "2026-03-08", user: "Giulia Neri", docs: { cassa: 1, pos: 1, ddt_w3: 1, ddt_vf: 1, fatture: 2 }, status: "completa", time: "20:20", attachments: [{ name: "cassa_to.pdf", cat: "cassa" }, { name: "pos_to.pdf", cat: "pos" }, { name: "ddt_w3_to.pdf", cat: "ddt_w3" }, { name: "ddt_vf_to.pdf", cat: "ddt_vf" }, { name: "fatt_to_01.pdf", cat: "fatture" }, { name: "fatt_to_02.pdf", cat: "fatture" }] },
  { id: 10, store: "Milano Duomo", societa: "Telefutura", date: "2026-03-07", user: "Luca Bianchi", docs: { cassa: 1, pos: 2, ddt_w3: 1, ddt_vf: 1, fatture: 3 }, status: "completa", time: "21:05", attachments: [{ name: "cassa_mi_07.pdf", cat: "cassa" }, { name: "pos_mi_07_1.pdf", cat: "pos" }, { name: "pos_mi_07_2.pdf", cat: "pos" }, { name: "ddt_w3_mi_07.pdf", cat: "ddt_w3" }, { name: "ddt_vf_mi_07.pdf", cat: "ddt_vf" }, { name: "fatt_mi_07_01.pdf", cat: "fatture" }, { name: "fatt_mi_07_02.pdf", cat: "fatture" }, { name: "fatt_mi_07_03.pdf", cat: "fatture" }] },
];

/* Build fatture list from all closures */
var buildFatture = function () {
  var list = [];
  var id = 1;
  MOCK_HISTORY.forEach(function (row) {
    row.attachments.filter(function (a) { return a.cat === "fatture"; }).forEach(function (att) {
      list.push({
        id: id++,
        filename: att.name,
        store: row.store,
        societa: row.societa,
        date: row.date,
        user: row.user,
        closureId: row.id,
        emessa: Math.random() > 0.55,
      });
    });
  });
  return list;
};

var Badge = function (props) {
  var colors = {
    completa: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
    incompleta: { bg: "#fef9c3", text: "#854d0e", border: "#fef08a" },
  };
  var c = colors[props.type] || colors.incompleta;
  return React.createElement("span", { style: { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text, border: "1px solid " + c.border, textTransform: "capitalize" } }, props.type);
};

var SocBadge = function (props) {
  var is2 = props.name === "Telefutura 2SRL";
  return React.createElement("span", { style: { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: is2 ? "#faf5ff" : "#eff6ff", color: is2 ? "#7c3aed" : "#2563eb", border: "1px solid " + (is2 ? "#e9d5ff" : "#bfdbfe") } }, props.name);
};

/* ─── UPLOAD CARD PER UNA SOCIETA ─── */
function SocietaBlock(props) {
  var societa = props.societa, files = props.files, setFiles = props.setFiles, color = props.color;

  var handleFile = function (key) {
    var fakeNames = ["chiusura_cassa.pdf", "report_pos.pdf", "ddt_marzo.pdf", "fattura_0042.pdf", "scontrino.jpg"];
    var idx = Math.floor(Math.random() * fakeNames.length);
    setFiles(function (prev) {
      var copy = JSON.parse(JSON.stringify(prev));
      copy[key].push({ name: fakeNames[idx], size: Math.floor(Math.random() * 900 + 100) + "KB" });
      return copy;
    });
  };

  var removeFile = function (key, i) {
    setFiles(function (prev) {
      var copy = JSON.parse(JSON.stringify(prev));
      copy[key] = copy[key].filter(function (_, j) { return j !== i; });
      return copy;
    });
  };

  var totalFiles = Object.values(files).reduce(function (a, b) { return a + b.length; }, 0);
  var mandatoryFilled = ["cassa", "pos"].filter(function (k) { return files[k].length > 0; }).length;

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "2px solid " + color, overflow: "hidden" }}>
      <div style={{ background: color + "0d", padding: "14px 20px", borderBottom: "1px solid " + color + "33", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
          <span style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>{societa}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{mandatoryFilled}/2 obbligatori · {totalFiles} file</span>
      </div>
      <div style={{ padding: "0 20px", marginTop: 12 }}>
        <div style={{ height: 5, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, background: mandatoryFilled === 2 ? "#22c55e" : color, width: (mandatoryFilled / 2) * 100 + "%", transition: "width 0.3s" }} />
        </div>
      </div>
      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {DOC_TYPES.map(function (dt) {
          return (
            <div key={dt.key} style={{ background: files[dt.key].length > 0 ? color + "08" : "#fafbfc", borderRadius: 10, border: files[dt.key].length > 0 ? "1.5px solid " + color + "55" : "1px solid #e2e8f0", padding: 14, transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{dt.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{dt.label}</span>
                    {dt.required && <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, padding: "1px 5px", textTransform: "uppercase" }}>Obbligatorio</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{dt.desc}</div>
                </div>
                {files[dt.key].length > 0 && (
                  <span style={{ background: color, color: "#fff", borderRadius: 20, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{files[dt.key].length}</span>
                )}
              </div>
              {files[dt.key].map(function (f, i) {
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: "#fff", borderRadius: 6, marginBottom: 3, fontSize: 12 }}>
                    <span style={{ color: "#64748b" }}>📄</span>
                    <span style={{ flex: 1, color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                    <span style={{ color: "#94a3b8", fontSize: 10 }}>{f.size}</span>
                    <button onClick={function () { removeFile(dt.key, i); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15, padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                );
              })}
              <button onClick={function () { handleFile(dt.key); }}
                style={{ marginTop: 6, width: "100%", padding: "8px", borderRadius: 7, border: "1.5px dashed #cbd5e1", background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={function (e) { e.target.style.borderColor = color; e.target.style.color = color; }}
                onMouseLeave={function (e) { e.target.style.borderColor = "#cbd5e1"; e.target.style.color = "#64748b"; }}>
                + Allega
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── VISTA INVIO E CHIUSURA (OVERLAY) ─── */
function VistaInvio(props) {
  var onClose = props.onClose;
  var emptyDocs = function () { return { cassa: [], pos: [], ddt_w3: [], ddt_vf: [], fatture: [] }; };
  var initState = {};
  SOCIETA.forEach(function (s) { initState[s] = { active: false, files: emptyDocs(), note: "" }; });

  var _s = useState(initState), state = _s[0], setState = _s[1];
  var _sent = useState(false), sent = _sent[0], setSent = _sent[1];
  var today = new Date().toISOString().split("T")[0];

  var toggleSocieta = function (soc) {
    setState(function (prev) {
      var copy = JSON.parse(JSON.stringify(prev));
      copy[soc].active = !copy[soc].active;
      if (!copy[soc].active) { copy[soc].files = emptyDocs(); copy[soc].note = ""; }
      return copy;
    });
  };

  var setFilesFor = function (soc) {
    return function (updater) {
      setState(function (prev) {
        var copy = JSON.parse(JSON.stringify(prev));
        copy[soc].files = typeof updater === "function" ? updater(copy[soc].files) : updater;
        return copy;
      });
    };
  };

  var setNoteFor = function (soc, val) {
    setState(function (prev) {
      var copy = JSON.parse(JSON.stringify(prev));
      copy[soc].note = val;
      return copy;
    });
  };

  var activeSoc = SOCIETA.filter(function (s) { return state[s].active; });
  var totalAllFiles = activeSoc.reduce(function (sum, s) {
    return sum + Object.values(state[s].files).reduce(function (a, b) { return a + b.length; }, 0);
  }, 0);

  var colors = { "Telefutura": "#2563eb", "Telefutura 2SRL": "#7c3aed" };

  if (sent) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#f0f2f5", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
          <h2 style={{ margin: "0 0 8px", color: "#1a1a2e", fontWeight: 700, fontSize: 24 }}>Chiusura Inviata</h2>
          <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 8px" }}>{totalAllFiles} documenti inviati per il {today}</p>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 32px" }}>{activeSoc.join(" + ")}</p>
          <button onClick={onClose} style={{ padding: "12px 32px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Torna alla Gestione</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#f0f2f5", overflowY: "auto" }}>
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 800 }}>📤 Invio Chiusura</h1>
            <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: 12 }}>Seleziona la società e allega i documenti</p>
          </div>
        </div>
        <button onClick={function () { setSent(true); }} disabled={totalAllFiles === 0}
          style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: totalAllFiles === 0 ? "#475569" : "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: totalAllFiles === 0 ? "not-allowed" : "pointer" }}>
          📤 Invia Chiusura {totalAllFiles > 0 ? "(" + totalAllFiles + " file)" : ""}
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 80px" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          {[{ l: "Data", v: today }, { l: "Negozio", v: "Roma Centro" }, { l: "Operatore", v: "Marco Rossi" }].map(function (item, i) {
            return (
              <div key={i} style={{ flex: 1, minWidth: 170, background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{item.l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{item.v}</div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Seleziona Società</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {SOCIETA.map(function (soc) {
            var active = state[soc].active;
            var c = colors[soc];
            return (
              <button key={soc} onClick={function () { toggleSocieta(soc); }}
                style={{ flex: 1, padding: "16px 20px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s", background: active ? c + "0d" : "#fff", border: active ? "2.5px solid " + c : "2px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, border: active ? "none" : "2px solid #d1d5db", background: active ? c : "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700 }}>
                  {active ? "✓" : ""}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: active ? c : "#64748b" }}>{soc}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{active ? "Chiusura attiva" : "Clicca per attivare"}</div>
                </div>
              </button>
            );
          })}
        </div>

        {activeSoc.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Seleziona almeno una società per iniziare</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {activeSoc.map(function (soc) {
            return (
              <div key={soc}>
                <SocietaBlock societa={soc} files={state[soc].files} setFiles={setFilesFor(soc)} color={colors[soc]} />
                <div style={{ marginTop: 10, padding: "0 4px" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Note {soc} (opzionale)</label>
                  <textarea value={state[soc].note} onChange={function (e) { setNoteFor(soc, e.target.value); }}
                    placeholder={"Segnalazioni per " + soc + "..."}
                    style={{ width: "100%", minHeight: 50, padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── EXPANDED ROW (ALLEGATI VIEW) ─── */
function ExpandedRow(props) {
  var row = props.row, isAdmin = props.isAdmin;
  var byCat = {};
  DOC_TYPES.forEach(function (dt) { byCat[dt.key] = []; });
  row.attachments.forEach(function (a) {
    if (byCat[a.cat]) byCat[a.cat].push(a);
  });

  return (
    <tr>
      <td colSpan={isAdmin ? 11 : 8} style={{ padding: 0, background: "#f8fafc" }}>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 12 }}>Allegati — {row.store} · {row.societa} · {row.date}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {DOC_TYPES.map(function (dt) {
              return (
                <div key={dt.key} style={{ background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{dt.icon}</span> {dt.label}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>{byCat[dt.key].length}</span>
                  </div>
                  {byCat[dt.key].length === 0 && <div style={{ fontSize: 11, color: "#cbd5e1", fontStyle: "italic" }}>Nessun allegato</div>}
                  {byCat[dt.key].map(function (att, i) {
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "#f8fafc", borderRadius: 5, marginBottom: 3, fontSize: 12 }}>
                        <span style={{ color: "#3b82f6" }}>📄</span>
                        <span style={{ flex: 1, color: "#334155", fontWeight: 500 }}>{att.name}</span>
                        <button style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 11, fontWeight: 600, padding: "2px 6px" }}>\u2B07 Scarica</button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ─── VISTA FATTURE (ADMIN OVERLAY) ─── */
function VistaFatture(props) {
  var onClose = props.onClose;
  var _fat = useState(function () { return buildFatture(); }), fatture = _fat[0], setFatture = _fat[1];
  var _tab = useState("da_emettere"), tab = _tab[0], setTab = _tab[1];
  var _fs = useState(""), fStore = _fs[0], setFStore = _fs[1];
  var _fso = useState(""), fSoc = _fso[0], setFSoc = _fso[1];
  var _fda = useState(""), fDateA = _fda[0], setFDateA = _fda[1];
  var _fdb = useState(""), fDateB = _fdb[0], setFDateB = _fdb[1];

  var toggleEmessa = function (id) {
    setFatture(function (prev) {
      return prev.map(function (f) { return f.id === id ? Object.assign({}, f, { emessa: !f.emessa }) : f; });
    });
  };

  var shown = fatture.filter(function (f) {
    if (tab === "da_emettere" && f.emessa) return false;
    if (tab === "emesse" && !f.emessa) return false;
    if (fStore && f.store !== fStore) return false;
    if (fSoc && f.societa !== fSoc) return false;
    if (fDateA && f.date < fDateA) return false;
    if (fDateB && f.date > fDateB) return false;
    return true;
  });

  var countDa = fatture.filter(function (f) { return !f.emessa; }).length;
  var countEm = fatture.filter(function (f) { return f.emessa; }).length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#f0f2f5", overflowY: "auto" }}>
      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 800 }}>🧾 Gestione Fatture</h1>
            <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Fatture ricevute dalle chiusure negozio</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 80px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { key: "da_emettere", label: "Da Emettere", count: countDa, color: "#f59e0b" },
            { key: "emesse", label: "Emesse", count: countEm, color: "#22c55e" },
          ].map(function (t) {
            var active = tab === t.key;
            return (
              <button key={t.key} onClick={function () { setTab(t.key); }}
                style={{ padding: "10px 20px", borderRadius: 10, border: active ? "2px solid " + t.color : "2px solid #e2e8f0", background: active ? t.color + "10" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: active ? t.color : "#64748b" }}>
                {t.label}
                <span style={{ background: t.color, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{t.count}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <select value={fStore} onChange={function (e) { setFStore(e.target.value); }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 500, color: "#334155", minWidth: 160 }}>
            <option value="">Tutti i negozi</option>
            {STORES.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
          </select>
          <select value={fSoc} onChange={function (e) { setFSoc(e.target.value); }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 500, color: "#334155", minWidth: 150 }}>
            <option value="">Tutte le società</option>
            {SOCIETA.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Dal</span>
            <input type="date" value={fDateA} onChange={function (e) { setFDateA(e.target.value); }}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155" }} />
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Al</span>
            <input type="date" value={fDateB} onChange={function (e) { setFDateB(e.target.value); }}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155" }} />
          </div>
          {(fStore || fSoc || fDateA || fDateB) && (
            <button onClick={function () { setFStore(""); setFSoc(""); setFDateA(""); setFDateB(""); }}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", fontSize: 12, fontWeight: 600, color: "#ef4444", cursor: "pointer" }}>
              ✕ Reset
            </button>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{shown.length} fatture</span>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["File", "Negozio", "Società", "Data Chiusura", "Operatore", "Stato", "Azioni"].map(function (h, i) {
                    return <th key={i} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {shown.map(function (f) {
                  return (
                    <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                      onMouseEnter={function (e) { e.currentTarget.style.background = "#fafbfc"; }}
                      onMouseLeave={function (e) { e.currentTarget.style.background = "#fff"; }}>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#ef4444", fontSize: 18 }}>📄</span>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{f.filename}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px", color: "#475569", fontWeight: 500 }}>{f.store}</td>
                      <td style={{ padding: "11px 14px" }}><SocBadge name={f.societa} /></td>
                      <td style={{ padding: "11px 14px", color: "#64748b" }}>{f.date}</td>
                      <td style={{ padding: "11px 14px", color: "#64748b" }}>{f.user}</td>
                      <td style={{ padding: "11px 14px" }}>
                        {f.emessa ? (
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}>Emessa</span>
                        ) : (
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fef9c3", color: "#854d0e", border: "1px solid #fef08a" }}>Da Emettere</span>
                        )}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#3b82f6", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>👁 Apri</button>
                          <button style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>\u2B07 PDF</button>
                          <button onClick={function () { toggleEmessa(f.id); }}
                            style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: f.emessa ? "#fef9c3" : "#dcfce7", color: f.emessa ? "#854d0e" : "#166534", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            {f.emessa ? "↩ Riapri" : "✓ Segna Emessa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {shown.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🧾</div>
              Nessuna fattura {tab === "da_emettere" ? "da emettere" : "emessa"} con i filtri selezionati
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── VISTA GESTIONE (HOME) ─── */
function VistaGestione(props) {
  var isAdmin = props.isAdmin, userStore = props.userStore;
  var _fs = useState(""), filterStore = _fs[0], setFilterStore = _fs[1];
  var _fda = useState(""), filterDateA = _fda[0], setFilterDateA = _fda[1];
  var _fdb = useState(""), filterDateB = _fdb[0], setFilterDateB = _fdb[1];
  var _fso = useState(""), filterSocieta = _fso[0], setFilterSocieta = _fso[1];
  var _exp = useState(null), expanded = _exp[0], setExpanded = _exp[1];

  var baseData = isAdmin ? MOCK_HISTORY : MOCK_HISTORY.filter(function (r) { return r.store === userStore; });

  var filtered = baseData.filter(function (r) {
    if (filterStore && r.store !== filterStore) return false;
    if (filterDateA && r.date < filterDateA) return false;
    if (filterDateB && r.date > filterDateB) return false;
    if (filterSocieta && r.societa !== filterSocieta) return false;
    return true;
  });

  var todayRows = baseData.filter(function (r) { return r.date === "2026-03-10"; });

  return (
    <div>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Chiusure Oggi", value: todayRows.length, icon: "📋", color: "#3b82f6" },
          isAdmin ? { label: "Negozi Mancanti", value: STORES.length - (function () { var s = {}; todayRows.forEach(function (r) { s[r.store] = true; }); return Object.keys(s).length; })(), icon: "❌", color: "#ef4444" } : null,
        ].filter(Boolean).map(function (kpi, i) {
          return (
            <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", border: "1px solid #e2e8f0", borderLeft: "4px solid " + kpi.color }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", marginTop: 4 }}>{kpi.icon} {kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {isAdmin && (
          <select value={filterStore} onChange={function (e) { setFilterStore(e.target.value); }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 500, color: "#334155", minWidth: 160 }}>
            <option value="">Tutti i negozi</option>
            {STORES.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
          </select>
        )}
        <select value={filterSocieta} onChange={function (e) { setFilterSocieta(e.target.value); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 500, color: "#334155", minWidth: 150 }}>
          <option value="">Tutte le società</option>
          {SOCIETA.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Dal</span>
          <input type="date" value={filterDateA} onChange={function (e) { setFilterDateA(e.target.value); }}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155" }} />
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Al</span>
          <input type="date" value={filterDateB} onChange={function (e) { setFilterDateB(e.target.value); }}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155" }} />
        </div>
        {(filterStore || filterDateA || filterDateB || filterSocieta) && (
          <button onClick={function () { setFilterStore(""); setFilterDateA(""); setFilterDateB(""); setFilterSocieta(""); }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", fontSize: 12, fontWeight: 600, color: "#ef4444", cursor: "pointer" }}>
            ✕ Reset
          </button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{filtered.length} risultati</span>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {(isAdmin ? ["Data", "Ora", "Negozio", "Società", "Operatore", "Cassa", "POS", "DDT W3", "DDT VF", "Fatture", ""] : ["Data", "Ora", "Società", "Cassa", "POS", "DDT W3", "DDT VF", "Fatture"]).map(function (h, i) {
                  return <th key={i} style={{ padding: "12px 12px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.map(function (r) {
                var isExp = expanded === r.id;
                return [
                  <tr key={r.id}
                    style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: isExp ? "#f0f9ff" : "#fff", transition: "background 0.15s" }}
                    onClick={function () { setExpanded(isExp ? null : r.id); }}
                    onMouseEnter={function (e) { if (!isExp) e.currentTarget.style.background = "#fafbfc"; }}
                    onMouseLeave={function (e) { if (!isExp) e.currentTarget.style.background = "#fff"; }}>
                    <td style={{ padding: "11px 12px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>{r.date}</td>
                    <td style={{ padding: "11px 12px", color: "#64748b" }}>{r.time}</td>
                    {isAdmin && <td style={{ padding: "11px 12px", fontWeight: 600, color: "#334155" }}>{r.store}</td>}
                    <td style={{ padding: "11px 12px" }}><SocBadge name={r.societa} /></td>
                    {isAdmin && <td style={{ padding: "11px 12px", color: "#475569" }}>{r.user}</td>}
                    {["cassa", "pos", "ddt_w3", "ddt_vf", "fatture"].map(function (k) {
                      return (
                        <td key={k} style={{ padding: "11px 12px", textAlign: "center" }}>
                          {r.docs[k] > 0 ? (
                            <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 20, padding: "2px 10px", fontWeight: 700, fontSize: 11 }}>{r.docs[k]}</span>
                          ) : (
                            <span style={{ color: "#d1d5db", fontSize: 15 }}>—</span>
                          )}
                        </td>
                      );
                    })}
                    {isAdmin && <td style={{ padding: "11px 12px", color: "#94a3b8", fontSize: 14 }}>{isExp ? "▲" : "▼"}</td>}
                  </tr>,
                  isExp ? <ExpandedRow key={"exp-" + r.id} row={r} isAdmin={isAdmin} /> : null,
                ];
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Nessuna chiusura trovata con i filtri selezionati</div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function ChiusuraNegozio() {
  var _v = useState(null), overlay = _v[0], setOverlay = _v[1];
  var _r = useState("Amministrazione"), role = _r[0], setRole = _r[1];
  var isAdmin = role === "Amministrazione";
  var userStore = "Roma Centro";

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f0f2f5", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Top bar */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, color: "#fff", fontSize: 21, fontWeight: 800, letterSpacing: -0.5 }}>🏪 Chiusura Negozio</h1>
          <p style={{ margin: "3px 0 0", color: "#94a3b8", fontSize: 13 }}>Gestione documentazione chiusura giornaliera</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Role switcher (demo only) */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px" }}>
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Demo:</span>
            {ROLES.map(function (r) {
              return (
                <button key={r} onClick={function () { setRole(r); }}
                  style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: role === r ? "#fff" : "transparent", color: role === r ? "#1e293b" : "#94a3b8", transition: "all 0.15s" }}>
                  {r}
                </button>
              );
            })}
          </div>

          {/* Fatture button (admin only) */}
          {isAdmin && (
            <button onClick={function () { setOverlay("fatture"); }}
              style={{ padding: "10px 20px", borderRadius: 10, border: "2px solid rgba(124,58,237,0.5)", background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              🧾 Fatture
            </button>
          )}

          {/* Invio e Chiusura button */}
          <button onClick={function () { setOverlay("invio"); }}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(59,130,246,0.35)" }}>
            📤 Invio e Chiusura
          </button>
        </div>
      </div>

      {/* Home = Gestione */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px" }}>
        {!isAdmin && (
          <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 16px", marginBottom: 20, border: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1e40af", fontWeight: 500 }}>
            🔒 Stai visualizzando solo le chiusure di <strong style={{ marginLeft: 4 }}>{userStore}</strong>
          </div>
        )}
        <VistaGestione isAdmin={isAdmin} userStore={userStore} />
      </div>

      {/* Overlays */}
      {overlay === "invio" && <VistaInvio onClose={function () { setOverlay(null); }} />}
      {overlay === "fatture" && <VistaFatture onClose={function () { setOverlay(null); }} />}
    </div>
  );
}

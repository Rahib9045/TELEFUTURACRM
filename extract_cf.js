const fs = require('fs');

const srcFile = 'e:/PRTFLIO/LUCA CRM/replica/CRM_MultiBrand_v8.jsx';
const dstFile = 'e:/PRTFLIO/LUCA CRM/replica/src/lib/cf.js';

let content = fs.readFileSync(srcFile, 'utf8');
const lines = content.split('\n');

// The CF logic starts at `const DI=` (line 70) and ends at `const _PCA=_PC.split("|");` (line 79)
let cfLines = lines.slice(69, 79).join('\n');

const additionalLogic = `

export const _CNA = _CN.split("|");
export const _CA = _CC.split("|");
export const CO = {};
_CNA.forEach((c, i) => { CO[c] = _CA[i]; });

export const _PNA = _PN.split("|");
export const _PCA = _PC.split("|");
export const CO_EE = {};
_PNA.forEach((p, i) => { CO_EE[p] = _PCA[i]; });

export const xC = s => s.toUpperCase().replace(/[^A-Z]/g,"").split("").filter(c => !"AEIOU".includes(c));
export const xV = s => s.toUpperCase().replace(/[^A-Z]/g,"").split("").filter(c => "AEIOU".includes(c));

export function calculateCF({ nome, cognome, sesso, giorno, mese, anno, comune, estero, paese }) {
  if (!nome || !cognome || !giorno || !mese || !anno) return null;
  if (estero && !paese) return null;
  if (!estero && !comune) return null;
  
  const luogo = (estero ? paese : comune).toUpperCase();
  const cc = estero ? (CO_EE[luogo] || "Z999") : (CO[luogo] || "Z999");
  
  const cn = xC(cognome), vn = xV(cognome), sur = [...cn, ...vn, "X", "X", "X"].slice(0, 3).join("");
  const cna = xC(nome);
  const nam = cna.length >= 4 ? [cna[0], cna[2], cna[3]].join("") : [...cna, ...xV(nome), "X", "X", "X"].slice(0, 3).join("");
  
  const an = anno.slice(-2), me = MCF[mese] || "A";
  let gi = parseInt(giorno);
  if (sesso === "F") gi += 40;
  
  const bd = an + me + (gi < 10 ? "0" + gi : String(gi));
  const partial = sur + nam + bd + cc;
  
  let sm = 0;
  for (let i = 0; i < 15; i++) {
    const ch = partial[i];
    sm += (i % 2 === 0) ? (DI[ch] || 0) : (PA[ch] || 0);
  }
  
  return partial + _R[sm % 26];
}
`;

// Also, export DI, PA, MCF, _CNA, _PNA etc if we want
cfLines = cfLines.replace(/const /g, 'export const ');

fs.writeFileSync(dstFile, cfLines + additionalLogic);
console.log('Done creating cf.js');

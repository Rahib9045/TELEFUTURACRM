const fs = require('fs');
const fileP = 'src/app/(dashboard)/pda/invia/page.jsx';
let text = fs.readFileSync(fileP, 'utf8');

// 1. Remove outer container that added the white background and blue header
text = text.replace(
    /<div style=\{\{maxWidth:900,margin:"0 auto"\}\}>[\s\S]*?\{\/\* CONTAINER INTERNO BIANCO \*\/\}\s*<div style=\{\{padding:"30px" \}\}>/,
    `
      {/* HEADER STANDARD DASHBOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Inserimento Contratto</h1>
          <p className="text-slate-400">Multi-Brand · v5.5 {venditore && \`· 👤 \${venditore}\`} {tipoCliente && \`· \${tipoCliente === "privato" ? "👤 Consumer" : "🏢 Business"}\`} {currentBrand && \`· 🏷 \${currentBrand.label}\`}</p>
        </div>
        <div className="flex items-center gap-3">
          {brand && step === 4 && (
            <button onClick={addCart}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
              📦 Cambia brand
            </button>
          )}
          <button onClick={reset} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
            ↩ Ricomincia
          </button>
        </div>
      </div>
`
);

// 2. Fix the top level wrapper
text = text.replace(
    /<div style=\{\{ fontFamily: "Inter,-apple-system,sans-serif", padding: 16, maxWidth: 960, margin: "0 auto" \}\}>/,
    `<div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">`
);

// Remove the two missing closing divs at the very bottom since we removed the double wrapper at the top
// Wait, I already removed them or added them? Let's aggressively match the end of the file.
text = text.replace(
    /\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}\s*\/\//,
    `\n    </div>\n  );\n}\n\n//`
);
text = text.replace(
    /\s*<\/div>\s*<\/div>\s*\);\s*\}\s*\/\//,
    `\n    </div>\n  );\n}\n\n//`
);

// 3. StepCard Dark Theme
text = text.replace(
    /(function StepCard.*?<div).*/,
    `$1 className="glass-panel p-6 md:p-8 animate-in slide-in-from-top-2 fade-in duration-200 mb-6" style={{ borderLeft: \`4px solid \${color}\` }}>`
);

// 4. Update NavBar buttons (forward/back)
text = text.replace(
    /function NavBar[\s\S]*?return \([\s\S]*?<\/div>\r?\n  \);/m,
    `function NavBar({ onBack, onNext, canNext, isFirst }) {
  return (
    <div className={\`flex gap-4 \${isFirst ? 'justify-end' : 'justify-between'} mt-8 pt-6 border-t border-white/10\`}>
      {!isFirst && <button onClick={onBack} className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-sm font-medium transition-all">← Torna indietro</button>}
      <button onClick={onNext} disabled={!canNext}
        className={\`px-8 py-2.5 rounded-xl text-sm font-bold transition-all \${canNext ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40' : 'bg-white/5 text-slate-500 cursor-not-allowed'}\`}>
        Vai avanti →
      </button>
    </div>
  );`
);

// 5. Mass replace bright color references with dark theme references natively through regex.
const replacements = [
    // General text
    { from: /color:\s*["']#555["']/g, to: 'color:"#cbd5e1"' },
    { from: /color:\s*["']#333["']/g, to: 'color:"#ffffff"' },
    { from: /color:\s*["']#444["']/g, to: 'color:"#f8fafc"' },
    { from: /color:\s*["']#666["']/g, to: 'color:"#94a3b8"' },
    { from: /color:\s*["']#888["']/g, to: 'color:"#64748b"' },
    { from: /color:\s*["']#999["']/g, to: 'color:"#64748b"' },

    // Backgrounds
    { from: /background:\s*["']white["']/g, to: 'background:"rgba(255,255,255,0.03)"' },
    { from: /background:\s*["']#ffffff["']/gi, to: 'background:"rgba(255,255,255,0.03)"' },
    { from: /background:\s*["']#fafbfc["']/g, to: 'background:"rgba(255,255,255,0.02)"' },
    { from: /background:\s*["']#f8f9fa["']/g, to: 'background:"rgba(255,255,255,0.04)"' },
    { from: /background:\s*["']#f0f0f0["']/g, to: 'background:"rgba(255,255,255,0.1)"' },
    { from: /background:\s*["']#e9ecef["']/g, to: 'background:"rgba(255,255,255,0.1)"' },
    { from: /background:\s*["']#EBF3FB["']/g, to: 'background:"rgba(46,117,182,0.1)"' },
    { from: /background:\s*["']#F3EEFB["']/g, to: 'background:"rgba(111,66,193,0.1)"' },
    { from: /background:\s*["']#f0fff0["']/g, to: 'background:"rgba(40,167,69,0.1)"' },
    { from: /background:\s*["']#d4edda["']/g, to: 'background:"rgba(40,167,69,0.2)"' },
    { from: /background:\s*["']#edfaf1["']/g, to: 'background:"rgba(40,167,69,0.1)"' },
    { from: /background:\s*["']#edfaf4["']/g, to: 'background:"rgba(0,166,81,0.1)"' },
    { from: /background:\s*["']#E8F4FF["']/g, to: 'background:"rgba(0,114,206,0.1)"' },
    { from: /background:\s*["']#FAF5FF["']/g, to: 'background:"rgba(111,66,193,0.1)"' },
    { from: /background:\s*["']#fff3cd["']/g, to: 'background:"rgba(255,193,7,0.1)"' },
    { from: /background:\s*["']#f8d7da["']/g, to: 'background:"rgba(220,53,69,0.1)"' },

    // Borders
    { from: /border:\s*["']1px solid #d0d0d0["']/g, to: 'border:"1px solid rgba(255,255,255,0.1)"' },
    { from: /border:\s*["']1px solid #ccc["']/g, to: 'border:"1px solid rgba(255,255,255,0.15)"' },
    { from: /border:\s*["']1px solid #ddd["']/g, to: 'border:"1px solid rgba(255,255,255,0.1)"' },
    { from: /border:\s*["']1px solid #e0e0e0["']/g, to: 'border:"1px solid rgba(255,255,255,0.08)"' },
    { from: /border:\s*["']1px solid #e8e8e8["']/g, to: 'border:"1px solid rgba(255,255,255,0.05)"' },
    { from: /border:\s*["']1px solid #f0f0f0["']/g, to: 'border:"1px solid rgba(255,255,255,0.05)"' },
    { from: /border:\s*["']2px solid #e0e0e0["']/g, to: 'border:"2px solid rgba(255,255,255,0.1)"' },
    { from: /border:\s*["']2px solid #e8e8e8["']/g, to: 'border:"2px solid rgba(255,255,255,0.1)"' },
    { from: /border:\s*["']2px solid #ddd["']/g, to: 'border:"2px solid rgba(255,255,255,0.15)"' },
    { from: /border:\s*["']2px dashed #ccc["']/g, to: 'border:"2px dashed rgba(255,255,255,0.2)"' },

    // Special Text
    { from: /color:\s*["']155724["']/g, to: 'color:"#4ade80"' },
    { from: /color:\s*["']#155724["']/g, to: 'color:"#4ade80"' },
    { from: /color:\s*["']#856404["']/g, to: 'color:"#fbbf24"' },
    { from: /color:\s*["']#721c24["']/g, to: 'color:"#f87171"' },
];

replacements.forEach(({ from, to }) => {
    text = text.replace(from, to);
});

// Update standard form inputs so they have dark background implicitly
text = text.replace(/<input type="text"/g, '<input type="text" className="bg-white/5 text-white placeholder-slate-500"');
text = text.replace(/<select /g, '<select className="bg-slate-900 border-white/10 text-white" ');
text = text.replace(/<textarea /g, '<textarea className="bg-white/5 border-white/10 text-white placeholder-slate-500" ');
text = text.replace(/<input type="date"/g, '<input type="date" className="bg-white/5 border-white/10 text-white" ');
text = text.replace(/<input type="time"/g, '<input type="time" className="bg-white/5 border-white/10 text-white" ');

// Helper style updates
text = text.replace(
    /function Label\(\{ text, required, note \}\) \{[\s\S]*?return \([\s\S]*?<div style=\{\{ fontSize: 11, fontWeight: 600, color: ".*?", marginBottom: 3 \}\}>/m,
    `function Label({ text, required, note }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>`
);

text = text.replace(
    /function AField[\s\S]*?return \(\s*<div.*?>\s*<div style=\{\{.*?color: ".*?".*?\}\}>/m,
    `function AField({ label, required, value, onChange, pf, ph, mono, span2 }) {
  return (
    <div style={span2 ? { gridColumn: "1 / -1" } : {}}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>`
);

fs.writeFileSync(fileP, text);
console.log('Done refactoring layout!');

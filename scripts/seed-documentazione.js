/**
 * Seed documentation table with mock docs (same as Documentazione page).
 * Run from project root: node scripts/seed-documentazione.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error("Missing .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const MOCK_DOCS = {
  windtre: {
    canvass: [
      { name: "Canvass Consumer Marzo 2026", type: "pdf", size: "2.4 MB", date: "01/03/2026", fillable: false },
      { name: "Canvass Business Marzo 2026", type: "pdf", size: "3.1 MB", date: "01/03/2026", fillable: false },
      { name: "Listino Accessori Q1 2026", type: "pdf", size: "1.8 MB", date: "15/01/2026", fillable: false },
    ],
    modulistica: [
      { name: "Modulo Recesso", type: "pdf", size: "180 KB", date: "10/02/2026", fillable: true },
      { name: "Modulo Cambio Intestatario", type: "pdf", size: "210 KB", date: "10/02/2026", fillable: true },
      { name: "Modulo Reclamo", type: "pdf", size: "150 KB", date: "05/01/2026", fillable: true },
    ],
    operativa: [
      { name: "Guida Attivazione MNP", type: "pdf", size: "850 KB", date: "20/02/2026", fillable: false },
      { name: "Procedura Verifica Credito", type: "pdf", size: "420 KB", date: "15/02/2026", fillable: false },
      { name: "Manuale CRM Agenti", type: "pdf", size: "5.2 MB", date: "01/01/2026", fillable: false },
    ],
  },
  vodafone_fastweb: {
    canvass: [
      { name: "Canvass Vodafone Consumer Marzo 2026", type: "pdf", size: "2.8 MB", date: "01/03/2026", fillable: false },
      { name: "Canvass Fastweb Casa Marzo 2026", type: "pdf", size: "1.9 MB", date: "01/03/2026", fillable: false },
    ],
    modulistica: [
      { name: "Modulo Migrazione Vodafone-Fastweb", type: "pdf", size: "290 KB", date: "15/02/2026", fillable: true },
      { name: "Modulo SDD Bancario", type: "pdf", size: "175 KB", date: "10/01/2026", fillable: true },
    ],
    operativa: [
      { name: "Guida Convergenza Fisso-Mobile", type: "pdf", size: "1.1 MB", date: "01/02/2026", fillable: false },
      { name: "Troubleshooting Linea Fissa", type: "pdf", size: "680 KB", date: "20/01/2026", fillable: false },
    ],
  },
  sky: {
    canvass: [
      { name: "Canvass Sky TV Marzo 2026", type: "pdf", size: "3.5 MB", date: "01/03/2026", fillable: false },
      { name: "Canvass Sky WiFi Marzo 2026", type: "pdf", size: "2.0 MB", date: "01/03/2026", fillable: false },
    ],
    modulistica: [
      { name: "Modulo Attivazione Sky Q", type: "pdf", size: "320 KB", date: "01/02/2026", fillable: true },
      { name: "Modulo Recesso Sky", type: "pdf", size: "190 KB", date: "15/01/2026", fillable: true },
    ],
    operativa: [
      { name: "Guida Installazione Sky Glass", type: "pdf", size: "4.2 MB", date: "01/03/2026", fillable: false },
    ],
  },
  energia: {
    canvass: [
      { name: "Canvass Luce Marzo 2026", type: "pdf", size: "1.6 MB", date: "01/03/2026", fillable: false },
      { name: "Canvass Gas Marzo 2026", type: "pdf", size: "1.4 MB", date: "01/03/2026", fillable: false },
    ],
    modulistica: [
      { name: "Modulo Voltura", type: "pdf", size: "250 KB", date: "10/02/2026", fillable: true },
      { name: "Modulo Subentro", type: "pdf", size: "230 KB", date: "10/02/2026", fillable: true },
    ],
    operativa: [
      { name: "Guida Lettura Bolletta", type: "pdf", size: "980 KB", date: "01/01/2026", fillable: false },
    ],
  },
  tim: {
    canvass: [
      { name: "Canvass Tim Mobile Marzo 2026", type: "pdf", size: "2.1 MB", date: "01/03/2026", fillable: false },
    ],
    modulistica: [
      { name: "Modulo Portabilità Tim", type: "pdf", size: "220 KB", date: "10/02/2026", fillable: true },
    ],
    operativa: [
      { name: "Guida Attivazione Tim Fibra", type: "pdf", size: "1.3 MB", date: "15/02/2026", fillable: false },
    ],
  },
  iliad: {
    canvass: [
      { name: "Canvass Iliad Mobile Marzo 2026", type: "pdf", size: "1.9 MB", date: "01/03/2026", fillable: false },
    ],
    modulistica: [
      { name: "Modulo Portabilità Iliad", type: "pdf", size: "210 KB", date: "08/02/2026", fillable: true },
    ],
    operativa: [
      { name: "Guida Gestione Offerte Iliad", type: "pdf", size: "890 KB", date: "20/02/2026", fillable: false },
    ],
  },
};

async function main() {
  const rows = [];
  for (const [brandId, cats] of Object.entries(MOCK_DOCS)) {
    for (const [categoryId, docs] of Object.entries(cats)) {
      for (const d of docs) {
        rows.push({
          brand_id: brandId,
          category_id: categoryId,
          name: d.name,
          type: d.type,
          size: d.size,
          date: d.date,
          fillable: d.fillable,
          is_demo: true,
        });
      }
    }
  }
  const { error } = await supabase.from("documentation").insert(rows);
  if (error) {
    console.error("Documentation insert error:", error.message);
    process.exit(1);
  }
  console.log("Inserted", rows.length, "documentation rows.");
  console.log("Done.");
}

main();

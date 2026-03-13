/**
 * Seed clients + contracts with mock data (same as Clienti page mock).
 * Run from project root: node scripts/seed-clienti.js
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
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

function generateMockClienti() {
  const list = [];
  for (let i = 1; i <= 150; i++) {
    const isBusiness = i % 3 === 0;
    list.push({
      id: `CLIENT_${i.toString().padStart(4, "0")}`,
      tipo: isBusiness ? "business" : "consumer",
      nome: isBusiness ? "Mario" : `Nome_${i}`,
      cognome: isBusiness ? "Rossi" : `Cognome_${i}`,
      ragione_sociale: isBusiness ? `Azienda Beta ${i} Srl` : null,
      cellulare: `333${Math.floor(1000000 + Math.random() * 9000000)}`,
      email: isBusiness ? `info@aziendabeta${i}.it` : `utente${i}@email.com`,
      cf_piva: isBusiness ? `0123456789${i % 10}` : `RSSMRA80A01H501${String.fromCharCode(65 + (i % 26))}`,
      indirizzo: `Via Roma ${i}`,
      citta: ["Milano", "Roma", "Napoli", "Torino", "Firenze"][i % 5],
      is_demo: true,
    });
  }
  return list;
}

const VENDITORI = ["Luca Perotta", "Alessandro Sandri", "Venditore 1", "Store Manager Roma"];
const NEGOZI = ["Store Milano Centro", "Store Roma Termini", "Roma Centro (RM001)", "Milano Centrale (MI001)"];
const PRODOTTI = ["Mobile", "Fisso", "Super Fibra", "Mobile 100GB", "Luce & Gas", "POS"];

function generateMockContrattiForClient(clientId) {
  const brands = ["FASTWEB", "VODAFONE", "WIND3", "WindTre", "EDISON", "ENI"];
  const cats = ["ENERGIA", "GAS", "MOBILE", "FISSO"];
  const stati = ["Attivo", "In lavorazione", "Attivato", "Sospeso", "Annullato"];
  const num = clientId.replace("CLIENT_", "");
  return [0, 1, 2].map((i) => {
    const day = String(10 + i).padStart(2, "0");
    const reg = `20/10/2023`;
    const att = `${day}/10/2023`;
    return {
      id: `CTR_${num}_${i}`,
      client_id: clientId,
      data: `${day}/03/2024`,
      brand: brands[Math.floor(Math.random() * brands.length)],
      categoria: cats[Math.floor(Math.random() * cats.length)],
      stato: stati[Math.floor(Math.random() * stati.length)],
      venditore: VENDITORI[Math.floor(Math.random() * VENDITORI.length)],
      prodotto: PRODOTTI[Math.floor(Math.random() * PRODOTTI.length)],
      negozio: NEGOZI[Math.floor(Math.random() * NEGOZI.length)],
      codice_attivazione: `ACT-${10000 + Math.floor(Math.random() * 90000)}`,
      data_registrazione: reg,
      data_attivazione: att,
      is_demo: true,
    };
  });
}

async function main() {
  console.log("Seeding clients...");
  const clients = generateMockClienti();
  const { error: errClients } = await supabase.from("clients").upsert(clients, { onConflict: "id" });
  if (errClients) {
    console.error("Clients insert error:", errClients.message);
    process.exit(1);
  }
  console.log("Inserted", clients.length, "clients.");

  console.log("Seeding contracts...");
  const contracts = clients.flatMap((c) => generateMockContrattiForClient(c.id));
  const BATCH = 100;
  for (let i = 0; i < contracts.length; i += BATCH) {
    const chunk = contracts.slice(i, i + BATCH);
    const { error } = await supabase.from("contracts").upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error("Contracts insert error:", error.message);
      process.exit(1);
    }
  }
  console.log("Inserted", contracts.length, "contracts.");
  console.log("Done. You can remove demo data later with: DELETE FROM contracts WHERE is_demo = true; DELETE FROM clients WHERE is_demo = true;");
}

main();

/**
 * Seed calendar: appointments, tasks. (Agenda blocks & meetings start empty.)
 * Run from project root: node scripts/seed-calendar.js
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

const appointments = [
  { date: "2026-03-03", time: "10:00", type: "outgoing", agente: "Luca Perotta", customer_address: "Via Roma 12, Roma", customer_name: "Mario Rossi", customer_phone: "3331234567", cf_piva: "RSSMRA80A01H501U", notes: "Cliente interessato a Vodafone fibra", status: "scheduled", is_demo: true },
  { date: "2026-03-03", time: "14:30", type: "incoming", agente: "Alessandro Sandri", store: "Roma Centro (RM001)", customer_name: "Anna Verdi", customer_phone: "3457654321", notes: "Rinnovo contratto Wind3", status: "attivato", is_demo: true },
  { date: "2026-03-05", time: "09:00", type: "incoming", agente: "Marco Bianchi", store: "Milano Centrale (MI001)", customer_name: "Giuseppe Ferrari", customer_phone: "3289876543", notes: "", status: "scheduled", is_demo: true },
  { date: "2026-03-10", time: "11:00", type: "outgoing", agente: "Giulia Rossi", customer_address: "Corso Buenos Aires 5, Milano", customer_name: "Francesca Bruno", customer_phone: "3401122334", notes: "Nuovo cliente energia", status: "scheduled", is_demo: true },
  { date: "2026-03-10", time: "15:00", type: "incoming", agente: "Luca Perotta", store: "Roma Est (RM002)", customer_name: "Carlo Neri", customer_phone: "3609988776", notes: "Assicurazione Generali", status: "da_richiamare", is_demo: true },
  { date: "2026-03-17", time: "10:30", type: "outgoing", agente: "Venditore 1", customer_address: "Via Napoli 88, Napoli", customer_name: "Lucia Esposito", customer_phone: "3211234567", notes: "", status: "scheduled", is_demo: true },
];

const tasks = [
  { title: "Richiamare per conferma contratto", date: "2026-03-03", time: "11:30", status: "da_fare", notes: "Controllare se ha inviato i documenti", client_ref: "Mario Rossi", created_by: "Luca Perotta", assigned_to: "Luca Perotta", is_demo: true },
  { title: "Verifica attivazione linea", date: "2026-03-03", status: "fatta", notes: "Linea OK", outcome_note: "Confermato con cliente.", client_ref: "Anna Verdi", created_by: "Alessandro Sandri", assigned_to: "Alessandro Sandri", is_demo: true },
  { title: "Sollecito pagamento", date: "2026-03-05", time: "16:00", status: "sospesa", client_ref: "Giuseppe Ferrari", created_by: "Marco Bianchi", assigned_to: "Giulia Rossi", is_demo: true },
];

async function main() {
  console.log("Seeding appointments...");
  const { error: e1 } = await supabase.from("appointments").insert(appointments);
  if (e1) {
    console.error("Appointments error:", e1.message);
    process.exit(1);
  }
  console.log("Inserted", appointments.length, "appointments.");

  console.log("Seeding calendar_tasks...");
  const { error: e2 } = await supabase.from("calendar_tasks").insert(tasks);
  if (e2) {
    console.error("Tasks error:", e2.message);
    process.exit(1);
  }
  console.log("Inserted", tasks.length, "tasks.");
  console.log("Done. Agenda blocks and meetings left empty.");
}

main();

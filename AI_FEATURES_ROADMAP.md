# AI Features Roadmap — Telefutura CRM

## High Impact — Easy to Build

### 1. Smart Client Lookup
When typing a name/CF in registra-contratto, AI autocompletes from existing clients and suggests "did you mean..." for typos in codice fiscale.

### 2. Contract Anomaly Detection
Flag contracts that look unusual:
- Same client signing 3 contracts in one day
- IMEI already used in another contract
- Missing required fields before submission

### 3. Auto-fill from Document Scan
Upload a photo of an ID card (carta d'identita) → AI extracts nome, cognome, CF, data nascita, indirizzo and pre-fills the anagrafica. Uses OCR + structured extraction via Claude Vision API.

---

## High Impact — Medium Effort

### 4. Sales Performance Insights (Dashboard)
AI analyzes dashboard data and generates natural language summaries:
- "Negozio Tiburtina is 23% below target — main gap is in Vodafone Fisso"
- "Marco R. has improved 15% this week, on track for bonus threshold"
- "WindTre Luce-Gas is underperforming across all stores"

### 5. Smart Product Recommendations
When registering a contract, AI suggests upsells based on what the client already has:
- "This client has WindTre Mobile — suggest Fisso convergente for discount"
- "Client's contract expires in 30 days — suggest renewal offer"

### 6. Predictive KO Detection
Based on historical patterns, flag contracts that are likely to become KO (rejected/unpaid). Show a risk score on each contract in tracking PDA.

---

## Medium Impact — Easy to Build

### 7. Natural Language Search
Search contracts/clients by typing natural language:
- "show me all Vodafone contracts from last week that are still pending"
- "find clients in Roma with expired WindTre contracts"

### 8. Auto-categorize Communications
When a new comunicazione comes in, AI categorizes it (urgente, informativo, azione richiesta) and suggests which stores/roles it's relevant to.

### 9. Meeting Notes Summary
After a calendar meeting, AI generates a summary and action items from notes.

---

## Recommended Implementation Order

| Priority | Feature | Effort | Value |
|----------|---------|--------|-------|
| 1 | Document Scan Auto-fill | Medium | Very High |
| 2 | Dashboard Insights | Easy | High |
| 3 | Contract Anomaly Detection | Easy | High |
| 4 | Smart Client Lookup | Easy | Medium |
| 5 | Predictive KO Detection | Medium | High |
| 6 | Smart Product Recommendations | Medium | High |
| 7 | Natural Language Search | Medium | Medium |
| 8 | Auto-categorize Communications | Easy | Medium |
| 9 | Meeting Notes Summary | Easy | Low |

---

## Tech Stack for AI Features

- **Claude API** (claude-sonnet-4-6) for text analysis, summaries, recommendations
- **Claude Vision** for document/ID card scanning
- **Supabase Edge Functions** for server-side AI processing
- **Supabase pgvector** (optional) for semantic search on client/contract data

"use client";

import { useState } from "react";
import { Search, UserCheck, UserPlus, Upload, X, CheckCircle, Send } from "lucide-react";
import { cn } from "@/utils";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_VENDORS = [
    "Luca Perotta", "Alessandro Sandri", "Marco Bianchi",
    "Giulia Rossi", "Venditore 1", "Venditore 2",
];

// Mock customer DB — will be replaced with Supabase queries
const MOCK_CUSTOMERS_CONSUMER: Record<string, {
    nome: string; cognome: string; cf: string;
    email: string; fisso: string; cellulare: string; domicilio: string;
}> = {
    "RSSMRA80A01H501U": { nome: "Mario", cognome: "Rossi", cf: "RSSMRA80A01H501U", email: "mario.rossi@email.com", fisso: "06 1234567", cellulare: "333 1234567", domicilio: "Via Roma 12, 00100 Roma" },
    "VRDANN70B02H502V": { nome: "Anna", cognome: "Verdi", cf: "VRDANN70B02H502V", email: "anna.verdi@email.com", fisso: "", cellulare: "345 9876543", domicilio: "Corso Buenos Aires 5, 20124 Milano" },
};

const MOCK_CUSTOMERS_BUSINESS: Record<string, {
    ragioneSociale: string; piva: string; referente: string;
    fisso: string; mobile: string; email: string;
    pec: string; codiceUnivoco: string; sedeLegale: string;
}> = {
    "12345678901": { ragioneSociale: "Rossi S.r.l.", piva: "12345678901", referente: "Mario Rossi", fisso: "06 9876543", mobile: "333 9876543", email: "info@rossi.it", pec: "rossi@pec.it", codiceUnivoco: "ABC1234", sedeLegale: "Via Milano 45, 00100 Roma" },
};

// ─── Brand placeholder — will be replaced with full config per brand/product ─

const BRANDS_PLACEHOLDER = [
    { id: "windtre", name: "WindTre", logo: "🌬️", available: true },
    { id: "vodafone", name: "Vodafone", logo: "🔴", available: false },
    { id: "sky", name: "Sky", logo: "🌐", available: false },
    { id: "iliad", name: "Iliad", logo: "🌸", available: false },
    { id: "energy", name: "Energy", logo: "⚡", available: false },
    { id: "fastweb", name: "Fastweb", logo: "🚀", available: false },
];

// ─── FIELD COMPONENT ──────────────────────────────────────────────────────────

interface FieldProps {
    label: string;
    required?: boolean;
    placeholder?: string;
    type?: "text" | "email" | "tel";
    value?: string;
    onChange?: (v: string) => void;
    prefilled?: boolean;
    disabled?: boolean;
    mono?: boolean;
}

function Field({ label, required, placeholder, type = "text", value, onChange, prefilled, disabled, mono }: FieldProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {label} {required && <span className="text-rose-400">*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value ?? ""}
                onChange={e => onChange?.(e.target.value)}
                disabled={disabled}
                readOnly={disabled}
                className={cn(
                    "glass-input w-full text-sm",
                    prefilled && "border-emerald-500/50 bg-emerald-500/5",
                    mono && "font-mono uppercase",
                    disabled && "opacity-60 cursor-not-allowed"
                )}
            />
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function InviaPda() {
    // Step tracking: 1=Venditore, 2=TipoCliente, 3=Anagrafica, 4=Brand, 5=Allegati
    const [step, setStep] = useState(1);

    // Step 1
    const [venditore, setVenditore] = useState("");

    // Step 2
    const [tipoCliente, setTipoCliente] = useState<"consumer" | "business" | null>(null);

    // Step 3 — Lookup
    const [lookupValue, setLookupValue] = useState("");
    const [customerFound, setCustomerFound] = useState<boolean | null>(null);

    // Step 3 — Consumer fields
    const [nome, setNome] = useState("");
    const [cognome, setCognome] = useState("");
    const [cf, setCf] = useState("");
    const [email, setEmail] = useState("");
    const [fisso, setFisso] = useState("");
    const [cellulare, setCellulare] = useState("");
    const [domicilio, setDomicilio] = useState("");

    // Step 3 — Business fields
    const [ragioneSociale, setRagioneSociale] = useState("");
    const [piva, setPiva] = useState("");
    const [referente, setReferente] = useState("");
    const [fissoB, setFissoB] = useState("");
    const [mobileB, setMobileB] = useState("");
    const [emailB, setEmailB] = useState("");
    const [pec, setPec] = useState("");
    const [codiceUnivoco, setCodiceUnivoco] = useState("");
    const [sedeLegale, setSedeLegale] = useState("");

    // Shared Anagrafica Fields
    const [iban, setIban] = useState("");
    const [noteAnagrafica, setNoteAnagrafica] = useState("");

    // Step 4
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [prodotto, setProdotto] = useState("");

    // Step 5 — Files
    const [filesDocId, setFilesDocId] = useState<File[]>([]);
    const [filesContratti, setFilesContratti] = useState<File[]>([]);
    const [filesAltro, setFilesAltro] = useState<File[]>([]);

    // Submit state
    const [isSubmitted, setIsSubmitted] = useState(false);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const reset = () => {
        setStep(1); setVenditore(""); setTipoCliente(null);
        setLookupValue(""); setCustomerFound(null);
        setNome(""); setCognome(""); setCf(""); setEmail(""); setFisso(""); setCellulare(""); setDomicilio("");
        setRagioneSociale(""); setPiva(""); setReferente(""); setFissoB(""); setMobileB("");
        setEmailB(""); setPec(""); setCodiceUnivoco(""); setSedeLegale("");
        setIban(""); setNoteAnagrafica("");
        setSelectedBrand(null); setProdotto("");
        setFilesDocId([]); setFilesContratti([]); setFilesAltro([]);
    };

    const handleLookup = () => {
        const key = lookupValue.toUpperCase().trim();
        if (tipoCliente === "consumer") {
            const match = MOCK_CUSTOMERS_CONSUMER[key];
            if (match) {
                setCustomerFound(true);
                setNome(match.nome); setCognome(match.cognome); setCf(match.cf);
                setEmail(match.email); setFisso(match.fisso); setCellulare(match.cellulare); setDomicilio(match.domicilio);
            } else {
                setCustomerFound(false);
                setCf(key);
                setNome(""); setCognome(""); setEmail(""); setFisso(""); setCellulare(""); setDomicilio("");
            }
        } else {
            const match = MOCK_CUSTOMERS_BUSINESS[key];
            if (match) {
                setCustomerFound(true);
                setRagioneSociale(match.ragioneSociale); setPiva(match.piva); setReferente(match.referente);
                setFissoB(match.fisso); setMobileB(match.mobile); setEmailB(match.email);
                setPec(match.pec); setCodiceUnivoco(match.codiceUnivoco); setSedeLegale(match.sedeLegale);
            } else {
                setCustomerFound(false);
                setPiva(key);
                setRagioneSociale(""); setReferente(""); setFissoB(""); setMobileB("");
                setEmailB(""); setPec(""); setCodiceUnivoco(""); setSedeLegale("");
            }
        }
    };

    const addFiles = (setter: React.Dispatch<React.SetStateAction<File[]>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setter(prev => [...prev, ...Array.from(e.target.files!)]);
    };
    const removeFile = (setter: React.Dispatch<React.SetStateAction<File[]>>, i: number) => {
        setter(prev => prev.filter((_, idx) => idx !== i));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        setTimeout(() => { setIsSubmitted(false); reset(); }, 4000);
    };

    // ── Step config ───────────────────────────────────────────────────────────

    const STEPS = ["Venditore", "Tipo Cliente", "Anagrafica", "Brand & Prodotto", "Allegati"];

    const stepCompleted = (s: number) => {
        if (s === 1) return !!venditore;
        if (s === 2) return !!tipoCliente;
        if (s === 3) return customerFound !== null;
        if (s === 4) return !!selectedBrand;
        if (s === 5) return (filesDocId.length > 0 || filesContratti.length > 0 || filesAltro.length > 0);
        return false;
    };

    const canProceed = stepCompleted(step);

    // ─────────────────────────────────────────────────────────────────────────

    if (isSubmitted) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <CheckCircle className="w-16 h-16 text-emerald-400" />
                <h2 className="text-2xl font-bold text-white">PDA Inviata!</h2>
                <p className="text-slate-400">La pratica è stata trasmessa al back office con successo.</p>
                <button onClick={reset} className="primary-btn px-6 py-2.5 mt-2">Nuova PDA</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">

            {/* Header */}
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Invia PDA</h2>
                    <p className="text-slate-400 text-sm">Compila i dati per trasmettere la PDA al back office</p>
                </div>
                {step > 1 && (
                    <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 transition-all">
                        ↩ Ricomincia
                    </button>
                )}
            </div>

            {/* Steps bar */}
            <div className="flex gap-1.5 mb-6">
                {STEPS.map((s, i) => {
                    const n = i + 1;
                    const done = stepCompleted(n) && n < step;
                    const active = n === step;
                    return (
                        <div key={n} className={cn(
                            "flex-1 text-center py-2 px-1 rounded-lg text-[10px] font-semibold transition-all",
                            active ? "bg-indigo-600 text-white" :
                                done ? "bg-emerald-600/80 text-white" :
                                    "bg-white/[0.04] text-slate-600"
                        )}>
                            {done ? "✓ " : ""}{s}
                        </div>
                    );
                })}
            </div>

            {/* ── STEP 1: VENDITORE ─────────────────────────────────────────────── */}
            {step === 1 && (
                <div className="glass-card p-6 space-y-5">
                    <StepHeader n={1} label="Venditore" color="text-indigo-400" />
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Seleziona il tuo nome <span className="text-rose-400">*</span>
                        </label>
                        <select
                            className="glass-input w-full text-sm"
                            value={venditore}
                            onChange={e => setVenditore(e.target.value)}
                        >
                            <option value="">— Seleziona venditore —</option>
                            {MOCK_VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <NextBtn disabled={!venditore} onClick={() => setStep(2)} />
                </div>
            )}

            {/* ── STEP 2: TIPO CLIENTE ──────────────────────────────────────────── */}
            {step === 2 && (
                <div className="glass-card p-6 space-y-5">
                    <StepHeader n={2} label="Tipo Cliente" color="text-purple-400" />
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: "consumer" as const, icon: "👤", label: "Consumer (Privato)", desc: "Persona fisica / Codice Fiscale" },
                            { id: "business" as const, icon: "🏢", label: "Business (Azienda)", desc: "Azienda / Partita IVA" },
                        ].map(o => (
                            <button
                                key={o.id}
                                onClick={() => { setTipoCliente(o.id); setCustomerFound(null); setLookupValue(""); }}
                                className={cn(
                                    "p-5 rounded-xl border text-center transition-all",
                                    tipoCliente === o.id
                                        ? "border-purple-500/60 bg-purple-500/10"
                                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                                )}
                            >
                                <div className="text-3xl mb-2">{o.icon}</div>
                                <div className={cn("font-bold text-sm mb-1", tipoCliente === o.id ? "text-purple-300" : "text-white")}>{o.label}</div>
                                <div className="text-[11px] text-slate-500">{o.desc}</div>
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <BackBtn onClick={() => setStep(1)} />
                        <NextBtn disabled={!tipoCliente} onClick={() => setStep(3)} />
                    </div>
                </div>
            )}

            {/* ── STEP 3: ANAGRAFICA ────────────────────────────────────────────── */}
            {step === 3 && (
                <div className="glass-card p-6 space-y-5">
                    <StepHeader n={3} label="Anagrafica Cliente" color="text-blue-400"
                        sub={tipoCliente === "consumer" ? "Consumer" : "Business"} />

                    {/* Lookup bar */}
                    <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 space-y-3">
                        <p className="text-xs font-semibold text-slate-400">
                            {tipoCliente === "consumer" ? "Codice Fiscale" : "Partita IVA"} — ricerca cliente esistente
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={lookupValue}
                                onChange={e => setLookupValue(e.target.value.toUpperCase())}
                                placeholder={tipoCliente === "consumer" ? "es. RSSMRA80A01H501U" : "es. 12345678901"}
                                className="glass-input flex-1 font-mono uppercase text-sm"
                                onKeyDown={e => e.key === "Enter" && handleLookup()}
                            />
                            <button onClick={handleLookup} className="primary-btn px-4 py-2 text-xs flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5" /> Cerca
                            </button>
                            <button
                                onClick={() => { setCustomerFound(false); setLookupValue(""); }}
                                className="px-3 py-2 text-xs rounded-lg border border-white/15 text-slate-400 hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5"
                            >
                                <UserPlus className="w-3.5 h-3.5" /> Nuovo
                            </button>
                        </div>
                        {customerFound === true && (
                            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                <UserCheck className="w-3.5 h-3.5" /> Cliente trovato — dati pre-compilati, verifica e procedi.
                            </div>
                        )}
                        {customerFound === false && (
                            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                                <UserPlus className="w-3.5 h-3.5" /> Nuovo cliente — compila i dati manualmente.
                            </div>
                        )}
                    </div>

                    {/* Fields — only shown after lookup */}
                    {customerFound !== null && (
                        <>
                            {tipoCliente === "consumer" ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Nome" required value={nome} onChange={setNome} prefilled={!!customerFound} />
                                    <Field label="Cognome" required value={cognome} onChange={setCognome} prefilled={!!customerFound} />
                                    <Field label="Codice Fiscale" required value={cf} onChange={setCf} prefilled={!!customerFound} mono />
                                    <Field label="Email" type="email" value={email} onChange={setEmail} prefilled={!!customerFound} />
                                    <Field label="Numero Fisso" type="tel" placeholder="es. 06 1234567" value={fisso} onChange={setFisso} prefilled={!!customerFound} />
                                    <Field label="Recapito Cellulare" type="tel" placeholder="es. 333 1234567" value={cellulare} onChange={setCellulare} prefilled={!!customerFound} />
                                    <div className="col-span-2">
                                        <Field label="IBAN" placeholder="IT00..." value={iban} onChange={setIban} prefilled={!!customerFound} mono />
                                    </div>
                                    <div className="col-span-2">
                                        <Field label="Domicilio" placeholder="Via, Numero, CAP, Città" value={domicilio} onChange={setDomicilio} prefilled={!!customerFound} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Note</label>
                                        <textarea
                                            placeholder="Inserisci eventuali note (es. orari di reperibilità, particolarità contrattuali...)"
                                            value={noteAnagrafica}
                                            onChange={e => setNoteAnagrafica(e.target.value)}
                                            disabled={!!customerFound && Boolean(noteAnagrafica)} /* if prefilled with a note, maybe disabled, else editable */
                                            className={cn(
                                                "glass-input w-full text-sm min-h-[80px] resize-y",
                                                !!customerFound && "border-emerald-500/50 bg-emerald-500/5"
                                            )}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Ragione Sociale" required value={ragioneSociale} onChange={setRagioneSociale} prefilled={!!customerFound} />
                                    <Field label="Partita IVA" required value={piva} onChange={setPiva} prefilled={!!customerFound} mono />
                                    <Field label="Referente" required value={referente} onChange={setReferente} prefilled={!!customerFound} />
                                    <Field label="Numero Fisso" type="tel" placeholder="es. 06 1234567" value={fissoB} onChange={setFissoB} prefilled={!!customerFound} />
                                    <Field label="Numero Mobile" type="tel" placeholder="es. 333 1234567" value={mobileB} onChange={setMobileB} prefilled={!!customerFound} />
                                    <Field label="Email" type="email" value={emailB} onChange={setEmailB} prefilled={!!customerFound} />
                                    <Field label="PEC" type="email" placeholder="es. azienda@pec.it" value={pec} onChange={setPec} prefilled={!!customerFound} />
                                    <Field label="Codice Univoco / SDI" placeholder="es. ABC1234" value={codiceUnivoco} onChange={setCodiceUnivoco} prefilled={!!customerFound} mono />
                                    <div className="col-span-2">
                                        <Field label="IBAN" placeholder="IT00..." value={iban} onChange={setIban} prefilled={!!customerFound} mono />
                                    </div>
                                    <div className="col-span-2">
                                        <Field label="Sede Legale" placeholder="Via, Numero, CAP, Città" value={sedeLegale} onChange={setSedeLegale} prefilled={!!customerFound} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Note</label>
                                        <textarea
                                            placeholder="Inserisci eventuali note (es. orari di reperibilità, particolarità contrattuali...)"
                                            value={noteAnagrafica}
                                            onChange={e => setNoteAnagrafica(e.target.value)}
                                            className={cn(
                                                "glass-input w-full text-sm min-h-[80px] resize-y",
                                                !!customerFound && "border-emerald-500/50 bg-emerald-500/5"
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex gap-3">
                        <BackBtn onClick={() => setStep(2)} />
                        <NextBtn disabled={customerFound === null} onClick={() => setStep(4)} />
                    </div>
                </div>
            )}

            {/* ── STEP 4: BRAND & PRODOTTO ──────────────────────────────────────── */}
            {step === 4 && (
                <div className="glass-card p-6 space-y-5">
                    <StepHeader n={4} label="Brand & Prodotto" color="text-orange-400" />

                    <p className="text-xs text-slate-500">Seleziona il brand da attivare.</p>

                    {/* Brand grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {BRANDS_PLACEHOLDER.map(b => (
                            <button
                                key={b.id}
                                onClick={() => { if (b.available) { setSelectedBrand(b.id); setProdotto(""); } }}
                                className={cn(
                                    "relative flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all",
                                    selectedBrand === b.id
                                        ? "border-indigo-500/60 bg-indigo-500/10"
                                        : b.available
                                            ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                                            : "border-white/5 bg-white/[0.01] opacity-35 cursor-not-allowed"
                                )}
                            >
                                <span className="text-2xl">{b.logo}</span>
                                <span className={cn("text-xs font-semibold", selectedBrand === b.id ? "text-indigo-300" : "text-slate-300")}>
                                    {b.name}
                                </span>
                                {!b.available && (
                                    <span className="absolute top-1 right-1 text-[8px] text-slate-600">presto</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Product placeholder — will be populated per brand */}
                    {selectedBrand && (
                        <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
                            <p className="text-xs font-semibold text-slate-400 mb-3">
                                Prodotto / Servizio <span className="text-rose-400">*</span>
                            </p>
                            <select
                                className="glass-input w-full text-sm"
                                value={prodotto}
                                onChange={e => setProdotto(e.target.value)}
                            >
                                <option value="">— Seleziona prodotto —</option>
                                {/* Placeholder options — full product config will be added per brand */}
                                <option value="Mobile GA">Mobile GA</option>
                                <option value="Mobile CB">Mobile CB</option>
                                <option value="Offerta Fisso">Offerta Fisso</option>
                                <option value="Luce e Gas">Luce e Gas</option>
                                <option value="Altro">Altro</option>
                            </select>
                            <p className="text-[10px] text-slate-600 mt-2">
                                ℹ La lista prodotti completa verrà configurata per brand nella prossima release.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <BackBtn onClick={() => setStep(3)} />
                        <NextBtn disabled={!selectedBrand || !prodotto} onClick={() => setStep(5)} />
                    </div>
                </div>
            )}

            {/* ── STEP 5: ALLEGATI ──────────────────────────────────────────────── */}
            {step === 5 && (
                <div className="glass-card p-6 space-y-5">
                    <StepHeader n={5} label="Carica Allegati" color="text-cyan-400" />

                    {/* Summary recap */}
                    <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                        <RecapRow label="Venditore" value={venditore} />
                        <RecapRow label="Tipo Cliente" value={tipoCliente === "consumer" ? "Consumer (Privato)" : "Business"} />
                        <RecapRow label="Cliente" value={tipoCliente === "consumer" ? `${nome} ${cognome}` : ragioneSociale} />
                        <RecapRow label="IBAN" value={iban} />
                        <RecapRow label="Note" value={noteAnagrafica} />
                        <RecapRow label="Brand" value={BRANDS_PLACEHOLDER.find(b => b.id === selectedBrand)?.name ?? ""} />
                        <RecapRow label="Prodotto" value={prodotto} />
                    </div>

                    {/* Upload zones grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {([
                            { label: "Documento d'identità", icon: "🪪", filesVar: filesDocId, setter: setFilesDocId },
                            { label: "Contratti", icon: "📄", filesVar: filesContratti, setter: setFilesContratti },
                            { label: "Altro", icon: "📁", filesVar: filesAltro, setter: setFilesAltro },
                        ] as const).map(cat => (
                            <div key={cat.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                                <div className="text-base mb-1">{cat.icon}</div>
                                <p className="text-xs font-semibold text-slate-300 mb-0.5">{cat.label}</p>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl h-20 cursor-pointer hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all mt-3">
                                    <Upload className="w-4 h-4 text-slate-500 mb-1" />
                                    <span className="text-[10px] text-slate-500">Trascina o <span className="text-cyan-400">scegli</span></span>
                                    <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={addFiles(cat.setter as React.Dispatch<React.SetStateAction<File[]>>)} />
                                </label>
                                {cat.filesVar.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {cat.filesVar.map((f, i) => (
                                            <li key={i} className="flex items-center justify-between text-[10px] text-slate-400 bg-white/[0.03] rounded px-2 py-1">
                                                <span className="truncate max-w-[80%]">{f.name}</span>
                                                <button onClick={() => removeFile(cat.setter as React.Dispatch<React.SetStateAction<File[]>>, i)}
                                                    className="text-slate-600 hover:text-rose-400 ml-1">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <BackBtn onClick={() => setStep(4)} />
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Send className="w-4 h-4" /> Invia PDA
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── SMALL REUSABLE COMPONENTS ───────────────────────────────────────────────

function StepHeader({ n, label, color, sub }: { n: number; label: string; color: string; sub?: string }) {
    return (
        <div className="flex items-center gap-2 mb-1">
            <span className={cn("w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0", color, "border-current/50")}>
                {n}
            </span>
            <span className={cn("text-xs font-bold uppercase tracking-wider", color)}>
                Step {n} — {label}
            </span>
            {sub && (
                <span className="text-[10px] text-slate-600 bg-white/[0.04] px-2 py-0.5 rounded">{sub}</span>
            )}
        </div>
    );
}

function NextBtn({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
                disabled
                    ? "bg-white/[0.04] text-slate-600 cursor-not-allowed"
                    : "primary-btn"
            )}
        >
            Avanti →
        </button>
    );
}

function BackBtn({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} className="px-5 py-2.5 rounded-xl border border-white/15 text-slate-400 hover:text-white hover:border-white/30 text-sm font-semibold transition-all">
            ← Indietro
        </button>
    );
}

function RecapRow({ label, value }: { label: string; value: string }) {
    return value ? (
        <>
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-300 font-medium">{value}</span>
        </>
    ) : null;
}

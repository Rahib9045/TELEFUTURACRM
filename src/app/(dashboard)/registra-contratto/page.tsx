"use client";

import { useState } from "react";
import { CheckCircle, Upload, X } from "lucide-react";
import { cn } from "@/utils";

// Mock data — will be replaced with Supabase queries
const MOCK_VENDORS = [
    "Luca Perotta", "Alessandro Sandri", "Marco Bianchi", "Giulia Rossi", "Venditore 1", "Venditore 2",
];

const MOCK_STORES = [
    { code: "RM001", name: "Roma Centro" },
    { code: "RM002", name: "Roma Est" },
    { code: "MI001", name: "Milano Centrale" },
    { code: "MI002", name: "Milano Nord" },
    { code: "NA001", name: "Napoli Centro" },
    { code: "TO001", name: "Torino Centro" },
];

const BRANDS = [
    { name: "Vodafone", types: ["Mobile", "Fibra"] },
    { name: "Wind3", types: ["Mobile", "Fibra"] },
    { name: "Fastweb", types: ["Mobile", "Fibra"] },
    { name: "Sky", types: ["Fibra", "TV"] },
    { name: "Edison Business", types: ["Energia"] },
    { name: "Edison Consumer", types: ["Energia"] },
    { name: "Enel Business", types: ["Energia"] },
    { name: "Enel Consumer", types: ["Energia"] },
    { name: "Generali Assicurazioni", types: ["Assicurazione"] },
];

const CITIES = ["Roma", "Milano", "Napoli", "Torino", "Firenze", "Bologna", "Palermo", "Genova", "Bari", "Venezia"];

type ContractType = "Mobile" | "Fibra" | "Energia" | "Assicurazione" | "TV" | "";

export default function RegistraContratto() {
    const [submitted, setSubmitted] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    // Form state
    const [venditore, setVenditore] = useState("");
    const [tipoCliente, setTipoCliente] = useState<"consumer" | "business" | "">("");
    const [identificativo, setIdentificativo] = useState("");
    const [brand, setBrand] = useState("");
    const [tipoContratto, setTipoContratto] = useState<ContractType>("");
    const [cittaVenditore, setCittaVenditore] = useState("");
    const [negozio, setNegozio] = useState("");

    // Mobile-specific
    const [smartphoneFornitо, setSmartphoneFornito] = useState<"si" | "no" | "">("");
    const [smartphoneModel, setSmartphoneModel] = useState("");
    const [imei, setImei] = useState("");

    // Fibra-specific
    const [indirizzoInstallazione, setIndirizzoInstallazione] = useState("");

    // Energia-specific
    const [tipoFornitura, setTipoFornitura] = useState<"luce" | "gas" | "dual" | "">("");
    const [pod, setPod] = useState("");
    const [pdr, setPdr] = useState("");

    // Assicurazione-specific
    const [garanzia, setGaranzia] = useState<"si" | "no" | "">("");
    const [tipoCopert, setTipoCopert] = useState("");

    const selectedBrandTypes = BRANDS.find(b => b.name === brand)?.types ?? [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (idx: number) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Replace with Supabase insert
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Registra Contratto</h2>
                <p className="text-slate-400">Registra un contratto già attivato in negozio nel sistema CRM.</p>
            </div>

            {submitted && (
                <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">Contratto registrato con successo nel CRM!</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1: Venditore */}
                <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-white mb-4 pb-2 border-b border-white/10">
                        1. Venditore attivante
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Venditore *</label>
                            <select className="glass-input w-full" value={venditore} onChange={e => setVenditore(e.target.value)} required>
                                <option value="">Seleziona venditore...</option>
                                {MOCK_VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Inserimento per conto di</label>
                            <select className="glass-input w-full">
                                <option value="">Sé stesso (default)</option>
                                {MOCK_VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Solo se si registra per un collega assente</p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Cliente */}
                <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-white mb-4 pb-2 border-b border-white/10">
                        2. Tipo cliente
                    </h3>
                    <div className="flex gap-4 mb-4">
                        {(["consumer", "business"] as const).map(tipo => (
                            <button
                                key={tipo}
                                type="button"
                                onClick={() => { setTipoCliente(tipo); setIdentificativo(""); }}
                                className={cn(
                                    "flex-1 py-3 rounded-xl border font-medium transition-all",
                                    tipoCliente === tipo
                                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]"
                                )}
                            >
                                {tipo === "consumer" ? "👤 Consumer (Privato)" : "🏢 Business (Azienda)"}
                            </button>
                        ))}
                    </div>
                    {tipoCliente && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {tipoCliente === "consumer" ? "Codice Fiscale *" : "Partita IVA *"}
                            </label>
                            <input
                                type="text"
                                className="glass-input w-full font-mono uppercase"
                                placeholder={tipoCliente === "consumer" ? "RSSMRA80A01H501U" : "12345678901"}
                                value={identificativo}
                                onChange={e => setIdentificativo(e.target.value.toUpperCase())}
                                maxLength={tipoCliente === "consumer" ? 16 : 11}
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Section 3: Brand & Tipo Contratto */}
                <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-white mb-4 pb-2 border-b border-white/10">
                        3. Brand e tipo contratto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Brand *</label>
                            <select
                                className="glass-input w-full"
                                value={brand}
                                onChange={e => { setBrand(e.target.value); setTipoContratto(""); }}
                                required
                            >
                                <option value="">Seleziona brand...</option>
                                {BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo contratto *</label>
                            <select
                                className="glass-input w-full"
                                value={tipoContratto}
                                onChange={e => setTipoContratto(e.target.value as ContractType)}
                                disabled={!brand}
                                required
                            >
                                <option value="">Seleziona tipo...</option>
                                {selectedBrandTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Conditional fields per contract type */}
                    {tipoContratto === "Mobile" && (
                        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-4">
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dettagli Mobile</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Smartphone fornito? *</label>
                                <div className="flex gap-3">
                                    {(["si", "no"] as const).map(v => (
                                        <button key={v} type="button"
                                            onClick={() => setSmartphoneFornito(v)}
                                            className={cn("px-6 py-2 rounded-lg border font-medium transition-all text-sm",
                                                smartphoneFornitо === v
                                                    ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                                                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]"
                                            )}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                                    ))}
                                </div>
                            </div>
                            {smartphoneFornitо === "si" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Modello smartphone *</label>
                                        <input type="text" className="glass-input w-full" placeholder="es. iPhone 15, Samsung S24" value={smartphoneModel} onChange={e => setSmartphoneModel(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">IMEI *</label>
                                        <input type="text" className="glass-input w-full font-mono" placeholder="15 cifre" value={imei} onChange={e => setImei(e.target.value)} maxLength={15} required />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tipoContratto === "Fibra" && (
                        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-4">
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dettagli Fibra</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Indirizzo di installazione *</label>
                                <input type="text" className="glass-input w-full" placeholder="Via, Numero civico, Città, CAP" value={indirizzoInstallazione} onChange={e => setIndirizzoInstallazione(e.target.value)} required />
                            </div>
                        </div>
                    )}

                    {tipoContratto === "Energia" && (
                        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-4">
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dettagli Energia</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo fornitura *</label>
                                <div className="flex gap-3">
                                    {(["luce", "gas", "dual"] as const).map(v => (
                                        <button key={v} type="button"
                                            onClick={() => setTipoFornitura(v)}
                                            className={cn("px-6 py-2 rounded-lg border font-medium transition-all text-sm capitalize",
                                                tipoFornitura === v
                                                    ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                                                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]"
                                            )}>{v === "dual" ? "Dual (Luce + Gas)" : v.charAt(0).toUpperCase() + v.slice(1)}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(tipoFornitura === "luce" || tipoFornitura === "dual") && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Codice POD</label>
                                        <input type="text" className="glass-input w-full font-mono uppercase" placeholder="IT001E..." value={pod} onChange={e => setPod(e.target.value.toUpperCase())} />
                                    </div>
                                )}
                                {(tipoFornitura === "gas" || tipoFornitura === "dual") && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Codice PDR</label>
                                        <input type="text" className="glass-input w-full font-mono" placeholder="12345678901234" value={pdr} onChange={e => setPdr(e.target.value)} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {tipoContratto === "Assicurazione" && (
                        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-4">
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dettagli Assicurazione</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Garanzia fornita? *</label>
                                <div className="flex gap-3">
                                    {(["si", "no"] as const).map(v => (
                                        <button key={v} type="button"
                                            onClick={() => setGaranzia(v)}
                                            className={cn("px-6 py-2 rounded-lg border font-medium transition-all text-sm",
                                                garanzia === v
                                                    ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                                                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]"
                                            )}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo di copertura</label>
                                <input type="text" className="glass-input w-full" placeholder="es. Infortuni, Vita, Casa..." value={tipoCopert} onChange={e => setTipoCopert(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 4: Location */}
                <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-white mb-1 pb-2 border-b border-white/10">
                        4. Dati di localizzazione
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Necessari per split commissioni e reportistica</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Città del venditore *</label>
                            <select className="glass-input w-full" value={cittaVenditore} onChange={e => setCittaVenditore(e.target.value)} required>
                                <option value="">Seleziona città...</option>
                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Negozio di attivazione *</label>
                            <select className="glass-input w-full" value={negozio} onChange={e => setNegozio(e.target.value)} required>
                                <option value="">Seleziona negozio...</option>
                                {MOCK_STORES.map(s => <option key={s.code} value={s.code}>[{s.code}] {s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 5: Attachments */}
                <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-white mb-4 pb-2 border-b border-white/10">
                        5. Allegati
                    </h3>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/15 rounded-xl cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all">
                        <Upload className="w-7 h-7 text-slate-500 mb-2" />
                        <span className="text-sm text-slate-400">Trascina qui o <span className="text-indigo-400">scegli file</span></span>
                        <span className="text-xs text-slate-600 mt-1">PDF, JPG, PNG — max 10MB per file</span>
                        <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                    </label>
                    {files.length > 0 && (
                        <ul className="mt-3 space-y-2">
                            {files.map((f, i) => (
                                <li key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/8 text-sm">
                                    <span className="text-slate-300 truncate">{f.name}</span>
                                    <button type="button" onClick={() => removeFile(i)} className="ml-3 text-slate-500 hover:text-rose-400 flex-shrink-0">
                                        <X className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 justify-end">
                    <button type="button" className="h-11 px-8 rounded-xl font-medium bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                        Annulla
                    </button>
                    <button type="submit" className="primary-btn h-11 px-8">
                        Registra Contratto
                    </button>
                </div>
            </form>
        </div>
    );
}

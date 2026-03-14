"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Download, X } from "lucide-react";
import { STATUS_OPTIONS, getStatusColor } from "@/components/StatusDropdown";
import { DatePickerInput } from "@/components/DatePickerInput";
import { cn } from "@/utils";
import { supabase } from "@/lib/supabaseClient";

const trackingColumns = [
    { header: "Avatar", accessor: "avatar", className: "w-16" },
    { header: "Categoria", accessor: "categoria" },
    { header: "Brand", accessor: "brand" },
    { header: "Venditore", accessor: "venditore" },
    { header: "Inviato il", accessor: "inviato_il" },
    { header: "Stato", accessor: "stato", className: "text-center" },
    { header: "Nominativo", accessor: "nominativo" },
];

type TrackingRow = { id: string; avatar: string; categoria: string; brand: string; venditore: string; inviato_il: string; stato: string; nominativo: string };

type RawRow = Record<string, unknown> & { clients?: Record<string, unknown> | null };

function mapContractToTracking(c: RawRow, client?: Record<string, unknown> | null): TrackingRow {
    const nome = (client?.nome as string) ?? "";
    const cognome = (client?.cognome as string) ?? "";
    const ragione = (client?.ragione_sociale as string) ?? "";
    const tipo = (client?.tipo as string) ?? "consumer";
    const nominativo = ragione.trim() || [nome, cognome].filter(Boolean).join(" ").trim() || "—";
    const avatar = tipo === "business" ? "🏢" : "👤";
    const inviato = (c.data_registrazione as string) || (c.data as string) || (c.created_at as string) || "";
    const inviatoFormatted = inviato ? (inviato.includes("T") ? new Date(inviato).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : inviato) : "—";
    return {
        id: (c.id as string) ?? "",
        avatar,
        categoria: (c.categoria as string) ?? "—",
        brand: (c.brand as string) ?? "—",
        venditore: (c.venditore as string) ?? "—",
        inviato_il: inviatoFormatted,
        stato: (c.stato as string) ?? "—",
        nominativo,
    };
}

function parseDateSafe(val: string): Date | null {
    if (!val || !val.trim()) return null;
    const d = val.trim();
    if (d.includes("T")) return new Date(d);
    const [day, month, year] = d.split(/[/-]/).map(Number);
    if (year && month && day) {
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
    }
    return null;
}

export default function TrackingPda() {
    const [rawList, setRawList] = useState<RawRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStato, setFilterStato] = useState("");
    const [filterVenditore, setFilterVenditore] = useState("");
    const [filterCategoria, setFilterCategoria] = useState("");
    const [filterRagione, setFilterRagione] = useState("");
    const [filterCodiceContratto, setFilterCodiceContratto] = useState("");
    const [filterCodiceOrdine, setFilterCodiceOrdine] = useState("");
    const [daDataImp, setDaDataImp] = useState("");
    const [aDataImp, setADataImp] = useState("");
    const [daDataCreazione, setDaDataCreazione] = useState("");
    const [aDataCreazione, setADataCreazione] = useState("");
    const [daDataFirma, setDaDataFirma] = useState("");
    const [aDataFirma, setADataFirma] = useState("");
    const [daDataGestione, setDaDataGestione] = useState("");
    const [aDataGestione, setADataGestione] = useState("");
    const [daDataAttivazione, setDaDataAttivazione] = useState("");
    const [aDataAttivazione, setADataAttivazione] = useState("");
    const [showFilters, setShowFilters] = useState(true);

    const [page, setPage] = useState(1);
    const pageSize = 25;
    const [totalCount, setTotalCount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("contracts")
                .select("id, brand, categoria, stato, venditore, data_registrazione, data, data_attivazione, created_at, clients!inner(nome, cognome, ragione_sociale, tipo)", { count: "exact" });

            // Server-side filters
            if (filterStato) query = query.eq("stato", filterStato);
            if (filterVenditore) query = query.eq("venditore", filterVenditore);
            if (filterCategoria) query = query.eq("categoria", filterCategoria);
            if (filterCodiceContratto) query = query.ilike("id", `%${filterCodiceContratto}%`);

            if (filterRagione) {
                const safe = filterRagione.trim().replace(/[",]/g, "");
                if (safe) {
                    const term = `%${safe}%`;
                    query = query.or(`clients.nome.ilike.${term},clients.cognome.ilike.${term},clients.ragione_sociale.ilike.${term}`);
                }
            }

            // Simple date filter for created_at if possible
            const fromImp = parseDateSafe(daDataImp);
            const toImp = parseDateSafe(aDataImp);
            if (fromImp) query = query.gte("created_at", fromImp.toISOString());
            if (toImp) query = query.lte("created_at", toImp.toISOString());

            const { data, count, error } = await query
                .order("created_at", { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);

            if (error) throw error;
            setRawList((data as unknown) as RawRow[]);
            setTotalCount(count ?? 0);
        } catch (err: any) {
            setLoadError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchData, 300);
        return () => clearTimeout(timer);
    }, [page, filterStato, filterVenditore, filterCategoria, filterRagione, filterCodiceContratto, filterCodiceOrdine, daDataImp, aDataImp]);

    useEffect(() => {
        const fetchFilters = async () => {
            const { data } = await supabase.from("contracts").select("venditore, categoria");
            if (data) {
                setUniqueVenditori(Array.from(new Set(data.map((r: any) => r.venditore).filter(Boolean))).sort() as string[]);
                setUniqueCategorie(Array.from(new Set(data.map((r: any) => r.categoria).filter(Boolean))).sort() as string[]);
            }
        };
        fetchFilters();
    }, []);

    const [uniqueVenditori, setUniqueVenditori] = useState<string[]>([]);
    const [uniqueCategorie, setUniqueCategorie] = useState<string[]>([]);

    const filtered = useMemo(() => {
        return rawList.map(r => mapContractToTracking(r, r.clients as Record<string, unknown> | null));
    }, [rawList]);

    const clearFilters = () => {
        setSearchQuery("");
        setFilterStato("");
        setFilterVenditore("");
        setFilterCategoria("");
        setFilterRagione("");
        setFilterCodiceContratto("");
        setFilterCodiceOrdine("");
        setDaDataImp("");
        setADataImp("");
        setDaDataCreazione("");
        setADataCreazione("");
        setDaDataFirma("");
        setADataFirma("");
        setDaDataGestione("");
        setADataGestione("");
        setDaDataAttivazione("");
        setADataAttivazione("");
    };

    const hasAnyFilter = filterRagione || filterCodiceContratto || filterCodiceOrdine || filterCategoria || filterVenditore || filterStato ||
        daDataImp || aDataImp || daDataCreazione || aDataCreazione || daDataFirma || aDataFirma || daDataGestione || aDataGestione || daDataAttivazione || aDataAttivazione;

    const clearDateImp = () => { setDaDataImp(""); setADataImp(""); };
    const clearDateCreazione = () => { setDaDataCreazione(""); setADataCreazione(""); };
    const clearDateFirma = () => { setDaDataFirma(""); setADataFirma(""); };
    const clearDateGestione = () => { setDaDataGestione(""); setADataGestione(""); };
    const clearDateAttivazione = () => { setDaDataAttivazione(""); setADataAttivazione(""); };

    const chip = (label: string, onClear: () => void) => (
        <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-300 text-xs">
            {label}
            <button type="button" onClick={onClear} className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
            </button>
        </span>
    );

    const exportCsv = () => {
        const headers = ["Categoria", "Brand", "Venditore", "Inviato il", "Stato", "Nominativo"];
        const rows = filtered.map(r => [r.categoria, r.brand, r.venditore, r.inviato_il, r.stato, r.nominativo].map(c => `"${String(c).replace(/"/g, '""')}"`).join(","));
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tracking-pda-${new Date().toISOString().slice(0, 10)}.csv`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 200);
    };

    return (
        <div className="w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Tracking pda</h2>
                    <p className="text-slate-400">Elenco delle PDA inviate e stato di lavorazione</p>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors", showFilters ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10")}>
                        <Filter className="w-4 h-4" />
                        Filtra
                    </button>
                    <button type="button" onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-indigo-300 hover:bg-primary/30 transition-colors disabled:opacity-50" >
                        <Download className="w-4 h-4" />
                        Esporta CSV
                    </button>
                </div>
            </div>

            {/* Advanced Search / Date Filter Section */}
            {showFilters && (
                <div className="glass-card mb-6 p-6">
                    <h3 className="text-lg font-medium text-white mb-4 border-b border-white/10 pb-2">Ricerca PDA</h3>
                    {hasAnyFilter && (
                        <div className="mb-4 pb-4 border-b border-white/5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filtri attivi</p>
                            <div className="flex flex-wrap gap-2">
                                {filterRagione && chip(`Nominativo: ${filterRagione}`, () => setFilterRagione(""))}
                                {filterCodiceContratto && chip(`Codice contratto: ${filterCodiceContratto}`, () => setFilterCodiceContratto(""))}
                                {filterCodiceOrdine && chip(`Codice ordine: ${filterCodiceOrdine}`, () => setFilterCodiceOrdine(""))}
                                {filterCategoria && chip(`Tipo: ${filterCategoria}`, () => setFilterCategoria(""))}
                                {filterVenditore && chip(`Venditore: ${filterVenditore}`, () => setFilterVenditore(""))}
                                {filterStato && chip(`Stato: ${filterStato}`, () => setFilterStato(""))}
                                {(daDataImp || aDataImp) && chip("Data importazione", clearDateImp)}
                                {(daDataCreazione || aDataCreazione) && chip("Data creazione", clearDateCreazione)}
                                {(daDataFirma || aDataFirma) && chip("Data firma", clearDateFirma)}
                                {(daDataGestione || aDataGestione) && chip("Data gestione", clearDateGestione)}
                                {(daDataAttivazione || aDataAttivazione) && chip("Data attivazione", clearDateAttivazione)}
                                <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs hover:bg-rose-500/25 transition-colors" >
                                    <X className="w-3.5 h-3.5" /> Annulla tutti
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ragione sociale / Nominativo</label>
                            <input value={filterRagione} onChange={e => setFilterRagione(e.target.value)} className="glass-input w-full" placeholder="Inserire nome o parte di esso" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Codice contratto</label>
                            <input value={filterCodiceContratto} onChange={e => setFilterCodiceContratto(e.target.value)} className="glass-input w-full" placeholder="Inserire codice o parte di esso" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Codice ordine</label>
                            <input value={filterCodiceOrdine} onChange={e => setFilterCodiceOrdine(e.target.value)} className="glass-input w-full" placeholder="Inserire codice o parte di esso" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
                            <select className="glass-input w-full" value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)}>
                                <option value="">Tutti</option>
                                {uniqueCategorie.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Venditore</label>
                            <select className="glass-input w-full" value={filterVenditore} onChange={e => setFilterVenditore(e.target.value)}>
                                <option value="">Tutti</option>
                                {uniqueVenditori.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stato attivazione</label>
                            <select className="glass-input w-full" value={filterStato} onChange={e => setFilterStato(e.target.value)}>
                                <option value="">Tutti</option>
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.label} value={opt.label}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Da data importazione</label>
                            <DatePickerInput id="dadataimp" value={daDataImp} onChange={setDaDataImp} placeholder="inserire data inizio" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">A data importazione</label>
                            <DatePickerInput id="adataimp" value={aDataImp} onChange={setADataImp} placeholder="inserire data fine" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Da data creazione</label>
                            <DatePickerInput id="dadatacreazione" value={daDataCreazione} onChange={setDaDataCreazione} placeholder="inserire data inizio" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">A data creazione</label>
                            <DatePickerInput id="adatacreazione" value={aDataCreazione} onChange={setADataCreazione} placeholder="inserire data fine" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Da data firma</label>
                            <DatePickerInput id="dadatafirma" value={daDataFirma} onChange={setDaDataFirma} placeholder="inserire data inizio" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">A data firma</label>
                            <DatePickerInput id="adatafirma" value={aDataFirma} onChange={setADataFirma} placeholder="inserire data fine" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Da data gestione</label>
                            <DatePickerInput id="dadatagestione" value={daDataGestione} onChange={setDaDataGestione} placeholder="inserire data inizio" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">A data gestione</label>
                            <DatePickerInput id="adatagestione" value={aDataGestione} onChange={setADataGestione} placeholder="inserire data fine" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Da data attivazione</label>
                            <DatePickerInput id="dadataattivazione" value={daDataAttivazione} onChange={setDaDataAttivazione} placeholder="inserire data inizio" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">A data attivazione</label>
                            <DatePickerInput id="adataattivazione" value={aDataAttivazione} onChange={setADataAttivazione} placeholder="inserire data fine" />
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button type="button" onClick={() => setShowFilters(false)} className="primary-btn h-10 px-6">Ricerca pda</button>
                        <button type="button" onClick={clearFilters} className="h-10 px-6 rounded-lg font-medium bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">Annulla</button>
                    </div>
                </div>
            )}

            {loadError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                    Errore: {loadError}
                </div>
            )}

            {/* Results Table */}
            <div className="glass-card mb-6">
                <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 bg-white/[0.02]">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Cerca per nominativo, brand, categoria..."
                            className="glass-input w-full pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select className="glass-input w-48" value={filterStato} onChange={e => setFilterStato(e.target.value)}>
                        <option value="">Tutti gli stati</option>
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.label} value={opt.label}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Caricamento...</div>
                ) : (
                    <div className="overflow-x-auto w-full max-w-[100vw]">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/[0.03] text-xs uppercase text-slate-400">
                                <tr>
                                    {trackingColumns.map((col, idx) => (
                                        <th key={idx} className={`px-6 py-4 font-semibold tracking-wider border-b border-white/5 ${col.className || ""}`}>
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nessuna PDA trovata.</td></tr>
                                ) : (
                                    filtered.map((row) => (
                                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">{row.avatar}</div>
                                            </td>
                                            <td className="px-6 py-4">{row.categoria}</td>
                                            <td className="px-6 py-4 font-medium text-white">{row.brand}</td>
                                            <td className="px-6 py-4">{row.venditore}</td>
                                            <td className="px-6 py-4 text-slate-400">{row.inviato_il}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border", getStatusColor(row.stato))}>
                                                    {row.stato}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{row.nominativo}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <span className="text-xs text-slate-400">Trovate {totalCount} PDA — Pagina {page} di {Math.ceil(totalCount / pageSize)}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                        >
                            Precedente
                        </button>
                        <button
                            disabled={page * pageSize >= totalCount || loading}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                        >
                            Successiva
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

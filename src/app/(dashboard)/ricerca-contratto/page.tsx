"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Eye, Edit, Trash2, X } from "lucide-react";
import { cn } from "@/utils";
import { DatePickerInput } from "@/components/DatePickerInput";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface ContrattoRow {
    id: string;
    venditore: string;
    brand: string;
    prodotto: string;
    cliente: string;
    cellulare: string;
    negozio: string;
    codice_attivazione: string;
    data_registrazione: string;
    data_attivazione: string;
    stato: string;
}

function mapContractToRow(c: Record<string, unknown>, client?: Record<string, unknown> | null): ContrattoRow {
    const nome = (client?.nome as string) ?? "";
    const cognome = (client?.cognome as string) ?? "";
    const ragione = (client?.ragione_sociale as string) ?? "";
    const cliente = ragione.trim() || [nome, cognome].filter(Boolean).join(" ").trim() || "—";
    return {
        id: (c.id as string) ?? "",
        venditore: (c.venditore as string) ?? "—",
        brand: (c.brand as string) ?? "—",
        prodotto: (c.prodotto as string) ?? "—",
        cliente,
        cellulare: (client?.cellulare as string) ?? "",
        negozio: (c.negozio as string) ?? "—",
        codice_attivazione: (c.codice_attivazione as string) ?? "—",
        data_registrazione: (c.data_registrazione as string) ?? (c.data as string) ?? "—",
        data_attivazione: (c.data_attivazione as string) ?? (c.data as string) ?? "—",
        stato: (c.stato as string) ?? "—",
    };
}

export default function RicercaContratto() {
    const { user } = useAuth();
    const [contractList, setContractList] = useState<ContrattoRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Filter state
    const [filterVenditore, setFilterVenditore] = useState("");
    const [filterCodice, setFilterCodice] = useState("");
    const [filterBrand, setFilterBrand] = useState("");
    const [filterProdotto, setFilterProdotto] = useState("");
    const [filterNegozio, setFilterNegozio] = useState("");
    const [filterCodiceAttivazione, setFilterCodiceAttivazione] = useState("");
    const [filterCliente, setFilterCliente] = useState("");
    const [filterCellulare, setFilterCellulare] = useState("");
    const [filterImei, setFilterImei] = useState("");
    const [filterTableSearch, setFilterTableSearch] = useState("");
    const [daDataAttivazione, setDaDataAttivazione] = useState("");
    const [aDataAttivazione, setADataAttivazione] = useState("");
    const [daDataRegistrazione, setDaDataRegistrazione] = useState("");
    const [aDataRegistrazione, setADataRegistrazione] = useState("");

    const [selectedContract, setSelectedContract] = useState<ContrattoRow | null>(null);
    const [detailMode, setDetailMode] = useState<"view" | "edit">("view");
    const [editStato, setEditStato] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("contracts")
                .select("*, clients(nome, cognome, ragione_sociale, cellulare)")
                .order("data", { ascending: false });
            if (error) {
                setLoadError(error.message);
                setContractList([]);
            } else {
                const rows = (data ?? []).map((row: Record<string, unknown>) => {
                    const clients = row.clients as Record<string, unknown> | null;
                    return mapContractToRow(row, clients);
                });
                setContractList(rows);
            }
            setLoading(false);
        })();
    }, []);

    const uniqueVenditori = useMemo(() => Array.from(new Set(contractList.map(r => r.venditore).filter(v => v && v !== "—"))).sort(), [contractList]);
    const uniqueBrands = useMemo(() => Array.from(new Set(contractList.map(r => r.brand).filter(v => v && v !== "—"))).sort(), [contractList]);
    const uniqueProdotti = useMemo(() => Array.from(new Set(contractList.map(r => r.prodotto).filter(v => v && v !== "—"))).sort(), [contractList]);
    const uniqueNegozi = useMemo(() => Array.from(new Set(contractList.map(r => r.negozio).filter(v => v && v !== "—"))).sort(), [contractList]);

    // RBAC: Store-Based Visibility Logic
    const isGlobalView = ["admin", "supervisore", "back_office"].includes(user?.role || "");
    const lockedStore = !isGlobalView ? user?.negozio : null;
    const lockedVenditore = !isGlobalView ? user?.name : null;

    const visibleData = useMemo(() => {
        let list = contractList.filter(row => {
            if (!isGlobalView && lockedStore && row.negozio !== lockedStore) return false;
            if (!isGlobalView && lockedVenditore && row.venditore !== lockedVenditore) return false;
            return true;
        });
        if (filterVenditore && filterVenditore !== "Tutti") list = list.filter(r => r.venditore === filterVenditore);
        if (filterBrand && filterBrand !== "Tutti i brand") list = list.filter(r => r.brand.toLowerCase().includes(filterBrand.toLowerCase()));
        if (filterProdotto && filterProdotto !== "Tutti i prodotti") list = list.filter(r => r.prodotto.toLowerCase().includes(filterProdotto.toLowerCase()));
        if (filterNegozio && filterNegozio !== "Tutti") list = list.filter(r => r.negozio === filterNegozio);
        if (filterCodice) list = list.filter(r => r.id.toLowerCase().includes(filterCodice.toLowerCase()));
        if (filterCodiceAttivazione && filterCodiceAttivazione !== "Tutti i codici") list = list.filter(r => r.codice_attivazione === filterCodiceAttivazione);
        if (filterCliente) list = list.filter(r => r.cliente.toLowerCase().includes(filterCliente.toLowerCase()));
        if (filterCellulare) list = list.filter(r => (r.cellulare || "").includes(filterCellulare));
        if (filterImei) list = list.filter(r => (r.codice_attivazione || "").includes(filterImei)); // Assuming IMEI might be stored or searched in activation code/notes or we need a specific field, but for now let's use activation code if that's what's intended or just filter by it
        if (filterTableSearch) {
            const q = filterTableSearch.toLowerCase();
            list = list.filter(r =>
                r.venditore.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q) || r.prodotto.toLowerCase().includes(q) ||
                r.cliente.toLowerCase().includes(q) || r.negozio.toLowerCase().includes(q) || r.codice_attivazione.toLowerCase().includes(q) || r.stato.toLowerCase().includes(q)
            );
        }
        const parseDate = (s: string): number | null => {
            if (!s || !s.trim()) return null;
            const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (m) return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10)).getTime();
            return null;
        };
        if (daDataAttivazione) {
            const from = parseDate(daDataAttivazione);
            if (from !== null) list = list.filter(r => parseDate(r.data_attivazione) !== null && parseDate(r.data_attivazione)! >= from);
        }
        if (aDataAttivazione) {
            const to = parseDate(aDataAttivazione);
            if (to !== null) list = list.filter(r => parseDate(r.data_attivazione) !== null && parseDate(r.data_attivazione)! <= to);
        }
        if (daDataRegistrazione) {
            const from = parseDate(daDataRegistrazione);
            if (from !== null) list = list.filter(r => parseDate(r.data_registrazione) !== null && parseDate(r.data_registrazione)! >= from);
        }
        if (aDataRegistrazione) {
            const to = parseDate(aDataRegistrazione);
            if (to !== null) list = list.filter(r => parseDate(r.data_registrazione) !== null && parseDate(r.data_registrazione)! <= to);
        }
        return list;
    }, [contractList, isGlobalView, lockedStore, lockedVenditore, filterVenditore, filterBrand, filterProdotto, filterNegozio, filterCodice, filterCodiceAttivazione, filterCliente, filterCellulare, filterImei, filterTableSearch, daDataAttivazione, aDataAttivazione, daDataRegistrazione, aDataRegistrazione]);

    const handleExportCsv = () => {
        if (visibleData.length === 0) return;
        const headers = ["Venditore", "Brand", "Prodotto", "Cliente", "Negozio", "Codice Attivazione", "Data Registrazione", "Data Attivazione", "Stato"];
        const rows = visibleData.map(r => [
            r.venditore, r.brand, r.prodotto, r.cliente, r.negozio, r.codice_attivazione, r.data_registrazione, r.data_attivazione, r.stato
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));
        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `contratti_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loadError) {
        return (
            <div className="w-full">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Ricerca Contratto</h2>
                    <p className="text-red-400">Errore caricamento: {loadError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Ricerca Contratto</h2>
                <p className="text-slate-400">Ricerca e gestisci i contratti registrati a sistema</p>
            </div>

            {/* Advanced Search Filter Section */}
            <div className="glass-card mb-6 p-6">
                <h3 className="text-lg font-medium text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-400" />
                    Filtri di ricerca
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                    {/* 1. Venditore */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Venditore</label>
                        <select
                            className="glass-input w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!isGlobalView}
                            value={isGlobalView ? filterVenditore : (lockedVenditore || "Tutti")}
                            onChange={e => setFilterVenditore(e.target.value)}
                        >
                            <option value="Tutti">Tutti i venditori</option>
                            {uniqueVenditori.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    {/* 2. Codice contratto */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Codice contratto</label>
                        <input type="text" placeholder="Es. CTR-123" className="glass-input w-full" value={filterCodice} onChange={e => setFilterCodice(e.target.value)} />
                    </div>

                    {/* 3. IMEI */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">IMEI / Serial Number</label>
                        <input type="text" placeholder="Inserisci IMEI" className="glass-input w-full" value={filterImei} onChange={e => setFilterImei(e.target.value)} />
                    </div>

                    {/* 4. Brand */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Brand</label>
                        <select className="glass-input w-full" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
                            <option value="">Tutti i brand</option>
                            {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    {/* 5. Prodotto */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Prodotto</label>
                        <select className="glass-input w-full" value={filterProdotto} onChange={e => setFilterProdotto(e.target.value)}>
                            <option value="">Tutti i prodotti</option>
                            {uniqueProdotti.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* 6. Negozio di attivazione */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Negozio di attivazione</label>
                        <select
                            className="glass-input w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!isGlobalView}
                            value={isGlobalView ? filterNegozio : (lockedStore || "Tutti")}
                            onChange={e => setFilterNegozio(e.target.value)}
                        >
                            <option value="Tutti">Tutti i negozi</option>
                            {uniqueNegozi.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>

                    {/* 7. Codice di attivazione */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Codice di attivazione</label>
                        <input type="text" placeholder="Es. ACT-12345" className="glass-input w-full" value={filterCodiceAttivazione} onChange={e => setFilterCodiceAttivazione(e.target.value)} />
                    </div>

                    {/* 8. Cliente */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Cliente</label>
                        <input type="text" placeholder="Nome, C.F. o P.IVA" className="glass-input w-full" value={filterCliente} onChange={e => setFilterCliente(e.target.value)} />
                    </div>

                    {/* 9. Numero di cellulare */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Numero di cellulare</label>
                        <input type="text" placeholder="Es. 3331234567" className="glass-input w-full" value={filterCellulare} onChange={e => setFilterCellulare(e.target.value)} />
                    </div>
                </div>

                {/* Date Ranges Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-white/5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Da data attivazione</label>
                        <DatePickerInput id="da_data_attivazione" value={daDataAttivazione} onChange={setDaDataAttivazione} placeholder="Seleziona data" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">A data attivazione</label>
                        <DatePickerInput id="a_data_attivazione" value={aDataAttivazione} onChange={setADataAttivazione} placeholder="Seleziona data" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Da data registrazione</label>
                        <DatePickerInput id="da_data_registrazione" value={daDataRegistrazione} onChange={setDaDataRegistrazione} placeholder="Seleziona data" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">A data registrazione</label>
                        <DatePickerInput id="a_data_registrazione" value={aDataRegistrazione} onChange={setADataRegistrazione} placeholder="Seleziona data" />
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-8 flex gap-3">
                    <button type="button" className="primary-btn h-10 px-8 text-sm" onClick={() => { setFilterVenditore(""); setFilterCodice(""); setFilterBrand(""); setFilterProdotto(""); setFilterNegozio(""); setFilterCodiceAttivazione(""); setFilterCliente(""); setFilterCellulare(""); setFilterImei(""); setFilterTableSearch(""); setDaDataAttivazione(""); setADataAttivazione(""); setDaDataRegistrazione(""); setADataRegistrazione(""); }}>Annulla filtri</button>
                    <button type="button" className="px-8 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all flex items-center gap-2" onClick={handleExportCsv}>
                        Scarica CSV
                    </button>
                </div>
            </div>

            {/* Results Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 flex gap-4 bg-white/[0.02]">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Filtra risultati..." className="glass-input w-full pl-10" value={filterTableSearch} onChange={e => setFilterTableSearch(e.target.value)} />
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">Caricamento contratti...</div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/[0.03] text-xs uppercase text-slate-400">
                                <tr>
                                    <th className="px-4 py-4 font-semibold">Venditore</th>
                                    <th className="px-4 py-4 font-semibold">Brand</th>
                                    <th className="px-4 py-4 font-semibold">Prodotto</th>
                                    <th className="px-4 py-4 font-semibold">Cliente</th>
                                    <th className="px-4 py-4 font-semibold">Negozio</th>
                                    <th className="px-4 py-4 font-semibold">Codice Attivazione</th>
                                    <th className="px-4 py-4 font-semibold">Data Registrazione</th>
                                    <th className="px-4 py-4 font-semibold">Data Attivazione</th>
                                    <th className="px-4 py-4 font-semibold">Stato</th>
                                    <th className="px-4 py-4 w-32 text-center">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleData.map((row) => (
                                    <tr key={row.id} className="border-b border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                        <td className="px-4 py-3 text-slate-300">{row.venditore}</td>
                                        <td className="px-4 py-3 font-medium text-white">{row.brand}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.prodotto}</td>
                                        <td className="px-4 py-3 text-slate-300 font-medium">{row.cliente}</td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">{row.negozio}</td>
                                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{row.codice_attivazione}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{row.data_registrazione}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{row.data_attivazione}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider",
                                                row.stato === 'Attivo' ? "bg-emerald-500/10 text-emerald-400" :
                                                    "bg-amber-500/10 text-amber-400"
                                            )}>
                                                {row.stato}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 justify-center">
                                                <button onClick={() => { setSelectedContract(row); setDetailMode("view"); }} className="p-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors" title="Visualizza Dettaglio"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => { setSelectedContract(row); setDetailMode("edit"); setEditStato(row.stato); }} className="p-1.5 rounded bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors" title="Modifica"><Edit className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {visibleData.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                                            Nessun contratto trovato per i criteri o permessi correnti.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 bg-white/[0.01]">
                    <span>Visualizzati {visibleData.length} contratti</span>
                </div>
            </div>

            {/* Contract detail / edit modal */}
            {selectedContract && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedContract(null)}>
                    <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-lg font-bold text-white">
                                {detailMode === "view" ? "Dettaglio contratto" : "Modifica contratto"}
                            </h3>
                            <button onClick={() => setSelectedContract(null)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-slate-500">Codice</span><p className="text-white font-mono">{selectedContract.id}</p></div>
                                <div><span className="text-slate-500">Stato</span><p className="text-white">{selectedContract.stato}</p></div>
                                <div className="col-span-2"><span className="text-slate-500">Venditore</span><p className="text-white">{selectedContract.venditore}</p></div>
                                <div><span className="text-slate-500">Brand</span><p className="text-white">{selectedContract.brand}</p></div>
                                <div><span className="text-slate-500">Prodotto</span><p className="text-white">{selectedContract.prodotto}</p></div>
                                <div className="col-span-2"><span className="text-slate-500">Cliente</span><p className="text-white">{selectedContract.cliente}</p></div>
                                {selectedContract.cellulare && <div><span className="text-slate-500">Cellulare</span><p className="text-white">{selectedContract.cellulare}</p></div>}
                                <div><span className="text-slate-500">Negozio</span><p className="text-white">{selectedContract.negozio}</p></div>
                                <div><span className="text-slate-500">Codice attivazione</span><p className="text-white font-mono">{selectedContract.codice_attivazione}</p></div>
                                <div><span className="text-slate-500">Data registrazione</span><p className="text-white">{selectedContract.data_registrazione}</p></div>
                                <div><span className="text-slate-500">Data attivazione</span><p className="text-white">{selectedContract.data_attivazione}</p></div>
                            </div>
                            {detailMode === "edit" && (
                                <div className="pt-4 border-t border-white/10 space-y-2">
                                    <label className="block text-xs font-semibold text-slate-400">Nuovo stato</label>
                                    <select
                                        value={editStato}
                                        onChange={e => setEditStato(e.target.value)}
                                        className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="Attivo">Attivo</option>
                                        <option value="In lavorazione">In lavorazione</option>
                                        <option value="Attivato">Attivato</option>
                                        <option value="Sospeso">Sospeso</option>
                                        <option value="Annullato">Annullato</option>
                                    </select>
                                    <button
                                        disabled={saving || editStato === selectedContract.stato}
                                        onClick={async () => {
                                            setSaving(true);
                                            const { error } = await supabase.from("contracts").update({ stato: editStato }).eq("id", selectedContract.id);
                                            if (!error) {
                                                setContractList(prev => prev.map(r => r.id === selectedContract.id ? { ...r, stato: editStato } : r));
                                                setSelectedContract(prev => prev ? { ...prev, stato: editStato } : null);
                                            }
                                            setSaving(false);
                                        }}
                                        className="w-full mt-3 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? "Salvataggio..." : "Salva modifiche"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

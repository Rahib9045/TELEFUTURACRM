"use client";

import { useState, useEffect, useMemo } from "react";
import { StatTable } from "@/components/ui/StatTable";
import { Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const dashboardColumns = [
    { header: "Brand", accessor: "brand", className: "font-semibold" },
    { header: "Segmento", accessor: "segmento" },
    { header: "Ricevute", accessor: "ricevute", className: "text-right" },
    { header: "Assegnate", accessor: "assegnate", className: "text-right" },
    { header: "OK", accessor: "ok", className: "text-right text-emerald-400 font-medium" },
    { header: "Sospesi", accessor: "sospesi", className: "text-right text-amber-400 font-medium" },
    { header: "KO", accessor: "ko", className: "text-right text-rose-400 font-medium" },
];

function isOk(stato: string) {
    const s = (stato || "").toLowerCase();
    return s === "attivo" || s === "attivato";
}
function isInLavorazione(stato: string) {
    return (stato || "").toLowerCase().includes("lavorazione");
}
function isSospeso(stato: string) {
    return (stato || "").toLowerCase() === "sospeso";
}
function isKo(stato: string) {
    const s = (stato || "").toLowerCase();
    return s === "annullato" || s === "ko";
}

export default function Dashboard() {
    const { user } = useAuth();
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [contracts, setContracts] = useState<{ brand: string; categoria: string; stato: string; created_at: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const fetchContracts = async (overrideFrom?: string, overrideTo?: string) => {
        setLoading(true);
        setLoadError(null);
        const from = overrideFrom !== undefined ? overrideFrom : dateFrom;
        const to = overrideTo !== undefined ? overrideTo : dateTo;
        let q = supabase.from("contracts").select("brand, categoria, stato, created_at");
        if (from) q = q.gte("created_at", from + "T00:00:00Z");
        if (to) q = q.lte("created_at", to + "T23:59:59Z");
        const { data, error } = await q;
        if (error) {
            setLoadError(error.message);
            setContracts([]);
        } else {
            setContracts((data ?? []) as typeof contracts);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const summaryStats = useMemo(() => {
        const total = contracts.length;
        const inLav = contracts.filter(c => isInLavorazione(c.stato)).length;
        const ok = contracts.filter(c => isOk(c.stato)).length;
        const ko = contracts.filter(c => isKo(c.stato)).length;
        return [
            { label: "Totale PDA Inviate", value: total.toLocaleString("it-IT"), trend: "", icon: Users, color: "text-blue-400" },
            { label: "In Lavorazione", value: String(inLav), trend: "", icon: Clock, color: "text-amber-400" },
            { label: "Approvate (OK)", value: String(ok), trend: "", icon: CheckCircle, color: "text-emerald-400" },
            { label: "Respinte (KO)", value: String(ko), trend: "", icon: AlertTriangle, color: "text-rose-400" },
        ];
    }, [contracts]);

    const tableData = useMemo(() => {
        const byKey: Record<string, { ricevute: number; ok: number; sospesi: number; ko: number }> = {};
        contracts.forEach(c => {
            const key = `${c.brand}|${c.categoria || "—"}`;
            if (!byKey[key]) byKey[key] = { ricevute: 0, ok: 0, sospesi: 0, ko: 0 };
            byKey[key].ricevute++;
            if (isOk(c.stato)) byKey[key].ok++;
            else if (isSospeso(c.stato)) byKey[key].sospesi++;
            else if (isKo(c.stato)) byKey[key].ko++;
        });
        return Object.entries(byKey).map(([key, counts]) => {
            const [brand, segmento] = key.split("|");
            return {
                brand,
                segmento,
                ricevute: counts.ricevute,
                assegnate: counts.ricevute,
                ok: counts.ok,
                sospesi: counts.sospesi,
                ko: counts.ko,
            };
        }).sort((a, b) => b.ricevute - a.ricevute);
    }, [contracts]);

    return (
        <div className="w-full space-y-8">
            {/* Header & Date Filters */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Benvenuto, {user?.name ? user.name.split(' ')[0] : 'Ospite'}
                    </h2>
                    <p className="text-slate-400">Ecco la panoramica delle tue PDA e statistiche</p>
                </div>

                <div className="flex flex-wrap items-end gap-3 p-4 glass-card mb-0 border-white/5">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Da Data</label>
                        <input type="date" className="glass-input text-sm py-1.5" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">A Data</label>
                        <input type="date" className="glass-input text-sm py-1.5" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchContracts()}
                        disabled={loading}
                        className="primary-btn py-1.5 px-4 h-9 disabled:opacity-50"
                    >
                        {loading ? "Caricamento..." : "Aggiorna Grafici"}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setDateFrom(""); setDateTo(""); fetchContracts("", ""); }}
                        className="h-9 px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium transition-colors"
                    >
                        Pulisci
                    </button>
                </div>
            </div>

            {loadError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                    Errore: {loadError}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="glass-card p-6 flex items-start gap-4">
                            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                    {stat.trend && (
                                        <span className={`text-xs font-semibold ${stat.trend.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                                            {stat.trend}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <StatTable
                title="Statistiche per Brand e Segmento"
                columns={dashboardColumns}
                data={tableData}
            />


        </div>
    );
}

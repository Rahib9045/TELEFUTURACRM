"use client";

import { StatTable } from "@/components/ui/StatTable";
import { Users, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Mock Data representing the stats
const summaryStats = [
    { label: "Totale PDA Inviate", value: "1,245", trend: "+12%", icon: Users, color: "text-blue-400" },
    { label: "In Lavorazione", value: "34", trend: "-5%", icon: Clock, color: "text-amber-400" },
    { label: "Approvate (OK)", value: "982", trend: "+18%", icon: CheckCircle, color: "text-emerald-400" },
    { label: "Respinte (KO)", value: "229", trend: "+2%", icon: AlertTriangle, color: "text-rose-400" },
];

const dashboardColumns = [
    { header: "Brand", accessor: "brand", className: "font-semibold" },
    { header: "Segmento", accessor: "segmento" },
    { header: "Ricevute", accessor: "ricevute", className: "text-right" },
    { header: "Assegnate", accessor: "assegnate", className: "text-right" },
    { header: "OK", accessor: "ok", className: "text-right text-emerald-400 font-medium" },
    { header: "Sospesi", accessor: "sospesi", className: "text-right text-amber-400 font-medium" },
    { header: "KO", accessor: "ko", className: "text-right text-rose-400 font-medium" },
];

const mockDashboardData = [
    { brand: "Edison", segmento: "Business", ricevute: 45, assegnate: 12, ok: 20, sospesi: 5, ko: 8 },
    { brand: "Enel", segmento: "Business", ricevute: 30, assegnate: 8, ok: 15, sospesi: 2, ko: 5 },
    { brand: "Tim", segmento: "Consumer", ricevute: 120, assegnate: 40, ok: 60, sospesi: 10, ko: 10 },
    { brand: "Vodafone", segmento: "Consumer", ricevute: 85, assegnate: 20, ok: 45, sospesi: 5, ko: 15 },
];

export default function Dashboard() {
    const { user } = useAuth();

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
                        <input type="date" className="glass-input text-sm py-1.5" defaultValue="2023-01-01" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">A Data</label>
                        <input type="date" className="glass-input text-sm py-1.5" defaultValue="2023-12-31" />
                    </div>
                    <button className="primary-btn py-1.5 px-4 h-9">
                        Aggiorna Grafici
                    </button>
                    <button className="h-9 px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium transition-colors">
                        Pulisci
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
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
                                    <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Data Table */}
            <StatTable
                title="Statistiche per Brand e Segmento"
                columns={dashboardColumns}
                data={mockDashboardData}
            />


        </div>
    );
}

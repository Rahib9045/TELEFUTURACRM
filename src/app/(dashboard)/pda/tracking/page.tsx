"use client";

import { StatTable } from "@/components/ui/StatTable";
import { Search, Filter, Download } from "lucide-react";
import { STATUS_OPTIONS, getStatusColor } from "@/components/StatusDropdown";
import { cn } from "@/utils";

const trackingColumns = [
    { header: "Avatar", accessor: "avatar", className: "w-16" },
    { header: "Categoria", accessor: "categoria" },
    { header: "Brand", accessor: "brand" },
    { header: "Venditore", accessor: "venditore" },
    { header: "Inviato il", accessor: "inviato_il" },
    { header: "Stato", accessor: "stato", className: "text-center" },
    { header: "Nominativo", accessor: "nominativo" },
];

const mockTrackingData = [
    {
        avatar: "👤",
        categoria: "ENERGIA",
        brand: "Edison Business",
        venditore: "agente",
        inviato_il: "2023-05-25 15:29:40",
        stato: "Assegnata",
        nominativo: "Reesolve Srl",
    },
    {
        avatar: "👤",
        categoria: "ENERGIA",
        brand: "Enel Business",
        venditore: "agente",
        inviato_il: "2023-03-04 13:47:45",
        stato: "Ricevuta",
        nominativo: "Telefutura Srl",
    },
    {
        avatar: "👤",
        categoria: "ENERGIA",
        brand: "Edison Consumer",
        venditore: "agente",
        inviato_il: "2023-03-04 13:46:53",
        stato: "KO credito",
        nominativo: "Anna Maria Copi",
    },
    {
        avatar: "👤",
        categoria: "ENERGIA",
        brand: "Edison Consumer",
        venditore: "agente",
        inviato_il: "2023-03-04 13:45:25",
        stato: "OK caricata EVA",
        nominativo: "Pietro Salli",
    },
];

export default function TrackingPda() {
    return (
        <div className="w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Tracking pda</h2>
                    <p className="text-slate-400">Elenco delle PDA inviate e stato di lavorazione</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtra
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-indigo-300 hover:bg-primary/30 transition-colors">
                        <Download className="w-4 h-4" />
                        Esporta CSV
                    </button>
                </div>
            </div>

            <div className="glass-card mb-6">
                <div className="p-4 border-b border-white/5 flex gap-4 bg-white/[0.02]">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Cerca per nominativo, brand, categoria..."
                            className="glass-input w-full pl-10"
                        />
                    </div>
                    <select className="glass-input w-48">
                        <option value="">Tutti gli stati</option>
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.label} value={opt.label}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Table is slightly modified to handle the raw emoji avatar for the mock */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-white/[0.03] text-xs uppercase text-slate-400">
                            <tr>
                                {trackingColumns.map((col, idx) => (
                                    <th key={idx} className={`px-6 py-4 font-semibold tracking-wider border-b border-white/5 ${col.className || ''}`}>
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {mockTrackingData.map((row, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                            {row.avatar}
                                        </div>
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
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 bg-white/[0.01]">
                    <span>Visualizzate da 1 a 4 di 4 totale</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50" disabled>Precedente</button>
                        <button className="px-3 py-1 rounded border border-primary bg-primary/20 text-indigo-300 font-medium">1</button>
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50" disabled>Prossima</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

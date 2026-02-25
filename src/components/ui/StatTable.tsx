import { cn } from "@/utils";
import { MoreVertical } from "lucide-react";

type Column = {
    header: string;
    accessor: string;
    className?: string;
};

type StatTableProps = {
    columns: Column[];
    data: any[];
    title?: string;
};

export function StatTable({ columns, data, title }: StatTableProps) {
    return (
        <div className="glass-card overflow-hidden">
            {title && (
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-lg font-medium text-white">{title}</h3>
                    <button className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-white/[0.03] text-xs uppercase text-slate-400">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={cn("px-6 py-4 font-semibold tracking-wider border-b border-white/5", col.className)}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                                >
                                    {columns.map((col, colIndex) => {
                                        const isStatus = col.accessor === "stato";
                                        const val = row[col.accessor];

                                        return (
                                            <td key={colIndex} className={cn("px-6 py-4 whitespace-nowrap", col.className)}>
                                                {isStatus ? (
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                                        val === "Assegnata" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                                                        val === "Ricevuta" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                                        val === "OK credito" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                                        val === "KO credito" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                                                    )}>
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            val === "Assegnata" && "bg-amber-500",
                                                            val === "Ricevuta" && "bg-blue-400",
                                                            val === "OK credito" && "bg-emerald-400",
                                                            val === "KO credito" && "bg-rose-400",
                                                        )}></span>
                                                        {val}
                                                    </span>
                                                ) : (
                                                    val
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                                    Nessun dato disponibile nel database.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Replica */}
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 bg-white/[0.01]">
                <span>Visualizzate da 1 a 10 di 25 totale</span>
                <div className="flex gap-1">
                    <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50">Precedente</button>
                    <button className="px-3 py-1 rounded border border-primary bg-primary/20 text-indigo-300 font-medium">1</button>
                    <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors">2</button>
                    <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors">3</button>
                    <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors">Prossima</button>
                </div>
            </div>
        </div>
    );
}

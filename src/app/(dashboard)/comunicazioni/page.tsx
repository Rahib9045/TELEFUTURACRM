"use client";

import { Bell, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils";

const comunicazioni = [
    {
        id: 1,
        title: "Aggiornamento Listini Energia Q4",
        date: "12 Nov 2023, 10:30",
        type: "info",
        content: "Si comunica a tutti gli agenti che i nuovi listini per il segmento Business sono stati pubblicati nella sezione Documentazione. Le nuove condizioni sono applicabili a partire dal 15 Novembre.",
        read: false
    },
    {
        id: 2,
        title: "Manutenzione Programmata Portale",
        date: "05 Nov 2023, 14:00",
        type: "warning",
        content: "Il portale subira una manutenzione programmata sabato dalle 22:00 alle 02:00 di domenica. Durante questa finestra non sara possibile inserire nuove PDA.",
        read: true
    },
    {
        id: 3,
        title: "Nuova Campagna Promozionale Summer",
        date: "28 Ott 2023, 09:15",
        type: "success",
        content: "E partita la nuova campagna promozionale estiva con extra bonus per i nuovi contratti consumer. Trovate tutti i dettagli e il materiale aggiornato nella vostra dashboard personale.",
        read: true
    }
];

const getTypeStyles = (type: string) => {
    switch (type) {
        case 'warning': return { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
        case 'success': return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
        default: return { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
    }
};

export default function Comunicazioni() {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Comunicazioni</h2>
                    <p className="text-slate-400">Avvisi e aggiornamenti importanti dal back office</p>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-full relative">
                    <Bell className="w-6 h-6 text-slate-300" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-[#0f111a] rounded-full"></span>
                </div>
            </div>

            <div className="space-y-4">
                {comunicazioni.map((com) => {
                    const styles = getTypeStyles(com.type);
                    const Icon = styles.icon;

                    return (
                        <div
                            key={com.id}
                            className={cn(
                                "glass-card p-6 relative overflow-hidden transition-all",
                                !com.read && "border-l-4 border-l-primary"
                            )}
                        >
                            {/* Unread indicator */}
                            {!com.read && (
                                <div className="absolute top-6 right-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Nuovo</span>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className={cn("shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border", styles.bg, styles.border, styles.color)}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="mb-1">
                                        <h3 className={cn("text-lg font-semibold", !com.read ? "text-white" : "text-slate-200")}>
                                            {com.title}
                                        </h3>
                                        <p className="text-sm text-slate-500">{com.date}</p>
                                    </div>
                                    <p className="text-slate-300 mt-3 leading-relaxed">
                                        {com.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

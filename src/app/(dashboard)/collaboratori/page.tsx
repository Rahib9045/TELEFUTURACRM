 "use client";

import { useState } from "react";
import { Clock, Users, CalendarDays, Shield } from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/context/AuthContext";

type TabId = "badge" | "ferie" | "malattia";

export default function CollaboratoriPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<TabId>("badge");

    const isAdminLike = user && ["admin", "store_manager", "back_office", "supervisore"].includes(user.role);

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] lg:h-screen lg:pl-64 w-full overflow-hidden min-w-0 max-w-full">
            <div className="flex-none p-4 lg:p-8 w-full min-w-0 max-w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                <Users className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Collaboratori</h1>
                        </div>
                        <p className="text-sm text-slate-400">
                            Badge turni, ferie e malattia in un'unica area.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 inline-flex rounded-2xl bg-white/5 border border-white/10 p-1 text-xs">
                    <button
                        className={cn(
                            "px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors",
                            tab === "badge" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-300"
                        )}
                        onClick={() => setTab("badge")}
                    >
                        <Clock className="w-4 h-4" />
                        Badge & Dashboard
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors",
                            tab === "ferie" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-300"
                        )}
                        onClick={() => setTab("ferie")}
                    >
                        <CalendarDays className="w-4 h-4" />
                        Ferie
                    </button>
                    {isAdminLike && (
                        <button
                            className={cn(
                                "px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors",
                                tab === "malattia" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-300"
                            )}
                            onClick={() => setTab("malattia")}
                        >
                            <Shield className="w-4 h-4" />
                            Malattia
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 px-4 lg:px-8 pb-8 overflow-y-auto custom-scrollbar w-full min-w-0 max-w-full">
                {tab === "badge" && <BadgeAndDashboard isAdminLike={!!isAdminLike} />}
                {tab === "ferie" && <FerieSection isAdminLike={!!isAdminLike} />}
                {tab === "malattia" && isAdminLike && <MalattiaSection />}
            </div>
        </div>
    );
}

function BadgeAndDashboard({ isAdminLike }: { isAdminLike: boolean }) {
    const { user } = useAuth();
    const [status, setStatus] = useState<"off" | "running" | "paused">("off");
    const [todayMinutes] = useState(0); // mock only

    const canStart = status === "off";
    const canPause = status === "running";
    const canResume = status === "paused";
    const canStop = status === "running" || status === "paused";

    const labelStatus =
        status === "off" ? "Fuori turno" : status === "running" ? "In turno" : "In pausa";

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Badge lato collaboratore */}
            <div className="xl:col-span-1 glass-card p-6 space-y-5">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Badge collaboratore
                        </p>
                        <h2 className="text-lg font-bold text-white mt-1">
                            {user?.name ?? "Utente"}
                        </h2>
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold border",
                        status === "running"
                            ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                            : status === "paused"
                                ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                                : "border-slate-500/40 text-slate-300 bg-slate-800/40"
                    )}>
                        {labelStatus}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                        disabled={!canStart}
                        onClick={() => setStatus("running")}
                        className={cn(
                            "h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all",
                            canStart
                                ? "bg-emerald-500 text-white border-emerald-500/60 shadow-lg shadow-emerald-500/25"
                                : "bg-white/5 text-slate-500 border-white/10 cursor-not-allowed"
                        )}
                    >
                        Inizia turno
                    </button>
                    <button
                        disabled={!canStop}
                        onClick={() => setStatus("off")}
                        className={cn(
                            "h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all",
                            canStop
                                ? "bg-rose-500/10 text-rose-300 border-rose-500/40 hover:bg-rose-500/20"
                                : "bg-white/5 text-slate-500 border-white/10 cursor-not-allowed"
                        )}
                    >
                        Termina turno
                    </button>
                    <button
                        disabled={!canPause}
                        onClick={() => setStatus("paused")}
                        className={cn(
                            "h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all col-span-1",
                            canPause
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
                                : "bg-white/5 text-slate-500 border-white/10 cursor-not-allowed"
                        )}
                    >
                        Pausa
                    </button>
                    <button
                        disabled={!canResume}
                        onClick={() => setStatus("running")}
                        className={cn(
                            "h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all col-span-1",
                            canResume
                                ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/20"
                                : "bg-white/5 text-slate-500 border-white/10 cursor-not-allowed"
                        )}
                    >
                        Riprendi
                    </button>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Riepilogo giornata
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {Math.floor(todayMinutes / 60)}h{" "}
                        <span className="text-xl text-slate-400">
                            {String(todayMinutes % 60).padStart(2, "0")}m
                        </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Dati dimostrativi — integrazione con backend in sviluppo.
                    </p>
                </div>
            </div>

            {/* Dashboard admin lato destro */}
            <div className="xl:col-span-2 space-y-6">
                {isAdminLike ? (
                    <>
                        <div className="glass-card p-5">
                            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between mb-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Dashboard admin
                                    </p>
                                    <h2 className="text-lg font-bold text-white mt-1">
                                        Turni attivi in tempo reale
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <select className="glass-input text-xs min-w-[140px]">
                                        <option>Tutti i collaboratori</option>
                                    </select>
                                    <select className="glass-input text-xs min-w-[140px]">
                                        <option>Tutti i punti vendita</option>
                                    </select>
                                    <select className="glass-input text-xs min-w-[140px]">
                                        <option>Oggi</option>
                                        <option>Ultimi 7 giorni</option>
                                        <option>Questo mese</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                                        In turno ora
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-white">0</p>
                                    <p className="mt-1 text-xs text-emerald-200/80">
                                        Vista demo — in attesa dati reali.
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                                        Ore lavorate (oggi)
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-white">0h</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Collaboratori in pausa
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-white">0</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Storico turni (demo)
                                </p>
                                <div className="border border-white/5 rounded-xl overflow-hidden">
                                    <table className="w-full text-xs text-slate-300">
                                        <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Collaboratore</th>
                                                <th className="px-4 py-2 text-left">Punto vendita</th>
                                                <th className="px-4 py-2 text-left">Inizio</th>
                                                <th className="px-4 py-2 text-left">Fine</th>
                                                <th className="px-4 py-2 text-right">Ore totali</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="px-4 py-3 text-slate-500 text-center" colSpan={5}>
                                                    Integrazione con storico turni da backend in arrivo.
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="glass-card p-6 text-sm text-slate-400">
                        <p>
                            La dashboard amministratore è visibile solo ai ruoli con permessi di gestione
                            (admin, store manager, back office, supervisore).
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FerieSection({ isAdminLike }: { isAdminLike: boolean }) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 glass-card p-6 space-y-4">
                <h2 className="text-lg font-bold text-white mb-2">Richiesta ferie</h2>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-400">Dal giorno</label>
                        <input type="date" className="glass-input mt-1 w-full" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400">Al giorno</label>
                        <input type="date" className="glass-input mt-1 w-full" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400">Motivo</label>
                        <textarea className="glass-input mt-1 w-full min-h-[80px]" placeholder="Es. Ferie estive" />
                    </div>
                    <button className="primary-btn w-full h-10 text-sm font-semibold">
                        Invia richiesta (demo)
                    </button>
                    <p className="text-[11px] text-slate-500">
                        Questa è una versione mock: il salvataggio reale verrà collegato al backend ferie.
                    </p>
                </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
                {isAdminLike && (
                    <div className="glass-card p-5">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Dashboard ferie
                                </p>
                                <h2 className="text-lg font-bold text-white mt-1">
                                    Situazione ferie collaboratori
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <select className="glass-input text-xs min-w-[140px]">
                                    <option>Tutti i collaboratori</option>
                                </select>
                                <select className="glass-input text-xs min-w-[140px]">
                                    <option>Tutti i punti vendita</option>
                                </select>
                                <select className="glass-input text-xs min-w-[140px]">
                                    <option>Oggi</option>
                                    <option>Prossimi 7 giorni</option>
                                    <option>Questo mese</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                                    In ferie oggi
                                </p>
                                <p className="mt-2 text-2xl font-bold text-white">0</p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                                    Ferie programmate
                                </p>
                                <p className="mt-2 text-2xl font-bold text-white">0</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Richieste in attesa
                                </p>
                                <p className="mt-2 text-2xl font-bold text-white">0</p>
                            </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Richieste ferie (demo)
                        </p>
                        <div className="border border-white/5 rounded-xl overflow-hidden">
                            <table className="w-full text-xs text-slate-300">
                                <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Collaboratore</th>
                                        <th className="px-4 py-2 text-left">Punto vendita</th>
                                        <th className="px-4 py-2 text-left">Periodo</th>
                                        <th className="px-4 py-2 text-left">Stato</th>
                                        <th className="px-4 py-2 text-right">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-3 text-slate-500 text-center" colSpan={5}>
                                            Qui verranno mostrate le richieste ferie una volta collegato il backend.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!isAdminLike && (
                    <div className="glass-card p-6 text-sm text-slate-400">
                        <p>
                            Puoi inviare le tue richieste ferie dal pannello a sinistra. La dashboard riepilogativa è
                            visibile solo ai ruoli amministrativi.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MalattiaSection() {
    return (
        <div className="glass-card p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Malattia (admin)
                    </p>
                    <h2 className="text-lg font-bold text-white mt-1">
                        Gestione assenze per malattia
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Modulo demo: collegare successivamente le API per creare e filtrare le assenze.
                    </p>
                </div>
                <button className="primary-btn h-10 px-5 text-sm font-semibold">
                    + Nuova assenza (demo)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                        Assenze nel periodo selezionato
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">0</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Collaboratori coinvolti
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">0</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Giorni totali di malattia
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">0</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
                <select className="glass-input text-xs min-w-[140px]">
                    <option>Tutti i collaboratori</option>
                </select>
                <select className="glass-input text-xs min-w-[140px]">
                    <option>Tutti i punti vendita</option>
                </select>
                <select className="glass-input text-xs min-w-[140px]">
                    <option>Ultimi 30 giorni</option>
                    <option>Ultimi 90 giorni</option>
                    <option>Quest'anno</option>
                </select>
            </div>

            <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Assenze registrate (demo)
                </p>
                <div className="border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-slate-300">
                        <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-2 text-left">Collaboratore</th>
                                <th className="px-4 py-2 text-left">Punto vendita</th>
                                <th className="px-4 py-2 text-left">Periodo</th>
                                <th className="px-4 py-2 text-left">N° certificato</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-4 py-3 text-slate-500 text-center" colSpan={4}>
                                    Qui verranno visualizzate le assenze per malattia dopo
                                    l&apos;integrazione con il backend.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Users, CalendarDays, Shield, X } from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

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

type ShiftRow = { id: number; employee_name: string; store: string; started_at: string; ended_at: string | null; pause_started_at: string | null; total_pause_minutes: number };

function BadgeAndDashboard({ isAdminLike }: { isAdminLike: boolean }) {
    const { user } = useAuth();
    const [activeShift, setActiveShift] = useState<ShiftRow | null>(null);
    const [todayMinutes, setTodayMinutes] = useState(0);
    const [loading, setLoading] = useState(true);

    const status: "off" | "running" | "paused" = !activeShift ? "off" : activeShift.pause_started_at ? "paused" : "running";
    const canStart = status === "off";
    const canPause = status === "running";
    const canResume = status === "paused";
    const canStop = status === "running" || status === "paused";

    const labelStatus =
        status === "off" ? "Fuori turno" : status === "running" ? "In turno" : "In pausa";

    const fetchActiveShift = useCallback(async () => {
        if (!user?.name) return;
        const { data } = await supabase.from("shifts").select("*").eq("employee_name", user.name).is("ended_at", null).order("started_at", { ascending: false }).limit(1).maybeSingle();
        setActiveShift(data as ShiftRow | null);
    }, [user?.name]);

    useEffect(() => {
        (async () => {
            await fetchActiveShift();
            setLoading(false);
        })();
    }, [fetchActiveShift]);

    useEffect(() => {
        if (!activeShift) {
            setTodayMinutes(0);
            return;
        }
        const compute = () => {
            const start = new Date(activeShift.started_at).getTime() / 60000;
            const now = Date.now() / 60000;
            let pause = Number(activeShift.total_pause_minutes) || 0;
            if (activeShift.pause_started_at) pause += (now - new Date(activeShift.pause_started_at).getTime() / 60000);
            setTodayMinutes(Math.max(0, Math.floor(now - start - pause)));
        };
        compute();
        const t = setInterval(compute, 60000);
        return () => clearInterval(t);
    }, [activeShift]);

    const handleStart = async () => {
        if (!user?.name) return;
        const { data, error } = await supabase.from("shifts").insert({ employee_name: user.name, store: user.negozio ?? "" }).select().single();
        if (!error && data) setActiveShift(data as ShiftRow);
    };
    const handlePause = async () => {
        if (!activeShift) return;
        await supabase.from("shifts").update({ pause_started_at: new Date().toISOString() }).eq("id", activeShift.id);
        setActiveShift(prev => prev ? { ...prev, pause_started_at: new Date().toISOString() } : null);
    };
    const handleResume = async () => {
        if (!activeShift?.pause_started_at) return;
        const extra = (Date.now() - new Date(activeShift.pause_started_at).getTime()) / 60000;
        const newTotal = (Number(activeShift.total_pause_minutes) || 0) + extra;
        await supabase.from("shifts").update({ pause_started_at: null, total_pause_minutes: newTotal }).eq("id", activeShift.id);
        setActiveShift(prev => prev ? { ...prev, pause_started_at: null, total_pause_minutes: newTotal } : null);
    };
    const handleStop = async () => {
        if (!activeShift) return;
        let totalPause = Number(activeShift.total_pause_minutes) || 0;
        if (activeShift.pause_started_at) totalPause += (Date.now() - new Date(activeShift.pause_started_at).getTime()) / 60000;
        await supabase.from("shifts").update({ ended_at: new Date().toISOString(), pause_started_at: null, total_pause_minutes: totalPause }).eq("id", activeShift.id);
        setActiveShift(null);
    };

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
                        disabled={!canStart || loading}
                        onClick={handleStart}
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
                        onClick={handleStop}
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
                        onClick={handlePause}
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
                        onClick={handleResume}
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
                </div>
            </div>

            {/* Dashboard admin lato destro */}
            <div className="xl:col-span-2 space-y-6">
                {isAdminLike ? (
                    <BadgeAdminDashboard onRefresh={fetchActiveShift} />
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

function BadgeAdminDashboard({ onRefresh }: { onRefresh: () => void }) {
    const [activeShifts, setActiveShifts] = useState<ShiftRow[]>([]);
    const [historyShifts, setHistoryShifts] = useState<(ShiftRow & { ended_at: string })[]>([]);
    const [filterStore, setFilterStore] = useState("");
    const [filterPerson, setFilterPerson] = useState("");

    const fetchShifts = useCallback(async () => {
        const { data: active } = await supabase.from("shifts").select("*").is("ended_at", null).order("started_at", { ascending: false });
        setActiveShifts((active ?? []) as ShiftRow[]);
        const { data: ended } = await supabase.from("shifts").select("*").not("ended_at", "is", null).order("started_at", { ascending: false }).limit(100);
        setHistoryShifts((ended ?? []) as (ShiftRow & { ended_at: string })[]);
    }, []);

    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    const inPause = activeShifts.filter(s => s.pause_started_at).length;
    const totalMinutesToday = historyShifts
        .filter(s => {
            const d = new Date(s.started_at);
            const today = new Date();
            return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        })
        .reduce((sum, s) => {
            const start = new Date(s.started_at).getTime() / 60000;
            const end = new Date((s as { ended_at: string }).ended_at).getTime() / 60000;
            const pause = Number(s.total_pause_minutes) || 0;
            return sum + Math.round(end - start - pause);
        }, 0);

    let displayActive = activeShifts;
    let displayHistory = historyShifts;
    if (filterPerson) displayActive = displayActive.filter(s => s.employee_name.toLowerCase().includes(filterPerson.toLowerCase()));
    if (filterPerson) displayHistory = displayHistory.filter(s => s.employee_name.toLowerCase().includes(filterPerson.toLowerCase()));
    if (filterStore) displayActive = displayActive.filter(s => s.store?.toLowerCase().includes(filterStore.toLowerCase()));
    if (filterStore) displayHistory = displayHistory.filter(s => s.store?.toLowerCase().includes(filterStore.toLowerCase()));

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
    const minsToHours = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

    return (
        <div className="glass-card p-5">
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between mb-4">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dashboard admin</p>
                    <h2 className="text-lg font-bold text-white mt-1">Turni attivi in tempo reale</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                    <input type="text" placeholder="Collaboratore" className="glass-input text-xs min-w-[140px]" value={filterPerson} onChange={e => setFilterPerson(e.target.value)} />
                    <input type="text" placeholder="Punto vendita" className="glass-input text-xs min-w-[140px]" value={filterStore} onChange={e => setFilterStore(e.target.value)} />
                    <button type="button" onClick={fetchShifts} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30">Aggiorna</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">In turno ora</p>
                    <p className="mt-2 text-2xl font-bold text-white">{displayActive.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Ore lavorate (oggi)</p>
                    <p className="mt-2 text-2xl font-bold text-white">{minsToHours(totalMinutesToday)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In pausa</p>
                    <p className="mt-2 text-2xl font-bold text-white">{inPause}</p>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Storico turni</p>
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
                            {displayHistory.length === 0 ? (
                                <tr><td className="px-4 py-3 text-slate-500 text-center" colSpan={5}>Nessun turno registrato.</td></tr>
                            ) : (
                                displayHistory.map(s => {
                                    const end = (s as ShiftRow & { ended_at: string }).ended_at;
                                    const startM = new Date(s.started_at).getTime() / 60000;
                                    const endM = end ? new Date(end).getTime() / 60000 : 0;
                                    const pause = Number(s.total_pause_minutes) || 0;
                                    const total = end ? Math.round(endM - startM - pause) : 0;
                                    return (
                                        <tr key={s.id} className="border-t border-white/5">
                                            <td className="px-4 py-3">{s.employee_name}</td>
                                            <td className="px-4 py-3">{s.store || "—"}</td>
                                            <td className="px-4 py-3">{formatDate(s.started_at)} {formatTime(s.started_at)}</td>
                                            <td className="px-4 py-3">{end ? `${formatDate(end)} ${formatTime(end)}` : "—"}</td>
                                            <td className="px-4 py-3 text-right">{minsToHours(total)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

type VacationRequest = { id: number; employee_name: string; store: string; date_from: string; date_to: string; reason: string | null; status: string; admin_note: string | null; created_at: string };

function FerieSection({ isAdminLike }: { isAdminLike: boolean }) {
    const { user } = useAuth();
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState<VacationRequest[]>([]);
    const [filterPerson, setFilterPerson] = useState("");
    const [filterStore, setFilterStore] = useState("");

    const fetchRequests = useCallback(async () => {
        const { data } = await supabase.from("vacation_requests").select("*").order("created_at", { ascending: false });
        setRequests((data ?? []) as VacationRequest[]);
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const inFerieOggi = requests.filter(r => r.status === "approved" && r.date_from <= new Date().toISOString().slice(0, 10) && r.date_to >= new Date().toISOString().slice(0, 10)).length;
    const programmate = requests.filter(r => r.status === "approved" && r.date_from > new Date().toISOString().slice(0, 10)).length;
    const inAttesa = requests.filter(r => r.status === "pending").length;

    let displayRequests = requests;
    if (filterPerson) displayRequests = displayRequests.filter(r => r.employee_name.toLowerCase().includes(filterPerson.toLowerCase()));
    if (filterStore) displayRequests = displayRequests.filter(r => r.store?.toLowerCase().includes(filterStore.toLowerCase()));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dateFrom || !dateTo || !user?.name) return;
        setSubmitting(true);
        await supabase.from("vacation_requests").insert({ employee_name: user.name, store: user.negozio ?? "", date_from: dateFrom, date_to: dateTo, reason: reason || null, status: "pending" });
        await fetchRequests();
        setDateFrom("");
        setDateTo("");
        setReason("");
        setSubmitting(false);
    };

    const setStatus = async (id: number, status: "approved" | "rejected", adminNote?: string) => {
        await supabase.from("vacation_requests").update({ status, admin_note: adminNote ?? null }).eq("id", id);
        await fetchRequests();
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 glass-card p-6 space-y-4">
                <h2 className="text-lg font-bold text-white mb-2">Richiesta ferie</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-400">Dal giorno</label>
                        <input type="date" className="glass-input mt-1 w-full" value={dateFrom} onChange={e => setDateFrom(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400">Al giorno</label>
                        <input type="date" className="glass-input mt-1 w-full" value={dateTo} onChange={e => setDateTo(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400">Motivo</label>
                        <textarea className="glass-input mt-1 w-full min-h-[80px]" placeholder="Es. Ferie estive" value={reason} onChange={e => setReason(e.target.value)} />
                    </div>
                    <button type="submit" disabled={submitting} className="primary-btn w-full h-10 text-sm font-semibold disabled:opacity-50">
                        {submitting ? "Invio..." : "Invia richiesta"}
                    </button>
                </form>
            </div>

            <div className="xl:col-span-2 space-y-6">
                {isAdminLike && (
                    <div className="glass-card p-5">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dashboard ferie</p>
                                <h2 className="text-lg font-bold text-white mt-1">Situazione ferie collaboratori</h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <input type="text" placeholder="Collaboratore" className="glass-input text-xs min-w-[140px]" value={filterPerson} onChange={e => setFilterPerson(e.target.value)} />
                                <input type="text" placeholder="Punto vendita" className="glass-input text-xs min-w-[140px]" value={filterStore} onChange={e => setFilterStore(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">In ferie oggi</p>
                                <p className="mt-2 text-2xl font-bold text-white">{inFerieOggi}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Ferie programmate</p>
                                <p className="mt-2 text-2xl font-bold text-white">{programmate}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Richieste in attesa</p>
                                <p className="mt-2 text-2xl font-bold text-white">{inAttesa}</p>
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Richieste ferie</p>
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
                                    {displayRequests.length === 0 ? (
                                        <tr><td className="px-4 py-3 text-slate-500 text-center" colSpan={5}>Nessuna richiesta.</td></tr>
                                    ) : (
                                        displayRequests.map(r => (
                                            <tr key={r.id} className="border-t border-white/5">
                                                <td className="px-4 py-3">{r.employee_name}</td>
                                                <td className="px-4 py-3">{r.store || "—"}</td>
                                                <td className="px-4 py-3">{formatDate(r.date_from)} – {formatDate(r.date_to)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-semibold",
                                                        r.status === "approved" && "bg-emerald-500/20 text-emerald-300",
                                                        r.status === "rejected" && "bg-rose-500/20 text-rose-300",
                                                        r.status === "pending" && "bg-amber-500/20 text-amber-300"
                                                    )}>{r.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {r.status === "pending" && (
                                                        <>
                                                            <button onClick={() => setStatus(r.id, "approved")} className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-semibold mr-1">Approva</button>
                                                            <button onClick={() => setStatus(r.id, "rejected")} className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-semibold">Rifiuta</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!isAdminLike && (
                    <div className="glass-card p-6 text-sm text-slate-400">
                        <p>Puoi inviare le tue richieste ferie dal pannello a sinistra. La dashboard riepilogativa è visibile solo ai ruoli amministrativi.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

type SicknessRow = { id: number; employee_name: string; store: string; date_from: string; date_to: string; certificate_number: string | null; created_at: string };

function MalattiaSection() {
    const [absences, setAbsences] = useState<SicknessRow[]>([]);
    const [showNewModal, setShowNewModal] = useState(false);
    const [filterPerson, setFilterPerson] = useState("");
    const [filterStore, setFilterStore] = useState("");
    const [periodDays, setPeriodDays] = useState(30);

    const [newEmployee, setNewEmployee] = useState("");
    const [newStore, setNewStore] = useState("");
    const [newDateFrom, setNewDateFrom] = useState("");
    const [newDateTo, setNewDateTo] = useState("");
    const [newCertNum, setNewCertNum] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchAbsences = useCallback(async () => {
        const { data } = await supabase.from("sickness_absences").select("*").order("date_from", { ascending: false });
        setAbsences((data ?? []) as SicknessRow[]);
    }, []);

    useEffect(() => {
        fetchAbsences();
    }, [fetchAbsences]);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    let filtered = absences.filter(a => a.date_to >= cutoffStr);
    if (filterPerson) filtered = filtered.filter(a => a.employee_name.toLowerCase().includes(filterPerson.toLowerCase()));
    if (filterStore) filtered = filtered.filter(a => a.store?.toLowerCase().includes(filterStore.toLowerCase()));

    const totalDays = filtered.reduce((sum, a) => {
        const from = new Date(a.date_from).getTime();
        const to = new Date(a.date_to).getTime();
        return sum + Math.ceil((to - from) / (24 * 60 * 60 * 1000)) + 1;
    }, 0);
    const uniquePeople = new Set(filtered.map(a => a.employee_name)).size;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmployee.trim() || !newDateFrom || !newDateTo) return;
        setSaving(true);
        await supabase.from("sickness_absences").insert({
            employee_name: newEmployee.trim(),
            store: newStore.trim() || "",
            date_from: newDateFrom,
            date_to: newDateTo,
            certificate_number: newCertNum.trim() || null,
        });
        await fetchAbsences();
        setShowNewModal(false);
        setNewEmployee("");
        setNewStore("");
        setNewDateFrom("");
        setNewDateTo("");
        setNewCertNum("");
        setSaving(false);
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });

    return (
        <div className="glass-card p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Malattia (admin)</p>
                    <h2 className="text-lg font-bold text-white mt-1">Gestione assenze per malattia</h2>
                </div>
                <button onClick={() => setShowNewModal(true)} className="primary-btn h-10 px-5 text-sm font-semibold">
                    + Nuova assenza
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Assenze nel periodo</p>
                    <p className="mt-2 text-2xl font-bold text-white">{filtered.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collaboratori coinvolti</p>
                    <p className="mt-2 text-2xl font-bold text-white">{uniquePeople}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Giorni totali</p>
                    <p className="mt-2 text-2xl font-bold text-white">{totalDays}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <input type="text" placeholder="Collaboratore" className="glass-input text-xs min-w-[140px]" value={filterPerson} onChange={e => setFilterPerson(e.target.value)} />
                <input type="text" placeholder="Punto vendita" className="glass-input text-xs min-w-[140px]" value={filterStore} onChange={e => setFilterStore(e.target.value)} />
                <select className="glass-input text-xs min-w-[140px]" value={periodDays} onChange={e => setPeriodDays(Number(e.target.value))}>
                    <option value={30}>Ultimi 30 giorni</option>
                    <option value={90}>Ultimi 90 giorni</option>
                    <option value={365}>Quest&apos;anno</option>
                </select>
            </div>

            <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assenze registrate</p>
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
                            {filtered.length === 0 ? (
                                <tr><td className="px-4 py-3 text-slate-500 text-center" colSpan={4}>Nessuna assenza registrata.</td></tr>
                            ) : (
                                filtered.map(a => (
                                    <tr key={a.id} className="border-t border-white/5">
                                        <td className="px-4 py-3">{a.employee_name}</td>
                                        <td className="px-4 py-3">{a.store || "—"}</td>
                                        <td className="px-4 py-3">{formatDate(a.date_from)} – {formatDate(a.date_to)}</td>
                                        <td className="px-4 py-3">{a.certificate_number || "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
                    <div className="glass-card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Nuova assenza per malattia</h3>
                            <button onClick={() => setShowNewModal(false)} className="p-1 hover:bg-white/10 rounded text-slate-400"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-400">Collaboratore *</label>
                                <input type="text" className="glass-input mt-1 w-full" value={newEmployee} onChange={e => setNewEmployee(e.target.value)} required placeholder="Nome e cognome" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400">Punto vendita</label>
                                <input type="text" className="glass-input mt-1 w-full" value={newStore} onChange={e => setNewStore(e.target.value)} placeholder="Opzionale" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400">Dal *</label>
                                    <input type="date" className="glass-input mt-1 w-full" value={newDateFrom} onChange={e => setNewDateFrom(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400">Al *</label>
                                    <input type="date" className="glass-input mt-1 w-full" value={newDateTo} onChange={e => setNewDateTo(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400">N° certificato</label>
                                <input type="text" className="glass-input mt-1 w-full" value={newCertNum} onChange={e => setNewCertNum(e.target.value)} placeholder="Opzionale" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-white/5 text-slate-300 hover:bg-white/10">Annulla</button>
                                <button type="submit" disabled={saving} className="flex-1 primary-btn py-2 text-sm font-semibold disabled:opacity-50">{saving ? "Salvataggio..." : "Salva"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


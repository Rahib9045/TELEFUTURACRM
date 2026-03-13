"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_KEY = "comunicazioni_read_ids";

type Comunicazione = {
    id: number;
    title: string;
    date_display: string;
    type: string;
    content: string;
};

function getReadSet(): Set<number> {
    if (typeof window === "undefined") return new Set();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const arr = raw ? (JSON.parse(raw) as number[]) : [];
        return new Set(arr);
    } catch {
        return new Set();
    }
}

function markRead(id: number) {
    const set = getReadSet();
    set.add(id);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch {
        // ignore
    }
}

function markAllRead(ids: number[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // ignore
    }
}

const getTypeStyles = (type: string) => {
    switch (type) {
        case "warning": return { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" };
        case "success": return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" };
        default: return { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" };
    }
};

export default function Comunicazioni() {
    const [list, setList] = useState<Comunicazione[]>([]);
    const [readSet, setReadSet] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        const { data, error: e } = await supabase
            .from("comunicazioni")
            .select("id, title, date_display, type, content")
            .order("created_at", { ascending: false });
        if (e) {
            setError(e.message);
            setList([]);
        } else {
            setList((data ?? []) as Comunicazione[]);
        }
        setReadSet(getReadSet());
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const handleMarkRead = (id: number) => {
        markRead(id);
        setReadSet(prev => new Set(prev).add(id));
    };

    const unreadCount = list.filter((c) => !readSet.has(c.id)).length;

    const handleMarkAllRead = () => {
        const ids = list.map((c) => c.id);
        markAllRead(ids);
        setReadSet(new Set(ids));
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Comunicazioni</h2>
                    <p className="text-slate-400">Avvisi e aggiornamenti importanti dal back office</p>
                </div>

                <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className={cn(
                        "p-3 rounded-full border transition-colors relative",
                        unreadCount > 0
                            ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    )}
                    title={unreadCount > 0 ? "Segna tutti come letti" : "Nessun nuovo"}
                >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-rose-500 text-[10px] font-bold text-white border-2 border-[#0f111a] rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="py-12 text-center text-slate-400">Caricamento...</div>
            ) : (
            <div className="space-y-4">
                {list.map((com) => {
                    const read = readSet.has(com.id);
                    const styles = getTypeStyles(com.type);
                    const Icon = styles.icon;

                    return (
                        <div
                            key={com.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => !read && handleMarkRead(com.id)}
                            onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !read) handleMarkRead(com.id); }}
                            className={cn(
                                "glass-card p-6 relative overflow-hidden transition-all cursor-pointer",
                                !read && "border-l-4 border-l-primary"
                            )}
                        >
                            {!read && (
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
                                        <h3 className={cn("text-lg font-semibold", !read ? "text-white" : "text-slate-200")}>
                                            {com.title}
                                        </h3>
                                        <p className="text-sm text-slate-500">{com.date_display}</p>
                                    </div>
                                    <p className="text-slate-300 mt-3 leading-relaxed">
                                        {com.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}

            {!loading && list.length === 0 && !error && (
                <div className="py-12 text-center text-slate-500">Nessuna comunicazione.</div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { LockKeyhole, Wifi, Radio, Tv, Zap, Leaf, ArrowLeft, RotateCcw, Eye, EyeOff, Copy } from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/context/AuthContext";

type BrandId = "windtre" | "vodafone" | "sky" | "fastweb" | "energia";

const BRANDS: { id: BrandId; name: string; color: string; bg: string; categories: number }[] = [
    { id: "windtre", name: "WindTre", color: "text-orange-300", bg: "bg-orange-500/15 border-orange-500/40", categories: 4 },
    { id: "vodafone", name: "Vodafone", color: "text-rose-300", bg: "bg-rose-500/15 border-rose-500/40", categories: 3 },
    { id: "sky", name: "Sky", color: "text-sky-300", bg: "bg-sky-500/15 border-sky-500/40", categories: 3 },
    { id: "fastweb", name: "Fastweb", color: "text-violet-300", bg: "bg-violet-500/15 border-violet-500/40", categories: 2 },
    { id: "energia", name: "Energia", color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/40", categories: 3 },
];

const CATEGORIES: Record<BrandId, { id: string; name: string }[]> = {
    windtre: [
        { id: "ngpos", name: "NGPOS" },
        { id: "ask", name: "ASK" },
        { id: "findomestic", name: "FINDOMESTIC" },
        { id: "compass", name: "COMPASS" },
    ],
    vodafone: [
        { id: "vodafone-one", name: "Vodafone One" },
        { id: "mnp-portal", name: "MNP Portal" },
        { id: "admin-dashboard", name: "Admin Dashboard" },
    ],
    sky: [
        { id: "sky-agent", name: "Sky Agent" },
        { id: "sky-business", name: "Sky Business" },
        { id: "admin-dashboard", name: "Admin Dashboard" },
    ],
    fastweb: [
        { id: "partner-portal", name: "Partner Portal" },
        { id: "admin-dashboard", name: "Admin Dashboard" },
    ],
    energia: [
        { id: "s4-energy", name: "S4 Energy Portal" },
        { id: "barton", name: "Barton Portal" },
        { id: "admin-dashboard", name: "Admin Dashboard" },
    ],
};

const STORES = [
    { id: "roma-termini", name: "Roma Termini", code: "RT001" },
    { id: "milano-centrale", name: "Milano Centrale", code: "MC002" },
    { id: "napoli-toledo", name: "Napoli Toledo", code: "NT003" },
    { id: "firenze-duomo", name: "Firenze Duomo", code: "FD004" },
    { id: "torino-centro", name: "Torino Centro", code: "TC005" },
    { id: "tutti", name: "Tutti (Accesso Globale)", code: "ALL" },
];

type Credential = {
    id: number;
    brandId: BrandId;
    categoryId: string;
    storeId: string;
    accessType: string;
    username: string;
    passwordMasked: string;
    passwordReal: string;
};

const MOCK_CREDENTIALS: Credential[] = [
    {
        id: 1,
        brandId: "windtre",
        categoryId: "ngpos",
        storeId: "roma-termini",
        accessType: "NGPOS Portal",
        username: "wind_ngpos_roma",
        passwordMasked: "••••••••••",
        passwordReal: "RomaNgpos2026!",
    },
    {
        id: 2,
        brandId: "windtre",
        categoryId: "ngpos",
        storeId: "milano-centrale",
        accessType: "NGPOS Portal",
        username: "wind_ngpos_milano",
        passwordMasked: "••••••••••",
        passwordReal: "MilanoNgpos2026!",
    },
];

export default function PasswordV2Page() {
    const { user } = useAuth();
    const [brand, setBrand] = useState<BrandId | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [store, setStore] = useState<string | null>(null);
    const [revealedId, setRevealedId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const isAllowed = user && ["admin", "store_manager"].includes(user.role);
    if (!isAllowed) {
        return (
            <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] lg:h-screen lg:pl-64 w-full overflow-hidden min-w-0 max-w-full">
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="glass-card max-w-md w-full p-8 text-center space-y-3">
                        <LockKeyhole className="w-10 h-10 mx-auto text-amber-400" />
                        <h1 className="text-xl font-bold text-white">Accesso riservato</h1>
                        <p className="text-sm text-slate-400">
                            La sezione Password CRM è visibile solo a ruoli <span className="font-semibold">admin</span> e{" "}
                            <span className="font-semibold">store manager</span>.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const step = !brand ? 1 : !category ? 2 : !store ? 3 : 4;

    const filteredCredentials = MOCK_CREDENTIALS.filter((c) => {
        if (!brand || !category || !store) return false;
        return c.brandId === brand && c.categoryId === category && (store === "tutti" || c.storeId === store);
    });

    const currentBrand = brand ? BRANDS.find((b) => b.id === brand) : null;
    const currentCategory = brand && category ? CATEGORIES[brand].find((c) => c.id === category) : null;
    const currentStore = store ? STORES.find((s) => s.id === store) : null;

    const resetAll = () => {
        setBrand(null);
        setCategory(null);
        setStore(null);
        setRevealedId(null);
        setCopiedId(null);
    };

    const crumbs = [
        brand && currentBrand?.name,
        category && currentCategory?.name,
        store && currentStore?.name,
    ].filter(Boolean) as string[];

    const handleCopy = (id: number, value: string) => {
        navigator.clipboard?.writeText(value).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
        });
    };

    const PasswordIcon = Wifi;

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] lg:h-screen lg:pl-64 w-full overflow-hidden min-w-0 max-w-full">
            <div className="flex-none p-4 lg:p-8 w-full min-w-0 max-w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                <LockKeyhole className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Password CRM</h1>
                        </div>
                        <p className="text-sm text-slate-400">
                            Credenziali di accesso per i vari brand — visibile solo ad admin e store manager.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {step > 1 && (
                            <button
                                onClick={() => {
                                    if (step === 2) { setBrand(null); setCategory(null); setStore(null); }
                                    else if (step === 3) { setCategory(null); setStore(null); }
                                    else if (step === 4) { setStore(null); }
                                    setRevealedId(null); setCopiedId(null);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-xs text-slate-200 hover:bg-white/5"
                            >
                                <ArrowLeft className="w-4 h-4" /> Indietro
                            </button>
                        )}
                        <button
                            onClick={resetAll}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:bg-white/5"
                        >
                            <RotateCcw className="w-4 h-4" /> Ricomincia
                        </button>
                    </div>
                </div>

                {crumbs.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        {crumbs.map((c, i) => (
                            <span key={i} className="flex items-center gap-2">
                                {i > 0 && <span className="text-slate-600">›</span>}
                                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">{c}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 px-4 lg:px-8 pb-8 overflow-y-auto custom-scrollbar w-full min-w-0 max-w-full space-y-6">
                {step === 1 && (
                    <div className="glass-card p-6 space-y-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Step 1 — Seleziona un Brand
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {BRANDS.map((b) => {
                                const Icon = b.id === "windtre" ? Wifi : b.id === "vodafone" ? Radio : b.id === "sky" ? Tv : b.id === "fastweb" ? Zap : Leaf;
                                const active = brand === b.id;
                                return (
                                    <button
                                        key={b.id}
                                        onClick={() => { setBrand(b.id); setCategory(null); setStore(null); setRevealedId(null); setCopiedId(null); }}
                                        className={cn(
                                            "relative rounded-2xl border p-4 text-left transition-all flex flex-col gap-2",
                                            active ? b.bg : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-lg", active ? "bg-black/20" : "bg-black/30")}>
                                                <Icon className={cn("w-5 h-5", active ? b.color : "text-slate-200")} />
                                            </div>
                                            <span className="text-[10px] px-2 py-1 rounded-full bg-black/40 text-slate-300">
                                                {b.categories} categorie
                                            </span>
                                        </div>
                                        <div className="mt-1">
                                            <p className={cn("font-semibold text-sm", active ? "text-white" : "text-slate-100")}>{b.name}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 2 && brand && (
                    <div className="glass-card p-6 space-y-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Step 2 — Seleziona categoria — {currentBrand?.name}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {CATEGORIES[brand].map((c) => {
                                const active = category === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => { setCategory(c.id); setStore(null); setRevealedId(null); setCopiedId(null); }}
                                        className={cn(
                                            "rounded-2xl border p-4 text-left transition-all",
                                            active ? "bg-indigo-500/20 border-indigo-500/40" : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <p className={cn("font-semibold text-sm", active ? "text-white" : "text-slate-100")}>{c.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">Sistema di accesso</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 3 && brand && category && (
                    <div className="glass-card p-6 space-y-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Step 3 — Seleziona Negozio — {currentBrand?.name} • {currentCategory?.name}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {STORES.map((s) => {
                                const active = store === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => { setStore(s.id); setRevealedId(null); setCopiedId(null); }}
                                        className={cn(
                                            "rounded-2xl border p-4 text-left transition-all",
                                            active ? "bg-slate-100/10 border-sky-500/40" : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <p className={cn("font-semibold text-sm", active ? "text-white" : "text-slate-100")}>{s.name}</p>
                                        <p className="text-[11px] text-slate-500 mt-1">Codice: {s.code}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 4 && brand && category && store && (
                    <div className="space-y-4">
                        <div className="glass-card p-6 space-y-4">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        Credenziali trovate
                                    </p>
                                    <p className="text-sm text-slate-300">
                                        {currentBrand?.name} • {currentCategory?.name} • {currentStore?.name}
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300">
                                    {filteredCredentials.length} credenziali
                                </span>
                            </div>
                            <div className="border border-white/10 rounded-xl overflow-hidden">
                                <table className="w-full text-xs text-slate-300">
                                    <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Tipo di accesso</th>
                                            <th className="px-4 py-2 text-left">Username</th>
                                            <th className="px-4 py-2 text-left">Password</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCredentials.length === 0 ? (
                                            <tr>
                                                <td className="px-4 py-4 text-center text-slate-500" colSpan={3}>
                                                    Nessuna credenziale configurata per questa combinazione.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCredentials.map((c) => {
                                                const revealed = revealedId === c.id;
                                                return (
                                                    <tr key={c.id} className="border-t border-white/5">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-lg bg-slate-900/60 flex items-center justify-center">
                                                                    <PasswordIcon className="w-4 h-4 text-slate-300" />
                                                                </div>
                                                                <span className="font-semibold text-slate-100">{c.accessType}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs text-slate-100">{c.username}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(c.id, c.username)}
                                                                    className="p-1 rounded hover:bg-white/10 text-slate-400"
                                                                >
                                                                    <Copy className="w-3 h-3" />
                                                                </button>
                                                                {copiedId === c.id && (
                                                                    <span className="text-[10px] text-emerald-400 font-semibold">Copiato</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs text-slate-100">
                                                                    {revealed ? c.passwordReal : c.passwordMasked}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setRevealedId((prev) => (prev === c.id ? null : c.id))}
                                                                    className="p-1 rounded hover:bg-white/10 text-slate-400"
                                                                >
                                                                    {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="glass-card border-amber-500/30 bg-amber-500/5 text-amber-100 text-xs p-4 flex gap-3">
                            <div className="mt-0.5">
                                <LockKeyhole className="w-4 h-4 text-amber-300" />
                            </div>
                            <div>
                                <p className="font-semibold text-amber-200 mb-1">Nota di sicurezza</p>
                                <p className="text-[11px] text-amber-100/90">
                                    Questa sezione contiene credenziali sensibili. L&apos;accesso è limitato ai ruoli admin e store manager.
                                    Le password sono visibili solo dopo aver cliccato sull&apos;icona dell&apos;occhio. Non condividere queste credenziali.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


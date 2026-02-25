"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils";

export const STATUS_OPTIONS = [
    { label: "OK caricata EVA", type: "success" },
    { label: "Assegnata", type: "warning" },
    { label: "Ricevuta", type: "warning" },
    { label: "Sospeso attesa assegnazione", type: "warning" },
    { label: "Sospeso attesa conferma da AG per caricamento", type: "warning" },
    { label: "Sospeso dati errati", type: "warning" },
    { label: "Sospeso mancanza DOC", type: "warning" },
    { label: "Sospeso mancanza firma pdc", type: "warning" },
    { label: "Sospeso richiesta censimento indirizzo", type: "warning" },
    { label: "Sospeso verifica acquisibilità", type: "warning" },
    { label: "KO clt non assegnato", type: "error" },
    { label: "KO clt non vuole procedere", type: "error" },
    { label: "KO credito", type: "error" },
    { label: "KO doc corretta mai arrivata", type: "error" },
    { label: "KO no cop fisso - no risorse", type: "error" },
    { label: "KO sconti errati", type: "error" },
];

export const getStatusColor = (label: string) => {
    const opt = STATUS_OPTIONS.find(o => o.label === label);
    if (!opt) return "text-slate-300 bg-white/5 border-white/10";

    switch (opt.type) {
        case "success": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        case "warning": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        case "error": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
        default: return "text-slate-300 bg-white/5 border-white/10";
    }
};

interface StatusDropdownProps {
    value: string;
    onChange?: (val: string) => void;
    className?: string;
}

export function StatusDropdown({ value, onChange, className }: StatusDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        setSelected(option);
        setIsOpen(false);
        if (onChange) onChange(option);
    };

    const colorClass = getStatusColor(selected);

    return (
        <div className={cn("relative w-full min-w-[180px]", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full text-xs font-semibold py-1.5 px-3 h-8 rounded-md border transition-all text-left",
                    colorClass,
                    isOpen && "ring-2 ring-indigo-500/50"
                )}
            >
                <span className="truncate pr-2">{selected}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 opacity-70 shrink-0 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 left-0 top-full w-[280px] mt-1 bg-[#161925]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl shadow-black/60 py-1 max-h-64 overflow-y-auto">
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleSelect(opt.label)}
                            className={cn(
                                "flex items-center w-full px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors",
                                selected === opt.label ? "bg-white/10 font-bold" : "font-medium"
                            )}
                        >
                            <span className={cn(
                                "flex-1",
                                opt.type === "success" ? "text-emerald-400" :
                                    opt.type === "warning" ? "text-amber-400" :
                                        "text-rose-400"
                            )}>
                                {opt.label}
                            </span>
                            {selected === opt.label && <Check className="w-3.5 h-3.5 ml-2 opacity-70" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

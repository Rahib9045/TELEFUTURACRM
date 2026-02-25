"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle } from "lucide-react";

export default function InviaPda() {
    const [categoria, setCategoria] = useState("");
    const [brand, setBrand] = useState("");

    // Mock form submission
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 4000);
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Invia PDA</h2>
                <p className="text-slate-400">Compilare i seguenti dati per trasmettere le pda al back office</p>
            </div>

            {isSubmitted && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle className="w-5 h-5" />
                    Pda inviata con successo!
                </div>
            )}

            <div className="glass-card mb-8">
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Top Selects */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Categoria <span className="text-rose-500">*</span></label>
                                <select
                                    required
                                    className="glass-input w-full md:w-1/2"
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                >
                                    <option value=""></option>
                                    <option value="DIGITAL">DIGITAL</option>
                                    <option value="ENERGIA">ENERGIA</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Brand (selezionare categoria per visualizzare brand) <span className="text-rose-500">*</span></label>
                                <select required className="glass-input w-full md:w-1/2" value={brand} onChange={(e) => setBrand(e.target.value)}>
                                    <option value=""></option>
                                    {categoria === "ENERGIA" && (
                                        <>
                                            <option value="Edison Business">Edison Business</option>
                                            <option value="Enel Business">Enel Business</option>
                                            <option value="Edison Consumer">Edison Consumer</option>
                                        </>
                                    )}
                                    {categoria === "DIGITAL" && (
                                        <option value="Web Services">Web Services</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Venditore <span className="text-rose-500">*</span></label>
                                <select required className="glass-input w-full md:w-1/2">
                                    <option value="8">agente</option>
                                </select>
                            </div>
                        </div>

                        <hr className="border-white/5" />

                        {/* Customer Details */}
                        <div>
                            <h4 className="text-lg font-medium text-white mb-4">Aiuta l'operatore che riceverà la tua pda: inserisci i seguenti dati</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Ragione sociale <span className="text-rose-500">*</span></label>
                                    <input type="text" required className="glass-input w-full" placeholder="inserire nome società" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Referente <span className="text-rose-500">*</span></label>
                                    <input type="text" required className="glass-input w-full" placeholder="inserire nominativo referente" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Recapito <span className="text-rose-500">*</span></label>
                                    <input type="text" required className="glass-input w-full" placeholder="inserire recapito telefonico" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Segmento <span className="text-rose-500">*</span></label>
                                    <select required className="glass-input w-full">
                                        <option value=""></option>
                                        <option value="Business">Business</option>
                                        <option value="Consumer">Consumer</option>
                                    </select>
                                </div>
                                {/* Dynamically shown fields based on segment/category in original, placed statically for visual replica */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Partita iva</label>
                                    <input type="text" className="glass-input w-full" placeholder="inserire partita iva" maxLength={11} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Codice fiscale</label>
                                    <input type="text" className="glass-input w-full" placeholder="inserire codice fiscale" maxLength={16} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">N. pod</label>
                                    <input type="number" className="glass-input w-full" />
                                </div>
                            </div>
                        </div>

                        <hr className="border-white/5" />

                        {/* File Upload Replica */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Carica allegati</label>
                            <div className="border border-dashed border-white/20 rounded-xl p-8 text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-300 font-medium">Click to browse or drag and drop</p>
                                <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, DOCX (Max 30MB)</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <button type="submit" className="primary-btn">
                                Invia PDA
                            </button>
                            <button type="button" className="px-6 py-2 rounded-lg font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors">
                                Annulla
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

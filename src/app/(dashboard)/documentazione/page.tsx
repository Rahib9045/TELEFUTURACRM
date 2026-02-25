"use client";

import { FileText, Download, Eye, FileArchive, FileImage, File } from "lucide-react";

const getIconForType = (type: string) => {
    switch (type) {
        case 'pdf': return <FileText className="w-8 h-8 text-rose-400" />;
        case 'zip': return <FileArchive className="w-8 h-8 text-amber-400" />;
        case 'img': return <FileImage className="w-8 h-8 text-blue-400" />;
        default: return <File className="w-8 h-8 text-slate-400" />;
    }
};

const documents = [
    { id: 1, title: 'Modello Incarico Business 2023', category: 'Energia', date: '2023-10-12', type: 'pdf', size: '2.4 MB' },
    { id: 2, title: 'Condizioni Generali Fornitura', category: 'Energia', date: '2023-09-05', type: 'pdf', size: '1.1 MB' },
    { id: 3, title: 'Listino Prezzi Digital Q4', category: 'Digital', date: '2023-11-01', type: 'pdf', size: '0.8 MB' },
    { id: 4, title: 'Materiale Promozionale e Banner', category: 'Marketing', date: '2023-08-20', type: 'zip', size: '45.2 MB' },
    { id: 5, title: 'Guida Portale Agenti', category: 'Generale', date: '2023-01-15', type: 'pdf', size: '5.6 MB' },
    { id: 6, title: 'Logo Telefutura High Res', category: 'Marketing', date: '2023-02-10', type: 'img', size: '3.2 MB' },
];

export default function Documentazione() {
    return (
        <div className="w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Documentazione</h2>
                    <p className="text-slate-400">Archivio documenti, listini e moduli utili</p>
                </div>

                <div className="flex gap-3">
                    <select className="glass-input w-48">
                        <option value="">Tutte le categorie</option>
                        <option value="Energia">Energia</option>
                        <option value="Digital">Digital</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Generale">Generale</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                    <div key={doc.id} className="glass-card p-6 flex flex-col h-full group hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
                                {getIconForType(doc.type)}
                            </div>
                            <span className="px-2.5 py-1 text-xs font-medium bg-white/5 text-slate-300 rounded-lg border border-white/10">
                                {doc.category}
                            </span>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 leading-tight">
                            {doc.title}
                        </h3>

                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-6 mt-auto pt-4">
                            <span>{doc.date}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span>{doc.size}</span>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/5">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium">
                                <Eye className="w-4 h-4" />
                                Visualizza
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-indigo-300 rounded-lg transition-colors text-sm font-medium">
                                <Download className="w-4 h-4" />
                                Scarica
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

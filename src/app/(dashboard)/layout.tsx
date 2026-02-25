"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

// This layout will wrap all authenticated routes (dashboard, pda, documenti, ecc)
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Sidebar />
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-6 md:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </>
    );
}

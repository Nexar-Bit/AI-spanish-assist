import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo Recepcionista IA — PYME",
  description: "Chat, voz y traspaso a humano (español)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="font-semibold text-white">
              Recepcionista IA <span className="text-slate-500 font-normal">(demo)</span>
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-slate-300">
              <Link className="hover:text-white" href="/chat">
                Chat
              </Link>
              <Link className="hover:text-white" href="/voz">
                Voz
              </Link>
              <Link className="hover:text-white" href="/operador">
                Panel operador
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

"use client";

import { useEffect, useState } from "react";

type Conv = {
  id: string;
  channel: string;
  contactId: string;
  needsHuman: boolean;
  handoffReason?: string;
  updatedAt: string;
  messages: { role: string; content: string }[];
};

export default function OperadorPage() {
  const [list, setList] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/conversations");
    const data = (await res.json()) as { conversations: Conv[] };
    setList(data.conversations);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function resolve(id: string) {
    await fetch("/api/handoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, needsHuman: false, reason: "Atendido" }),
    });
    void refresh();
  }

  const flagged = list.filter((c) => c.needsHuman);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-white">Panel operador</h1>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>
      <p className="text-sm text-slate-400">
        Conversaciones que requieren intervención humana (derivación explícita o detectada).
      </p>
      {flagged.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-500">
          No hay conversaciones pendientes. En el chat, pide hablar con un humano para generar una.
        </p>
      ) : (
        <ul className="space-y-4">
          {flagged.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-amber-200">
                  Canal: {c.channel} · {new Date(c.updatedAt).toLocaleString("es-ES")}
                </span>
                <button
                  type="button"
                  onClick={() => void resolve(c.id)}
                  className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600"
                >
                  Marcar atendida
                </button>
              </div>
              {c.handoffReason && (
                <p className="mt-1 text-xs text-amber-100/80">Motivo: {c.handoffReason}</p>
              )}
              <p className="mt-2 text-slate-300">
                Último mensaje:{" "}
                {c.messages[c.messages.length - 1]?.content ?? "—"}
              </p>
            </li>
          ))}
        </ul>
      )}
      <details className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
        <summary className="cursor-pointer text-slate-300">Todas las conversaciones</summary>
        <ul className="mt-3 space-y-2">
          {list.map((c) => (
            <li key={c.id} className="text-xs">
              <span className="text-slate-500">{c.id.slice(0, 8)}…</span> {c.channel}{" "}
              {c.needsHuman ? "· pendiente humano" : ""}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

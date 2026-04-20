"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsHuman, setNeedsHuman] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };

    setMessages((prev) => {
      const thread = [...prev, userMsg];
      void (async () => {
        try {
          const apiMessages = thread.map((m) => ({ role: m.role, content: m.content }));
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale: "es", messages: apiMessages }),
          });
          if (!res.ok) throw new Error("request_failed");
          const data = (await res.json()) as { reply: string; needsHuman: boolean };
          setNeedsHuman(data.needsHuman);
          setMessages((p) => [
            ...p,
            { id: crypto.randomUUID(), role: "assistant", content: data.reply },
          ]);
        } catch {
          setMessages((p) => [
            ...p,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: "Ha ocurrido un error de red. Inténtalo de nuevo.",
            },
          ]);
        } finally {
          setLoading(false);
        }
      })();
      return thread;
    });
  }, [input, loading]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {needsHuman && (
        <p className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          Esta conversación sugiere atención humana (solo indicador en esta sesión; no se guarda en
          servidor).
        </p>
      )}
      <section className="flex min-h-[420px] flex-col rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="border-b border-slate-800 px-4 py-3 text-sm text-slate-400">
          Chatbot en <strong className="text-slate-200">español</strong> · historial solo en este
          navegador
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-slate-500">
              Escribe un mensaje para empezar. Prueba: «Quiero hablar con un humano» o «Quiero
              reservar cita».
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-8 rounded-lg bg-blue-950/50 px-3 py-2 text-slate-100"
                  : "mr-8 rounded-lg bg-slate-800/80 px-3 py-2 text-slate-200"
              }
            >
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 border-t border-slate-800 p-3">
          <input
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            placeholder="Escribe en español…"
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          />
          <button
            type="button"
            disabled={loading}
            onClick={send}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {loading ? "…" : "Enviar"}
          </button>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string; createdAt: string };

export default function ChatPage() {
  const [name, setName] = useState("Cliente demo");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"web" | "whatsapp" | "email">("whatsapp");
  const [locale] = useState<"es" | "en">("es");
  const [conversationId, setConversationId] = useState<string | null>(null);
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
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId ?? undefined,
          channel,
          locale,
          contact: { name, email: email || undefined, phone: phone || undefined },
          message: text,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      const data = (await res.json()) as {
        conversationId: string;
        messages: Msg[];
        needsHuman: boolean;
      };
      setConversationId(data.conversationId);
      setMessages(data.messages);
      setNeedsHuman(data.needsHuman);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Ha ocurrido un error de red. Inténtalo de nuevo.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [channel, conversationId, email, input, loading, locale, name, phone]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm">
        <h2 className="font-semibold text-white">Datos de contacto (CRM demo)</h2>
        <label className="block text-slate-400">
          Nombre
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-slate-400">
          Correo (opcional)
          <input
            type="email"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-slate-400">
          Teléfono (opcional)
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="block text-slate-400">
          Canal simulado
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
            value={channel}
            onChange={(e) => setChannel(e.target.value as typeof channel)}
          >
            <option value="whatsapp">WhatsApp Business</option>
            <option value="email">Correo</option>
            <option value="web">Web</option>
          </select>
        </label>
        {needsHuman && (
          <p className="rounded-lg bg-amber-950/60 px-2 py-2 text-amber-200">
            Esta conversación está marcada para seguimiento humano. Revisa el panel operador.
          </p>
        )}
      </aside>
      <section className="flex min-h-[420px] flex-col rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="border-b border-slate-800 px-4 py-3 text-sm text-slate-400">
          Asistente en <strong className="text-slate-200">español</strong> · mismo backend que voz
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

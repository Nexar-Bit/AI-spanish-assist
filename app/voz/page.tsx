"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechRecognitionCtor, SpeechRecognitionLike } from "@/lib/speech-types";

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string; createdAt: string };

export default function VozPage() {
  const [name] = useState("Cliente voz");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [supported, setSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(!!SR);
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((x) => x.lang.startsWith("es")) ?? voices[0];
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const sendText = useCallback(
    async (text: string) => {
      setError(null);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId ?? undefined,
          channel: "web",
          locale: "es",
          contact: { name },
          message: text,
        }),
      });
      if (!res.ok) {
        setError("No se pudo contactar con el servidor.");
        return;
      }
      const data = (await res.json()) as { conversationId: string; messages: Msg[]; reply: string };
      setConversationId(data.conversationId);
      setMessages(data.messages);
      speak(data.reply);
    },
    [conversationId, name, speak]
  );

  const toggleListen = useCallback(() => {
    setError(null);
    const SR = (window.SpeechRecognition || window.webkitSpeechRecognition) as
      | SpeechRecognitionCtor
      | undefined;
    if (!SR) {
      setError("Tu navegador no soporta reconocimiento de voz. Prueba Chrome o Edge.");
      return;
    }
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "es-ES";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (ev) => {
      let finalText = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) finalText += ev.results[i][0].transcript;
      }
      if (finalText.trim()) {
        setLastHeard(finalText.trim());
        void sendText(finalText.trim());
      }
    };
    rec.onerror = () => {
      setListening(false);
      setError("Error de micrófono o permisos denegados.");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, sendText]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h1 className="text-xl font-semibold text-white">Agente de voz (demo)</h1>
        <p className="mt-2 text-sm text-slate-400">
          Pulsa el micrófono y habla en español. La transcripción se envía al mismo API que el chat;
          la respuesta se lee en voz alta (es-ES).
        </p>
        {supported === false && (
          <p className="mt-3 text-sm text-red-300">Este navegador no expone Web Speech API.</p>
        )}
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        <button
          type="button"
          onClick={toggleListen}
          className={
            "mt-4 w-full rounded-xl px-4 py-3 text-center font-medium " +
            (listening
              ? "bg-red-600 text-white hover:bg-red-500"
              : "bg-emerald-600 text-white hover:bg-emerald-500")
          }
        >
          {listening ? "Detener escucha" : "Hablar (micrófono)"}
        </button>
        {lastHeard && (
          <p className="mt-3 text-xs text-slate-500">
            Última frase detectada: <span className="text-slate-300">{lastHeard}</span>
          </p>
        )}
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
        <p className="font-medium text-slate-300">Historial reciente</p>
        <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">
          {messages.slice(-8).map((m) => (
            <li key={m.id} className="text-slate-400">
              <span className="text-slate-600">{m.role === "user" ? "Tú" : "IA"}:</span>{" "}
              {m.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

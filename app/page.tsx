import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
        <h1 className="text-2xl font-bold text-white">Demo: voz + chatbot</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Asistente de <strong className="text-slate-200">texto</strong> y de{" "}
          <strong className="text-slate-200">voz</strong> en español. El historial vive en el
          navegador; el servidor no guarda conversaciones ni contactos (sin base de datos ni
          archivos de estado).
        </p>
        <ul className="mt-4 list-inside list-disc text-slate-400">
          <li>Chat: envías el hilo completo en cada petición para mantener contexto.</li>
          <li>Voz: reconocimiento y síntesis es-ES en el cliente.</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/chat"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Probar chat
          </Link>
          <Link
            href="/voz"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Probar voz
          </Link>
        </div>
      </div>
      <p className="text-xs text-slate-600">
        Opcional: <code className="text-slate-400">OPENAI_API_KEY</code> y, si quieres enlaces de
        reserva, <code className="text-slate-400">NEXT_PUBLIC_CALCOM_BASE_URL</code> en{" "}
        <code className="text-slate-400">.env</code>.
      </p>
    </div>
  );
}

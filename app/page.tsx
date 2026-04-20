import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
        <h1 className="text-2xl font-bold text-white">Demo para PYMEs en España</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Este proyecto de muestra incluye un asistente de texto y uno de voz que responden en{" "}
          <strong className="text-slate-200">español</strong>, persistencia sencilla de contactos y
          conversaciones (CRM demo), detección de traspaso a humano y un endpoint listo para{" "}
          <strong className="text-slate-200">Cal.com</strong> cuando configures las variables de
          entorno.
        </p>
        <ul className="mt-4 list-inside list-disc text-slate-400">
          <li>Canal web simulando WhatsApp / correo (misma API).</li>
          <li>Voz en el navegador (reconocimiento y síntesis en español de España).</li>
          <li>Panel del operador para ver conversaciones marcadas para humano.</li>
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
        Opcional: define <code className="text-slate-400">OPENAI_API_KEY</code> para respuestas con
        modelo. Sin clave, el demo usa respuestas heurísticas en español.
      </p>
    </div>
  );
}

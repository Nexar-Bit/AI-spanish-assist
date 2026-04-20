const SYSTEM_ES = `Eres la recepcionista virtual de una PYME en España. Responde SIEMPRE en español (tono profesional y cercano).
Puedes ayudar con: horarios, ubicación, servicios genéricos, agendar cita (ofrece el enlace de reserva si existe), y derivar a un humano si el cliente lo pide o el caso es sensible (reclamaciones legales, salud urgente, pagos disputados).
Si el usuario escribe en inglés, puedes responder brevemente en inglés pero indica que también atiendes en español.
No inventes datos concretos del negocio (nombre comercial, dirección exacta): si no los tienes en el contexto, pide aclaración o ofrece agendar con un humano.`;

export function buildSystemPrompt(locale: "es" | "en"): string {
  if (locale === "en") {
    return `${SYSTEM_ES}\n(Usuario prefiere inglés: responde principalmente en inglés.)`;
  }
  return SYSTEM_ES;
}

/** Respuestas locales cuando no hay API de modelo (demo sin OPENAI_API_KEY). */
export function fallbackReply(userText: string, calcomUrl?: string): string {
  const t = userText.toLowerCase();
  if (/humano|persona|agente|operador|emplead|manager|gerente/i.test(userText)) {
    return "Por supuesto. Voy a marcar tu conversación para que un compañero humano continúe en breve. Mientras tanto, ¿puedes indicarme tu nombre y un teléfono o correo de contacto?";
  }
  if (/cita|reserva|agenda|cal\.com|calendario|hora/i.test(userText)) {
    if (calcomUrl) {
      return `Puedes elegir hueco aquí: ${calcomUrl}. Si prefieres, dime día y franja aproximada y lo dejo anotado para el equipo.`;
    }
    return "Para agendar, el equipo puede confirmarte disponibilidad. ¿Qué día y franja horaria te vendría bien? También puedes pedir que te pasemos con un humano.";
  }
  if (/hola|buenas|hey/i.test(t) || t.length < 4) {
    return "¡Hola! Soy la recepcionista virtual. ¿En qué puedo ayudarte hoy? Puedo orientarte sobre servicios, horarios o dejar constancia para que un compañero te llame.";
  }
  if (/gracias/i.test(t)) {
    return "Un placer. Si necesitas algo más, aquí estaré.";
  }
  return "Gracias por tu mensaje. Para darte una respuesta precisa, ¿podrías concretar un poco más? Si es urgente o sobre un pedido concreto, puedo pasarte con un agente humano: solo dímelo.";
}

export { SYSTEM_ES };

const HUMAN_KEYWORDS =
  /\b(humano|persona real|operador|agente humano|empleado|gerente|manager|pasar con alguien|hablar con alguien)\b/i;

export function userRequestsHuman(text: string): boolean {
  return HUMAN_KEYWORDS.test(text);
}

export function assistantOffersHandoff(text: string): boolean {
  return /marcar tu conversaci[oó]n|pasarte con un agente|compa[ñn]ero humano|derivar/i.test(text);
}

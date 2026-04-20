/**
 * Demo: creación de reserva vía API Cal.com v2 (opcional).
 * Documentación: https://cal.com/docs/api-reference
 */
export type CalcomBookResult =
  | { ok: true; bookingUid: string; url?: string }
  | { ok: false; error: string };

export async function tryCreateCalcomBooking(params: {
  eventTypeId?: number;
  start: string;
  attendeeEmail: string;
  attendeeName: string;
}): Promise<CalcomBookResult> {
  const key = process.env.CALCOM_API_KEY;
  if (!key) {
    return { ok: false, error: "CALCOM_API_KEY no configurada (demo en modo simulación)." };
  }

  const eventTypeId = params.eventTypeId ?? Number(process.env.CALCOM_EVENT_TYPE_ID || 0);
  if (!eventTypeId) {
    return { ok: false, error: "Falta CALCOM_EVENT_TYPE_ID o eventTypeId en la petición." };
  }

  const res = await fetch("https://api.cal.com/v2/bookings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "cal-api-version": "2024-08-13",
    },
    body: JSON.stringify({
      eventTypeId,
      start: params.start,
      attendee: {
        name: params.attendeeName,
        email: params.attendeeEmail,
        timeZone: "Europe/Madrid",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, error: `Cal.com ${res.status}: ${errText.slice(0, 400)}` };
  }

  const data = (await res.json()) as { data?: { uid?: string; id?: number } };
  const uid = data.data?.uid ?? String(data.data?.id ?? "");
  if (!uid) return { ok: false, error: "Respuesta Cal.com inesperada." };
  return { ok: true, bookingUid: uid };
}

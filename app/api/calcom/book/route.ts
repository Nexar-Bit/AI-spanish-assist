import { NextResponse } from "next/server";
import { z } from "zod";
import { tryCreateCalcomBooking } from "@/lib/calcom";

const schema = z.object({
  start: z.string().min(10),
  attendeeEmail: z.string().email(),
  attendeeName: z.string().min(1).max(120),
  eventTypeId: z.number().int().positive().optional(),
});

/**
 * POST /api/calcom/book — intenta reserva real si hay CALCOM_API_KEY; si no, modo demo.
 */
export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!process.env.CALCOM_API_KEY) {
    const base = process.env.NEXT_PUBLIC_CALCOM_BASE_URL;
    return NextResponse.json({
      mode: "demo",
      message:
        "Sin CALCOM_API_KEY esta ruta solo confirma el flujo. Configura la clave y CALCOM_EVENT_TYPE_ID para reservas reales.",
      suggestedPublicUrl: base ?? null,
      simulated: {
        start: parsed.data.start,
        attendeeEmail: parsed.data.attendeeEmail,
        attendeeName: parsed.data.attendeeName,
      },
    });
  }

  const result = await tryCreateCalcomBooking(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ mode: "live", bookingUid: result.bookingUid });
}

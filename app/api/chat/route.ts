import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAssistantReply } from "@/lib/ai";
import { assistantOffersHandoff, userRequestsHuman } from "@/lib/handoff";

const bodySchema = z.object({
  locale: z.enum(["es", "en"]).default("es"),
  /** Historial ya acordado (usuario/asistente). El último mensaje debe ser del usuario. */
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(80),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "payload_invalid", details: parsed.error.flatten() }, { status: 400 });
    }
    const { locale, messages } = parsed.data;
    const last = messages[messages.length - 1];
    if (last.role !== "user") {
      return NextResponse.json({ error: "last_message_must_be_user" }, { status: 400 });
    }

    const calcomBase = process.env.NEXT_PUBLIC_CALCOM_BASE_URL || undefined;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    const { text } = await generateAssistantReply({
      locale,
      history,
      calcomBaseUrl: calcomBase,
    });

    const needsHuman =
      userRequestsHuman(last.content) || assistantOffersHandoff(text);

    return NextResponse.json({ reply: text, needsHuman });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAssistantReply } from "@/lib/ai";
import {
  appendMessage,
  createConversation,
  getConversation,
  setNeedsHuman,
  upsertContact,
} from "@/lib/store";
import { assistantOffersHandoff, userRequestsHuman } from "@/lib/handoff";

const bodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  channel: z.enum(["web", "whatsapp", "email"]).default("web"),
  locale: z.enum(["es", "en"]).default("es"),
  contact: z.object({
    name: z.string().min(1).max(120),
    phone: z.string().max(40).optional(),
    email: z.string().email().optional(),
  }),
  message: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "payload_invalid", details: parsed.error.flatten() }, { status: 400 });
    }
    const { conversationId, channel, locale, contact, message } = parsed.data;

    const c = upsertContact({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
    });

    let conv = conversationId ? getConversation(conversationId) : undefined;
    if (!conv || conv.contactId !== c.id) {
      conv = createConversation({ channel, contactId: c.id, locale });
    }

    appendMessage(conv.id, "user", message);

    const calcomBase = process.env.NEXT_PUBLIC_CALCOM_BASE_URL || undefined;
    const history = getConversation(conv.id)!.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const { text } = await generateAssistantReply({
      locale,
      history,
      calcomBaseUrl: calcomBase,
    });

    appendMessage(conv.id, "assistant", text);

    const needsHuman =
      userRequestsHuman(message) || assistantOffersHandoff(text);

    if (needsHuman) {
      setNeedsHuman(
        conv.id,
        true,
        userRequestsHuman(message) ? "Solicitud explícita del usuario" : "Ofrecido por el asistente / política"
      );
    }

    const fresh = getConversation(conv.id)!;
    return NextResponse.json({
      conversationId: fresh.id,
      reply: text,
      needsHuman: fresh.needsHuman,
      messages: fresh.messages,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

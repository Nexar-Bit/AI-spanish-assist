import OpenAI from "openai";
import { buildSystemPrompt, fallbackReply } from "./spanish-agent";

export async function generateAssistantReply(params: {
  locale: "es" | "en";
  history: { role: "user" | "assistant" | "system"; content: string }[];
  calcomBaseUrl?: string;
}): Promise<{ text: string; usedModel: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const calcomUrl = params.calcomBaseUrl?.replace(/\/$/, "");

  if (!apiKey) {
    const lastUser = [...params.history].reverse().find((m) => m.role === "user");
    const text = fallbackReply(lastUser?.content ?? "", calcomUrl);
    return { text, usedModel: false };
  }

  const client = new OpenAI({ apiKey });
  const system = buildSystemPrompt(params.locale);
  const extra =
    calcomUrl && params.locale === "es"
      ? `\nEnlace público de reservas (Cal.com): ${calcomUrl}`
      : calcomUrl
        ? `\nPublic booking link (Cal.com): ${calcomUrl}`
        : "";

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: system + extra },
    ...params.history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.4,
    max_tokens: 500,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    const lastUser = [...params.history].reverse().find((m) => m.role === "user");
    return { text: fallbackReply(lastUser?.content ?? "", calcomUrl), usedModel: false };
  }
  return { text, usedModel: true };
}

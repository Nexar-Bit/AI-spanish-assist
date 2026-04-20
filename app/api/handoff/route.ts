import { NextResponse } from "next/server";
import { z } from "zod";
import { setNeedsHuman } from "@/lib/store";

const schema = z.object({
  conversationId: z.string().uuid(),
  needsHuman: z.boolean(),
  reason: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const conv = setNeedsHuman(
    parsed.data.conversationId,
    parsed.data.needsHuman,
    parsed.data.reason
  );
  return NextResponse.json({ conversation: conv });
}

import { NextResponse } from "next/server";
import { listConversations } from "@/lib/store";

export async function GET() {
  const all = listConversations();
  return NextResponse.json({ conversations: all });
}

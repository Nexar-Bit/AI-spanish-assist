import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Contact, Conversation, StoreShape } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

function ensureStore(): StoreShape {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const initial: StoreShape = { contacts: [], conversations: [] };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  const raw = fs.readFileSync(STORE_FILE, "utf8");
  return JSON.parse(raw) as StoreShape;
}

function saveStore(store: StoreShape) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function getStore(): StoreShape {
  return ensureStore();
}

export function upsertContact(partial: Partial<Contact> & { name: string }): Contact {
  const store = getStore();
  const existing = store.contacts.find(
    (c) =>
      (partial.phone && c.phone === partial.phone) ||
      (partial.email && c.email === partial.email)
  );
  const now = new Date().toISOString();
  if (existing) {
    existing.name = partial.name || existing.name;
    if (partial.phone) existing.phone = partial.phone;
    if (partial.email) existing.email = partial.email;
    if (partial.notes) existing.notes = partial.notes;
    saveStore(store);
    return existing;
  }
  const contact: Contact = {
    id: randomUUID(),
    name: partial.name,
    phone: partial.phone,
    email: partial.email,
    notes: partial.notes,
    createdAt: now,
  };
  store.contacts.push(contact);
  saveStore(store);
  return contact;
}

export function getConversation(id: string): Conversation | undefined {
  return getStore().conversations.find((c) => c.id === id);
}

export function listConversations(): Conversation[] {
  return [...getStore().conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function appendMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string
): Conversation {
  const store = getStore();
  const conv = store.conversations.find((c) => c.id === conversationId);
  if (!conv) throw new Error("conversation_not_found");
  const msg = {
    id: randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
  conv.messages.push(msg);
  conv.updatedAt = msg.createdAt;
  saveStore(store);
  return conv;
}

export function createConversation(input: {
  channel: Conversation["channel"];
  contactId: string;
  locale?: "es" | "en";
}): Conversation {
  const store = getStore();
  const now = new Date().toISOString();
  const conv: Conversation = {
    id: randomUUID(),
    channel: input.channel,
    contactId: input.contactId,
    locale: input.locale ?? "es",
    needsHuman: false,
    messages: [],
    updatedAt: now,
  };
  store.conversations.push(conv);
  saveStore(store);
  return conv;
}

export function setNeedsHuman(
  conversationId: string,
  needs: boolean,
  reason?: string
): Conversation {
  const store = getStore();
  const conv = store.conversations.find((c) => c.id === conversationId);
  if (!conv) throw new Error("conversation_not_found");
  conv.needsHuman = needs;
  conv.handoffReason = reason;
  conv.updatedAt = new Date().toISOString();
  saveStore(store);
  return conv;
}

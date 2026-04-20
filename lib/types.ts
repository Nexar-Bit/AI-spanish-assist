export type Channel = "web" | "whatsapp" | "email";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  channel: Channel;
  contactId: string;
  locale: "es" | "en";
  needsHuman: boolean;
  handoffReason?: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface StoreShape {
  contacts: Contact[];
  conversations: Conversation[];
}

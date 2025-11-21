
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface BotPersona {
  id: string;
  name: string;
  avatar: string;
  systemInstruction: string;
  description: string;
}

export interface BroadcastTemplate {
  subject: string;
  content: string;
}

export interface OrderItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderData {
  items: OrderItem[];
  totalAmount: number;
}

export interface BotResponse {
  text: string;
  order?: OrderData;
}

export type Tab = 'chat' | 'settings' | 'broadcast' | 'connect';

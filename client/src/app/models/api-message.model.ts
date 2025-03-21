export interface ApiMessage {
  id: number;
  senderType: "operator" | "customer";
  senderId: string;
  text: string;
  createdAt: string;
}

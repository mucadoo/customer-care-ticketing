export type Message = {
  id: number;
  senderType: "operator" | "customer";
  senderId: string;
  text: string;
  createdAt: Date;
};

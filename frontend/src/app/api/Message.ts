export type Ticket = {
  selected: boolean;
  id: number;
  subject: string;
  status: "unresolved" | "resolved";
  createdAt: Date;
};

export type Message = {
  id: number;
  senderType: "operator" | "customer";
  senderId: string;
  text: string;
  createdAt: Date;
};

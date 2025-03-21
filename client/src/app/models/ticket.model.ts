export type Ticket = {
  id: number;
  subject: string;
  status: "unresolved" | "resolved";
  createdAt: Date;
  selected: boolean;
};

export interface ApiTicket {
  id: number;
  subject: string;
  status: "unresolved" | "resolved";
  createdAt: string;
}

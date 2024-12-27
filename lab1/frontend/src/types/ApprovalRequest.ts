import { User } from "./User";

export enum ApprovalStatus {
  SENT = "SENT",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export type ApprovalResponse = {
  id: number;
  user: User;
  status: ApprovalStatus;
  createdAt: string;
  statusChangedBy: User;  
}

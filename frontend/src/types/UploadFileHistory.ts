import { User } from "./User";

type UploadFileHistory = {
  id: number;
  fileName: string;
  entityName: string;
  uploaded: number;
  uploadDate: string;
  status: string;
  errorMessage: string;
  user: User;
}

export type { UploadFileHistory };

import { User } from "./User";

type House = {
  id: number;
  name: string;
  year: number;
  numberOfFlatsOnFloor: number;
  user: User;
  editable: boolean;
}

export type { House };

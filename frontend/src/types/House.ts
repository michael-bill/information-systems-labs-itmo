import { User } from "./User";

type House = {
  id: number;
  name: string;
  year: number;
  numberOfFlatsOnFloor: number;
  user: User;
}

export type { House };

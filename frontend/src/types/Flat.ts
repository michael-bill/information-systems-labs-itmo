import { Coordinates } from "./Coordinates";
import { House } from "./House";
import { User } from "./User";
import { View } from "./View";

type Flat = {
  id: number;
  name: string;
  coordinates: Coordinates;
  creationDate: string;
  area: number;
  price: number;
  balcony: boolean;
  timeToMetroOnFoot: number;
  numberOfRooms: number;
  numberOfBathrooms: number;
  timeToMetroByTransport: number;
  view: View;
  house: House;
  user: User;
}

export type { Flat };

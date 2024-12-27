import { Coordinates } from "./Coordinates";
import { View } from "./View";

type FlatDTO = {
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
  houseId: number;
};

export type { FlatDTO };

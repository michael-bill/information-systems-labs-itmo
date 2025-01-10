import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../const";
import { House } from "../../types/House";

export const createHouseWebSocket = (
  onUpdate: (house: House) => void,
  onCreate: (house: House) => void,
  onDelete: (houseId: number) => void
) => {
  const socket = new SockJS(WS_URL);
  const client = new Client({
    webSocketFactory: () => socket,
    debug: () => { },
    onConnect: () => {
      console.log("House WebSocket Connected");

      client.subscribe("/topic/updates/house", (message) => {
        onUpdate(JSON.parse(message.body));
      });

      client.subscribe("/topic/creates/house", (message) => {
        onCreate(JSON.parse(message.body));
      });

      client.subscribe("/topic/deletes/house", (message) => {
        onDelete(JSON.parse(message.body));
      });
    },
    onStompError: (frame) => {
      console.error("STOMP error", frame);
    },
  });

  return client;
};

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../const";
import { Flat } from "../../types/Flat";

export const createFlatWebSocket = (
  onUpdate: (flat: Flat) => void,
  onCreate: (flat: Flat) => void,
  onDelete: (flatId: number) => void
) => {
  const socket = new SockJS(WS_URL);
  const client = new Client({
    webSocketFactory: () => socket,
    debug: () => { },
    onConnect: () => {
      console.log("Flat WebSocket Connected");

      client.subscribe("/topic/updates/flat", (message) => {
        onUpdate(JSON.parse(message.body));
      });

      client.subscribe("/topic/creates/flat", (message) => {
        onCreate(JSON.parse(message.body));
      });

      client.subscribe("/topic/deletes/flat", (message) => {
        onDelete(JSON.parse(message.body));
      });
    },
    onStompError: (frame) => {
      console.error("STOMP error", frame);
    },
  });

  return client;
};

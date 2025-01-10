import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../const";
import { UploadFileHistory } from "../../types/UploadFileHistory";

export const createUploadFileHistoryWebSocket = (
  onCreate: (flat: UploadFileHistory) => void
) => {
  const socket = new SockJS(WS_URL);
  const client = new Client({
    webSocketFactory: () => socket,
    debug: () => { },
    onConnect: () => {
      console.log("UploadFileHistory WebSocket Connected");

      client.subscribe("/topic/creates/upload-file-history", (message) => {
        onCreate(JSON.parse(message.body));
      });
    },
    onStompError: (frame) => {
      console.error("STOMP error", frame);
    },
  });

  return client;
};

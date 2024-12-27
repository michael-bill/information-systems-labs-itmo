import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../const";

export const createAdminApprovalWebSocket = (
  onUpdate: (request: any) => void,
  onCreate: (request: any) => void
) => {
  const socket = new SockJS(WS_URL);
  const client = new Client({
    webSocketFactory: () => socket,
    debug: () => { },
    onConnect: () => {
      console.log("Admin Approval WebSocket Connected");

      client.subscribe("/topic/updates/admin-creation-request", (message) => {
        onUpdate(JSON.parse(message.body));
      });

      client.subscribe("/topic/creates/admin-creation-request", (message) => {
        onCreate(JSON.parse(message.body));
      });
    },
    onStompError: (frame) => {
      console.error("STOMP error", frame);
    },
  });

  return client;
};

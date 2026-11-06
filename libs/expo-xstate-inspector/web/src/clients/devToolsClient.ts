import { PLUGIN_NAME, PROTOCOL_VERSION } from "../constants/plugin.js";
import { unpackFrame } from "../utils/frames.js";

type DevToolsClientCallbacks = {
  onClose: () => void;
  onMessage: (method: string, payload: unknown) => void;
};

const broadcastUrl = () => {
  const host =
    new URLSearchParams(location.search).get("devServer") || location.host;
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${host}/expo-dev-plugins/broadcast`;
};

/** Connects to the app through the Expo dev tools broadcast socket. */
export const connectDevToolsClient = ({
  onMessage,
  onClose
}: DevToolsClientCallbacks) => {
  const ws = new WebSocket(broadcastUrl());
  ws.binaryType = "arraybuffer";
  const browserClientId = Date.now().toString();
  const send = (message: object) => ws.send(JSON.stringify(message));

  ws.onopen = () => {
    send({
      protocolVersion: PROTOCOL_VERSION,
      pluginName: PLUGIN_NAME,
      method: "handshake",
      browserClientId,
      __isHandshakeMessages: true
    });
    // Asks the app to replay its running actors.
    send({
      messageKey: { pluginName: PLUGIN_NAME, method: "connected" },
      payload: {}
    });
  };

  ws.onmessage = ({ data }: MessageEvent<ArrayBuffer | string>) => {
    const { messageKey, payload, ...handshake } = unpackFrame(data);
    if (handshake.__isHandshakeMessages) {
      // The app keeps one page per plugin and terminates the older ones.
      if (
        handshake.method === "terminateBrowserClient" &&
        handshake.browserClientId === browserClientId
      ) {
        ws.close();
      }
      return;
    }
    if (messageKey?.pluginName === PLUGIN_NAME) {
      onMessage(messageKey.method, payload);
    }
  };

  ws.onclose = onClose;
};

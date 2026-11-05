const OBJECT_PAYLOAD = 6;

type Frame = {
  __isHandshakeMessages?: boolean;
  browserClientId?: string;
  messageKey?: { method: string; pluginName: string };
  method?: string;
  payload?: unknown;
};

/**
 * Decodes a dev tools message. See @expo/devtools MessageFramePacker: plain
 * objects are JSON strings, other payloads are binary frames.
 */
export const unpackFrame = (data: ArrayBuffer | string): Frame => {
  if (typeof data === "string") {
    return JSON.parse(data);
  }
  const view = new DataView(data);
  const keyLength = view.getUint32(0);
  const decoder = new TextDecoder();
  const messageKey = JSON.parse(decoder.decode(data.slice(4, 4 + keyLength)));
  const isObject = view.getUint8(4 + keyLength) === OBJECT_PAYLOAD;
  return {
    messageKey,
    payload: isObject
      ? JSON.parse(decoder.decode(data.slice(5 + keyLength)))
      : undefined
  };
};

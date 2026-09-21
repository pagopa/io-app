/**
 * Subscribes to the middleware stream and reports whether the page is connected.
 * The stream keeps no history, so a reload starts from an empty timeline.
 */
import { useEffect, useState } from "react";

import { ingest } from "./timeline";

export type ConnectionStatus = "connected" | "connecting" | "reconnecting";

export const useStream = (): ConnectionStatus => {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const stream = new EventSource("stream");
    const onOpen = () => setStatus("connected");
    const onError = () => setStatus("reconnecting");
    const onMessage = (message: MessageEvent<string>) => {
      try {
        ingest(JSON.parse(message.data), message.data.length);
      } catch {
        // A malformed frame is dropped; the stream stays usable.
      }
    };

    stream.addEventListener("open", onOpen);
    stream.addEventListener("error", onError);
    stream.addEventListener("message", onMessage);
    return () => {
      stream.close();
    };
  }, []);

  return status;
};

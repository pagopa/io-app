import { getDevToolsPluginClientAsync } from "expo/devtools";

import type { InspectorTransport } from "../types/transport";

import { PLUGIN_NAME } from "../constants/plugin";

/** Sends inspector messages through the Expo dev tools plugin channel. */
export const createDevToolsTransport = (): InspectorTransport => {
  const client = getDevToolsPluginClientAsync(PLUGIN_NAME).catch(
    () => undefined
  );
  return {
    onConnected: listener =>
      void client.then(instance =>
        instance?.addMessageListener("connected", listener)
      ),
    // Messages are dropped while no web page is connected.
    send: (method, payload) =>
      void client.then(instance => {
        if (instance?.isConnected() === true) {
          instance.sendMessage(method, payload);
        }
      })
  };
};

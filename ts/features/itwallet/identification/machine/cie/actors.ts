import { fromCallback, fromPromise } from "xstate";
import { CieManager } from "@pagopa/io-react-native-cie";
import { CieEvents } from "./events";

export type StartCieManagerInput = {
  pin: string;
  authenticationUrl: string;
};

export const createCieActorsImplementation = () => ({
  startCieManager: fromPromise<void, StartCieManagerInput>(async ({ input }) =>
    // Start the CieManager with the provided pin and authentication URL
    CieManager.startReading(input.pin, input.authenticationUrl)
  ),
  cieManagerActor: fromCallback<CieEvents>(({ sendBack }) => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", ({ progress }) => {
        sendBack({ type: "cie-read-event", progress });
      }),
      // Start listening for errors
      CieManager.addListener("onError", error => {
        sendBack({ type: "cie-read-error", error });
      }),
      // Start listening for success
      CieManager.addListener("onSuccess", uri => {
        sendBack({ type: "cie-read-success", authorizationUrl: uri });
      })
    ];

    return () => {
      // Remove the event listener on exit
      cleanup.forEach(remove => remove());
      // Ensure the reading is stopped when state is exited
      void CieManager.stopReading();
    };
  })
});

import { fromCallback, fromPromise } from "xstate";
import { CieManager } from "@pagopa/io-react-native-cie";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { assert } from "../../../../../utils/assert";
import { EnvType } from "../../../common/utils/environment";
import { cieUatEndpoint } from "../utils/endpoints";
import { CieEvents } from "./events";

const WAIT_TIMEOUT_NAVIGATION = 1700 as Millisecond;
const WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY = 5000 as Millisecond;

export type StartCieManagerInput = {
  pin: string;
  serviceProviderUrl?: string;
  env: EnvType;
};

export type CieManagerActorInput = {
  isScreenReaderEnabled: boolean;
};

export default {
  startCieManager: fromPromise<void, StartCieManagerInput>(
    async ({ input }) => {
      assert(input.serviceProviderUrl, "serviceProviderUrl should be defined");

      if (input.env === "pre") {
        CieManager.setCustomIdpUrl(cieUatEndpoint);
      }

      // Start the CieManager with the provided pin and authentication URL
      return CieManager.startReading(input.pin, input.serviceProviderUrl);
    }
  ),
  cieManagerActor: fromCallback<CieEvents, CieManagerActorInput>(
    ({ sendBack, input }) => {
      const cleanup = [
        // Start listening for NFC events
        CieManager.addListener("onEvent", event => {
          sendBack({ type: "cie-read-event", event });
        }),
        // Start listening for errors
        CieManager.addListener("onError", error => {
          sendBack({ type: "cie-read-error", error });
        }),
        // Start listening for success
        CieManager.addListener("onSuccess", uri => {
          // Before proceeding to the next step, give some time to read the success message
          setTimeout(
            () => sendBack({ type: "cie-read-success", authorizationUrl: uri }),
            input.isScreenReaderEnabled
              ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY // If screen reader is enabled, give more time to read the success message
              : WAIT_TIMEOUT_NAVIGATION
          );
        })
      ];

      return () => {
        // Remove the event listener on exit
        cleanup.forEach(remove => remove());
        // Ensure the reading is stopped when state is exited
        void CieManager.stopReading();
      };
    }
  )
};

import { CieManager } from "@pagopa/io-react-native-cie";
import HapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { fromCallback, fromPromise } from "xstate";
import { assert } from "../../../../../utils/assert";
import { EnvType } from "../../../common/utils/environment";
import {
  WAIT_TIMEOUT_NAVIGATION,
  WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
} from "../utils/constants";
import { cieUatEndpoint } from "../utils/endpoints";
import { CieEvents } from "./events";

export type StartCieManagerInput = {
  pin: string;
  serviceProviderUrl?: string;
  env: EnvType;
};

export type CieManagerActorInput = {
  isScreenReaderEnabled: boolean;
};

export const cieMachineActors = {
  startCieManager: fromPromise<void, StartCieManagerInput>(
    async ({ input }) => {
      assert(input.serviceProviderUrl, "serviceProviderUrl should be defined");

      // If we are in PRE environment we need to use the UAT IDP url
      // Otherwise, using undefined will reset to the default (PROD)
      CieManager.setCustomIdpUrl(
        input.env === "pre" ? cieUatEndpoint : undefined
      );

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
          // Trigger a light haptic feedback on the start of the reading
          // when the tag is discovered
          if (event.name === "ON_TAG_DISCOVERED") {
            HapticFeedback.trigger(HapticFeedbackTypes.impactLight);
          }
        }),
        // Start listening for errors
        CieManager.addListener("onError", error => {
          sendBack({ type: "cie-read-error", error });
          // Trigger a warning haptic feedback on TAG_LOST error
          // or an error haptic feedback for all the other errors
          HapticFeedback.trigger(
            error.name === "TAG_LOST"
              ? HapticFeedbackTypes.notificationWarning
              : HapticFeedbackTypes.notificationError
          );
        }),
        // Start listening for success
        CieManager.addListener("onSuccess", uri => {
          // On Android we do not receive a final event with progress = 1
          // This mocks allows to have a consistent behavior across platforms
          sendBack({
            type: "cie-read-event",
            event: { name: "READ_SUCCESS", progress: 1 }
          });

          // Trigger a success haptic feedback
          HapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

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

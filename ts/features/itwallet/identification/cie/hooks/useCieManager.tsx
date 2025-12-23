import {
  CieError,
  CieManager,
  InternalAuthAndMrtdResponse,
  NfcError,
  NfcEvent
} from "@pagopa/io-react-native-cie";
import I18n from "i18next";
import { useCallback, useEffect, useState } from "react";
import HapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { useScreenReaderEnabled } from "../../../../../utils/accessibility";
import {
  WAIT_TIMEOUT_NAVIGATION,
  WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
} from "../utils/constants";
import { cieUatEndpoint } from "../utils/endpoints";
import { getCieProgressEmojis } from "../utils/strings";

export type CieManagerFailure = CieError | NfcError;

export type CieManagerState =
  | { state: "idle" }
  | { state: "reading"; progress: number }
  | { state: "failure"; failure: CieManagerFailure; progress?: number }
  | { state: "success" };

type UseCieManager = (params: {
  /**
   * Handler called upon successful CIE authentication flow.
   */
  onSuccess?: (authorizationUrl: string) => void;
  /**
   * Handler called upon successful internal authentication and MRTD with PACE flow.
   * Returned data is base64 encoded.
   */
  onInternalAuthAndMRTDWithPaceSuccess?: (
    data: InternalAuthAndMrtdResponse
  ) => void;
  /**
   * Wether to use UAT endpoints for CIE auth operations.
   */
  useUat?: boolean;
}) => {
  /**
   * The current state of the CIE manager.
   */
  state: CieManagerState;
  /**
   * Starts the CIE reading process with the provided PIN and service provider URL.
   */
  startReading: (pin: string, serviceProviderUrl: string) => Promise<void>;

  /**
   * Starts the internal authentication and MRTD with PACE reading process with the provided CAN and challenge to sign.
   */
  startInternalAuthAndMRTDReading: (
    can: string,
    challenge: string
  ) => Promise<void>;
};

export const useCieManager: UseCieManager = ({
  onSuccess,
  onInternalAuthAndMRTDWithPaceSuccess,
  useUat
}) => {
  const isScreenReaderEnabled = useScreenReaderEnabled();
  const [state, setState] = useState<CieManagerState>({ state: "idle" });

  /**
   * Handles the completion of the CIE reading process.
   * It sets the progress to 1, triggers a success haptic feedback,
   * and after a timeout, calls the provided handler.
   */
  const completionHandler = useCallback(
    (handler: () => void) => {
      // On Android we do not receive a final event with progress = 1
      // This mocks allows to have a consistent behavior across platforms
      setState({ state: "success" });

      // Trigger a success haptic feedback
      HapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

      // Before proceeding to the next step, give some time to read the success message
      setTimeout(
        handler,
        isScreenReaderEnabled
          ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY // If screen reader is enabled, give more time to read the success message
          : WAIT_TIMEOUT_NAVIGATION
      );
    },
    [isScreenReaderEnabled]
  );

  /**
   * Handler for NFC events emitted by the CieManager.
   * @param event The NFC event containing the read progress
   */
  const onEventListener = (event: NfcEvent) => {
    setState({ state: "reading", progress: event.progress });

    // Trigger a light haptic feedback on the start of the reading
    // when the tag is discovered
    if (event.name === "ON_TAG_DISCOVERED") {
      HapticFeedback.trigger(HapticFeedbackTypes.impactLight);
    }

    // Updates the status alert for the iOS NFC system dialog with the current reading progress.
    const progressEmojis = getCieProgressEmojis(event.progress);
    const label = I18n.t(
      "features.itWallet.identification.cie.readingCard.ios.reading.status"
    );
    CieManager.setCurrentAlertMessage(`${progressEmojis}\n${label}`);
  };

  /**
   * Handler for NFC errors emitted by the CieManager.
   * @param error The NFC error occurred during the reading process
   */
  const onErrorListener = (error: NfcError) => {
    setState(prev => {
      // For the failure state we want to preserve the current progress
      const currentProgress = prev.state === "reading" ? prev.progress : 0;
      return { state: "failure", failure: error, progress: currentProgress };
    });

    // Trigger a warning haptic feedback on TAG_LOST error
    // or an error haptic feedback for all the other errors
    HapticFeedback.trigger(
      error.name === "TAG_LOST"
        ? HapticFeedbackTypes.notificationWarning
        : HapticFeedbackTypes.notificationError
    );

    CieManager.stopReading().catch(() => {
      // Ignore errors on stop reading
    });
  };

  /**
   * Sets up the CIE Manager alerts and event listeners for NFC events,
   * errors, and success.
   */
  useEffect(() => {
    CieManager.setAlertMessage(
      "readingInstructions",
      I18n.t("features.itWallet.identification.cie.readingCard.ios.idle.status")
    );
    CieManager.setAlertMessage(
      "readingSuccess",
      I18n.t(
        "features.itWallet.identification.cie.readingCard.ios.completed.status"
      )
    );

    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", onEventListener),
      // Start listening for errors
      CieManager.addListener("onError", onErrorListener)
    ];

    if (onSuccess) {
      // eslint-disable-next-line functional/immutable-data
      cleanup.push(
        // Start listening for success
        CieManager.addListener("onSuccess", uri => {
          completionHandler(() => onSuccess(uri));
        })
      );
    }

    if (onInternalAuthAndMRTDWithPaceSuccess) {
      // eslint-disable-next-line functional/immutable-data
      cleanup.push(
        // Start listening for internal auth and MRTD with PACE success
        CieManager.addListener("onInternalAuthAndMRTDWithPaceSuccess", data => {
          completionHandler(() => onInternalAuthAndMRTDWithPaceSuccess(data));
        })
      );
    }

    return () => {
      // Remove the event listener on exit
      cleanup.forEach(remove => remove());
      // Ensure the reading is stopped when state is exited
      void CieManager.stopReading().catch(() => {
        // Ignore errors on stop reading
      });
    };
  }, [completionHandler, onInternalAuthAndMRTDWithPaceSuccess, onSuccess]);

  /**
   * Starts the CIE reading process with the provided PIN and service provider URL.
   * @param pin The CIE card PIN code.
   * @param serviceProviderUrl The service provider URL for the CIE authentication flow.
   */
  const startReading = async (pin: string, serviceProviderUrl: string) => {
    setState({ state: "idle" });

    // If we are in PRE environment we need to use the UAT IDP url
    // Otherwise, using undefined will reset to the default (PROD)
    CieManager.setCustomIdpUrl(useUat ? cieUatEndpoint : undefined);

    try {
      // Start the CieManager with the provided pin and authentication URL
      await CieManager.startReading(pin, serviceProviderUrl);
    } catch (error) {
      setState({ state: "failure", failure: error as CieManagerFailure });
    }
  };

  /**
   * Starts the internal authentication and MRTD with PACE reading process with the provided CAN and challenge to sign.
   * @param can The CIE card CAN code.
   * @param challenge The challenge to be signed with PACE.
   */
  const startInternalAuthAndMRTDReading = async (
    can: string,
    challenge: string
  ) => {
    setState({ state: "idle" });

    try {
      // Start the CieManager with the provided pin and authentication URL
      await CieManager.startInternalAuthAndMRTDReading(
        can,
        challenge,
        "base64"
      );
    } catch (error) {
      setState({ state: "failure", failure: error as CieManagerFailure });
    }
  };

  return {
    state,
    startReading,
    startInternalAuthAndMRTDReading
  };
};

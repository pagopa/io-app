import { triggerHaptic } from "@io-app/design-system";
import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
import I18n from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { useIODispatch, useIOStore } from "../../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isScreenReaderEnabledSelector } from "../../../../../store/reducers/preferences";
import { isDevEnv } from "../../../../../utils/environment";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import { cieLoginFlowSelector } from "../../../activeSessionLogin/store/selectors";
import {
  trackLoginCieCardReadingError,
  trackLoginCieCardReadingSuccess
} from "../../../common/analytics/cieAnalytics";
import {
  cieErrorMessagesMap,
  WAIT_TIMEOUT_NAVIGATION,
  WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
} from "../../../common/utils/constants";
import { cieAuthenticationError } from "../store/actions";
import { isCieLoginUatEnabledSelector } from "../store/selectors";
import { getCieUatEndpoint } from "../utils/endpoints";

const CIE_ALERT_MESSAGES_CONFIG = Platform.select<
  Parameters<typeof cieManager.start>[0]
>({
  ios: {
    readingInstructions: I18n.t(
      "authentication.cie.card.iosAlert.readingInstructions"
    ),
    moreTags: I18n.t("authentication.cie.card.iosAlert.moreTags"),
    readingInProgress: I18n.t(
      "authentication.cie.card.iosAlert.readingInProgress"
    ),
    readingSuccess: I18n.t("authentication.cie.card.iosAlert.readingSuccess"),
    invalidCard: I18n.t("authentication.cie.card.iosAlert.invalidCard"),
    tagLost: I18n.t("authentication.cie.card.iosAlert.tagLost"),
    cardLocked: I18n.t("authentication.cie.card.iosAlert.cardLocked"),
    wrongPin1AttemptLeft: I18n.t(
      "authentication.cie.card.iosAlert.wrongPin1AttemptLeft"
    ),
    wrongPin2AttemptLeft: I18n.t(
      "authentication.cie.card.iosAlert.wrongPin2AttemptLeft"
    ),
    genericError: I18n.t("authentication.cie.card.iosAlert.genericError")
  },
  default: undefined
});

export type CieManagerState =
  | { failure: CEvent; status: "failure" }
  | { failure: string; status: "reading-failure" }
  | { status: "idle" }
  | { status: "reading" }
  | { status: "success" };

type UseCieManager = (params: { onSuccess: (authUrl: string) => void }) => {
  /**
   * Starts the reading process for the CIE card by providing the user's PIN and the authentication URL.
   */
  startReading: (pin: string, authUrl: string) => Promise<void>;
  /**
   * The current state of the CIE manager.
   */
  state: CieManagerState;
};

export const useCieManager: UseCieManager = ({ onSuccess }) => {
  const dispatch = useIODispatch();
  const store = useIOStore();

  const loginFlow = cieLoginFlowSelector(store.getState());
  const assistanceToolConfig = assistanceToolConfigSelector(store.getState());

  const [state, setState] = useState<CieManagerState>({ status: "idle" });

  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const commonErrorHandling = useCallback(
    (
      reason: "GENERIC" | CEvent["event"],
      description: string | undefined,
      handler: () => void
    ) => {
      trackLoginCieCardReadingError(loginFlow);

      dispatch(
        cieAuthenticationError({
          reason,
          cieDescription: description ?? cieErrorMessagesMap[reason] ?? "",
          flow: loginFlow
        })
      );
      triggerHaptic("notificationError");
      handler();
    },
    [dispatch, loginFlow]
  );

  const handleError = useCallback(
    (error: Error) => {
      handleSendAssistanceLog(choosenTool, error.message);

      commonErrorHandling("GENERIC", error.message, () =>
        setState({ failure: error.message, status: "reading-failure" })
      );
    },
    [choosenTool, commonErrorHandling]
  );

  const handleEvent = useCallback(
    (event: CEvent) => {
      handleSendAssistanceLog(choosenTool, event.event);

      // Reading starts
      if (event.event === "ON_TAG_DISCOVERED") {
        setState({ status: "reading" });
        triggerHaptic("impactLight");
        return;
      }

      commonErrorHandling(event.event, undefined, () => {
        // ON_TAG_LOST and "Transmission Error" are handled inline
        // by the reading screen itself
        if (
          event.event === "ON_TAG_LOST" ||
          event.event === "Transmission Error"
        ) {
          setState({ failure: event.event, status: "reading-failure" });
          return;
        }

        setState({ failure: event, status: "failure" });
      });
    },
    [choosenTool, commonErrorHandling]
  );

  const handleSuccess = useCallback(
    (url: string) => {
      setState({ status: "success" });
      triggerHaptic("notificationSuccess");

      handleSendAssistanceLog(choosenTool, "authentication SUCCESS");
      trackLoginCieCardReadingSuccess(loginFlow);

      const isScreenReaderEnabled = isScreenReaderEnabledSelector(
        store.getState()
      );

      setTimeout(
        () => onSuccess(url),
        isScreenReaderEnabled
          ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
          : WAIT_TIMEOUT_NAVIGATION
      );
    },
    [choosenTool, loginFlow, onSuccess, store]
  );

  const startReading = useCallback(
    async (pin: string, authUrl: string) => {
      setState({ status: "idle" });

      cieManager.removeAllListeners();
      cieManager.onEvent(handleEvent);
      cieManager.onError(handleError);
      cieManager.onSuccess(handleSuccess);

      cieManager.enableLog(isDevEnv);
      // Set the IDP URL based on the environment:
      // Uses the UAT endpoint for Pre-production or null to fallback to PROD (default).
      const idpUrl = isCieLoginUatEnabledSelector(store.getState())
        ? getCieUatEndpoint()
        : null;
      cieManager.setCustomIdpUrl(idpUrl);
      cieManager.setAuthenticationUrl(authUrl);

      try {
        await cieManager.setPin(pin);
        await cieManager.start(CIE_ALERT_MESSAGES_CONFIG);
        await cieManager.startListeningNFC();
      } catch {
        handleError(new Error("Failed to start reading CIE"));
      }
    },
    [handleEvent, handleError, handleSuccess, store]
  );

  useEffect(
    () =>
      // Cleanup on unmount
      () => {
        void cieManager.stopListeningNFC().catch(() => {
          // Ignore errors on stop listening NFC
        });
        cieManager.removeAllListeners();
      },
    []
  );

  return {
    state,
    startReading
  };
};

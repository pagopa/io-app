import { triggerHaptic } from "@io-app/design-system";
import { CieLogger, CieManager, NfcError, NfcEvent } from "@io-app/expo-cie";
import I18n from "i18next";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { useIODispatch, useIOStore } from "../../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isScreenReaderEnabledSelector } from "../../../../../store/reducers/preferences";
import { isDevEnv } from "../../../../../utils/environment";
import { unknownToString } from "../../../../../utils/errors";
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

const CIE_ALERT_MESSAGES = {
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
};

const FAILURE_ERRORS = new Set<NfcError["name"]>([
  "APDU_ERROR",
  "AUTHENTICATION_ERROR",
  "CARD_BLOCKED",
  "CERTIFICATE_EXPIRED",
  "CERTIFICATE_REVOKED",
  "NO_INTERNET_CONNECTION",
  "NOT_A_CIE",
  "WRONG_PIN"
]);

export type CieManagerState =
  | { failure: NfcError; status: "failure" }
  | { failure: string; status: "reading-failure" }
  | { status: "idle" }
  | { status: "reading" }
  | { status: "success" };

type UseCieManager = (params: { onSuccess: (authUrl: string) => void }) => {
  /**
   * Starts the reading process for the CIE card by providing the user's PIN and
   * the authentication URL.
   */
  startReading: (pin: string, authUrl: string) => Promise<void>;
  /** The current state of the CIE manager. */
  state: CieManagerState;
};

export const useCieManager: UseCieManager = ({ onSuccess }) => {
  const dispatch = useIODispatch();
  const store = useIOStore();

  const loginFlow = cieLoginFlowSelector(store.getState());
  const assistanceToolConfig = assistanceToolConfigSelector(store.getState());
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  const [state, setState] = useState<CieManagerState>({ status: "idle" });

  const commonErrorHandling = useCallback(
    (
      reason: "GENERIC" | NfcError["name"],
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
    (error: NfcError) => {
      handleSendAssistanceLog(choosenTool, error.message ?? error.name);

      if (error.name === "TAG_LOST") {
        commonErrorHandling(error.name, error.message, () =>
          setState({ failure: error.name, status: "reading-failure" })
        );
        return;
      }

      if (FAILURE_ERRORS.has(error.name)) {
        commonErrorHandling(error.name, error.message, () =>
          setState({ failure: error, status: "failure" })
        );
        return;
      }

      commonErrorHandling("GENERIC", error.message, () =>
        setState({
          failure: error.message ?? error.name,
          status: "reading-failure"
        })
      );
    },
    [choosenTool, commonErrorHandling]
  );

  const handleEvent = useCallback(
    (event: NfcEvent) => {
      handleSendAssistanceLog(choosenTool, event.name);

      // Trigger a light haptic feedback and update the state to reflect
      // the start of the reading when the tag is discovered
      if (event.name === "ON_TAG_DISCOVERED") {
        setState({ status: "reading" });
        triggerHaptic("impactLight");
        return;
      }

      // Handle recoverable errors by allowing
      // the user to retry the reading process
      if (event.name === "ON_TAG_LOST" || event.name === "Transmission Error") {
        commonErrorHandling("TAG_LOST", undefined, () =>
          setState({ failure: "TAG_LOST", status: "reading-failure" })
        );
        return;
      }

      // Halt the reading process and transition to a failure state.
      // This delegates the rendering to the specific Failure components.
      // Any other/unknown progress event is ignored
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

      if (Platform.OS === "ios") {
        CieLogger.setLogMode(isDevEnv ? "FILE" : "DISABLED");
      }
      // Set the IDP URL based on the environment:
      // Uses the UAT endpoint for Pre-production or null to fallback to PROD (default).
      const idpUrl = isCieLoginUatEnabledSelector(store.getState())
        ? (getCieUatEndpoint() ?? undefined)
        : undefined;
      CieManager.setCustomIdpUrl(idpUrl);

      try {
        await CieManager.startReading(pin, authUrl);
      } catch (e: unknown) {
        const errorMessage = unknownToString(e);
        handleError({ name: "GENERIC_ERROR", message: errorMessage });
      }
    },
    [handleError, store]
  );

  useEffect(() => {
    if (Platform.OS === "ios") {
      Object.entries(CIE_ALERT_MESSAGES).forEach(([key, value]) => {
        CieManager.setAlertMessage(
          key as keyof typeof CIE_ALERT_MESSAGES,
          value
        );
      });
    }

    const cleanup = [
      CieManager.addListener("onEvent", handleEvent),
      CieManager.addListener("onError", handleError),
      CieManager.addListener("onSuccess", handleSuccess)
    ];

    return () => {
      cleanup.forEach(remove => remove());
      void CieManager.stopReading().catch(() => {
        // Ignore errors on stop reading
      });
    };
  }, [handleError, handleEvent, handleSuccess]);

  return {
    state,
    startReading
  };
};

import { triggerHaptic } from "@io-app/design-system";
import {
  CieErrorSchema,
  CieLogger,
  CieManager,
  NfcError,
  NfcEvent
} from "@io-app/expo-cie";
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
import { cieEnvSelector } from "../store/selectors";
import { getCieIdpUrl } from "../utils/endpoints";

const IOS_ALERT_MESSAGES: ReadonlyArray<
  readonly [Parameters<typeof CieManager.setAlertMessage>[0], string]
> = [
  [
    "readingInstructions",
    I18n.t("authentication.cie.card.iosAlert.readingInstructions")
  ],
  ["moreTags", I18n.t("authentication.cie.card.iosAlert.moreTags")],
  [
    "readingInProgress",
    I18n.t("authentication.cie.card.iosAlert.readingInProgress")
  ],
  ["readingSuccess", I18n.t("authentication.cie.card.iosAlert.readingSuccess")],
  ["invalidCard", I18n.t("authentication.cie.card.iosAlert.invalidCard")],
  ["tagLost", I18n.t("authentication.cie.card.iosAlert.tagLost")],
  ["cardLocked", I18n.t("authentication.cie.card.iosAlert.cardLocked")],
  [
    "wrongPin1AttemptLeft",
    I18n.t("authentication.cie.card.iosAlert.wrongPin1AttemptLeft")
  ],
  [
    "wrongPin2AttemptLeft",
    I18n.t("authentication.cie.card.iosAlert.wrongPin2AttemptLeft")
  ],
  ["genericError", I18n.t("authentication.cie.card.iosAlert.genericError")]
];

/**
 * Decodes the URL returned by the CIE SDK, falling back to the raw value if
 * malformed.
 */
const safeDecodeURIComponent = (url: string): string => {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
};

export type CieManagerState =
  | { failure: NfcError; status: "failure" }
  | { progress: number; status: "reading" }
  | { status: "idle" }
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
    (error: NfcError, handler: () => void) => {
      trackLoginCieCardReadingError(loginFlow);

      dispatch(
        cieAuthenticationError({
          reason: error.name,
          cieDescription:
            error.message ?? cieErrorMessagesMap[error.name] ?? "",
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
      CieManager.stopReading().catch(() => {
        // Ignore errors on stop reading
      });

      // iOS only: the user dismissed the native NFC sheet.
      // Stay on the reading screen.
      if (error.name === "CANCELLED_BY_USER") {
        return;
      }

      handleSendAssistanceLog(choosenTool, error.name);

      commonErrorHandling(error, () =>
        setState({ failure: error, status: "failure" })
      );
    },
    [choosenTool, commonErrorHandling]
  );

  const handleEvent = useCallback(
    (event: NfcEvent) => {
      handleSendAssistanceLog(choosenTool, event.name);

      setState({ status: "reading", progress: event.progress });

      // Trigger a light haptic feedback on the start of the reading
      // when the tag is discovered
      if (event.name === "ON_TAG_DISCOVERED") {
        triggerHaptic("impactLight");
      }
    },
    [choosenTool]
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
        () => onSuccess(safeDecodeURIComponent(url)),
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
      // Set the IDP URL based on the environment (undefined falls back to PROD).
      const idpUrl = getCieIdpUrl(cieEnvSelector(store.getState()));
      CieManager.setCustomIdpUrl(idpUrl);

      try {
        await CieManager.startReading(pin, authUrl);
      } catch (error) {
        const parsed = CieErrorSchema.safeParse(error);
        handleError({
          name: "GENERIC_ERROR",
          message: parsed.success ? parsed.data.code : unknownToString(error)
        });
      }
    },
    [handleError, store]
  );

  useEffect(() => {
    if (Platform.OS === "ios") {
      IOS_ALERT_MESSAGES.forEach(([key, message]) => {
        CieManager.setAlertMessage(key, message);
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

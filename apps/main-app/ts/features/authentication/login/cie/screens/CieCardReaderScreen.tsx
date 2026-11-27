/**
 * A screen to guide the user to proper read the CIE
 *
 * TODO: isolate cie event listener as saga
 *
 * TODO: when 100% is reached, the animation end
 */
import {
  Body,
  ContentWrapper,
  H3,
  IOButton,
  IOPictograms,
  triggerHaptic,
  useIOColors,
  VSpacer
} from "@io-app/design-system";
import {
  CieErrorSchema,
  CieLogger,
  CieManager,
  NfcError,
  NfcEvent
} from "@io-app/expo-cie";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isScreenReaderEnabledSelector } from "../../../../../store/reducers/preferences";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { isDevEnv } from "../../../../../utils/environment";
import { unknownToString } from "../../../../../utils/errors";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import { getTextForState } from "../../../activeSessionLogin/shared/utils";
import {
  trackLoginCieCardReaderScreen,
  trackLoginCieCardReadingError,
  trackLoginCieCardReadingSuccess
} from "../../../common/analytics/cieAnalytics";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import {
  accessibityTimeout,
  cieErrorMessagesMap,
  WAIT_TIMEOUT_NAVIGATION,
  WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
} from "../../../common/utils/constants";
import CieCardReadingAnimation, {
  ReadingState
} from "../components/CieCardReadingAnimation";
import {
  cieAuthenticationError,
  CieAuthenticationErrorPayload,
  CieAuthenticationErrorReason
} from "../store/actions";
import { cieEnvSelector } from "../store/selectors";
import { CieEnv } from "../utils";
import { getCieIdpUrl } from "../utils/endpoints";

export type CieCardReaderScreenNavigationParams = {
  authorizationUri: string;
  ciePin: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centerText: {
    textAlign: "center"
  },
  contentContainer: {
    flexGrow: 1,
    alignContent: "center",
    justifyContent: "center"
  }
});

type SetErrorParameter = {
  errorDescription?: string;
  eventReason: CieAuthenticationErrorReason;
  navigation?: () => void;
};

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

const getPictogramName = (state: ReadingState): IOPictograms => {
  switch (state) {
    case ReadingState.completed:
      return "success";
    case ReadingState.error:
      return "empty";
    case ReadingState.reading:
    case ReadingState.waiting_card:
    default:
      return Platform.select({
        ios: "nfcScaniOS",
        default: "nfcScanAndroid"
      });
  }
};

const CieCardReaderScreen = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<AuthenticationParamsList, "CIE_CARD_READER_SCREEN">
    >();
  const route =
    useRoute<RouteProp<AuthenticationParamsList, "CIE_CARD_READER_SCREEN">>();
  const colors = useIOColors();
  const circleColor = colors.foreground.accent;

  const dispatch = useIODispatch();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const cieEnv = useIOSelector(cieEnvSelector);
  const isScreenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);

  const ciePin = route.params.ciePin;
  const cieAuthorizationUri = route.params.authorizationUri;

  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const [readingState, setReadingState] = useState<ReadingState>(
    ReadingState.waiting_card
  );

  // Ref to access latest readingState inside cieManager callbacks without stale closures
  const readingStateRef = useRef(readingState);
  useEffect(() => {
    readingStateRef.current = readingState;
  }, [readingState]);

  // Derived display text — recomputed whenever readingState changes,
  // replacing the original updateContent / getTextForState imperative calls.
  const { title, subtitle, content } = useMemo(() => {
    switch (readingState) {
      case ReadingState.completed:
        return {
          title: I18n.t("authentication.cie.card.cieCardValid"),
          subtitle: "",
          content: isScreenReaderEnabled
            ? I18n.t("authentication.cie.card.cieCardValid")
            : undefined
        };
      case ReadingState.error:
        return getTextForState(ReadingState.error);
      case ReadingState.reading:
        return {
          title: I18n.t("authentication.cie.card.readerCardTitle"),
          subtitle: "",
          content: I18n.t("authentication.cie.card.readerCardFooter")
        };
      default:
        return getTextForState(ReadingState.waiting_card);
    }
  }, [readingState, isScreenReaderEnabled]);

  // Announce content changes to accessibility services (replaces announceUpdate setState callbacks)
  useEffect(() => {
    if (content) {
      AccessibilityInfo.announceForAccessibility(content);
    }
  }, [content]);

  // Track error analytics whenever the reading state transitions to error
  useEffect(() => {
    if (readingState === ReadingState.error) {
      trackLoginCieCardReadingError();
    }
  }, [readingState]);

  const dispatchAnalyticEvent = useCallback(
    (error: CieAuthenticationErrorPayload) => {
      dispatch(cieAuthenticationError(error));
    },
    [dispatch]
  );

  const setError = useCallback(
    ({ eventReason, errorDescription, navigation: nav }: SetErrorParameter) => {
      const cieDescription =
        errorDescription ?? cieErrorMessagesMap[eventReason] ?? "";
      dispatchAnalyticEvent({
        reason: eventReason,
        cieDescription,
        flow: "auth"
      });
      setReadingState(ReadingState.error);
      triggerHaptic("notificationError");
      nav?.();
    },
    [dispatchAnalyticEvent]
  );

  // Refs holding the latest callbacks to avoid stale closures inside cieManager event handlers
  const setErrorRef = useRef(setError);
  const navigationRef = useRef(navigation);
  useEffect(() => {
    setErrorRef.current = setError;
    navigationRef.current = navigation;
  }, [setError, navigation]);

  const handleCieEvent = useCallback(
    (event: NfcEvent) => {
      setReadingState(ReadingState.reading);
      handleSendAssistanceLog(choosenTool, event.name);

      if (event.name === "ON_TAG_DISCOVERED") {
        triggerHaptic("impactLight");
      }
    },
    [choosenTool]
  );

  const handleCieError = useCallback(
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
      const nav = navigationRef.current;
      switch (error.name) {
        case "APDU_ERROR":
          setErrorRef.current({
            eventReason: error.name,
            navigation: () =>
              nav.replace(
                AUTHENTICATION_ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN
              )
          });
          break;
        case "AUTHENTICATION_ERROR":
        case "GENERIC_ERROR":
        case "NO_INTERNET_CONNECTION":
        case "WRONG_CAN":
          setErrorRef.current({
            eventReason: error.name,
            navigation: () =>
              nav.replace(AUTHENTICATION_ROUTES.CIE_UNEXPECTED_ERROR)
          });
          break;
        case "CARD_BLOCKED":
        case "WRONG_PIN":
          setErrorRef.current({
            eventReason: error.name,
            navigation: () =>
              nav.replace(AUTHENTICATION_ROUTES.CIE_WRONG_PIN_SCREEN, {
                remainingCount:
                  error.name === "WRONG_PIN" ? error.attemptsLeft : 0
              })
          });
          break;
        case "CERTIFICATE_EXPIRED":
        case "CERTIFICATE_REVOKED":
          setErrorRef.current({
            eventReason: error.name,
            navigation: () =>
              nav.replace(AUTHENTICATION_ROUTES.CIE_EXPIRED_SCREEN)
          });
          break;
        case "NOT_A_CIE":
          setErrorRef.current({
            eventReason: error.name,
            navigation: () =>
              nav.replace(AUTHENTICATION_ROUTES.CIE_WRONG_CARD_SCREEN)
          });
          break;
        case "TAG_LOST":
          setErrorRef.current({
            eventReason: error.name,
            errorDescription: error.message
          });
          break;
      }
    },
    [choosenTool]
  );

  const handleCieSuccess = useCallback(
    (cieConsentUri: string) => {
      setReadingState(ReadingState.completed);
      trackLoginCieCardReadingSuccess();

      setTimeout(
        () =>
          navigation.replace(AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE, {
            cieConsentUri
          }),
        isScreenReaderEnabled
          ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
          : WAIT_TIMEOUT_NAVIGATION
      );
    },
    [navigation, isScreenReaderEnabled]
  );

  const startCie = useCallback(
    async (env: CieEnv) => {
      setReadingState(ReadingState.waiting_card);

      if (Platform.OS === "ios") {
        CieLogger.setLogMode(isDevEnv ? "FILE" : "DISABLED");

        IOS_ALERT_MESSAGES.forEach(([key, message]) => {
          CieManager.setAlertMessage(key, message);
        });
      }
      CieManager.setCustomIdpUrl(getCieIdpUrl(env));

      try {
        await CieManager.startReading(ciePin, cieAuthorizationUri);
      } catch (error) {
        const parsed = CieErrorSchema.safeParse(error);
        handleCieError({
          name: "GENERIC_ERROR",
          message: parsed.success ? parsed.data.code : unknownToString(error)
        });
      }
    },
    [handleCieError, ciePin, cieAuthorizationUri]
  );

  // Mount: track screen view + start CIE reading
  // Unmount: stop NFC and remove listeners (replaces componentDidMount/componentWillUnmount)
  useEffect(() => {
    trackLoginCieCardReaderScreen();

    const cleanup = [
      CieManager.addListener("onEvent", handleCieEvent),
      CieManager.addListener("onError", handleCieError),
      CieManager.addListener("onSuccess", handleCieSuccess)
    ];

    void startCie(cieEnv);

    return () => {
      cleanup.forEach(remove => remove());
      CieManager.stopReading().catch(() => {
        // Ignore errors on stop listening NFC
      });
    };
    // Run once. Retry calls startCie directly and must not restart NFC.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = useCallback(
    () =>
      navigation.reset({
        index: 0,
        routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
      }),
    [navigation]
  );

  const renderActions = () => {
    if (readingState === ReadingState.completed) {
      return null;
    }

    const shouldRenderRetry =
      Platform.OS === "ios" || readingState === ReadingState.error;

    return (
      <View style={{ alignItems: "center", gap: 24 }}>
        {shouldRenderRetry && (
          <View>
            <IOButton
              label={I18n.t("authentication.cie.nfc.retry")}
              onPress={() => void startCie(cieEnv)}
              variant="solid"
            />
          </View>
        )}
        <View>
          <IOButton
            label={I18n.t("global.buttons.close")}
            onPress={handleCancel}
            variant="link"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} testID="cie-card-reader-screen-test-id">
        <ScrollView
          centerContent={true}
          contentContainerStyle={styles.contentContainer}
        >
          <ContentWrapper>
            <CieCardReadingAnimation
              circleColor={circleColor}
              pictogramName={getPictogramName(readingState)}
              readingState={readingState}
            />
            <VSpacer size={32} />
            <Title text={title} />
            <VSpacer size={8} />
            {subtitle && <Body style={styles.centerText}>{subtitle}</Body>}
            <VSpacer size={24} />
            {renderActions()}
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const Title = (props: { text: string }) => {
  const titleRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      if (!titleRef.current && Platform.OS === "android") {
        setAccessibilityFocus(titleRef, accessibityTimeout);
      }
    }, [])
  );

  return (
    <View accessible ref={titleRef}>
      <H3 style={styles.centerText}>{props.text}</H3>
    </View>
  );
};

export default CieCardReaderScreen;

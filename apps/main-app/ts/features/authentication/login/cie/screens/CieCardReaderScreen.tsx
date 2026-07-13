/**
 * A screen to guide the user to proper read the CIE
 * TODO: isolate cie event listener as saga
 * TODO: when 100% is reached, the animation end
 */
import {
  Body,
  ContentWrapper,
  H3,
  IOButton,
  IOColors,
  IOPictograms,
  VSpacer,
  useIOTheme
} from "@io-app/design-system";
import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
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
import HapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isScreenReaderEnabledSelector } from "../../../../../store/reducers/preferences";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { isDevEnv } from "../../../../../utils/environment";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import {
  WAIT_TIMEOUT_NAVIGATION,
  WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY,
  accessibityTimeout,
  analyticActions,
  getTextForState
} from "../../../activeSessionLogin/shared/utils";
import {
  trackLoginCieCardReaderScreen,
  trackLoginCieCardReadingError,
  trackLoginCieCardReadingSuccess
} from "../../../common/analytics/cieAnalytics";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import CieCardReadingAnimation, {
  ReadingState
} from "../components/CieCardReadingAnimation";
import {
  CieAuthenticationErrorPayload,
  CieAuthenticationErrorReason,
  cieAuthenticationError
} from "../store/actions";
import { isCieLoginUatEnabledSelector } from "../store/selectors";
import { getCieUatEndpoint } from "../utils/endpoints";

export type CieCardReaderScreenNavigationParams = {
  ciePin: string;
  authorizationUri: string;
};

export type CieCardReaderNavigationProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "CIE_CARD_READER_SCREEN"
>;

type SetErrorParameter = {
  eventReason: CieAuthenticationErrorReason;
  errorDescription?: string;
  navigation?: () => void;
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

const getPictogramName = (state: ReadingState): IOPictograms => {
  switch (state) {
    case ReadingState.error:
      return "empty";
    case ReadingState.completed:
      return "success";
    case ReadingState.reading:
    case ReadingState.waiting_card:
    default:
      return Platform.select({
        ios: "nfcScaniOS",
        default: "nfcScanAndroid"
      });
  }
};

/**
 * This screen is shown while reading the CIE card.
 */
const CieCardReaderScreen = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<AuthenticationParamsList, "CIE_CARD_READER_SCREEN">
    >();
  const route =
    useRoute<RouteProp<AuthenticationParamsList, "CIE_CARD_READER_SCREEN">>();
  const theme = useIOTheme();
  const circleColor = IOColors[theme["interactiveElem-default"]];

  const dispatch = useIODispatch();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const isCieUatEnabled = useIOSelector(isCieLoginUatEnabledSelector);
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
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  // Ref to access latest readingState inside cieManager callbacks without stale closures
  const readingStateRef = useRef(readingState);
  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    readingStateRef.current = readingState;
  }, [readingState]);

  // Derived display text — recomputed whenever readingState or errorMessage changes,
  // replacing the original updateContent / getTextForState imperative calls.
  const { title, subtitle, content } = useMemo(() => {
    switch (readingState) {
      case ReadingState.reading:
        return {
          title: I18n.t("authentication.cie.card.readerCardTitle"),
          subtitle: "",
          content: I18n.t("authentication.cie.card.readerCardFooter")
        };
      case ReadingState.error:
        return getTextForState(ReadingState.error, errorMessage);
      case ReadingState.completed:
        return {
          title: I18n.t("authentication.cie.card.cieCardValid"),
          subtitle: "",
          content: isScreenReaderEnabled
            ? I18n.t("authentication.cie.card.cieCardValid")
            : undefined
        };
      default:
        return getTextForState(ReadingState.waiting_card);
    }
  }, [readingState, errorMessage, isScreenReaderEnabled]);

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
        errorDescription ?? analyticActions.get(eventReason) ?? "";
      dispatchAnalyticEvent({
        reason: eventReason,
        cieDescription,
        flow: "auth"
      });
      setErrorMessage(cieDescription);
      setReadingState(ReadingState.error);
      HapticFeedback.trigger(HapticFeedbackTypes.notificationError);
      nav?.();
    },
    [dispatchAnalyticEvent]
  );

  // Refs holding the latest callbacks to avoid stale closures inside cieManager event handlers
  const setErrorRef = useRef(setError);
  const navigationRef = useRef(navigation);
  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    setErrorRef.current = setError;
    // eslint-disable-next-line functional/immutable-data
    navigationRef.current = navigation;
  }, [setError, navigation]);

  const handleCieEvent = useCallback(
    async (event: CEvent) => {
      handleSendAssistanceLog(choosenTool, event.event);
      const nav = navigationRef.current;
      switch (event.event) {
        case "ON_TAG_DISCOVERED":
          if (readingStateRef.current !== ReadingState.reading) {
            setReadingState(ReadingState.reading);
            HapticFeedback.trigger(HapticFeedbackTypes.impactLight);
          }
          break;
        case "Function not supported" as unknown:
        case "TAG_ERROR_NFC_NOT_SUPPORTED":
        case "ON_TAG_DISCOVERED_NOT_CIE":
          setErrorRef.current({
            eventReason: event.event,
            navigation: () =>
              nav.navigate(AUTHENTICATION_ROUTES.MAIN, {
                screen: AUTHENTICATION_ROUTES.CIE_WRONG_CARD_SCREEN
              })
          });
          break;
        case "AUTHENTICATION_ERROR":
        case "ON_NO_INTERNET_CONNECTION":
          setErrorRef.current({
            eventReason: event.event,
            navigation: () =>
              nav.navigate(AUTHENTICATION_ROUTES.MAIN, {
                screen: AUTHENTICATION_ROUTES.CIE_UNEXPECTED_ERROR
              })
          });
          break;
        case "EXTENDED_APDU_NOT_SUPPORTED":
          setErrorRef.current({
            eventReason: event.event,
            navigation: () =>
              nav.navigate(AUTHENTICATION_ROUTES.MAIN, {
                screen:
                  AUTHENTICATION_ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN
              })
          });
          break;
        case "Transmission Error":
        case "ON_TAG_LOST":
          setErrorRef.current({ eventReason: event.event });
          break;
        case "PIN Locked":
        case "ON_CARD_PIN_LOCKED":
        case "ON_PIN_ERROR":
          setErrorRef.current({
            eventReason: event.event,
            navigation: () =>
              nav.navigate(AUTHENTICATION_ROUTES.MAIN, {
                screen: AUTHENTICATION_ROUTES.CIE_WRONG_PIN_SCREEN,
                params: {
                  remainingCount:
                    event.event === "ON_CARD_PIN_LOCKED"
                      ? 0
                      : event.attemptsLeft
                }
              })
          });
          break;
        case "CERTIFICATE_EXPIRED":
        case "CERTIFICATE_REVOKED":
          setErrorRef.current({
            eventReason: event.event,
            navigation: () =>
              nav.navigate(AUTHENTICATION_ROUTES.MAIN, {
                screen: AUTHENTICATION_ROUTES.CIE_EXPIRED_SCREEN
              })
          });
          break;
        default:
          break;
      }
    },
    [choosenTool]
  );

  const handleCieError = useCallback(
    (error: Error) => {
      handleSendAssistanceLog(choosenTool, error.message);
      setErrorRef.current({
        eventReason: "GENERIC",
        errorDescription: error.message
      });
    },
    [choosenTool]
  );

  // Holds the consent URI so it is accessible in the completed-state effect below
  const cieConsentUriRef = useRef<string | null>(null);

  const handleCieSuccess = useCallback(
    (cieConsentUri: string) => {
      if (readingStateRef.current === ReadingState.completed) {
        return;
      }
      handleSendAssistanceLog(choosenTool, "authentication SUCCESS");
      // eslint-disable-next-line functional/immutable-data
      cieConsentUriRef.current = cieConsentUri;
      setReadingState(ReadingState.completed);
    },
    [choosenTool]
  );

  // Navigate to the consent screen once reading completes
  // (replaces the setState callback in the original handleCieSuccess)
  useEffect(() => {
    if (readingState !== ReadingState.completed || !cieConsentUriRef.current) {
      return undefined;
    }
    const consentUri = cieConsentUriRef.current;
    const delay = isScreenReaderEnabled
      ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
      : Platform.select({ ios: 0, default: WAIT_TIMEOUT_NAVIGATION });
    const timer = setTimeout(() => {
      trackLoginCieCardReadingSuccess();
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE,
        params: { cieConsentUri: consentUri }
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [readingState, isScreenReaderEnabled, navigation]);

  const startCieAndroid = useCallback(
    async (useCieUat: boolean) => {
      cieManager
        .start()
        .then(async () => {
          cieManager.onEvent(handleCieEvent);
          cieManager.onError(handleCieError);
          cieManager.onSuccess(handleCieSuccess);
          await cieManager.setPin(ciePin);
          cieManager.setAuthenticationUrl(cieAuthorizationUri);
          cieManager.enableLog(isDevEnv);
          cieManager.setCustomIdpUrl(useCieUat ? getCieUatEndpoint() : null);
          await cieManager.startListeningNFC();
          setReadingState(ReadingState.waiting_card);
        })
        .catch(() => {
          setReadingState(ReadingState.error);
        });
    },
    [
      handleCieEvent,
      handleCieError,
      handleCieSuccess,
      ciePin,
      cieAuthorizationUri
    ]
  );

  const startCieiOS = useCallback(
    async (useCieUat: boolean) => {
      cieManager.removeAllListeners();
      cieManager.onEvent(handleCieEvent);
      cieManager.onError(handleCieError);
      cieManager.onSuccess(handleCieSuccess);
      cieManager.enableLog(isDevEnv);
      cieManager.setCustomIdpUrl(useCieUat ? getCieUatEndpoint() : null);
      await cieManager.setPin(ciePin);
      cieManager.setAuthenticationUrl(cieAuthorizationUri);
      cieManager
        .start({
          readingInstructions: I18n.t(
            "authentication.cie.card.iosAlert.readingInstructions"
          ),
          moreTags: I18n.t("authentication.cie.card.iosAlert.moreTags"),
          readingInProgress: I18n.t(
            "authentication.cie.card.iosAlert.readingInProgress"
          ),
          readingSuccess: I18n.t(
            "authentication.cie.card.iosAlert.readingSuccess"
          ),
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
        })
        .then(async () => {
          await cieManager.startListeningNFC();
          setReadingState(ReadingState.waiting_card);
        })
        .catch(() => {
          setReadingState(ReadingState.error);
        });
    },
    [
      handleCieEvent,
      handleCieError,
      handleCieSuccess,
      ciePin,
      cieAuthorizationUri
    ]
  );

  // Mount: track screen view + start CIE reading
  // Unmount: stop NFC and remove listeners (replaces componentDidMount/componentWillUnmount)
  useEffect(() => {
    trackLoginCieCardReaderScreen();
    const startCie = Platform.select({
      ios: startCieiOS,
      default: startCieAndroid
    });
    void startCie(isCieUatEnabled);

    return () => {
      void cieManager.stopListeningNFC().catch(() => {
        // Ignore errors on stop listening NFC
      });
      cieManager.removeAllListeners();
    };
    // startCie functions and isCieUatEnabled are stable after mount;
    // this effect intentionally mirrors componentDidMount/componentWillUnmount.
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

  const footer = Platform.select({
    default: (
      <View style={{ alignItems: "center" }}>
        <View>
          <IOButton
            variant="link"
            label={I18n.t("global.buttons.close")}
            onPress={handleCancel}
          />
        </View>
      </View>
    ),
    ios: (
      <View style={{ alignItems: "center" }}>
        <View>
          <IOButton
            variant="solid"
            label={I18n.t("authentication.cie.nfc.retry")}
            onPress={() => void startCieiOS(isCieUatEnabled)}
          />
        </View>
        <VSpacer size={24} />
        <View>
          <IOButton
            variant="link"
            label={I18n.t("global.buttons.close")}
            onPress={handleCancel}
          />
        </View>
      </View>
    )
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} testID="cie-card-reader-screen-test-id">
        <ScrollView
          centerContent={true}
          contentContainerStyle={styles.contentContainer}
        >
          <ContentWrapper>
            <CieCardReadingAnimation
              pictogramName={getPictogramName(readingState)}
              readingState={readingState}
              circleColor={circleColor}
            />
            <VSpacer size={32} />
            <Title text={title} />
            <VSpacer size={8} />
            {subtitle && <Body style={styles.centerText}>{subtitle}</Body>}
            <VSpacer size={24} />
            {readingState !== ReadingState.completed && footer}
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

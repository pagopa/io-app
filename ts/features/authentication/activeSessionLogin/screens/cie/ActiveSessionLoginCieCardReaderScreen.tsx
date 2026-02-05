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
} from "@pagopa/io-app-design-system";
import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
import I18n from "i18next";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { isDevEnv } from "../../../../../utils/environment";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import CieCardReadingAnimation, {
  ReadingState
} from "../../../login/cie/components/CieCardReadingAnimation";
import {
  cieAuthenticationError,
  CieAuthenticationErrorReason
} from "../../../login/cie/store/actions";
import { isCieLoginUatEnabledSelector } from "../../../login/cie/store/selectors";
import { getCieUatEndpoint } from "../../../login/cie/utils/endpoints";
import {
  analyticActions,
  WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY,
  WAIT_TIMEOUT_NAVIGATION,
  accessibityTimeout,
  getTextForState
} from "../../shared/utils";
import {
  trackLoginCieCardReaderScreen,
  trackLoginCieCardReadingError,
  trackLoginCieCardReadingSuccess
} from "../../../common/analytics/cieAnalytics";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { isScreenReaderEnabledSelector } from "../../../../../store/reducers/preferences";

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

type ActiveSessionLoginCieCardReaderScreenProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "CIE_CARD_READER_SCREEN_ACTIVE_SESSION_LOGIN"
>;

/**
 * This screen shown while reading the card
 */
const ActiveSessionLoginCieCardReaderScreen = ({
  navigation,
  route
}: ActiveSessionLoginCieCardReaderScreenProps) => {
  const { authorizationUri, ciePin } = route.params;

  const theme = useIOTheme();
  const dispatch = useIODispatch();

  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const isCieUatEnabled = useIOSelector(isCieLoginUatEnabledSelector);
  const isScreenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);

  const [readingState, setReadingState] = useState<ReadingState>(
    ReadingState.waiting_card
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const readingStateRef = useRef(readingState);
  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    readingStateRef.current = readingState;
  }, [readingState]);

  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const textState = useMemo(() => {
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
        return getTextForState(ReadingState.error, errorMessage);
      case ReadingState.reading:
        return {
          title: I18n.t("authentication.cie.card.readerCardTitle"),
          subtitle: "",
          content: I18n.t("authentication.cie.card.readerCardFooter")
        };
      default: // waiting_card
        return getTextForState(ReadingState.waiting_card);
    }
  }, [readingState, errorMessage, isScreenReaderEnabled]);

  useEffect(() => {
    if (textState.content) {
      AccessibilityInfo.announceForAccessibility(textState.content);
    }
  }, [textState.content]);

  const setError = useCallback(
    ({
      eventReason,
      errorDescription,
      navigation: navAction
    }: {
      eventReason: CieAuthenticationErrorReason;
      errorDescription?: string;
      navigation?: () => void;
    }) => {
      const cieDescription =
        errorDescription ?? analyticActions.get(eventReason) ?? "";

      dispatch(
        cieAuthenticationError({
          reason: eventReason,
          cieDescription,
          flow: "reauth"
        })
      );
      trackLoginCieCardReadingError("reauth");

      setErrorMessage(cieDescription);
      setReadingState(ReadingState.error);
      HapticFeedback.trigger(HapticFeedbackTypes.notificationError);
      navAction?.();
    },
    [dispatch]
  );

  const handleCieSuccess = useCallback(
    (cieConsentUri: string) => {
      if (readingStateRef.current === ReadingState.completed) {
        return;
      }
      handleSendAssistanceLog(choosenTool, "authentication SUCCESS");
      setReadingState(ReadingState.completed);

      setTimeout(
        () => {
          void trackLoginCieCardReadingSuccess("reauth");
          navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
            screen:
              AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN,
            params: { cieConsentUri }
          });
        },
        isScreenReaderEnabled
          ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
          : Platform.select({ ios: 0, default: WAIT_TIMEOUT_NAVIGATION })
      );
    },
    [choosenTool, navigation, isScreenReaderEnabled]
  );

  const handleCieEvent = useCallback(
    async (event: CEvent) => {
      handleSendAssistanceLog(choosenTool, event.event);
      switch (event.event) {
        // Reading starts
        case "ON_TAG_DISCOVERED":
          if (readingStateRef.current !== ReadingState.reading) {
            setReadingState(ReadingState.reading);
            HapticFeedback.trigger(HapticFeedbackTypes.impactLight);
          }
          break;
        // "Function not supported" seems to be TAG_ERROR_NFC_NOT_SUPPORTED
        // for the iOS SDK
        case "Function not supported" as unknown:
        case "TAG_ERROR_NFC_NOT_SUPPORTED":
        case "ON_TAG_DISCOVERED_NOT_CIE":
          setError({
            eventReason: event.event,
            navigation: () =>
              navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
                screen: AUTHENTICATION_ROUTES.CIE_WRONG_CARD_SCREEN
              })
          });
          break;
        case "AUTHENTICATION_ERROR":
        case "ON_NO_INTERNET_CONNECTION":
          setError({
            eventReason: event.event,
            navigation: () =>
              navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
                screen: AUTHENTICATION_ROUTES.CIE_UNEXPECTED_ERROR
              })
          });
          break;
        case "EXTENDED_APDU_NOT_SUPPORTED":
          setError({
            eventReason: event.event,
            navigation: () =>
              navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
                screen:
                  AUTHENTICATION_ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN
              })
          });
          break;
        case "Transmission Error":
        case "ON_TAG_LOST":
          setError({ eventReason: event.event });
          break;
        // The card is temporarily locked. Unlock is available by CieID app
        case "PIN Locked":
        case "ON_CARD_PIN_LOCKED":
        case "ON_PIN_ERROR":
          setError({
            eventReason: event.event,
            navigation: () =>
              navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
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
        // CIE is Expired or Revoked
        case "CERTIFICATE_EXPIRED":
        case "CERTIFICATE_REVOKED":
          setError({
            eventReason: event.event,
            navigation: () =>
              navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
                screen: AUTHENTICATION_ROUTES.CIE_EXPIRED_SCREEN
              })
          });
          break;
        default:
          break;
      }
    },
    [choosenTool, navigation, setError]
  );

  const handleCieError = useCallback(
    (error: Error) => {
      handleSendAssistanceLog(choosenTool, error.message);
      setError({ eventReason: "GENERIC", errorDescription: error.message });
    },
    [choosenTool, setError]
  );

  const startCie = useCallback(
    async (useUat: boolean) => {
      cieManager.removeAllListeners();
      cieManager.onEvent(handleCieEvent);
      cieManager.onError(handleCieError);
      cieManager.onSuccess(handleCieSuccess);

      cieManager.enableLog(isDevEnv);
      cieManager.setCustomIdpUrl(useUat ? getCieUatEndpoint() : null);
      cieManager.setAuthenticationUrl(authorizationUri);

      try {
        await cieManager.setPin(ciePin);
        await cieManager.start(CIE_ALERT_MESSAGES_CONFIG);
        await cieManager.startListeningNFC();
        setReadingState(ReadingState.waiting_card);
      } catch (e) {
        trackLoginCieCardReadingError("reauth");
        setReadingState(ReadingState.error);
      }
    },
    [authorizationUri, ciePin, handleCieError, handleCieEvent, handleCieSuccess]
  );

  useOnFirstRender(() => {
    void trackLoginCieCardReaderScreen("reauth");
  });

  useEffect(() => {
    void startCie(isCieUatEnabled);

    // Cleanup on unmount
    return () => {
      void cieManager.stopListeningNFC().catch(() => {
        // Ignore errors on stop listening NFC
      });
      cieManager.removeAllListeners();
    };
  }, [isCieUatEnabled, startCie]);

  const footerComponent = useMemo(
    () =>
      Platform.select({
        default: (
          <View style={{ alignItems: "center" }}>
            <View>
              <IOButton
                variant="link"
                label={I18n.t("global.buttons.close")}
                onPress={navigation.popToTop}
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
                onPress={() => startCie(isCieUatEnabled)}
              />
            </View>
            <VSpacer size={24} />
            <View>
              <IOButton
                variant="link"
                label={I18n.t("global.buttons.close")}
                onPress={navigation.popToTop}
              />
            </View>
          </View>
        )
      }),
    [navigation.popToTop, startCie, isCieUatEnabled]
  );

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
              circleColor={IOColors[theme["interactiveElem-default"]]}
            />
            <VSpacer size={32} />
            <Title
              text={textState.title}
              accessibilityLabel={
                textState.subtitle
                  ? `${textState.title}. ${textState.subtitle}`
                  : textState.title
              }
            />
            <VSpacer size={8} />
            {textState.subtitle && (
              <Body style={styles.centerText}>{textState.subtitle}</Body>
            )}
            <VSpacer size={24} />
            {readingState !== ReadingState.completed && footerComponent}
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const Title = (props: { text: string; accessibilityLabel: string }) => {
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

export default ActiveSessionLoginCieCardReaderScreen;

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

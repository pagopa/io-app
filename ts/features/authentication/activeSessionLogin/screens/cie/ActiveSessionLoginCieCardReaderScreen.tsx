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
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import I18n from "../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import {
  isScreenReaderEnabled,
  setAccessibilityFocus
} from "../../../../../utils/accessibility";
import { isDevEnv } from "../../../../../utils/environment";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
// import {
//   trackLoginCieCardReaderScreen,
//   trackLoginCieCardReadingError,
//   trackLoginCieCardReadingSuccess
// } from "../../../common/analytics/cieAnalytics";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { isActiveSessionLoginSelector } from "../../store/selectors";
import CieCardReadingAnimation, {
  ReadingState
} from "../../../login/cie/components/CieCardReadingAnimation";
import {
  CieAuthenticationErrorPayload,
  CieAuthenticationErrorReason,
  cieAuthenticationError
} from "../../../login/cie/store/actions";
import { isCieLoginUatEnabledSelector } from "../../../login/cie/store/selectors";
import { getCieUatEndpoint } from "../../../login/cie/utils/endpoints";

// The MP events related to this page have been commented on,
// pending their correct integration into the flow.
// Task: https://pagopa.atlassian.net/browse/IOPID-3343

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOColors.white
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

type setErrorParameter = {
  eventReason: CieAuthenticationErrorReason;
  errorDescription?: string;
  navigation?: () => void;
};

const getPictogramName = (state: ReadingState): IOPictograms => {
  switch (state) {
    default:
    case ReadingState.reading:
    case ReadingState.waiting_card:
      return Platform.select({
        ios: "nfcScaniOS",
        default: "nfcScanAndroid"
      });
    case ReadingState.error:
      return "empty";
    case ReadingState.completed:
      return "success";
  }
};

// A subset of Cie Events (errors) which is of interest to analytics
const analyticActions = new Map<CieAuthenticationErrorReason, string>([
  // Reading interrupted before the sdk complete the reading
  ["Transmission Error", I18n.t("authentication.cie.card.error.onTagLost")],
  ["ON_TAG_LOST", I18n.t("authentication.cie.card.error.onTagLost")],
  [
    "TAG_ERROR_NFC_NOT_SUPPORTED",
    I18n.t("authentication.cie.card.error.unknownCardContent")
  ],
  [
    "ON_TAG_DISCOVERED_NOT_CIE",
    I18n.t("authentication.cie.card.error.unknownCardContent")
  ],
  ["PIN Locked", I18n.t("authentication.cie.card.error.generic")],
  ["ON_CARD_PIN_LOCKED", I18n.t("authentication.cie.card.error.generic")],
  ["ON_PIN_ERROR", I18n.t("authentication.cie.card.error.tryAgain")],
  ["PIN_INPUT_ERROR", ""],
  ["CERTIFICATE_EXPIRED", I18n.t("authentication.cie.card.error.generic")],
  ["CERTIFICATE_REVOKED", I18n.t("authentication.cie.card.error.generic")],
  ["AUTHENTICATION_ERROR", I18n.t("authentication.cie.card.error.generic")],
  [
    "EXTENDED_APDU_NOT_SUPPORTED",
    I18n.t("authentication.cie.nfc.apduNotSupported")
  ],
  [
    "ON_NO_INTERNET_CONNECTION",
    I18n.t("authentication.cie.card.error.tryAgain")
  ],
  ["STOP_NFC_ERROR", ""],
  ["START_NFC_ERROR", ""]
]);

// the timeout we sleep until move to consent form screen when authentication goes well
const WAIT_TIMEOUT_NAVIGATION = 1700 as Millisecond;
const WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY = 5000 as Millisecond;
const VIBRATION = 100 as Millisecond;
const accessibityTimeout = 100 as Millisecond;

type TextForState = {
  title: string;
  subtitle?: string;
  content: string;
};

// some texts changes depending on current running Platform
const getTextForState = (
  state: ReadingState.waiting_card | ReadingState.error,
  errorMessage: string = ""
): TextForState => {
  const texts: Record<
    ReadingState.waiting_card | ReadingState.error,
    TextForState
  > = Platform.select({
    ios: {
      [ReadingState.waiting_card]: {
        title: I18n.t("authentication.cie.card.titleiOS"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeaderiOS"),
        // the native alert hides the screen content and shows a message it self
        content: ""
      },
      [ReadingState.error]: {
        title: I18n.t("authentication.cie.card.error.readerCardLostTitle"),
        subtitle: "",
        // the native alert hides the screen content and shows a message it self
        content: ""
      },
      [ReadingState.reading]: {
        title: I18n.t("authentication.cie.card.titleiOS"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeaderiOS"),
        // the native alert hides the screen content and shows a message it self
        content: ""
      }
    },
    default: {
      [ReadingState.waiting_card]: {
        title: I18n.t("authentication.cie.card.title"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeader"),
        content: I18n.t("authentication.cie.card.layCardMessageFooter")
      },
      [ReadingState.error]: {
        title: I18n.t("authentication.cie.card.error.readerCardLostTitle"),
        subtitle: I18n.t("authentication.cie.card.error.onTagLost"),
        content: errorMessage
      }
    }
  });
  return texts[state];
};

/**
 * This screen shown while reading the card
 */
const ActiveSessionLoginCieCardReaderScreen = () => {
  // --- START: Hooks to get navigation, route, theme and redux state ---
  const navigation =
    useNavigation<
      IOStackNavigationProp<
        AuthenticationParamsList,
        "CIE_CARD_READER_SCREEN_ACTIVE_SESSION_LOGIN"
      >
    >();
  const route =
    useRoute<
      RouteProp<
        AuthenticationParamsList,
        "CIE_CARD_READER_SCREEN_ACTIVE_SESSION_LOGIN"
      >
    >();
  const theme = useIOTheme();
  const dispatch = useDispatch();

  const { ciePin, authorizationUri } = route.params;
  const blueColorName = IOColors[theme["interactiveElem-default"]];

  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const isCieUatEnabled = useIOSelector(isCieLoginUatEnabledSelector);
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  // --- END: Hooks ---

  const [readingState, setReadingState] = useState<ReadingState>(
    ReadingState.waiting_card
  );

  /*
      These are the states that can occur when reading the cie (from SDK)
      - waiting_card (we are ready for read ->radar effect)
      - reading (we are reading the card -> progress animation)
      - error (the reading is interrupted -> progress animation stops and the progress circle becomes red)
      - completed (the reading has been completed)
      */
  const [textState, setTextState] = useState<Partial<TextForState>>(
    getTextForState(ReadingState.waiting_card)
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isScreenReaderEnabledState, setIsScreenReaderEnabledState] =
    useState(false);

  const subTitleRef = useRef<Text>(null);
  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  // To avoid re-triggering effects, we keep a ref to the reading state for the success handler
  const readingStateRef = useRef(readingState);
  // eslint-disable-next-line functional/immutable-data
  readingStateRef.current = readingState;

  const announceUpdate = useCallback(() => {
    if (textState.content) {
      AccessibilityInfo.announceForAccessibility(textState.content);
    }
  }, [textState.content]);

  useEffect(() => {
    switch (readingState) {
      case ReadingState.reading:
        setTextState({
          title: I18n.t("authentication.cie.card.readerCardTitle"),
          subtitle: "",
          content: I18n.t("authentication.cie.card.readerCardFooter")
        });
        break;
      case ReadingState.error:
        // trackLoginCieCardReadingError();
        setTextState(getTextForState(ReadingState.error, errorMessage));
        break;
      case ReadingState.completed:
        setTextState({
          title: I18n.t("authentication.cie.card.cieCardValid"),
          subtitle: "",
          content: isScreenReaderEnabledState
            ? I18n.t("authentication.cie.card.cieCardValid")
            : undefined
        });
        break;
      default: // waiting_card
        setTextState(getTextForState(ReadingState.waiting_card));
    }
    announceUpdate();
  }, [readingState, errorMessage, isScreenReaderEnabledState, announceUpdate]);

  const dispatchAnalyticEvent = useCallback(
    (error: CieAuthenticationErrorPayload) => {
      dispatch(cieAuthenticationError(error));
    },
    [dispatch]
  );

  const setError = useCallback(
    ({
      eventReason,
      errorDescription,
      navigation: navAction
    }: setErrorParameter) => {
      const cieDescription =
        errorDescription ??
        pipe(
          analyticActions.get(eventReason),
          O.fromNullable,
          O.getOrElse(() => "")
        );

      dispatchAnalyticEvent({
        reason: eventReason,
        cieDescription
      });

      setErrorMessage(cieDescription);
      setReadingState(ReadingState.error);
      Vibration.vibrate(VIBRATION);
      navAction?.();
    },
    [dispatchAnalyticEvent]
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
          if (isActiveSessionLogin) {
            navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen:
                AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN,
              params: { cieConsentUri }
            });
          } else {
            // trackLoginCieCardReadingSuccess();
            navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE,
              params: { cieConsentUri }
            });
          }
        },
        isScreenReaderEnabledState
          ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
          : Platform.select({ ios: 0, default: WAIT_TIMEOUT_NAVIGATION })
      );
    },
    [choosenTool, isActiveSessionLogin, navigation, isScreenReaderEnabledState]
  );

  const handleCieEvent = useCallback(
    async (event: CEvent) => {
      handleSendAssistanceLog(choosenTool, event.event);
      switch (event.event) {
        // Reading starts
        case "ON_TAG_DISCOVERED":
          if (readingStateRef.current !== ReadingState.reading) {
            setReadingState(ReadingState.reading);
            Vibration.vibrate(VIBRATION);
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
      // trackLoginCieCardReadingError();
      handleSendAssistanceLog(choosenTool, error.message);
      setError({ eventReason: "GENERIC", errorDescription: error.message });
    },
    [choosenTool, setError]
  );

  const startCie = useCallback(
    async (useCieUat: boolean) => {
      cieManager.removeAllListeners();
      cieManager.onEvent(handleCieEvent);
      cieManager.onError(handleCieError);
      cieManager.onSuccess(handleCieSuccess);
      cieManager.enableLog(isDevEnv);
      cieManager.setCustomIdpUrl(useCieUat ? getCieUatEndpoint() : null);
      await cieManager.setPin(ciePin);
      cieManager.setAuthenticationUrl(authorizationUri);

      const startOptions = {
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
      };

      try {
        if (Platform.OS === "ios") {
          await cieManager.start(startOptions);
        } else {
          await cieManager.start();
        }
        await cieManager.startListeningNFC();
        setReadingState(ReadingState.waiting_card);
      } catch (e) {
        setReadingState(ReadingState.error);
      }
    },
    [authorizationUri, ciePin, handleCieError, handleCieEvent, handleCieSuccess]
  );

  useEffect(() => {
    // trackLoginCieCardReaderScreen();

    const checkScreenReader = async () => {
      const srEnabled = await isScreenReaderEnabled();
      setIsScreenReaderEnabledState(srEnabled);
    };

    void checkScreenReader();
    void startCie(isCieUatEnabled);

    // Cleanup on unmount
    return () => {
      void cieManager.stopListeningNFC();
      cieManager.removeAllListeners();
    };
  }, [isCieUatEnabled, startCie]);

  const handleCancel = useCallback(() => {
    if (isActiveSessionLogin) {
      navigation.popToTop();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
      });
    }
  }, [isActiveSessionLogin, navigation]);

  const getFooter = useCallback(
    (): ReactNode =>
      Platform.select({
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
                onPress={() => startCie(isCieUatEnabled)}
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
      }),
    [handleCancel, startCie, isCieUatEnabled]
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
              circleColor={blueColorName}
            />
            <VSpacer size={32} />
            <Title
              text={textState.title || ""}
              accessibilityLabel={
                textState.subtitle
                  ? `${textState.title}. ${textState.subtitle}`
                  : textState.title || ""
              }
            />
            <VSpacer size={8} />
            {textState.subtitle && (
              <Body style={styles.centerText} ref={subTitleRef}>
                {textState.subtitle}
              </Body>
            )}
            <VSpacer size={24} />
            {readingState !== ReadingState.completed && getFooter()}
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

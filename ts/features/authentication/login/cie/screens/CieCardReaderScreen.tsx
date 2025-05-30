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
  VSpacer
} from "@pagopa/io-app-design-system";
import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

import { useFocusEffect } from "@react-navigation/native";
import {
  PureComponent,
  ReactNode,
  createRef,
  useCallback,
  useRef
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
import { connect } from "react-redux";
import I18n from "../../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { ReduxProps } from "../../../../../store/actions/types";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  isScreenReaderEnabled,
  setAccessibilityFocus
} from "../../../../../utils/accessibility";
import { isDevEnv } from "../../../../../utils/environment";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
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

type Props = CieCardReaderNavigationProps &
  ReduxProps &
  ReturnType<typeof mapStateToProps> & {
    headerHeight: number;
    blueColorName: string;
  };

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

type State = {
  // Get the current status of the card reading
  readingState: ReadingState;
  title: string;
  subtitle?: string;
  content?: string;
  errorMessage?: string;
  isScreenReaderEnabled: boolean;
};

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
 *  This screen shown while reading the card
 */
class CieCardReaderScreen extends PureComponent<Props, State> {
  private subTitleRef = createRef<Text>();
  private choosenTool = assistanceToolRemoteConfig(
    this.props.assistanceToolConfig
  );
  constructor(props: Props) {
    super(props);
    trackLoginCieCardReaderScreen();
    this.state = {
      /*
      These are the states that can occur when reading the cie (from SDK)
      - waiting_card (we are ready for read ->radar effect)
      - reading (we are reading the card -> progress animation)
      - error (the reading is interrupted -> progress animation stops and the progress circle becomes red)
      - completed (the reading has been completed)
      */
      readingState: ReadingState.waiting_card,
      ...getTextForState(ReadingState.waiting_card),
      isScreenReaderEnabled: false
    };
    this.startCieiOS = this.startCieiOS.bind(this);
    this.startCieAndroid = this.startCieAndroid.bind(this);
  }

  get ciePin(): string {
    return this.props.route.params.ciePin;
  }

  get cieAuthorizationUri(): string {
    return this.props.route.params.authorizationUri;
  }

  private setError = ({
    eventReason,
    errorDescription,
    navigation
  }: setErrorParameter) => {
    const cieDescription =
      errorDescription ??
      pipe(
        analyticActions.get(eventReason),
        O.fromNullable,
        O.getOrElse(() => "")
      );

    this.dispatchAnalyticEvent({
      reason: eventReason,
      cieDescription
    });

    this.setState(
      {
        readingState: ReadingState.error,
        errorMessage: cieDescription
      },
      () => {
        Vibration.vibrate(VIBRATION);
        navigation?.();
      }
    );
  };

  private dispatchAnalyticEvent = (error: CieAuthenticationErrorPayload) => {
    this.props.dispatch(cieAuthenticationError(error));
  };

  private handleCieEvent = async (event: CEvent) => {
    handleSendAssistanceLog(this.choosenTool, event.event);
    switch (event.event) {
      // Reading starts
      case "ON_TAG_DISCOVERED":
        if (this.state.readingState !== ReadingState.reading) {
          this.setState({ readingState: ReadingState.reading }, () => {
            Vibration.vibrate(VIBRATION);
          });
        }
        break;
      // "Function not supported" seems to be TAG_ERROR_NFC_NOT_SUPPORTED
      // for the iOS SDK
      case "Function not supported" as unknown:
      case "TAG_ERROR_NFC_NOT_SUPPORTED":
      case "ON_TAG_DISCOVERED_NOT_CIE":
        this.setError({
          eventReason: event.event,
          navigation: () =>
            this.props.navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.CIE_WRONG_CARD_SCREEN
            })
        });
        break;
      case "AUTHENTICATION_ERROR":
      case "ON_NO_INTERNET_CONNECTION":
        this.setError({
          eventReason: event.event,
          navigation: () =>
            this.props.navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.CIE_UNEXPECTED_ERROR
            })
        });
        break;
      case "EXTENDED_APDU_NOT_SUPPORTED":
        this.setError({
          eventReason: event.event,
          navigation: () =>
            this.props.navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen:
                AUTHENTICATION_ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN
            })
        });
        break;
      case "Transmission Error":
      case "ON_TAG_LOST":
        this.setError({ eventReason: event.event });
        break;

      // The card is temporarily locked. Unlock is available by CieID app
      case "PIN Locked":
      case "ON_CARD_PIN_LOCKED":
      case "ON_PIN_ERROR":
        this.setError({
          eventReason: event.event,
          navigation: () =>
            this.props.navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.CIE_WRONG_PIN_SCREEN,
              params: {
                remainingCount:
                  event.event === "ON_CARD_PIN_LOCKED" ? 0 : event.attemptsLeft
              }
            })
        });
        break;

      // CIE is Expired or Revoked
      case "CERTIFICATE_EXPIRED":
      case "CERTIFICATE_REVOKED":
        this.setError({
          eventReason: event.event,
          navigation: () =>
            this.props.navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.CIE_EXPIRED_SCREEN
            })
        });
        break;

      default:
        break;
    }
    this.updateContent();
  };

  private announceUpdate = () => {
    if (this.state.content) {
      AccessibilityInfo.announceForAccessibility(this.state.content);
    }
  };

  private updateContent = () => {
    switch (this.state.readingState) {
      case ReadingState.reading:
        this.setState(
          {
            title: I18n.t("authentication.cie.card.readerCardTitle"),
            subtitle: "",
            content: I18n.t("authentication.cie.card.readerCardFooter")
          },
          this.announceUpdate
        );
        break;
      case ReadingState.error:
        trackLoginCieCardReadingError();
        this.setState(
          state => getTextForState(ReadingState.error, state.errorMessage),
          this.announceUpdate
        );
        break;
      case ReadingState.completed:
        this.setState(
          state => ({
            title: I18n.t("authentication.cie.card.cieCardValid"),
            subtitle: "",
            // duplicate message so screen reader can read the updated message
            content: state.isScreenReaderEnabled
              ? I18n.t("authentication.cie.card.cieCardValid")
              : undefined
          }),
          this.announceUpdate
        );
        break;
      // waiting_card state
      default:
        this.setState(
          getTextForState(ReadingState.waiting_card),
          this.announceUpdate
        );
    }
  };

  // TODO: It should reset authentication process
  private handleCieError = (error: Error) => {
    trackLoginCieCardReadingError();
    handleSendAssistanceLog(this.choosenTool, error.message);
    this.setError({ eventReason: "GENERIC", errorDescription: error.message });
  };

  private handleCieSuccess = (cieConsentUri: string) => {
    if (this.state.readingState === ReadingState.completed) {
      return;
    }
    handleSendAssistanceLog(this.choosenTool, "authentication SUCCESS");
    this.setState({ readingState: ReadingState.completed }, () => {
      this.updateContent();
      setTimeout(
        async () => {
          trackLoginCieCardReadingSuccess();
          this.props.navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
            screen: AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE,
            params: {
              cieConsentUri
            }
          });
          // if screen reader is enabled, give more time to read the success message
        },
        this.state.isScreenReaderEnabled
          ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
          : // if is iOS don't wait. The thank you page is shown natively
            Platform.select({ ios: 0, default: WAIT_TIMEOUT_NAVIGATION })
      );
    });
  };

  public async startCieAndroid(useCieUat: boolean) {
    cieManager
      .start()
      .then(async () => {
        cieManager.onEvent(this.handleCieEvent);
        cieManager.onError(this.handleCieError);
        cieManager.onSuccess(this.handleCieSuccess);
        await cieManager.setPin(this.ciePin);
        cieManager.setAuthenticationUrl(this.cieAuthorizationUri);
        cieManager.enableLog(isDevEnv);
        cieManager.setCustomIdpUrl(useCieUat ? getCieUatEndpoint() : null);
        await cieManager.startListeningNFC();
        this.setState({ readingState: ReadingState.waiting_card });
      })
      .catch(() => {
        this.setState({ readingState: ReadingState.error });
      });
  }

  public async startCieiOS(useCieUat: boolean) {
    cieManager.removeAllListeners();
    cieManager.onEvent(this.handleCieEvent);
    cieManager.onError(this.handleCieError);
    cieManager.onSuccess(this.handleCieSuccess);
    cieManager.enableLog(isDevEnv);
    cieManager.setCustomIdpUrl(useCieUat ? getCieUatEndpoint() : null);
    await cieManager.setPin(this.ciePin);
    cieManager.setAuthenticationUrl(this.cieAuthorizationUri);
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
        this.setState({ readingState: ReadingState.waiting_card });
        this.updateContent();
      })
      .catch(() => {
        this.setState({ readingState: ReadingState.error });
      });
  }

  public async componentDidMount() {
    const startCie = Platform.select({
      ios: this.startCieiOS,
      default: this.startCieAndroid
    });
    await startCie(this.props.isCieUatEnabled);
    const srEnabled = await isScreenReaderEnabled();
    this.setState({ isScreenReaderEnabled: srEnabled });
  }

  private handleCancel = () =>
    this.props.navigation.reset({
      index: 0,
      routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
    });

  private getFooter = () =>
    Platform.select({
      default: (
        <View style={{ alignItems: "center" }}>
          <View>
            <IOButton
              variant="link"
              label={I18n.t("global.buttons.close")}
              onPress={this.handleCancel}
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
              onPress={() => this.startCieiOS(this.props.isCieUatEnabled)}
            />
          </View>
          <VSpacer size={24} />
          <View>
            <IOButton
              variant="link"
              label={I18n.t("global.buttons.close")}
              onPress={this.handleCancel}
            />
          </View>
        </View>
      )
    });

  public render(): ReactNode {
    return (
      <SafeAreaView style={{ flex: 1 }} testID="cie-card-reader-screen-test-id">
        <ScrollView
          centerContent={true}
          contentContainerStyle={styles.contentContainer}
        >
          <ContentWrapper>
            <CieCardReadingAnimation
              pictogramName={getPictogramName(this.state.readingState)}
              readingState={this.state.readingState}
              circleColor={this.props.blueColorName}
            />
            <VSpacer size={32} />
            <Title
              text={this.state.title}
              accessibilityLabel={
                this.state.subtitle
                  ? `${this.state.title}. ${this.state.subtitle}`
                  : this.state.title
              }
            />
            <VSpacer size={8} />
            {this.state.subtitle && (
              <Body style={styles.centerText} ref={this.subTitleRef}>
                {this.state.subtitle}
              </Body>
            )}
            <VSpacer size={24} />
            {this.state.readingState !== ReadingState.completed &&
              this.getFooter()}
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  assistanceToolConfig: assistanceToolConfigSelector(state),
  isCieUatEnabled: isCieLoginUatEnabledSelector(state)
});

const ReaderScreen = (props: Props) => (
  <View style={styles.container}>
    <CieCardReaderScreen {...props} />
  </View>
);

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

export default connect(mapStateToProps)(ReaderScreen);

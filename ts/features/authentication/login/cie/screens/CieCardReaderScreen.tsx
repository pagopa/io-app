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
  IOPictograms,
  VSpacer
} from "@pagopa/io-app-design-system";
import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { PureComponent, ReactNode, useCallback, useRef } from "react";
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
import { connect } from "react-redux";

import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { ReduxProps } from "../../../../../store/actions/types";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isScreenReaderEnabledSelector } from "../../../../../store/reducers/preferences";
import { GlobalState } from "../../../../../store/reducers/types";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { isDevEnv } from "../../../../../utils/environment";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import {
  accessibityTimeout,
  analyticActions,
  getTextForState,
  WAIT_TIMEOUT_NAVIGATION,
  WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
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
  cieAuthenticationError,
  CieAuthenticationErrorPayload,
  CieAuthenticationErrorReason
} from "../store/actions";
import { isCieLoginUatEnabledSelector } from "../store/selectors";
import { getCieUatEndpoint } from "../utils/endpoints";

export type CieCardReaderNavigationProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "CIE_CARD_READER_SCREEN"
>;

export type CieCardReaderScreenNavigationParams = {
  authorizationUri: string;
  ciePin: string;
};

type Props = CieCardReaderNavigationProps &
  ReduxProps &
  ReturnType<typeof mapStateToProps> & {
    blueColorName: string;
    headerHeight: number;
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

type setErrorParameter = {
  errorDescription?: string;
  eventReason: CieAuthenticationErrorReason;
  navigation?: () => void;
};

type State = {
  content?: string;
  errorMessage?: string;
  // Get the current status of the card reading
  readingState: ReadingState;
  subtitle?: string;
  title: string;
};

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

/**
 *  This screen shown while reading the card
 */
class CieCardReaderScreen extends PureComponent<Props, State> {
  get cieAuthorizationUri(): string {
    return this.props.route.params.authorizationUri;
  }
  get ciePin(): string {
    return this.props.route.params.ciePin;
  }

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
      ...getTextForState(ReadingState.waiting_card)
    };
    this.startCieiOS = this.startCieiOS.bind(this);
    this.startCieAndroid = this.startCieAndroid.bind(this);
  }

  public async componentDidMount() {
    const startCie = Platform.select({
      ios: this.startCieiOS,
      default: this.startCieAndroid
    });
    await startCie(this.props.isCieUatEnabled);
  }

  public async componentWillUnmount() {
    await cieManager.stopListeningNFC().catch(() => {
      // Ignore errors on stop listening NFC
    });
    cieManager.removeAllListeners();
  }

  public render(): ReactNode {
    return (
      <SafeAreaView style={{ flex: 1 }} testID="cie-card-reader-screen-test-id">
        <ScrollView
          centerContent={true}
          contentContainerStyle={styles.contentContainer}
        >
          <ContentWrapper>
            <CieCardReadingAnimation
              circleColor={this.props.blueColorName}
              pictogramName={getPictogramName(this.state.readingState)}
              readingState={this.state.readingState}
            />
            <VSpacer size={32} />
            <Title
              accessibilityLabel={
                this.state.subtitle
                  ? `${this.state.title}. ${this.state.subtitle}`
                  : this.state.title
              }
              text={this.state.title}
            />
            <VSpacer size={8} />
            {this.state.subtitle && (
              <Body style={styles.centerText}>{this.state.subtitle}</Body>
            )}
            <VSpacer size={24} />
            {this.state.readingState !== ReadingState.completed &&
              this.getFooter()}
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    );
  }

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

  private announceUpdate = () => {
    if (this.state.content) {
      AccessibilityInfo.announceForAccessibility(this.state.content);
    }
  };

  private dispatchAnalyticEvent = (error: CieAuthenticationErrorPayload) => {
    this.props.dispatch(cieAuthenticationError(error));
  };

  private getFooter = () =>
    Platform.select({
      default: (
        <View style={{ alignItems: "center" }}>
          <View>
            <IOButton
              label={I18n.t("global.buttons.close")}
              onPress={this.handleCancel}
              variant="link"
            />
          </View>
        </View>
      ),
      ios: (
        <View style={{ alignItems: "center" }}>
          <View>
            <IOButton
              label={I18n.t("authentication.cie.nfc.retry")}
              onPress={() => this.startCieiOS(this.props.isCieUatEnabled)}
              variant="solid"
            />
          </View>
          <VSpacer size={24} />
          <View>
            <IOButton
              label={I18n.t("global.buttons.close")}
              onPress={this.handleCancel}
              variant="link"
            />
          </View>
        </View>
      )
    });

  private handleCancel = () =>
    this.props.navigation.reset({
      index: 0,
      routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
    });

  // TODO: It should reset authentication process
  private handleCieError = (error: Error) => {
    trackLoginCieCardReadingError();
    handleSendAssistanceLog(this.choosenTool, error.message);
    this.setError({ eventReason: "GENERIC", errorDescription: error.message });
  };

  private handleCieEvent = async (event: CEvent) => {
    handleSendAssistanceLog(this.choosenTool, event.event);
    switch (event.event) {
      // "Function not supported" seems to be TAG_ERROR_NFC_NOT_SUPPORTED
      // for the iOS SDK
      case "Function not supported" as unknown:
      case "ON_TAG_DISCOVERED_NOT_CIE":
      case "TAG_ERROR_NFC_NOT_SUPPORTED":
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
      // The card is temporarily locked. Unlock is available by CieID app
      case "ON_CARD_PIN_LOCKED":
      // falls through
      case "ON_PIN_ERROR":
      case "PIN Locked":
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
      // Reading starts
      case "ON_TAG_DISCOVERED":
        if (this.state.readingState !== ReadingState.reading) {
          this.setState({ readingState: ReadingState.reading }, () => {
            HapticFeedback.trigger(HapticFeedbackTypes.impactLight);
          });
        }
        break;

      case "ON_TAG_LOST":
      case "Transmission Error":
        this.setError({ eventReason: event.event });
        break;

      default:
        break;
    }
    this.updateContent();
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
        this.props.isScreenReaderEnabled
          ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
          : // if is iOS don't wait. The thank you page is shown natively
            Platform.select({ ios: 0, default: WAIT_TIMEOUT_NAVIGATION })
      );
    });
  };

  private setError = ({
    eventReason,
    errorDescription,
    navigation
  }: setErrorParameter) => {
    const cieDescription =
      errorDescription ?? analyticActions.get(eventReason) ?? "";

    this.dispatchAnalyticEvent({
      reason: eventReason,
      cieDescription,
      flow: "auth"
    });

    this.setState(
      {
        readingState: ReadingState.error,
        errorMessage: cieDescription
      },
      () => {
        HapticFeedback.trigger(HapticFeedbackTypes.notificationError);
        navigation?.();
      }
    );
  };

  private updateContent = () => {
    switch (this.state.readingState) {
      case ReadingState.completed:
        this.setState(
          {
            title: I18n.t("authentication.cie.card.cieCardValid"),
            subtitle: "",
            // duplicate message so screen reader can read the updated message
            content: this.props.isScreenReaderEnabled
              ? I18n.t("authentication.cie.card.cieCardValid")
              : undefined
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
      // waiting_card state
      default:
        this.setState(
          getTextForState(ReadingState.waiting_card),
          this.announceUpdate
        );
    }
  };
}

const mapStateToProps = (state: GlobalState) => ({
  assistanceToolConfig: assistanceToolConfigSelector(state),
  isCieUatEnabled: isCieLoginUatEnabledSelector(state),
  isScreenReaderEnabled: isScreenReaderEnabledSelector(state)
});

const ReaderScreen = (props: Props) => (
  <View style={styles.container}>
    <CieCardReaderScreen {...props} />
  </View>
);

const Title = (props: { accessibilityLabel: string; text: string }) => {
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

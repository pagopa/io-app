/**
 * A screen to guide the user to proper read the CIE
 * TODO: isolate cie event listener as saga
 * TODO: when 100% is reached, the animation end
 */
import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Content, Text, View } from "native-base";
import * as React from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  Vibration
} from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import CieNfcOverlay from "../../../components/cie/CieNfcOverlay";
import CieReadingCardAnimation from "../../../components/cie/CieReadingCardAnimation";
import { withConditionalView } from "../../../components/helpers/withConditionalView";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { isNfcEnabledSelector } from "../../../store/reducers/cie";
import { GlobalState } from "../../../store/reducers/types";
import customVariables from "../../../theme/variables";
import {
  isScreenReaderEnabled,
  setAccessibilityFocus
} from "../../../utils/accessibility";
import { instabugLog, TypeLogs } from "../../../boot/configureInstabug";
import {
  cieAuthenticationError,
  CieAuthenticationErrorPayload,
  CieAuthenticationErrorReason
} from "../../../store/actions/cie";
import { ReduxProps } from "../../../store/actions/types";
import { isIos } from "../../../utils/platform";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";

type NavigationParams = {
  ciePin: string;
  authorizationUri: string;
};

type Props = NavigationScreenProps<NavigationParams> &
  ReduxProps &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: customVariables.contentPadding
  }
});

export enum ReadingState {
  "reading" = "reading",
  "error" = "error",
  "completed" = "completed",
  "waiting_card" = "waiting_card"
}

type State = {
  // Get the current status of the card reading
  readingState: ReadingState;
  title: string;
  subtitle: string;
  content?: string;
  errorMessage?: string;
  isScreenReaderEnabled: boolean;
};

type setErrorParameter = {
  eventReason: CieAuthenticationErrorReason;
  errorDescription?: string;
  navigationRoute?: string;
  navigationParams?: Record<string, unknown>;
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
    "ON_NO_INTERNET_CONNECTION",
    I18n.t("authentication.cie.card.error.tryAgain")
  ],
  ["STOP_NFC_ERROR", ""],
  ["START_NFC_ERROR", ""]
]);

const instabugTag = "cie";
// the timeout we sleep until move to consent form screen when authentication goes well
const WAIT_TIMEOUT_NAVIGATION = 1700 as Millisecond;
const WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY = 5000 as Millisecond;
const VIBRATION = 100 as Millisecond;
const accessibityTimeout = 100 as Millisecond;

/**
 *  This screen shown while reading the card
 */
class CieCardReaderScreen extends React.PureComponent<Props, State> {
  private subTitleRef = React.createRef<Text>();

  constructor(props: Props) {
    super(props);
    this.state = {
      /*
      These are the states that can occur when reading the cie (from SDK)
      - waiting_card (we are ready for read ->radar effect)
      - reading (we are reading the card -> progress animation)
      - error (the reading is interrupted -> progress animation stops and the progress circle becomes red)
      - completed (the reading has been completed)
      */
      readingState: ReadingState.waiting_card,
      title: I18n.t("authentication.cie.card.title"),
      subtitle: I18n.t("authentication.cie.card.layCardMessageHeader"),
      content: I18n.t("authentication.cie.card.layCardMessageFooter"),
      isScreenReaderEnabled: false
    };
    this.startCieiOS = this.startCieiOS.bind(this);
    this.startCieAndroid = this.startCieAndroid.bind(this);
  }

  get ciePin(): string {
    return this.props.navigation.getParam("ciePin");
  }

  get cieAuthorizationUri(): string {
    return this.props.navigation.getParam("authorizationUri");
  }

  private setError = ({
    eventReason,
    errorDescription,
    navigationRoute,
    navigationParams = {}
  }: setErrorParameter) => {
    const cieDescription =
      errorDescription ??
      fromNullable(analyticActions.get(eventReason)).getOrElse("");

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
        if (navigationRoute !== undefined) {
          this.props.navigation.navigate(navigationRoute, navigationParams);
        }
      }
    );
  };

  private dispatchAnalyticEvent = (error: CieAuthenticationErrorPayload) => {
    this.props.dispatch(cieAuthenticationError(error));
  };

  private handleCieEvent = async (event: CEvent) => {
    instabugLog(event.event, TypeLogs.DEBUG, instabugTag);
    switch (event.event) {
      // Reading starts
      case "ON_TAG_DISCOVERED":
        if (this.state.readingState !== ReadingState.reading) {
          this.setState({ readingState: ReadingState.reading }, () => {
            Vibration.vibrate(VIBRATION);
          });
        }
        break;

      case "Transmission Error":
      case "ON_TAG_LOST":
      case "TAG_ERROR_NFC_NOT_SUPPORTED":
      case "ON_TAG_DISCOVERED_NOT_CIE":
      case "AUTHENTICATION_ERROR":
      case "ON_NO_INTERNET_CONNECTION":
        this.setError({ eventReason: event.event });
        break;

      // The card is temporarily locked. Unlock is available by CieID app
      case "PIN Locked":
      case "ON_CARD_PIN_LOCKED":
        this.setError({
          eventReason: event.event,
          navigationRoute: ROUTES.CIE_PIN_TEMP_LOCKED_SCREEN
        });
        break;

      // The inserted pin is incorrect
      case "ON_PIN_ERROR":
        this.setError({
          eventReason: event.event,
          navigationRoute: ROUTES.CIE_WRONG_PIN_SCREEN,
          navigationParams: {
            remainingCount: event.attemptsLeft
          }
        });
        break;

      // CIE is Expired or Revoked
      case "CERTIFICATE_EXPIRED":
      case "CERTIFICATE_REVOKED":
        this.setError({
          eventReason: event.event,
          navigationRoute: ROUTES.CIE_EXPIRED_SCREEN
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
            subtitle: I18n.t("authentication.cie.card.readerCardHeader"),
            content: I18n.t("authentication.cie.card.readerCardFooter")
          },
          this.announceUpdate
        );
        break;
      case ReadingState.error:
        this.setState(
          {
            title: I18n.t(
              isIos
                ? "authentication.cie.card.error.readerCardLostTitleiOS"
                : "authentication.cie.card.error.readerCardLostTitle"
            ),
            subtitle: I18n.t(
              isIos
                ? "authentication.cie.card.error.readerCardLostHeaderiOS"
                : "authentication.cie.card.error.readerCardLostHeader"
            ),
            content: isIos ? "" : this.state.errorMessage
          },
          this.announceUpdate
        );
        break;
      case ReadingState.completed:
        this.setState(
          {
            title: I18n.t("global.buttons.ok2"),
            subtitle: I18n.t("authentication.cie.card.cieCardValid"),
            // duplicate message so screen reader can read the updated message
            content: this.state.isScreenReaderEnabled
              ? I18n.t("authentication.cie.card.cieCardValid")
              : undefined
          },
          this.announceUpdate
        );
        break;
      // waiting_card state
      default:
        this.setState(
          {
            title: I18n.t(
              isIos
                ? "authentication.cie.card.titleiOS"
                : "authentication.cie.card.title"
            ),
            subtitle: I18n.t(
              isIos
                ? "authentication.cie.card.layCardMessageHeaderiOS"
                : "authentication.cie.card.layCardMessageHeader"
            ),
            content: isIos
              ? ""
              : I18n.t("authentication.cie.card.layCardMessageFooter")
          },
          this.announceUpdate
        );
    }
  };

  // TODO: It should reset authentication process
  private handleCieError = (error: Error) => {
    instabugLog(error.message, TypeLogs.DEBUG, instabugTag);
    this.setError({ eventReason: "GENERIC", errorDescription: error.message });
  };

  private handleCieSuccess = (cieConsentUri: string) => {
    if (this.state.readingState === ReadingState.completed) {
      return;
    }
    instabugLog("authentication SUCCESS", TypeLogs.DEBUG, instabugTag);
    this.setState({ readingState: ReadingState.completed }, () => {
      this.updateContent();
      setTimeout(
        async () => {
          this.props.navigation.navigate(ROUTES.CIE_CONSENT_DATA_USAGE, {
            cieConsentUri
          });
          // if screen reader is enabled, give more time to read the success message
        },
        this.state.isScreenReaderEnabled
          ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
          : // if is iOS don't wait. The thank you page is shown natively
          Platform.OS === "ios"
          ? 0
          : WAIT_TIMEOUT_NAVIGATION
      );
    });
  };

  public async startCieAndroid() {
    cieManager
      .start()
      .then(async () => {
        cieManager.onEvent(this.handleCieEvent);
        cieManager.onError(this.handleCieError);
        cieManager.onSuccess(this.handleCieSuccess);
        await cieManager.setPin(this.ciePin);
        cieManager.setAuthenticationUrl(this.cieAuthorizationUri);
        await cieManager.startListeningNFC();
        this.setState({ readingState: ReadingState.waiting_card });
      })
      .catch(() => {
        this.setState({ readingState: ReadingState.error });
      });
  }

  public async startCieiOS() {
    cieManager.removeAllListeners();
    cieManager.onEvent(this.handleCieEvent);
    cieManager.onError(this.handleCieError);
    cieManager.onSuccess(this.handleCieSuccess);
    await cieManager.setPin(this.ciePin);
    cieManager.setAuthenticationUrl(this.cieAuthorizationUri);
    cieManager
      .start()
      .then(async () => {
        await cieManager.startListeningNFC();
        this.setState({ readingState: ReadingState.waiting_card });
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
    await startCie();
    const srEnabled = await isScreenReaderEnabled();
    this.setState({ isScreenReaderEnabled: srEnabled });
  }

  // focus on subtitle just after set the focus on navigation header title
  private handleOnHeaderFocus = () => {
    setAccessibilityFocus(this.subTitleRef, accessibityTimeout);
  };

  private handleCancel = () => this.props.dispatch(resetToAuthenticationRoute);

  private getFooter = () =>
    Platform.select({
      default: (
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            onPress: this.handleCancel,
            bordered: true,
            title: I18n.t("global.buttons.cancel")
          }}
        />
      ),
      ios: (
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            bordered: true,
            onPress: this.handleCancel,
            title: I18n.t("global.buttons.cancel")
          }}
          rightButton={{
            onPress: async () => await this.startCieiOS(),
            title: I18n.t("authentication.cie.nfc.retry")
          }}
        />
      )
    });

  public render(): React.ReactNode {
    return (
      <TopScreenComponent
        onAccessibilityNavigationHeaderFocus={this.handleOnHeaderFocus}
        goBack={true}
        headerTitle={I18n.t("authentication.cie.card.headerTitle")}
      >
        <ScreenContentHeader title={this.state.title} />
        <Content bounces={false} noPadded={true}>
          <Text style={styles.padded} ref={this.subTitleRef}>
            {this.state.subtitle}
          </Text>
          {!isIos && (
            <CieReadingCardAnimation readingState={this.state.readingState} />
          )}
          {isIos && <View spacer={true} />}
          <Text style={styles.padded} accessible={true}>
            {this.state.content}
          </Text>
        </Content>
        {this.state.readingState !== ReadingState.completed && // TODO: validate - the screen has the back button on top left so it includes cancel also on reading success
          this.getFooter()}
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const isEnabled = isNfcEnabledSelector(state);
  return {
    isNfcEnabled: pot.getOrElse(isEnabled, false)
  };
};

export default connect(mapStateToProps)(
  withConditionalView(
    CieCardReaderScreen,
    (props: Props) => props.isNfcEnabled,
    CieNfcOverlay
  )
);

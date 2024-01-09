/**
 * A screen to guide the user to proper read the CIE
 * TODO: isolate cie event listener as saga
 * TODO: when 100% is reached, the animation end
 */
import cieManager, {
  Event as CEvent,
  CieData
} from "@pagopa/io-react-native-cie-pid";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import {
  View,
  AccessibilityInfo,
  Platform,
  StyleSheet,
  Vibration,
  Text,
  SafeAreaView
} from "react-native";
import { connect } from "react-redux";
import {
  VSpacer,
  IOColors,
  H2,
  ButtonSolid,
  Body,
  IOStyles
} from "@pagopa/io-app-design-system";
import I18n from "../../../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { ReduxProps } from "../../../../../../store/actions/types";
import { assistanceToolConfigSelector } from "../../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  isScreenReaderEnabled,
  setAccessibilityFocus
} from "../../../../../../utils/accessibility";
import { isIos } from "../../../../../../utils/platform";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../../utils/supportAssistance";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import CieReadingCardAnimation, {
  ReadingState
} from "../../../../components/cie/CieReadingCardAnimation";
import {
  ItwCieAuthenticationErrorPayload,
  ItwCieAuthenticationErrorReason,
  itwCieAuthenticationError
} from "../../../../store/actions/issuing/pid/itwIssuancePidCieActions";
import { itwIsNfcEnabledSelector } from "../../../../store/reducers/issuance/pid/itwIssuancePidCieAuthReducer";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import CieNfcOverlay from "../../../../components/cie/CieNfcOverlay";

export type ItwCieCardReaderScreenNavigationParams = {
  ciePin: string;
  authorizationUri: string;
};

type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUING_PID_CIE_CARD_READER_SCREEN"
>;

type Props = NavigationProps & ReduxProps & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOColors.white
  },
  textCenter: {
    textAlign: "center"
  }
});

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
  eventReason: ItwCieAuthenticationErrorReason;
  errorDescription?: string;
  navigation?: () => void;
};

// A subset of Cie Events (errors) which is of interest to analytics
const analyticActions = new Map<ItwCieAuthenticationErrorReason, string>([
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
  subtitle: string;
  content: string;
};

// some texts changes depending on current running Platform
const getTextForState = (
  state: ReadingState.waiting_card | ReadingState.error,
  _: string = ""
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
        title: I18n.t("authentication.cie.card.error.readerCardLostTitleiOS"),
        subtitle: I18n.t(
          "authentication.cie.card.error.readerCardLostHeaderiOS"
        ),
        // the native alert hides the screen content and shows a message it self
        content: ""
      }
    },
    default: {
      [ReadingState.waiting_card]: {
        title: I18n.t("features.itWallet.issuing.cie.waiting.title"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeader"),
        content: I18n.t("features.itWallet.issuing.cie.waiting.content")
      },
      [ReadingState.error]: {
        title: I18n.t("features.itWallet.issuing.cie.error.title"),
        subtitle: "",
        content: ""
      }
    }
  });
  return texts[state];
};

/**
 *  This screen shown while reading the card
 */
class ItwCieCardReaderScreen extends React.PureComponent<Props, State> {
  private subTitleRef = React.createRef<Text>();
  private choosenTool = assistanceToolRemoteConfig(
    this.props.assistanceToolConfig
  );
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

  private dispatchAnalyticEvent = (error: ItwCieAuthenticationErrorPayload) => {
    this.props.dispatch(itwCieAuthenticationError(error));
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
      case "Transmission Error":
      case "ON_TAG_LOST":
      case "TAG_ERROR_NFC_NOT_SUPPORTED":
      case "ON_TAG_DISCOVERED_NOT_CIE":
      case "AUTHENTICATION_ERROR":
      case "ON_NO_INTERNET_CONNECTION":
      case "EXTENDED_APDU_NOT_SUPPORTED":
        this.setError({ eventReason: event.event });
        break;

      // The card is temporarily locked. Unlock is available by CieID app
      case "PIN Locked":
      case "ON_CARD_PIN_LOCKED":
        this.setError({
          eventReason: event.event,
          navigation: () =>
            this.props.navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.ISSUING.PID.CIE.PIN_TEMP_LOCKED_SCREEN
            })
        });
        break;

      // The inserted pin is incorrect
      case "ON_PIN_ERROR":
        this.setError({
          eventReason: event.event,
          navigation: () =>
            this.props.navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.ISSUING.PID.CIE.WRONG_PIN_SCREEN,
              params: {
                remainingCount: event.attemptsLeft
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
            this.props.navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.ISSUING.PID.CIE.EXPIRED_SCREEN
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
            title: I18n.t("features.itWallet.issuing.cie.reading.title"),
            subtitle: I18n.t("authentication.cie.card.readerCardHeader"),
            content: ""
          },
          this.announceUpdate
        );
        break;
      case ReadingState.error:
        this.setState(
          state => getTextForState(ReadingState.error, state.errorMessage),
          this.announceUpdate
        );
        break;
      case ReadingState.completed:
        this.setState(
          {
            title: I18n.t("features.itWallet.issuing.cie.success.title"),
            subtitle: I18n.t("authentication.cie.card.cieCardValid"),
            // duplicate message so screen reader can read the updated message
            content: I18n.t("features.itWallet.issuing.cie.success.content")
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

  // TODO: It should reset authentication process
  private handleCieError = (error: Error) => {
    handleSendAssistanceLog(this.choosenTool, error.message);
    this.setError({ eventReason: "GENERIC", errorDescription: error.message });
  };

  private handleCieSuccess = (cieData: string) => {
    const cieDataParsed: CieData = JSON.parse(cieData);
    const cieConsentUri = cieDataParsed.url;
    const pidData = cieDataParsed.pidData;
    if (this.state.readingState === ReadingState.completed) {
      return;
    }
    handleSendAssistanceLog(this.choosenTool, "authentication SUCCESS");
    this.setState({ readingState: ReadingState.completed }, () => {
      this.updateContent();
      setTimeout(
        async () => {
          this.props.navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.ISSUING.PID.CIE.CONSENT_DATA_USAGE,
            params: {
              cieConsentUri,
              pidData
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
        )
      })
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

  private getFooter = () => (
    <ButtonSolid
      onPress={constNull}
      label={I18n.t("features.itWallet.issuing.cie.help")}
      accessibilityLabel={I18n.t("features.itWallet.issuing.cie.help")}
      fullWidth={true}
      color={"contrast"}
    />
  );

  public render(): React.ReactNode {
    return (
      <BaseScreenComponent
        onAccessibilityNavigationHeaderFocus={this.handleOnHeaderFocus}
        goBack={true}
        headerTitle={I18n.t("authentication.cie.card.headerTitle")}
      >
        <SafeAreaView style={IOStyles.flex}>
          {!isIos && (
            <CieReadingCardAnimation readingState={this.state.readingState} />
          )}
          {isIos && <VSpacer size={16} />}
          <View style={IOStyles.horizontalContentPadding}>
            <H2 style={styles.textCenter}>{this.state.title}</H2>
            <Body style={styles.textCenter} accessible={true}>
              {this.state.content}
            </Body>
            {this.state.readingState === ReadingState.error && (
              <ButtonSolid
                onPress={() =>
                  this.setState(
                    { readingState: ReadingState.waiting_card },
                    () => this.updateContent()
                  )
                }
                label={I18n.t("features.itWallet.issuing.cie.error.retry")}
                accessibilityLabel={I18n.t(
                  "features.itWallet.issuing.cie.error.retry"
                )}
                fullWidth={true}
              />
            )}
          </View>
        </SafeAreaView>
        {this.state.readingState !== ReadingState.completed && // TODO: validate - the screen has the back button on top left so it includes cancel also on reading success
          this.getFooter()}
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const isEnabled = itwIsNfcEnabledSelector(state);
  return {
    isNfcEnabled: pot.getOrElse(isEnabled, false),
    assistanceToolConfig: assistanceToolConfigSelector(state)
  };
};

const ReaderScreen = (props: Props) => (
  <View style={styles.container}>
    {props.isNfcEnabled ? (
      <ItwCieCardReaderScreen {...props} />
    ) : (
      <CieNfcOverlay {...props} />
    )}
  </View>
);

export default connect(mapStateToProps)(ReaderScreen);

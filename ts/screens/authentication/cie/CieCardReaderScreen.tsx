import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, Vibration } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import CieNfcOverlay from "../../../components/cie/CieNfcOverlay";
import CieReadingCardAnimation from "../../../components/cie/CieReadingCardAnimation";
import { withConditionalView } from "../../../components/helpers/withConditionalView";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import StyledIconFont from "../../../components/ui/IconFont";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { isNfcEnabledSelector } from "../../../store/reducers/cie";
import { GlobalState } from "../../../store/reducers/types";
import customVariables from "../../../theme/variables";
import { SUCCESS_ICON_HEIGHT } from "../../../utils/constants";

type NavigationParams = {
  ciePin: string;
  authorizationUri: string;
};

type Props = NavigationScreenProps<NavigationParams> &
  ReturnType<typeof mapStateToProps> &
  LightModalContextInterface;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  center: { alignSelf: "center" }
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
};

// the timeout we sleep until move to consent form screen when authentication goes well
const WAIT_TIMEOUT_NAVIGATION = 1700 as Millisecond;
const VIBRATION = 100 as Millisecond;

/**
 * A screen to guide the user to proper read the CIE
 */
class CieCardReaderScreen extends React.PureComponent<Props, State> {
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
      content: I18n.t("authentication.cie.card.layCardMessageFooter")
    };
  }

  get ciePin(): string {
    return this.props.navigation.getParam("ciePin");
  }

  get cieAuthorizationUri(): string {
    return this.props.navigation.getParam("authorizationUri");
  }

  private setError = (
    errorMessage: string,
    navigationRoute?: string,
    navigationParams: {} = {}
  ) => {
    this.setState(
      {
        readingState: ReadingState.error,
        errorMessage
      },
      () => {
        Vibration.vibrate(VIBRATION);
        if (navigationRoute !== undefined) {
          this.props.navigation.navigate(navigationRoute, navigationParams);
        }
      }
    );
  };

  private handleCieEvent = async (event: CEvent) => {
    switch (event.event) {
      // Reading starts
      case "ON_TAG_DISCOVERED":
        if (this.state.readingState !== ReadingState.reading) {
          this.setState({ readingState: ReadingState.reading }, () => {
            Vibration.vibrate(VIBRATION);
          });
        }
        break;

      // Reading interrupted before the sdk complete the reading
      case "ON_TAG_LOST":
        this.setError(I18n.t("authentication.cie.card.error.onTagLost"));
        break;

      case "ON_TAG_DISCOVERED_NOT_CIE":
        this.setError(
          I18n.t("authentication.cie.card.error.unknownCardContent")
        );
        break;

      // The card is temporarily locked. Unlock is available by CieID app
      case "ON_CARD_PIN_LOCKED":
        this.setError(
          I18n.t("authentication.cie.card.error.generic"),
          ROUTES.CIE_PIN_TEMP_LOCKED_SCREEN
        );
        break;

      case "AUTHENTICATION_ERROR":
        this.setError(I18n.t("authentication.cie.card.error.generic"));
        break;

      case "ON_NO_INTERNET_CONNECTION":
        this.setError(I18n.t("authentication.cie.card.error.tryAgain"));
        break;

      // The inserted pin is incorrect
      case "ON_PIN_ERROR":
        this.setError(
          I18n.t("authentication.cie.card.error.tryAgain"),
          ROUTES.CIE_WRONG_PIN_SCREEN,
          {
            remainingCount: event.attemptsLeft
          }
        );
        break;

      // CIE is Expired or Revoked
      case "CERTIFICATE_EXPIRED":
      case "CERTIFICATE_REVOKED":
        this.setError(
          I18n.t("authentication.cie.card.error.generic"),
          ROUTES.CIE_EXPIRED_SCREEN
        );
        break;

      default:
        break;
    }
    this.updateContent();
  };

  private updateContent = () => {
    switch (this.state.readingState) {
      case ReadingState.completed:
      case ReadingState.reading:
        this.setState({
          title: I18n.t("authentication.cie.card.readerCardTitle"),
          subtitle: I18n.t("authentication.cie.card.readerCardHeader"),
          content: I18n.t("authentication.cie.card.readerCardFooter")
        });
        break;
      case ReadingState.error:
        this.setState({
          title: I18n.t("authentication.cie.card.error.readerCardLostTitle"),
          subtitle: I18n.t(
            "authentication.cie.card.error.readerCardLostHeader"
          ),
          content: this.state.errorMessage
        });
        break;

      // waiting_card state
      default:
        this.setState({
          title: I18n.t("authentication.cie.card.title"),
          subtitle: I18n.t("authentication.cie.card.layCardMessageHeader"),
          content: I18n.t("authentication.cie.card.layCardMessageFooter")
        });
    }
  };

  // TODO: It should reset authentication process
  private handleCieError = (error: Error) => {
    this.setState({
      readingState: ReadingState.error,
      errorMessage: error.message
    });
  };

  private modal = (
    <TopScreenComponent
      customRightIcon={{ iconName: "io-close", onPress: this.props.hideModal }}
    >
      <Content>
        <View>
          <StyledIconFont
            name={"io-complete"}
            color={customVariables.brandHighlight}
            size={SUCCESS_ICON_HEIGHT}
            style={styles.center}
          />
          <View spacer={true} />
          <Text alignCenter={true}>
            {I18n.t("global.buttons.ok2")}
            {I18n.t("global.symbols.exclamation")}
          </Text>
          <Text bold={true} alignCenter={true}>
            {I18n.t("authentication.cie.card.cieCardValid")}
          </Text>
        </View>
      </Content>
    </TopScreenComponent>
  );

  private handleCieSuccess = (cieConsentUri: string) => {
    this.props.showModal(this.modal);
    setTimeout(async () => {
      this.props.navigation.navigate(ROUTES.CIE_CONSENT_DATA_USAGE, {
        cieConsentUri
      });
    }, WAIT_TIMEOUT_NAVIGATION);
  };

  public componentDidMount() {
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

  public render(): React.ReactNode {
    return (
      <TopScreenComponent
        goBack={true}
        headerTitle={I18n.t("authentication.cie.card.headerTitle")}
      >
        <ScreenContentHeader title={this.state.title} />
        <Content bounces={false} noPadded={true}>
          <Text style={styles.padded}>{this.state.subtitle}</Text>
          <CieReadingCardAnimation readingState={this.state.readingState} />
          {this.state.content && (
            <Text style={styles.padded}>{this.state.content}</Text>
          )}
        </Content>

        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            onPress: this.props.navigation.goBack,
            cancel: true,
            title: I18n.t("global.buttons.cancel")
          }}
        />
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
    withLightModalContext(CieCardReaderScreen),
    (props: Props) => props.isNfcEnabled,
    CieNfcOverlay
  )
);

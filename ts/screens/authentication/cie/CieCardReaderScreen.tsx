/**
 * A screen to guide the user to proper read the CIE
 * TODO: isolate cie event listener as saga
 * TODO: when 100% is reached, the animation end
 */
import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text } from "native-base";
import * as React from "react";
import { StyleSheet, Vibration } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
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

type NavigationParams = {
  ciePin: string;
  authorizationUri: string;
};

type Props = NavigationScreenProps<NavigationParams> &
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
  errorMessage: string;
};

/**
 *  This screen shown while reading the card
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
      errorMessage: ""
    };
  }

  get ciePin(): string {
    return this.props.navigation.getParam("ciePin");
  }

  get cieAuthorizationUri(): string {
    return this.props.navigation.getParam("authorizationUri");
  }

  private handleCieEvent = async (event: CEvent) => {
    // TODO: WHAT is it returned if CIE is EXPIRED? we should redirect to CieExpiredOrInvalidScreen
    // -- it should be CERTIFICATE_EXPIRED
    switch (event.event) {
      case "ON_TAG_DISCOVERED":
        if (this.state.readingState !== ReadingState.reading) {
          this.setState({ readingState: ReadingState.reading }, () => {
            Vibration.vibrate(100);
          });
        }
        break;
      case "ON_TAG_LOST":
        this.setState(
          {
            readingState: ReadingState.error,
            errorMessage: I18n.t("authentication.cie.card.error.onTagLost")
          },
          () => {
            Vibration.vibrate(100);
          }
        );
        break;

      case "ON_CARD_PIN_LOCKED":
        await this.stopCieManager();
        this.props.navigation.navigate(ROUTES.CIE_PIN_TEMP_LOCKED_SCREEN);
        break;

      case "AUTHENTICATION_ERROR":
      case "CERTIFICATE_EXPIRED":
        this.setState(
          {
            readingState: ReadingState.error,
            errorMessage: I18n.t("authentication.cie.card.error.generic")
          },
          () => {
            Vibration.vibrate(100);
          }
        );
        break;

      case "ON_NO_INTERNET_CONNECTION":
        this.setState(
          {
            readingState: ReadingState.error,
            errorMessage: I18n.t("authentication.cie.card.error.tryAgain")
          },
          () => {
            Vibration.vibrate(100);
          }
        );
        break;
      case "ON_PIN_ERROR":
        await this.handleWrongPin(event.attemptsLeft);
        break;
      default:
        break;
    }
  };

  private handleCieError = (error: Error) => {
    this.setState({
      readingState: ReadingState.error,
      errorMessage: error.message
    });
  };

  private handleCieSuccess = (consentUri: string) => {
    this.setState({ readingState: ReadingState.completed }, async () => {
      await this.stopCieManager();
      this.props.navigation.navigate(ROUTES.CIE_VALID_SCREEN, {
        cieConsentUri: consentUri
      });
    });
  };

  private handleWrongPin = async (attemptsLeft: number) => {
    await this.stopCieManager();
    this.props.navigation.navigate(ROUTES.CIE_WRONG_PIN_SCREEN, {
      remainingCount: attemptsLeft
    });
  };

  private stopCieManager = async () => {
    cieManager.removeAllListeners();
    await cieManager.stopListeningNFC();
  };

  public async componentWillUnmount() {
    await this.stopCieManager();
  }

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
        title={I18n.t("authentication.cie.card.headerTitle")}
      >
        <ScreenContentHeader
          title={
            this.state.readingState === ReadingState.error
              ? I18n.t("authentication.cie.card.error.readerCardLostTitle")
              : this.state.readingState === ReadingState.reading
                ? I18n.t("authentication.cie.card.readerCardTitle")
                : I18n.t("authentication.cie.card.title")
          }
        />
        <Content bounces={false} noPadded={true}>
          <Text style={styles.padded}>
            {this.state.readingState === ReadingState.error
              ? I18n.t("authentication.cie.card.error.readerCardLostHeader")
              : this.state.readingState === ReadingState.reading
                ? I18n.t("authentication.cie.card.readerCardHeader")
                : I18n.t("authentication.cie.card.layCardMessageHeader")}
          </Text>
          <CieReadingCardAnimation readingState={this.state.readingState} />
          <Text style={styles.padded} selectable={true}>
            {this.state.readingState === ReadingState.error
              ? this.state.errorMessage
              : this.state.readingState === ReadingState.reading
                ? I18n.t("authentication.cie.card.readerCardFooter")
                : I18n.t("authentication.cie.card.layCardMessageFooter")}
          </Text>
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            onPress: this.props.navigation.goBack, // TODO: evaluate if return to landing screen or CiePinScreen (double or triple back)
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
    isNfcEnabled: pot.isSome(isEnabled) && isEnabled.value === true
  };
};

export default connect(mapStateToProps)(
  withConditionalView(
    CieCardReaderScreen,
    (props: Props) => props.isNfcEnabled,
    CieNfcOverlay
  )
);

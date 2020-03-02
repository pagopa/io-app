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
import { Animated, Easing, Image, StyleSheet, Vibration } from "react-native";
import ProgressCircle from "react-native-progress-circle";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import AnimatedRing from "../../../components/animations/AnimatedRing";
import CieNfcOverlay from "../../../components/cie/CieNfcOverlay";
import { withConditionalView } from "../../../components/helpers/withConditionalView";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import {
  navigateToCieValid,
  navigateToCieWrongPin
} from "../../../store/actions/navigation";
import { isNfcEnabledSelector } from "../../../store/reducers/cie";
import { GlobalState } from "../../../store/reducers/types";
import customVariables from "../../../theme/variables";

type NavigationParams = {
  ciePin: string;
  authorizationUri: string;
};

type Props = NavigationScreenProps<NavigationParams> &
  ReturnType<typeof mapStateToProps>;

// Image dimension
const imgDimension = 180;
const boxDimension = 245;
const progressThreshold = 60;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  imgContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: boxDimension
  },
  img: {
    overflow: "hidden",
    backgroundColor: customVariables.colorWhite,
    height: imgDimension - 3,
    width: imgDimension - 3,
    borderRadius: imgDimension / 2
  },
  rings: {
    height: boxDimension,
    width: boxDimension,
    position: "absolute",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  }
});

enum ReadingState {
  "reading" = "reading",
  "error" = "error",
  "completed" = "completed",
  "waiting_card" = "waiting_card"
}

type State = {
  progressBarValue: number;
  // Get the current status of the card reading
  readingState: ReadingState;
  errorMessage: string;
};

/**
 *  This screen shown while reading the card
 */
class CieCardReaderScreen extends React.PureComponent<Props, State> {
  private progressAnimation: Animated.CompositeAnimation;
  private progressAnimatedValue: Animated.Value;

  constructor(props: Props) {
    super(props);
    this.state = {
      progressBarValue: 0,
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
    this.progressAnimatedValue = new Animated.Value(0);
    this.progressAnimatedValue.addListener(anim => {
      this.setState({ progressBarValue: anim.value });
    });
    // Two animation: the first fills the progress with the primary
    // color up to progressThreshold, the second up to 100
    // from 0 to 60 in 8 secs
    const firstAnim = Animated.timing(this.progressAnimatedValue, {
      toValue: progressThreshold,
      easing: Easing.linear,
      duration: 8000
    });
    // from 60 to 100 in 10 secs
    const secondAnim = Animated.timing(this.progressAnimatedValue, {
      toValue: 100,
      easing: Easing.linear,
      duration: 10000
    });
    this.progressAnimation = Animated.sequence([firstAnim, secondAnim]);
  }

  get ciePin(): string {
    return this.props.navigation.getParam("ciePin");
  }

  get cieAuthorizationUri(): string {
    return this.props.navigation.getParam("authorizationUri");
  }

  private startAnimation = () => {
    this.progressAnimation.stop();
    this.setState({ progressBarValue: 0 });
    this.progressAnimatedValue.setValue(0);
    this.progressAnimation.start();
  };

  public componentDidUpdate(_: Props, prevState: State) {
    // If we start reading the card, start the animation
    if (
      prevState.readingState !== ReadingState.reading &&
      this.state.readingState === ReadingState.reading
    ) {
      this.startAnimation();
    }
    // If we are not reading the card, stop the animation
    if (
      prevState.readingState === ReadingState.reading &&
      this.state.readingState !== ReadingState.reading
    ) {
      this.progressAnimation.stop();
    }
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
      this.props.navigation.navigate(
        navigateToCieValid({ cieConsentUri: consentUri })
      );
    });
  };

  private handleWrongPin = async (attemptsLeft: number) => {
    await this.stopCieManager();
    this.props.navigation.navigate(
      navigateToCieWrongPin({ remainingCount: attemptsLeft })
    );
  };

  private stopCieManager = async () => {
    this.progressAnimation.stop();
    this.progressAnimatedValue.removeAllListeners();
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

  // TODO: isolate the animation as component
  private getAnimatedImage = () => {
    // Setting for 'radar' animation
    const ringSettings = {
      dimension: imgDimension,
      // Three different animation start delays (one is 0), one for each ring
      delayX1: 700 as Millisecond,
      delayX2: 1400 as Millisecond,
      duration: 2100 as Millisecond
    };

    return (
      <View style={styles.imgContainer}>
        {this.state.readingState === ReadingState.waiting_card && (
          <View style={styles.rings}>
            <AnimatedRing
              dimension={ringSettings.dimension}
              startAnimationAfter={0 as Millisecond}
              duration={ringSettings.duration}
              boxDimension={boxDimension}
            />
            <AnimatedRing
              dimension={ringSettings.dimension}
              startAnimationAfter={ringSettings.delayX1}
              duration={ringSettings.duration}
              boxDimension={boxDimension}
            />
            <AnimatedRing
              dimension={ringSettings.dimension}
              startAnimationAfter={ringSettings.delayX2}
              duration={ringSettings.duration}
              boxDimension={boxDimension}
            />
          </View>
        )}
        <ProgressCircle
          percent={this.state.progressBarValue}
          radius={imgDimension / 2}
          borderWidth={3}
          color={
            this.state.readingState === ReadingState.error
              ? customVariables.brandDanger
              : customVariables.brandPrimary
          }
          shadowColor={customVariables.brandLightGray}
          bgColor={customVariables.brandLightGray}
        >
          <Image
            source={require("../../../../img/landing/place-card-illustration.png")}
            style={styles.img}
          />
        </ProgressCircle>
      </View>
    );
  };

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
          {this.getAnimatedImage()}
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

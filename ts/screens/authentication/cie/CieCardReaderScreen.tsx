import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Animated, Easing, Image, StyleSheet, Vibration } from "react-native";
import cieManager, { Event as CEvent } from "react-native-cie";
import ProgressCircle from "react-native-progress-circle";
import {
  NavigationScreenProp,
  NavigationScreenProps,
  NavigationState
} from "react-navigation";
import { RTron } from "../../../boot/configureStoreAndPersistor";
import AnimatedRing from "../../../components/animations/AnimatedRing";
import ScreenHeader from "../../../components/ScreenHeader";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import {
  navigateToCieValid,
  navigateToCieWrongPin
} from "../../../store/actions/navigation";
import customVariables from "../../../theme/variables";

interface OwnProps {
  navigation: NavigationScreenProp<NavigationState>;
}
type NavigationParams = {
  ciePin: string;
  authorizationUri: string;
};

type Props = OwnProps &
  Readonly<{
    navigation: NavigationScreenProp<NavigationState>;
  }> &
  NavigationScreenProps<NavigationParams>;
// Image dimension
const imgDimension = 180;
const boxDimension = 245;
const progressThreshold = 60;

const styles = StyleSheet.create({
  messageHeader: {
    minHeight: 85,
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding,
    fontSize: customVariables.fontSizeBase
  },
  messageFooter: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding,
    fontSize: customVariables.fontSizeBase
  },
  titleHeader: {
    marginTop: 20,
    minHeight: 85
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

type ReadingState = "reading" | "error" | "completed" | "waiting_card";

type State = {
  progressBarValue: number;
  // Get the current status of the card reading
  readingState: ReadingState;
  errorMessage: string;
};

/**
 *  This screen shown while reading the card
 */
class CieCardReaderScreen extends React.Component<Props, State> {
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
      readingState: "waiting_card",
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

  public componentDidUpdate(_: Props, prevState: State) {
    // If we start reading the card, start the animation
    if (
      prevState.readingState !== "reading" &&
      this.state.readingState === "reading"
    ) {
      this.progressAnimation.stop();
      this.setState({ progressBarValue: 0 });
      this.progressAnimatedValue.setValue(0);
      this.progressAnimation.start();
    }
    // If we are not in reading the card, stop the animation
    if (
      prevState.readingState === "reading" &&
      this.state.readingState !== "reading"
    ) {
      this.progressAnimation.stop();
    }
  }

  private handleCieEvent = async (event: CEvent) => {
    switch (event.event) {
      case "ON_TAG_DISCOVERED":
        if (this.state.readingState !== "reading") {
          this.setState({ readingState: "reading" }, () => {
            Vibration.vibrate(100);
          });
        }
        break;
      case "ON_TAG_LOST":
      case "AUTHENTICATION_ERROR":
      case "CERTIFICATE_EXPIRED":
      case "ON_NO_INTERNET_CONNECTION":
        if (this.state.readingState !== "error") {
          this.setState(
            { readingState: "error", errorMessage: event.event },
            () => {
              Vibration.vibrate(100);
            }
          );
        }
        break;
      case "ON_PIN_ERROR":
        await this.handleWrongPin(event.attemptsLeft);
        break;
      default:
        break;
    }
  };

  private handleCieError = (error: Error) => {
    this.setState({ readingState: "error", errorMessage: error.message });
  };

  private handleCieSuccess = (consentUri: string) => {
    this.setState({ readingState: "completed" }, async () => {
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
        this.setState({ readingState: "waiting_card" });
      })
      .catch(() => {
        this.setState({ readingState: "error" });
      });
  }

  public render(): React.ReactNode {
    // Setting for 'radar' animation
    const ringSettings = {
      dimension: imgDimension,
      // Three different animation start delays (one is 0), one for each ring
      delayX1: 700 as Millisecond,
      delayX2: 1400 as Millisecond,
      duration: 2100 as Millisecond
    };

    return (
      <BaseScreenComponent goBack={true}>
        <Content noPadded={true} bounces={false}>
          <ScreenHeader
            heading={
              <H2 style={styles.titleHeader}>
                {this.state.readingState === "error"
                  ? I18n.t("authentication.cie.readerCardLostTitle")
                  : this.state.readingState === "reading"
                    ? I18n.t("authentication.cie.readerCardTitle")
                    : I18n.t("cie.title")}
              </H2>
            }
          />
          <Text style={styles.messageHeader}>
            {this.state.readingState === "error"
              ? I18n.t("authentication.cie.readerCardLostHeader")
              : this.state.readingState === "reading"
                ? I18n.t("authentication.cie.readerCardHeader")
                : I18n.t("cie.layCardMessageHeader")}
          </Text>
          <View style={styles.imgContainer}>
            <View style={styles.rings}>
              {this.state.readingState === "waiting_card" && (
                <AnimatedRing
                  dimension={ringSettings.dimension}
                  startAnimationAfter={0 as Millisecond}
                  duration={ringSettings.duration}
                  boxDimension={boxDimension}
                />
              )}
              {this.state.readingState === "waiting_card" && (
                <AnimatedRing
                  dimension={ringSettings.dimension}
                  startAnimationAfter={ringSettings.delayX1}
                  duration={ringSettings.duration}
                  boxDimension={boxDimension}
                />
              )}
              {this.state.readingState === "waiting_card" && (
                <AnimatedRing
                  dimension={ringSettings.dimension}
                  startAnimationAfter={ringSettings.delayX2}
                  duration={ringSettings.duration}
                  boxDimension={boxDimension}
                />
              )}
            </View>
            <ProgressCircle
              percent={this.state.progressBarValue}
              radius={imgDimension / 2}
              borderWidth={3}
              color={
                this.state.readingState === "error"
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
          <Text style={styles.messageFooter} selectable={true}>
            {this.state.readingState === "error"
              ? this.state.errorMessage
              : this.state.readingState === "reading"
                ? I18n.t("authentication.cie.readerCardFooter")
                : I18n.t("cie.layCardMessageFooter")}
          </Text>
        </Content>
        <View footer={true}>
          <Button
            onPress={this.props.navigation.goBack}
            cancel={true}
            block={true}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
        </View>
      </BaseScreenComponent>
    );
  }
}

export default CieCardReaderScreen;

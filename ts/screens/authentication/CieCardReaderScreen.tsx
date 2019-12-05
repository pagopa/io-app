import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Animated, Easing, Image, StyleSheet } from "react-native";
import ProgressCircle from "react-native-progress-circle";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import AnimatedRing from "../../components/animations/AnimatedRing";
import ScreenHeader from "../../components/ScreenHeader";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

interface OwnProps {
  navigation: NavigationScreenProp<NavigationState>;
}

type Props = OwnProps;
// Image dimension
const imgDimension = 180;
const boxDimension = 245;
const progressThreshold = 60;

const styles = StyleSheet.create({
  messageHeader: {
    minHeight: 90,
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
    marginTop: 35
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
      readingState: "waiting_card"
    };
    this.progressAnimatedValue = new Animated.Value(0);
    this.progressAnimatedValue.addListener(anim => {
      this.setState({ progressBarValue: anim.value });
    });
    // Two animation: the first fill the progress with the primary
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
    // TODO: remove this!!
    // Simulates error
    // tslint:disable-next-line: no-commented-code
    /* const reading_states: ReadingState[] = [
      "reading",
      "error",
      "completed",
      "waiting_card"
    ];
    let index = 0;
    setInterval(() => {
      this.setState({ readingState: reading_states[index] }, () => {
        console.warn(reading_states[index]);
        index++;
        if (index >= reading_states.length) {
          index = 0;
        }
      });
    }, 5000); */
  }

  public componentDidUpdate(_: Props, prevState: State) {
    // If we start reading the card, start the animation
    if (
      prevState.readingState !== "reading" &&
      this.state.readingState === "reading"
    ) {
      this.setState({ progressBarValue: 0 });
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
                {this.state.readingState === "waiting_card"
                  ? I18n.t("authentication.cie.readerCardLostTitle")
                  : I18n.t("authentication.cie.readerCardTitle")}
              </H2>
            }
          />
          <Text style={styles.messageHeader}>
            {this.state.readingState === "waiting_card"
              ? I18n.t("authentication.cie.readerCardLostHeader")
              : I18n.t("authentication.cie.readerCardHeader")}
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
                source={require("../../../img/landing/place-card-illustration.png")}
                style={styles.img}
              />
            </ProgressCircle>
          </View>
          <Text style={styles.messageFooter}>
            {this.state.readingState === "waiting_card"
              ? ""
              : I18n.t("authentication.cie.readerCardFooter")}
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

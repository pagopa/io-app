import { Millisecond } from "italia-ts-commons/lib/units";
import { View } from "native-base";
import * as React from "react";
import { Animated, Easing, Image, StyleSheet } from "react-native";
import ProgressCircle from "react-native-progress-circle";
import { ReadingState } from "../../screens/authentication/cie/CieCardReaderScreen";
import customVariables from "../../theme/variables";
import AnimatedRing from "../animations/AnimatedRing";
import IconFont from "../ui/IconFont";

type Props = Readonly<{
  readingState: ReadingState;
}>;

type State = Readonly<{
  progressBarValue: number;
}>;

// Image dimension
const imgDimension = 180;
const boxDimension = 245;
const progressThreshold = 60;

// Setting for 'radar' animation
const ringSettings = {
  dimension: imgDimension,
  // Three different animation start delays (one is 0), one for each ring
  delayX1: 700 as Millisecond,
  delayX2: 1400 as Millisecond,
  duration: 2100 as Millisecond
};

const styles = StyleSheet.create({
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
  },
  successIcon: {
    position: "absolute",
    alignSelf: "flex-start"
  },
  flexStart: {
    justifyContent: "flex-start"
  }
});

export default class CieReadingCardAnimation extends React.PureComponent<
  Props,
  State
> {
  private progressAnimation?: Animated.CompositeAnimation;
  private progressAnimatedValue: Animated.Value;

  constructor(props: Props) {
    super(props);
    this.state = {
      progressBarValue: 0
    };
    // tslint:disable-next-line: no-object-mutation
    this.progressAnimatedValue = new Animated.Value(0);
    this.createAnimation();
  }

  private createAnimation() {
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
    // tslint:disable-next-line: no-object-mutation
    this.progressAnimation = Animated.sequence([firstAnim, secondAnim]);
    this.addAnimationListener();
  }

  private startAnimation = () => {
    if (
      this.progressAnimation === undefined ||
      this.progressAnimatedValue === undefined
    ) {
      return;
    }
    this.progressAnimation.stop();
    this.setState({ progressBarValue: 0 });
    this.progressAnimatedValue.setValue(0);
    this.progressAnimation.start(({ finished }) => {
      if (finished) {
        // loop
        this.createAnimation();
        this.startAnimation();
      }
    });
  };

  private addAnimationListener = () => {
    if (this.progressAnimatedValue === undefined) {
      return;
    }
    this.progressAnimatedValue.addListener(anim => {
      this.setState({ progressBarValue: anim.value });
    });
  };

  private stopAnimation = () => {
    if (
      this.progressAnimation === undefined ||
      this.progressAnimatedValue === undefined
    ) {
      return;
    }
    this.progressAnimation.stop();
    this.progressAnimatedValue.removeAllListeners();
  };

  public componentDidUpdate(prevProps: Props) {
    // If we start reading the card, start the animation
    if (
      prevProps.readingState !== ReadingState.reading &&
      this.props.readingState === ReadingState.reading
    ) {
      this.startAnimation();
    }
    // If we are not reading the card, stop the animation
    if (
      this.progressAnimation !== undefined &&
      prevProps.readingState === ReadingState.reading &&
      this.props.readingState !== ReadingState.reading
    ) {
      this.progressAnimation.stop();
    }
  }

  public componentWillUnmount() {
    this.stopAnimation();
  }

  public render() {
    return (
      <View style={styles.imgContainer}>
        {this.props.readingState === ReadingState.waiting_card && (
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

        <View style={styles.flexStart}>
          <ProgressCircle
            percent={
              this.props.readingState === ReadingState.completed
                ? 0
                : this.state.progressBarValue
            }
            radius={imgDimension / 2}
            borderWidth={3}
            color={
              this.props.readingState === ReadingState.error
                ? customVariables.brandDanger
                : customVariables.brandPrimary
            }
            shadowColor={customVariables.brandLightGray}
            bgColor={customVariables.brandLightGray}
          >
            <Image
              source={require("../../../img/cie/place-card-illustration.png")}
              style={styles.img}
            />
          </ProgressCircle>
          {this.props.readingState === ReadingState.completed && (
            <IconFont
              name={"io-success"}
              color={customVariables.textLinkColor}
              size={50}
              style={styles.successIcon}
            />
          )}
        </View>
      </View>
    );
  }
}

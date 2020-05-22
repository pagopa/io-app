import { View } from "native-base";
import * as React from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import ProgressCircle from "react-native-progress-circle";
import { ReadingState } from "../../screens/authentication/cie/CieCardReaderScreen";
import customVariables from "../../theme/variables";
import StyledIconFont from "../ui/IconFont";

type Props = Readonly<{
  readingState: ReadingState;
}>;

type State = Readonly<{
  progressBarValue: number;
  slidingCardAnimationValue: number;
}>;

// Image dimension
const imgDimension = 180;
const boxDimension = 245;
const progressThreshold = 60;

// Slided animated icons params
const CARD_ICON_SIZE = 70;
const PHONE_ICON_SIZE = 120;
const slidingAmplitude = 25;

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
  flexStart: {
    justifyContent: "flex-start"
  },
  cardIcon: {
    position: "absolute",
    paddingBottom: 20
  },
  phoneIcon: {
    position: "absolute",
    backgroundColor: "white",
    alignSelf: "flex-end"
  },
  slidingContentContainer: {
    height: imgDimension,
    width: imgDimension - customVariables.contentPadding,
    justifyContent: "center"
  }
});

const AnimatedStyledIconFont: typeof StyledIconFont = Animated.createAnimatedComponent(
  StyledIconFont
);

/**
 * A component to render the animation displayed during the reading of the CIE card.
 * there are 2 animations:
 * - a card and a phone icons sliding to suggest the user to place the card on the bottom part of the phone
 * - a circle representing the progress of the reading
 */
export default class CieReadingCardAnimation extends React.PureComponent<
  Props,
  State
> {
  private progressAnimation?: Animated.CompositeAnimation;
  private slidingCardAnimation?: Animated.CompositeAnimation;

  private progressAnimatedValue: Animated.Value;
  private slidingCardAnimatedValue: Animated.Value;

  constructor(props: Props) {
    super(props);
    this.state = {
      progressBarValue: 0,
      slidingCardAnimationValue: slidingAmplitude
    };
    // tslint:disable-next-line: no-object-mutation
    this.progressAnimatedValue = new Animated.Value(0);
    this.createProrgessiveAnimation();

    // tslint:disable-next-line: no-object-mutation
    this.slidingCardAnimatedValue = new Animated.Value(slidingAmplitude);
    this.createSlidingCardAnimation();
  }

  /**
   * Progressive Animation
   */

  private createProrgessiveAnimation() {
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
    this.addProgressiveAnimationListener();
  }

  private startProgressiveAnimation = () => {
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
        this.progressAnimatedValue.removeAllListeners();
        this.createProrgessiveAnimation();
        this.startProgressiveAnimation();
      }
    });
  };

  private addProgressiveAnimationListener = () => {
    if (this.progressAnimatedValue === undefined) {
      return;
    }
    this.progressAnimatedValue.addListener(anim => {
      this.setState({ progressBarValue: anim.value });
    });
  };

  private stopProgressiveAnimation = () => {
    if (
      this.progressAnimation === undefined ||
      this.progressAnimatedValue === undefined
    ) {
      return;
    }
    this.progressAnimation.stop();
    this.progressAnimatedValue.removeAllListeners();
  };

  /**
   * Sliding Card Animation
   */

  private createSlidingCardAnimation() {
    const firstAnim = Animated.timing(this.slidingCardAnimatedValue, {
      toValue: 0,
      easing: Easing.sin,
      duration: 1000,
      useNativeDriver: true
    });

    const secondAnim = Animated.timing(this.slidingCardAnimatedValue, {
      toValue: slidingAmplitude,
      easing: Easing.ease,
      duration: 1000,
      useNativeDriver: true
    });

    const thirdAnim = Animated.timing(this.slidingCardAnimatedValue, {
      toValue: slidingAmplitude,
      duration: 1000,
      useNativeDriver: true
    });

    // tslint:disable-next-line: no-object-mutation
    this.slidingCardAnimation = Animated.sequence([
      firstAnim,
      secondAnim,
      thirdAnim
    ]);
    this.addSlidingCardAnimationListener();
  }

  private startSlidingCardAnimation = () => {
    if (
      this.slidingCardAnimation === undefined ||
      this.slidingCardAnimatedValue === undefined
    ) {
      return;
    }
    this.slidingCardAnimation.stop();
    this.slidingCardAnimation.start(({ finished }) => {
      if (finished) {
        // loop
        this.slidingCardAnimatedValue.removeAllListeners();
        this.createSlidingCardAnimation();
        this.startSlidingCardAnimation();
      }
    });
  };

  private addSlidingCardAnimationListener = () => {
    if (this.slidingCardAnimatedValue === undefined) {
      return;
    }
    this.slidingCardAnimatedValue.addListener(anim => {
      this.setState({ slidingCardAnimationValue: anim.value });
    });
  };

  private stopSlidingCardAnimation = () => {
    if (
      this.slidingCardAnimation === undefined ||
      this.slidingCardAnimatedValue === undefined
    ) {
      return;
    }
    this.slidingCardAnimation.stop();
    this.slidingCardAnimatedValue.removeAllListeners();
  };

  public componentDidMount() {
    this.startSlidingCardAnimation();
  }

  public componentDidUpdate(prevProps: Props) {
    // If we start reading the card, start the animation
    if (
      prevProps.readingState !== ReadingState.reading &&
      this.props.readingState === ReadingState.reading
    ) {
      this.stopSlidingCardAnimation();
      this.setState({ slidingCardAnimationValue: slidingAmplitude }); // TODO it could be a small animation from slidingCardAnimationValue current value to slidingAmplitude
      this.startProgressiveAnimation();
    }
    // If we are not reading the card, stop the animation
    if (
      this.progressAnimation !== undefined &&
      this.slidingCardAnimation &&
      prevProps.readingState === ReadingState.reading &&
      this.props.readingState !== ReadingState.reading
    ) {
      this.progressAnimation.stop();
      this.startSlidingCardAnimation();
    }
  }

  public componentWillUnmount() {
    this.stopProgressiveAnimation();
    this.stopSlidingCardAnimation();
  }

  public render() {
    const { readingState } = this.props;
    return (
      <View style={styles.imgContainer}>
        <View style={styles.flexStart}>
          <ProgressCircle
            percent={
              readingState === ReadingState.completed
                ? 0
                : this.state.progressBarValue
            }
            radius={imgDimension / 2}
            borderWidth={3}
            color={
              readingState === ReadingState.error
                ? customVariables.brandDanger
                : customVariables.brandPrimary
            }
            shadowColor={customVariables.brandLightGray}
            bgColor={customVariables.colorWhite}
          >
            <View style={styles.slidingContentContainer}>
              <AnimatedStyledIconFont
                name={"io-cie-card"}
                color={customVariables.brandHighlight}
                size={CARD_ICON_SIZE}
                style={[
                  {
                    paddingLeft: this.state.slidingCardAnimationValue
                  },
                  styles.cardIcon
                ]}
              />
              <AnimatedStyledIconFont
                name={"io-cie-phone"}
                color={customVariables.brandHighlight}
                size={PHONE_ICON_SIZE}
                style={[
                  {
                    paddingRight: this.state.slidingCardAnimationValue
                  },
                  styles.phoneIcon
                ]}
              />
            </View>
          </ProgressCircle>
        </View>
      </View>
    );
  }
}

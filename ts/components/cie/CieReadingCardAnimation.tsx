/**
 * TODO: refactor to a functional component.
 * https://pagopa.atlassian.net/browse/IOPID-1857
 */
import {
  IOColors,
  IOPictograms,
  Pictogram
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import ProgressCircle from "react-native-progress-circle";

export enum ReadingState {
  "reading" = "reading",
  "error" = "error",
  "completed" = "completed",
  "waiting_card" = "waiting_card"
}

type Props = Readonly<{
  readingState: ReadingState;
  pictogramName: IOPictograms;
  circleColor: string;
}>;

type State = Readonly<{
  progressBarValue: number;
}>;

// Image dimension
const imgDimension = 188;
const progressThreshold = 60;
const circleBorderWidth = 3;

const styles = StyleSheet.create({
  imgContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: imgDimension
  },
  img: {
    overflow: "hidden",
    backgroundColor: IOColors.white,
    height: imgDimension,
    width: imgDimension,
    borderRadius: imgDimension / 2,
    justifyContent: "center",
    alignItems: "center"
  },
  imgWrapper: {
    height: imgDimension + 30,
    width: imgDimension + 30,
    paddingStart: 15,
    paddingTop: 25
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

    this.progressAnimatedValue = new Animated.Value(0);
    this.createAnimation();
  }

  private createAnimation() {
    // Two animation: the first fills the progress with the primary
    // color up to progressThreshold, the second up to 100
    // from 0 to 60 in 8 secs
    const firstAnim = Animated.timing(this.progressAnimatedValue, {
      useNativeDriver: false,
      toValue: progressThreshold,
      easing: Easing.linear,
      duration: 8000
    });
    // from 60 to 100 in 10 secs
    const secondAnim = Animated.timing(this.progressAnimatedValue, {
      useNativeDriver: false,
      toValue: 100,
      easing: Easing.linear,
      duration: 10000
    });
    // eslint-disable-next-line
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
      <View style={styles.imgContainer} accessible={false}>
        <View style={styles.flexStart}>
          <ProgressCircle
            percent={
              this.props.readingState === ReadingState.completed
                ? 100
                : this.state.progressBarValue
            }
            radius={imgDimension / 2}
            borderWidth={circleBorderWidth}
            color={
              this.props.readingState === ReadingState.error
                ? IOColors.greyLight
                : this.props.circleColor
            }
            shadowColor={IOColors.greyLight}
            bgColor={IOColors.greyLight}
          >
            <View style={styles.img}>
              <View style={styles.imgWrapper}>
                <Pictogram size={"100%"} name={this.props.pictogramName} />
              </View>
            </View>
          </ProgressCircle>
        </View>
      </View>
    );
  }
}

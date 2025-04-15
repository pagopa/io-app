/**
 * TODO: refactor to a functional component.
 * https://pagopa.atlassian.net/browse/IOPID-1857
 */
import {
  IOColors,
  IOPictogramSizeScale,
  IOPictograms,
  Pictogram
} from "@pagopa/io-app-design-system";
import { PureComponent } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { CircularProgress } from "../../../../../components/ui/CircularProgress";
import { isDevEnv } from "../../../../../utils/environment";

export enum ReadingState {
  "reading" = "reading",
  "error" = "error",
  "completed" = "completed",
  "waiting_card" = "waiting_card"
}

type CieCardReadingAnimationProps = Readonly<{
  readingState: ReadingState;
  pictogramName: IOPictograms;
  circleColor: string;
}>;

type State = Readonly<{
  progressBarValue: number;
}>;

// Image dimension
const imgSize: IOPictogramSizeScale = 180;
const progressThreshold = 60;
const circleBorderWidth = 3;

const styles = StyleSheet.create({
  imgTranslated: {
    height: imgSize + 30,
    width: imgSize + 30,
    paddingStart: 15,
    paddingTop: 25
  }
});

export default class CieCardReadingAnimation extends PureComponent<
  CieCardReadingAnimationProps,
  State
> {
  private progressAnimation?: Animated.CompositeAnimation;
  private progressAnimatedValue: Animated.Value;

  constructor(props: CieCardReadingAnimationProps) {
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
    // eslint-disable-next-line functional/immutable-data
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

  public componentDidUpdate(
    prevCieCardReadingAnimationProps: CieCardReadingAnimationProps
  ) {
    // If we start reading the card, start the animation
    if (
      prevCieCardReadingAnimationProps.readingState !== ReadingState.reading &&
      this.props.readingState === ReadingState.reading
    ) {
      this.startAnimation();
    }
    // If we are not reading the card, stop the animation
    if (
      this.progressAnimation !== undefined &&
      prevCieCardReadingAnimationProps.readingState === ReadingState.reading &&
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
      <View style={{ alignSelf: "center" }} accessible={false}>
        <CircularProgress
          size={imgSize}
          radius={imgSize / 2}
          progress={
            this.props.readingState === ReadingState.completed
              ? 100
              : this.state.progressBarValue
          }
          strokeWidth={circleBorderWidth}
          strokeColor={
            this.props.readingState === ReadingState.error
              ? IOColors["grey-100"]
              : this.props.circleColor
          }
          strokeBgColor={IOColors["grey-100"]}
        >
          {/* Use a `View` to translate the Pictogram to simulate the
          `Bleed` variant effect */}
          <View style={styles.imgTranslated}>
            <Pictogram size={"100%"} name={this.props.pictogramName} />
          </View>
        </CircularProgress>
      </View>
    );
  }
}

export const testableCieCardReadingAnimation = isDevEnv
  ? {
      types: {
        CieCardReadingAnimationProps: {} as CieCardReadingAnimationProps
      }
    }
  : undefined;

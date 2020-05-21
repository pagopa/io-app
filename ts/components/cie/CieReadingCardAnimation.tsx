import { Millisecond } from "italia-ts-commons/lib/units";
import { View } from "native-base";
import * as React from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import ProgressCircle from "react-native-progress-circle";
import { ReadingState } from "../../screens/authentication/cie/CieCardReaderScreen";
import customVariables from "../../theme/variables";
import AnimatedRing from "../animations/AnimatedRing";
import StyledIconFont from '../ui/IconFont';

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

const slidingAmplitude = 25;

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
  flexStart: {
    justifyContent: "flex-start",
  },
  cardIcon: {
    position:'absolute',
    paddingBottom: 20, 
  },
  phoneIcon: {
    position: 'absolute', 
    backgroundColor: 'white',
    alignSelf: 'flex-end'
  },
  slidingContentContainer:{
    height: imgDimension, 
    width: imgDimension - customVariables.contentPadding, 
    justifyContent: 'center'
  }
});

const AnimatedStyledIconFont: typeof StyledIconFont = Animated.createAnimatedComponent(StyledIconFont);

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
    this.slidingCardAnimatedValue = new Animated.Value(0);
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
      this.slidingCardAnimation === undefined ||
      this.slidingCardAnimatedValue === undefined
    ) {
      return;
    }
    this.slidingCardAnimation.stop();
    this.slidingCardAnimatedValue.removeAllListeners();
  };

  /**
   * Sliding Card Animation
   */

  private createSlidingCardAnimation() {
    // decrease from slidingAmplitude to 0
    const firstAnim = Animated.timing(this.slidingCardAnimatedValue, {
      toValue: 0,
      easing: Easing.ease,
      duration: 1500
    });

    // increase value from 0 to slidingAmplitude
    const secondAnim = Animated.timing(this.slidingCardAnimatedValue, {
      toValue: slidingAmplitude,
      easing: Easing.ease,
      duration: 1000
    });

    //wait
    const thirdhAnim = Animated.timing(this.slidingCardAnimatedValue, {
      toValue: slidingAmplitude,
      easing: Easing.linear,
      duration: 1500
    });

    // tslint:disable-next-line: no-object-mutation
    this.slidingCardAnimation = Animated.sequence([firstAnim,secondAnim, thirdhAnim]);
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

  public componentDidMount(){
    this.startSlidingCardAnimation();
  }

  public componentDidUpdate(prevProps: Props) {
    // If we start reading the card, start the animation
    if (
      prevProps.readingState !== ReadingState.reading &&
      this.props.readingState === ReadingState.reading
    ) {
      this.stopSlidingCardAnimation();
      this.setState({slidingCardAnimationValue: slidingAmplitude}) //TODO it could be a small animation from slidingCardAnimationValue current value to slidingAmplitude 
      this.startProgressiveAnimation();
    }
    // If we are not reading the card, stop the animation
    if (
      this.progressAnimation !== undefined && this.slidingCardAnimation &&
      prevProps.readingState === ReadingState.reading &&
      this.props.readingState !== ReadingState.reading
    ) {
      this.progressAnimation.stop();
      //this.slidingCardAnimation.start();
      this.startSlidingCardAnimation();
    }
  }

  public componentWillUnmount() {
    this.stopProgressiveAnimation();
    this.stopSlidingCardAnimation();
  }

  private AnimatedRings = (
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
  );

  public render() {
    const {readingState} = this.props;
    return (
      <View style={styles.imgContainer}>
        {readingState === ReadingState.waiting_card && (
         this.AnimatedRings
        )}

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
                name={'io-cie-card'} 
                color={customVariables.brandHighlight} 
                size={70} 
                style={[{
                  paddingLeft: this.state.slidingCardAnimationValue,
                  }, styles.cardIcon]}
              /> 
              <AnimatedStyledIconFont 
                name={'io-cie-phone'} 
                color={customVariables.brandHighlight} 
                size={120} 
                style={[{
                  paddingRight: this.state.slidingCardAnimationValue
                }, styles.phoneIcon]}
              />
            </View>
          </ProgressCircle>
        </View>
      </View>
    );
  }
}

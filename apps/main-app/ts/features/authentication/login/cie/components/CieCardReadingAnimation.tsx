import {
  IOColors,
  IOPictograms,
  IOPictogramSizeScale,
  Pictogram
} from "@io-app/design-system";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { CircularProgress } from "../../../../../components/ui/CircularProgress";
import { isDevEnv } from "../../../../../utils/environment";

export enum ReadingState {
  "completed" = "completed",
  "error" = "error",
  "reading" = "reading",
  "waiting_card" = "waiting_card"
}

type CieCardReadingAnimationProps = Readonly<{
  circleColor: string;
  pictogramName: IOPictograms;
  readingState: ReadingState;
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

const CieCardReadingAnimation = ({
  readingState,
  pictogramName,
  circleColor
}: CieCardReadingAnimationProps) => {
  const [progressBarValue, setProgressBarValue] = useState(0);
  const progressAnimatedValue = useRef(new Animated.Value(0));
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);
  // Holds the latest startAnimation to allow recursive loop calls without stale closures
  const startAnimationRef = useRef<() => void>(() => undefined);

  const createAnimation = useCallback(() => {
    // Two animations: the first fills the progress up to progressThreshold,
    // the second fills it up to 100
    const firstAnim = Animated.timing(progressAnimatedValue.current, {
      useNativeDriver: false,
      toValue: progressThreshold,
      easing: Easing.linear,
      duration: 8000
    });
    const secondAnim = Animated.timing(progressAnimatedValue.current, {
      useNativeDriver: false,
      toValue: 100,
      easing: Easing.linear,
      duration: 10000
    });
    // eslint-disable-next-line functional/immutable-data
    progressAnimation.current = Animated.sequence([firstAnim, secondAnim]);
    progressAnimatedValue.current.addListener(({ value }) => {
      setProgressBarValue(value);
    });
  }, []);

  const startAnimation = useCallback(() => {
    if (!progressAnimation.current) {
      return;
    }
    progressAnimation.current.stop();
    setProgressBarValue(0);
    progressAnimatedValue.current.setValue(0);
    progressAnimation.current.start(({ finished }) => {
      if (finished) {
        // Loop: recreate and restart animation
        createAnimation();
        startAnimationRef.current();
      }
    });
  }, [createAnimation]);

  // Keep ref in sync with the latest startAnimation to support recursive loop calls
  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    startAnimationRef.current = startAnimation;
  }, [startAnimation]);

  // Initialize animation on mount and clean up on unmount
  useEffect(() => {
    createAnimation();
    // Copy ref value to a local variable for use in the cleanup function,
    // as the ref may have changed by the time cleanup runs.
    const animatedValue = progressAnimatedValue.current;
    const animation = progressAnimation;
    return () => {
      animation.current?.stop();
      animatedValue.removeAllListeners();
    };
  }, [createAnimation]);

  // React to readingState transitions (replaces componentDidUpdate)
  const prevReadingStateRef = useRef(readingState);
  useEffect(() => {
    const prevState = prevReadingStateRef.current;
    // eslint-disable-next-line functional/immutable-data
    prevReadingStateRef.current = readingState;

    if (
      prevState !== ReadingState.reading &&
      readingState === ReadingState.reading
    ) {
      startAnimation();
    } else if (
      progressAnimation.current !== null &&
      prevState === ReadingState.reading &&
      readingState !== ReadingState.reading
    ) {
      progressAnimation.current.stop();
    }
  }, [readingState, startAnimation]);

  return (
    <View accessible={false} style={{ alignSelf: "center" }}>
      <CircularProgress
        progress={
          readingState === ReadingState.completed ? 100 : progressBarValue
        }
        radius={imgSize / 2}
        size={imgSize}
        strokeBgColor={IOColors["grey-100"]}
        strokeColor={
          readingState === ReadingState.error
            ? IOColors["grey-100"]
            : circleColor
        }
        strokeWidth={circleBorderWidth}
      >
        {/* Use a `View` to translate the Pictogram to simulate the
        `Bleed` variant effect */}
        <View style={styles.imgTranslated}>
          <Pictogram name={pictogramName} size={"100%"} />
        </View>
      </CircularProgress>
    </View>
  );
};

export default CieCardReadingAnimation;

export const testableCieCardReadingAnimation = isDevEnv
  ? {
      types: {
        CieCardReadingAnimationProps: {} as CieCardReadingAnimationProps
      }
    }
  : undefined;

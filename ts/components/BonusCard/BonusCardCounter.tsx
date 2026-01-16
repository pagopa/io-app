import {
  H3,
  IOColors,
  IOSkeleton,
  LabelMini,
  useIOThemeContext,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useEffect } from "react";
import { ColorValue, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

type CounterType = "Value" | "ValueWithProgress";

type BaseProps = {
  type: CounterType;
};

type AmountProps = {
  type: "Value";
  value: string;
};

type AmountWithProgressProps = {
  type: "ValueWithProgress";
  value: string;
  /**
   * Progress bar value, expressed in a range from 0 to 1
   */
  progress: number;
};

type LoadingProps =
  | { isLoading: true; label?: string; skeletonColor: ColorValue }
  | ({ isLoading?: false; label: string } & (
      | AmountProps
      | AmountWithProgressProps
    ));

export type BonusCardCounter = BaseProps & LoadingProps;

const BonusCardCounter = (props: BonusCardCounter) => {
  const isDark = useIOThemeContext().themeType === "dark";

  if (props.isLoading) {
    return (
      <BonusCardCounterSkeleton
        type={props.type}
        skeletonColor={props.skeletonColor}
      />
    );
  }

  return (
    <View
      style={[styles.container, { alignItems: "stretch" }]}
      testID="BonusCardCounterTestID"
    >
      <LabelMini
        weight="Regular"
        style={{ textAlign: "center" }}
        color={isDark ? "white" : "blueItalia-850"}
      >
        {props.label}
      </LabelMini>
      <VSpacer size={4} />
      <H3 color={isDark ? "blueIO-300" : "blueIO-500"} style={styles.value}>
        {props.value}
      </H3>
      {props.type === "ValueWithProgress" && (
        <>
          <VSpacer size={8} />
          <BonusProgressBar progress={props.progress} />
        </>
      )}
    </View>
  );
};

type BonusProgressBarProps = {
  progress: number;
};

const BonusProgressBar = ({ progress }: BonusProgressBarProps) => {
  const isDark = useIOThemeContext().themeType === "dark";

  const progressBarColor: ColorValue = isDark
    ? IOColors["blueIO-300"]
    : IOColors["blueIO-500"];

  const width = useSharedValue(100);
  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    width.value = progress * 100;
  });
  const scalingWidth = useAnimatedStyle(() => ({
    width: withTiming(width.value, { duration: 1000 })
  }));
  return (
    <View
      style={styles.progressBarContainer}
      testID="BonusCardCounterProgressTestID"
    >
      <Animated.View
        style={[
          {
            width: `${width.value}%`,
            backgroundColor: progressBarColor,
            flex: 1
          },
          scalingWidth
        ]}
      />
    </View>
  );
};

const BonusCardCounterSkeleton = ({
  type,
  skeletonColor
}: {
  type: CounterType;
  skeletonColor: ColorValue;
}) => (
    <View
      style={[styles.container, { alignItems: "center" }]}
      testID="BonusCardCounterSkeletonTestID"
    >
      <IOSkeleton
        color={skeletonColor}
        shape="rectangle"
        height={16}
        width={64}
        radius={16}
      />
      <VSpacer size={8} />
      <IOSkeleton
        color={skeletonColor}
        shape="rectangle"
        height={24}
        width={100}
        radius={24}
      />
      {type === "ValueWithProgress" && (
        <>
          <VSpacer size={8} />
          <IOSkeleton
            color={skeletonColor}
            shape="rectangle"
            height={6}
            width={110}
            radius={8}
          />
        </>
      )}
    </View>
  );

const styles = StyleSheet.create({
  container: {
    flexBasis: "40%"
  },
  value: {
    textAlign: "center"
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: IOColors.white,
    marginHorizontal: 16,
    borderRadius: 4,
    overflow: "hidden"
  }
});

export { BonusCardCounter };

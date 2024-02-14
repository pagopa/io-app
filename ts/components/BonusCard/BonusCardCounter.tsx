import { H3, IOColors, Label, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import Placeholder from "rn-placeholder";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

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
  | { isLoading: true; label?: string }
  | ({ isLoading?: false; label: string } & (
      | AmountProps
      | AmountWithProgressProps
    ));

export type BonusCardCounter = BaseProps & LoadingProps;

const BonusCardCounter = (props: BonusCardCounter) => {
  if (props.isLoading) {
    return <BonusCardCounterSkeleton type={props.type} />;
  }

  return (
    <View
      style={[styles.container, { alignItems: "stretch" }]}
      testID="BonusCardCounterTestID"
    >
      <Label weight="Regular" fontSize="mini" style={styles.label}>
        {props.label}
      </Label>
      <VSpacer size={4} />
      <H3 color="blueItalia-500" style={styles.value}>
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
  const isDesignSystemEnabled = useSelector(isDesignSystemEnabledSelector);

  const progressBarColor = isDesignSystemEnabled
    ? IOColors["blueItalia-500"]
    : IOColors.blue;

  const width = useSharedValue(100);
  React.useEffect(() => {
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

type BonusCardCounterSkeletonProps = {
  type: CounterType;
};

const BonusCardCounterSkeleton = ({ type }: BonusCardCounterSkeletonProps) => {
  const isDesignSystemEnabled = useSelector(isDesignSystemEnabledSelector);

  const placeholderColor = isDesignSystemEnabled
    ? IOColors["blueItalia-100"]
    : IOColors["blueIO-100"];

  return (
    <View
      style={[styles.container, { alignItems: "center" }]}
      testID="BonusCardCounterSkeletonTestID"
    >
      <Placeholder.Box
        height={16}
        width={64}
        color={placeholderColor}
        animate="fade"
        radius={16}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        height={24}
        width={100}
        color={placeholderColor}
        animate="fade"
        radius={24}
      />
      {type === "ValueWithProgress" && (
        <>
          <VSpacer size={8} />
          <Placeholder.Box
            height={6}
            width={110}
            color={placeholderColor}
            animate="fade"
            radius={8}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexBasis: "40%"
  },
  label: {
    textAlign: "center"
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

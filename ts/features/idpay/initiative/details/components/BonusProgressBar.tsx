import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { IOColors } from "../../../../../components/core/variables/IOColors";

type Props = {
  percentage: number;
  isDisabled?: boolean;
};

const BonusProgressBar = ({ percentage, isDisabled = false }: Props) => {
  const width = useSharedValue(100);
  React.useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    width.value = percentage;
  });
  const scalingWidth = useAnimatedStyle(() => ({
    width: withTiming(width.value, { duration: 1000 })
  }));
  return (
    <View style={styles.remainingPercentageSliderContainer}>
      <Animated.View
        style={[
          {
            width: `${width.value}%`,
            backgroundColor: !isDisabled ? IOColors.blue : IOColors["grey-450"],
            flex: 1,
            borderRadius: 4
          },
          scalingWidth
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  remainingPercentageSliderContainer: {
    height: 4,
    backgroundColor: IOColors.white,
    width: 100,
    borderRadius: 4
  }
});

export { BonusProgressBar };

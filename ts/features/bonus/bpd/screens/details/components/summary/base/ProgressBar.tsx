import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IOColors } from "../../../../../../../../components/core/variables/IOColors";

type Props = {
  // between 0 and 1
  progressPercentage: number;
};

const styles = StyleSheet.create({
  progressBar: {
    backgroundColor: IOColors.greyLight,
    height: 4
  },
  fillBar: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: IOColors.blue
  }
});

/**
 * In order to fill the first amount of the bar, if there are 0 transactions,
 * the percentage is set to 1
 * @param progressPercentage
 */
const calculateStylePercentage = (progressPercentage: number) => {
  // clamp between 0 and 100 to avoid over/under flow
  const percentageValue = Math.max(Math.min(progressPercentage * 100, 100), 0);
  return `${percentageValue === 0 ? 1 : percentageValue}%`;
};

/**
 * Render a progress bar
 * @param props
 * @constructor
 */
export const ProgressBar: React.FunctionComponent<Props> = props => (
  <View style={styles.progressBar}>
    <View
      testID={"progressBar"}
      style={[
        styles.fillBar,
        { width: calculateStylePercentage(props.progressPercentage) }
      ]}
    />
  </View>
);

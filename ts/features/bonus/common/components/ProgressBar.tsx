import { IOColors, useIOThemeContext } from "@pagopa/io-app-design-system";
import { FunctionComponent } from "react";

import { View, StyleSheet, DimensionValue } from "react-native";

type Props = {
  // between 0 and 1
  progressPercentage: number;
};

/**
 * In order to fill the first amount of the bar, if there are 0 transactions,
 * the percentage is set to 1
 * @param progressPercentage
 */
const calculateStylePercentage = (
  progressPercentage: number
): DimensionValue => {
  // clamp between 0 and 100 to avoid over/under flow
  const percentageValue = Math.max(Math.min(progressPercentage * 100, 100), 0);
  return `${percentageValue === 0 ? 1 : percentageValue}%`;
};

/**
 * Render a progress bar
 * @param props
 * @constructor
 */
export const ProgressBar: FunctionComponent<Props> = props => {
  const isDark = useIOThemeContext().themeType === "dark";
  const backgroundColor = isDark
    ? IOColors["blueIO-300"]
    : IOColors["blueIO-500"];

  return (
    <View style={{ backgroundColor: IOColors["grey-100"], height: 4 }}>
      <View
        testID={"progressBar"}
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor,
          width: calculateStylePercentage(props.progressPercentage)
        }}
      />
    </View>
  );
};

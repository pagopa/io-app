import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

const DOT_SIZE = 8;
const ACTIVE_WIDTH = 16;
const ACTIVE_HEIGHT = 4;
const INNER_GAP = 8;

type Props = {
  stepIndex: number;
  totalSteps: number;
};

export const TourStepIndicator = ({ stepIndex, totalSteps }: Props) => {
  const theme = useIOTheme();
  const activeColor = IOColors[theme["interactiveElem-default"]];
  const defaultColor = IOColors[theme["icon-default"]];

  return (
    <View
      accessible
      accessibilityLabel={I18n.t("features.tour.stepIndicator", {
        current: stepIndex + 1,
        total: totalSteps
      })}
      style={styles.container}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === stepIndex
              ? {
                  width: ACTIVE_WIDTH,
                  height: ACTIVE_HEIGHT,
                  backgroundColor: activeColor
                }
              : {
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderWidth: 1,
                  borderColor: defaultColor
                }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: INNER_GAP
  },
  dot: {
    borderRadius: 20,
    borderCurve: "continuous"
  }
});

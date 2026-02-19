import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

const DOT_SIZE = 8;
const ACTIVE_WIDTH = 16;
const ACTIVE_HEIGHT = 4;
const INNER_GAP = 8;
const TRANSITION_DURATION = "200ms";
const TRANSPARENT = "transparent";

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
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === stepIndex;
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: isActive ? ACTIVE_WIDTH : DOT_SIZE,
                height: isActive ? ACTIVE_HEIGHT : DOT_SIZE,
                backgroundColor: isActive ? activeColor : TRANSPARENT,
                borderWidth: isActive ? 0 : 1,
                borderColor: isActive ? TRANSPARENT : defaultColor,
                transitionProperty: ["width", "height", "backgroundColor"],
                transitionDuration: TRANSITION_DURATION
              }
            ]}
          />
        );
      })}
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

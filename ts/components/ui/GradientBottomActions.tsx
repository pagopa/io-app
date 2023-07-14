import * as React from "react";
import { View, StyleSheet, Alert, ViewStyle, StyleProp } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated from "react-native-reanimated";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
import { IOVisualCostants } from "../core/variables/IOStyles";
import ButtonSolid from "./ButtonSolid";

export type GradientBottomActions = WithTestID<{
  transitionAnimStyle: Animated.AnimateStyle<StyleProp<ViewStyle>>;
  bottomMargin: number;
  gradientAreaHeight: number;
  // Accepted components: ButtonSolid, ButtonLink
  // Don't use any components other than this, please.
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}>;

// Background color should be app main background (both light and dark themes)
const HEADER_BG_COLOR: IOColors = "white";

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flex: 1,
    justifyContent: "flex-end"
  }
});

export const GradientBottomActions = ({
  primaryAction,
  secondaryAction,
  bottomMargin,
  gradientAreaHeight,
  transitionAnimStyle,
  testID
}: GradientBottomActions) => (
  <View
    style={{
      width: "100%",
      position: "absolute",
      bottom: 0,
      height: gradientAreaHeight,
      paddingBottom: bottomMargin
    }}
    testID={testID}
    pointerEvents="box-none"
  >
    <Animated.View
      style={[
        {
          ...StyleSheet.absoluteFillObject,
          borderTopColor: IOColors["error-500"],
          backgroundColor: hexToRgba(IOColors["error-500"], 0.5),
          borderTopWidth: 1
        },
        transitionAnimStyle
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        style={{ height: gradientAreaHeight }}
        // 100% opacity bg color fills at least 50% of the area
        locations={[0, 0.5]}
        colors={[
          hexToRgba(IOColors[HEADER_BG_COLOR], 0),
          IOColors[HEADER_BG_COLOR]
        ]}
      />
    </Animated.View>
    <View style={styles.buttonContainer} pointerEvents="box-none">
      {primaryAction}
      {/* <View style={[IOStyles.row, { flexShrink: 0 }]}>
          {firstAction}
          {secondAction && (
            <>
              <HSpacer size={16} />
              {secondAction}
            </>
          )}
        </View> */}
    </View>
  </View>
);

export default GradientBottomActions;

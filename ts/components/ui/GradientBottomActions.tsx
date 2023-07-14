import * as React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated from "react-native-reanimated";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
import { IOVisualCostants } from "../core/variables/IOStyles";
import { IOSpacer } from "../core/variables/IOSpacing";
import { VSpacer } from "../core/spacer/Spacer";

export type GradientBottomActions = WithTestID<{
  transitionAnimStyle: Animated.AnimateStyle<StyleProp<ViewStyle>>;
  dimensions: GradientBottomActionsDimensions;
  // Accepted components: ButtonSolid, ButtonLink
  // Don't use any components other than this, please.
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}>;

type GradientBottomActionsDimensions = {
  bottomMargin: number;
  extraBottomMargin: number;
  gradientAreaHeight: number;
  spaceBetweenActions: IOSpacer;
};

// Background color should be app main background (both light and dark themes)
const HEADER_BG_COLOR: IOColors = "white";

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flex: 1,
    flexShrink: 0,
    justifyContent: "flex-end"
  }
});

export const GradientBottomActions = ({
  primaryAction,
  secondaryAction,
  dimensions,
  transitionAnimStyle,
  testID
}: GradientBottomActions) => (
  <View
    style={{
      width: "100%",
      position: "absolute",
      bottom: 0,
      height: dimensions.gradientAreaHeight,
      paddingBottom: dimensions.bottomMargin
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
        style={{ height: dimensions.gradientAreaHeight }}
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

      {secondaryAction && (
        <View
          style={{
            alignSelf: "center",
            marginBottom: dimensions.extraBottomMargin
          }}
        >
          <VSpacer size={dimensions.spaceBetweenActions} />
          {secondaryAction}
        </View>
      )}
    </View>
  </View>
);

export default GradientBottomActions;

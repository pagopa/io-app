import React from "react";
import { Easing, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { easeGradient } from "react-native-easing-gradient";
import LinearGradient from "react-native-linear-gradient";
import Animated from "react-native-reanimated";
import {
  IOColors,
  IOVisualCostants,
  WithTestID,
  hexToRgba
} from "@pagopa/io-app-design-system";
import { ServiceStandardActions } from "./ServiceStandardActions";
import { ServiceSpecialAction } from "./ServiceSpecialAction";

const HEADER_BG_COLOR: IOColors = "white";

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flex: 1,
    flexShrink: 0,
    justifyContent: "flex-end"
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject
  }
});

type BottomActionsDimensions = {
  bottomMargin: number;
  safeBottomAreaHeight: number;
};

type ServiceDetailsFooterActionsProps = WithTestID<{
  dimensions: BottomActionsDimensions;
  transitionAnimStyle: Animated.AnimateStyle<StyleProp<ViewStyle>>;
  children?: React.ReactNode;
  debugMode?: boolean;
  specialActionProps?: React.ComponentProps<typeof ServiceSpecialAction>;
  standardActionsProps?: React.ComponentProps<typeof ServiceStandardActions>;
}>;

const { colors, locations } = easeGradient({
  colorStops: {
    0: { color: hexToRgba(IOColors[HEADER_BG_COLOR], 0) },
    1: { color: IOColors[HEADER_BG_COLOR] }
  },
  easing: Easing.ease,
  extraColorStopsPerTransition: 20
});

export const ServiceDetailsFooterActions = ({
  dimensions,
  transitionAnimStyle,
  debugMode = false,
  specialActionProps,
  standardActionsProps,
  testID
}: ServiceDetailsFooterActionsProps) => {
  const { bottomMargin, safeBottomAreaHeight } = dimensions;

  return (
    <View
      style={{
        width: "100%",
        position: "absolute",
        bottom: 0,
        height: bottomMargin + safeBottomAreaHeight,
        paddingBottom: bottomMargin
      }}
      testID={testID}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.gradientContainer,
          debugMode && {
            borderTopColor: IOColors["error-500"],
            borderTopWidth: 1,
            backgroundColor: hexToRgba(IOColors["error-500"], 0.5)
          },
          transitionAnimStyle
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          style={{
            height: (bottomMargin + safeBottomAreaHeight) * 0.45
          }}
          locations={locations}
          colors={colors}
        />
        <View
          style={{
            bottom: 0,
            height: (bottomMargin + safeBottomAreaHeight) * 0.55,
            backgroundColor: IOColors[HEADER_BG_COLOR]
          }}
        />
      </Animated.View>

      <View style={styles.buttonContainer} pointerEvents="box-none">
        {specialActionProps && <ServiceSpecialAction {...specialActionProps} />}
        {standardActionsProps && (
          <ServiceStandardActions {...standardActionsProps} />
        )}
      </View>
    </View>
  );
};

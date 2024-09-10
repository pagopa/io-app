import React from "react";
import { Easing, Pressable, StyleSheet } from "react-native";
import { easeGradient } from "react-native-easing-gradient";
import LinearGradient from "react-native-linear-gradient";
import {
  PressableBaseProps,
  WithTestID,
  Caption
} from "@pagopa/io-app-design-system";
import Animated from "react-native-reanimated";
import I18n from "../../../../i18n";
import TrustmarkLogo from "../../../../../img/wallet/trustmark.svg";
import { useSpringPressScaleAnimation } from "../../../../components/ui/utils/hooks/useSpringPressScaleAnimation";

type ItwCredentialTrustmarkProps = WithTestID<PressableBaseProps>;

const TRUSTMARK_HEIGHT = 48;

const { colors, locations } = easeGradient({
  colorStops: {
    0: { color: "#CCCCCC" },
    "0.3": { color: "#E0E0E0" },
    "0.7": { color: "#F2F2F2" },
    1: { color: "#E9E9E9" }
  },
  easing: Easing.ease,
  extraColorStopsPerTransition: 8
});

const gradientAngleCenter = { x: 0.5, y: 0.7 };

export const ItwCredentialTrustmark = ({
  testID,
  onPress
}: ItwCredentialTrustmarkProps) => {
  const { onPressIn, onPressOut, animatedScaleStyle } =
    useSpringPressScaleAnimation();

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessible={true}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.trustmark.cta"
      )}
      accessibilityRole="button"
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
    >
      <Animated.View style={[styles.container, animatedScaleStyle]}>
        <LinearGradient
          useAngle
          angle={1}
          angleCenter={gradientAngleCenter}
          locations={locations}
          colors={colors}
          style={styles.gradientView}
        >
          <Caption style={styles.caption}>
            {I18n.t(
              "features.itWallet.presentation.trustmark.cta"
            ).toUpperCase()}
          </Caption>
          <TrustmarkLogo style={styles.logo} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden"
  },
  gradientView: {
    height: TRUSTMARK_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 16,
    position: "relative"
  },
  caption: {
    zIndex: 10
  },
  logo: {
    zIndex: 1,
    position: "absolute",
    height: TRUSTMARK_HEIGHT * 2,
    width: TRUSTMARK_HEIGHT * 2,
    top: "-40%",
    right: -TRUSTMARK_HEIGHT / 2
  }
});

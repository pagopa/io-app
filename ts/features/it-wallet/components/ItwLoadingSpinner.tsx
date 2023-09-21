import React, { useEffect, useRef } from "react";
import { StyleSheet, View, ColorValue, Animated, Easing } from "react-native";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import { WithTestID } from "../../../types/WithTestID";
import { H4 } from "../../../components/core/typography/H4";
import { H2 } from "../../../components/core/typography/H2";

type Props = WithTestID<{
  captionTitle?: string;
  captionSubtitle?: string;
  color: ColorValue;
  durationMs?: number;
}>;

const height = 76;

const styles = StyleSheet.create({
  container: {
    width: height,
    height,
    justifyContent: "center",
    alignItems: "center"
  },
  progress: {
    width: "100%",
    height: "100%",
    borderRadius: height / 2,
    borderBottomColor: IOColors.white,
    borderWidth: 4,
    position: "absolute"
  },
  textAlignCenter: {
    textAlign: "center"
  }
});

const startRotationAnimation = (
  durationMs: number,
  rotationDegree: Animated.Value
): void => {
  Animated.loop(
    Animated.timing(rotationDegree, {
      toValue: 360,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: true
    })
  ).start();
};

const ItwLoadingSpinner = ({
  captionTitle,
  captionSubtitle,
  color,
  durationMs = 1000
}: Props): React.ReactElement => {
  const rotationDegree = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startRotationAnimation(durationMs, rotationDegree);
  }, [durationMs, rotationDegree]);

  return (
    <>
      <View
        style={styles.container}
        accessibilityRole="progressbar"
        testID={"LoadingSpinnerTestID"}
      >
        <Animated.View
          testID={"LoadingSpinnerAnimatedTestID"}
          style={[
            styles.progress,
            {
              borderTopColor: color,
              borderRightColor: color,
              borderLeftColor: color
            },
            {
              transform: [
                {
                  rotateZ: rotationDegree.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"]
                  })
                }
              ]
            }
          ]}
        />
      </View>
      <VSpacer size={48} />
      <H2 style={styles.textAlignCenter} testID="LoadingSpinnerCaptionTitleID">
        {captionTitle}
      </H2>
      <VSpacer />
      <H4
        weight="Regular"
        style={styles.textAlignCenter}
        testID="LoadingSpinnerCaptionSubTitleID"
      >
        {captionSubtitle}
      </H4>
    </>
  );
};

export default ItwLoadingSpinner;

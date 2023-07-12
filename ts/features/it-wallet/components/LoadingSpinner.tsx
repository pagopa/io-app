import React, { useEffect, useRef } from "react";
import { StyleSheet, View, ColorValue, Animated, Easing } from "react-native";
import { WithTestID } from "../../../types/WithTestID";
import { IOColors } from "../../../components/core/variables/IOColors";
import { H1 } from "../../../components/core/typography/H1";
import { H4 } from "../../../components/core/typography/H4";
import { VSpacer } from "../../../components/core/spacer/Spacer";

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
      useNativeDriver: false
    })
  ).start();
};

const LoadingSpinner = ({
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
      <H1 testID="LoadingSpinnerCaptionTitleID">{captionTitle}</H1>
      <VSpacer />
      <H4 weight="Regular" testID="LoadingSpinnerCaptionSubTitleID">
        {captionSubtitle}
      </H4>
    </>
  );
};

export default LoadingSpinner;

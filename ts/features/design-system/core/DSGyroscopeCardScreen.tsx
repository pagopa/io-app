/* eslint-disable functional/immutable-data */
import { H6, IOColors, VSpacer } from "@pagopa/io-app-design-system";
import MaskedView from "@react-native-masked-view/masked-view";
import * as React from "react";
import { useState } from "react";
import {
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import Animated, {
  Extrapolate,
  SensorType,
  interpolate,
  useAnimatedReaction,
  useAnimatedSensor,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

type CardSize = {
  width: LayoutRectangle["width"];
  height: LayoutRectangle["height"];
};

type LightSize = {
  value: LayoutRectangle["width"];
};

/* LIGHT
   Visual parameters */
const lightSizePercentage: ViewStyle["width"] = "80%";
const lightScaleMultiplier: number = 1;
const lightOpacity: ViewStyle["opacity"] = 0.3;
/* Percentage of visible light when it's near
card boundaries */
const visibleLightPercentage: number = 0.5;

/* CARD
   Visual parameters */
const cardAspectRatio: ViewStyle["aspectRatio"] = 7 / 4;

/* MOVEMENT
   Spring config for the light movement */
const springConfig = {
  mass: 1,
  damping: 50,
  stiffness: 200,
  overshootClamping: false
};

const DSGyroscopeCardScreen = () => {
  /* On first render, store the current device orientation
  using quaternions */
  const rotationSensor = useAnimatedSensor(SensorType.ROTATION);
  const { qx, qy } = rotationSensor.sensor.value;
  const initialQx = useSharedValue(0);
  const initialQy = useSharedValue(0);

  useAnimatedReaction(
    () => rotationSensor.sensor.value,
    s => {
      initialQx.value = s.qx;
      initialQy.value = s.qy;
    },
    []
  );

  // eslint-disable-next-line no-console
  console.log(
    "Sensor values:",
    `qx: ${initialQx.value}, qy: ${initialQy.value}`
  );

  /* Get both card and light sizes to set the basic boundaries */
  const [cardSize, setCardSize] = useState<CardSize>();
  const [lightSize, setLightSize] = useState<LightSize>();

  const getCardSize = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCardSize({ width, height });
  };

  const getLightSize = (event: LayoutChangeEvent) => {
    const { width: lightSize } = event.nativeEvent.layout;
    setLightSize({ value: lightSize });
  };

  /* Calculate the light position using quaternions */
  const lightAnimatedStyle = useAnimatedStyle(() => {
    /* Not all devices are in an initial flat position on a surface 
    (e.g. a table) then we use relative rotation values,
    not absolute ones  */
    const relativeQx = qx - initialQx.value;
    const relativeQy = qy - initialQy.value;

    const maxTranslateX =
      ((cardSize?.width ?? 0) -
        (lightSize?.value ?? 0) * visibleLightPercentage) /
      2;
    const maxTranslateY =
      ((cardSize?.height ?? 0) -
        (lightSize?.value ?? 0) * visibleLightPercentage) /
      2;

    /* We don't need to consider the whole
    quaternion range, just the 1/10 */
    const quaternionRange: number = 0.1;

    const translateX = interpolate(
      relativeQx,
      [-quaternionRange, quaternionRange],
      [maxTranslateX, -maxTranslateX],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      relativeQy,
      [-quaternionRange, quaternionRange],
      [-maxTranslateY, maxTranslateY],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: withSpring(translateX, springConfig) },
        { translateY: withSpring(translateY, springConfig) },
        { scale: lightScaleMultiplier }
      ]
    };
  });

  return (
    <View style={styles.container}>
      <MaskedView maskElement={<View style={styles.mask} />}>
        <View style={styles.box} onLayout={getCardSize}>
          <Animated.View
            style={[styles.light, lightAnimatedStyle]}
            onLayout={getLightSize}
          >
            <Svg height={"100%"} width={"100%"}>
              <Defs>
                <RadialGradient
                  id="grad"
                  cx="50%"
                  cy="50%"
                  rx="50%"
                  ry="50%"
                  fx="50%"
                  fy="50%"
                >
                  {/* There are many stops because it's an easing gradient.
                  To learn more: https://larsenwork.com/easing-gradients/ */}
                  <Stop stopColor="#ffffff" offset="0%" stopOpacity={1} />
                  <Stop stopColor="#ffffff" offset="8.1%" stopOpacity={0.987} />
                  <Stop stopColor="#ffffff" offset="15.5%" stopOpacity={0.95} />
                  <Stop stopColor="#ffffff" offset="22.5%" stopOpacity={0.89} />
                  <Stop stopColor="#ffffff" offset="29%" stopOpacity={0.825} />
                  <Stop stopColor="#ffffff" offset="35.3%" stopOpacity={0.74} />
                  <Stop stopColor="#ffffff" offset="41.2%" stopOpacity={0.65} />
                  <Stop stopColor="#ffffff" offset="47.1%" stopOpacity={0.55} />
                  <Stop stopColor="#ffffff" offset="52.9%" stopOpacity={0.45} />
                  <Stop stopColor="#ffffff" offset="58.8%" stopOpacity={0.35} />
                  <Stop stopColor="#ffffff" offset="64.7%" stopOpacity={0.26} />
                  <Stop stopColor="#ffffff" offset="71%" stopOpacity={0.175} />
                  <Stop stopColor="#ffffff" offset="77.5%" stopOpacity={0.1} />
                  <Stop stopColor="#ffffff" offset="84.5%" stopOpacity={0.05} />
                  <Stop stopColor="#ffffff" offset="91.9%" stopOpacity={0.01} />
                  <Stop stopColor="#ffffff" offset="100%" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={"50%"} cy={"50%"} r={"50%"} fill="url(#grad)" />
            </Svg>
          </Animated.View>
        </View>
      </MaskedView>
      <View style={styles.debugInfo}>
        <H6>Card</H6>
        <Text>{`Size: ${cardSize?.width} × ${cardSize?.height}`}</Text>
        <VSpacer size={8} />
        <H6>Light (Circle)</H6>
        <Text>{`Size: ${lightSize?.value}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24
  },
  light: {
    alignSelf: "center",
    width: lightSizePercentage,
    aspectRatio: 1,
    opacity: lightOpacity,
    borderRadius: 100
  },
  mask: {
    width: "100%",
    aspectRatio: cardAspectRatio,
    backgroundColor: IOColors.black,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24
  },
  box: {
    justifyContent: "center",
    width: "100%",
    aspectRatio: cardAspectRatio,
    backgroundColor: IOColors["hanPurple-250"]
  },
  debugInfo: {
    alignSelf: "flex-start",
    position: "relative",
    top: 16
  }
});

export { DSGyroscopeCardScreen };

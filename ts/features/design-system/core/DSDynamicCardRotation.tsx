/* eslint-disable functional/immutable-data */
import { H6, IOColors, VSpacer, hexToRgba } from "@pagopa/io-app-design-system";
import {
  Canvas,
  Color,
  DiffRect,
  Image,
  LinearGradient,
  Mask,
  RoundedRect,
  Circle as SkiaCircle,
  Group as SkiaGroup,
  RadialGradient as SkiaRadialGradient,
  rect,
  rrect,
  useImage,
  vec
} from "@shopify/react-native-skia";

import { useState } from "react";
import {
  ColorValue,
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import Animated, {
  Extrapolation,
  SensorType,
  interpolate,
  useAnimatedReaction,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
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
const lightSizePercentage: ViewStyle["width"] = "90%";
const lightScaleMultiplier: number = 1;
const lightOpacity: ViewStyle["opacity"] = 0.9;
const lightSkiaOpacity: number = 0.4;
/* Percentage of visible light when it's near
card boundaries */
const visibleLightPercentage: number = 0.25;

/* CARD
   Visual parameters */
const cardAspectRatio: ViewStyle["aspectRatio"] = 7 / 4;
const cardBorderRadius: number = 24;
const cardBorderWidth: number = 1;
const cardBorderColor: ColorValue = IOColors["hanPurple-500"];
const cardBorderHighlighted: ColorValue = IOColors.white;
const cardBorderOpacity: number = 0.65;
// Drivers' License
const cardGradient: Array<Color> = ["#F4ACD5", "#FCE6F2"];
// Flag
// const flagDistanceFromEdge: number = 16;
// const flagSize: number = 32;

/* MOVEMENT
   Spring config for the light movement */
const springConfig = {
  mass: 1,
  damping: 50,
  stiffness: 200,
  overshootClamping: false
};

export const DSDynamicCardRotation = () => {
  /* On first render, store the current device orientation
  using quaternions */
  const rotationSensor = useAnimatedSensor(SensorType.ROTATION);
  const { roll: initialRoll, pitch: initialPitch } =
    rotationSensor.sensor.value;

  const roll = useSharedValue(0);
  const pitch = useSharedValue(0);
  const skiaTranslateX = useSharedValue(0);
  const skiaTranslateY = useSharedValue(0);

  useAnimatedReaction(
    () => rotationSensor.sensor.value,
    sensor => {
      roll.value = sensor.roll;
      pitch.value = sensor.pitch;
    },
    []
  );
  /* Not all devices are in an initial flat position on a surface
    (e.g. a table) then we use relative rotation values,
    not absolute ones  */
  const relativeRoll = useDerivedValue(() => -(initialRoll - roll.value));
  const relativePitch = useDerivedValue(() => initialPitch - pitch.value);

  // eslint-disable-next-line no-console
  console.log("Sensor values:", `qx: ${roll.value}, qy: ${pitch.value}`);

  /* Get both card and light sizes to set the basic boundaries */
  const [cardSize, setCardSize] = useState<CardSize>();
  const [lightSize, setLightSize] = useState<LightSize>();

  const getCardSize = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCardSize({ width, height });
  };

  const getLightSize = (event: LayoutChangeEvent) => {
    const { width: newLightSize } = event.nativeEvent.layout;
    setLightSize({ value: newLightSize });
  };

  /* Set translate boundaries */
  const maxTranslateX =
    ((cardSize?.width ?? 0) -
      (lightSize?.value ?? 0) * visibleLightPercentage) /
    2;

  const maxTranslateY =
    ((cardSize?.height ?? 0) -
      (lightSize?.value ?? 0) * visibleLightPercentage) /
    2;

  /* We don't need to consider the whole
    sensor range, just the 1/10 */
  const sensorRange: number = 0.1;

  /* Calculate the light position using quaternions */
  const lightAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      relativeRoll.value,
      [-sensorRange, sensorRange],
      [maxTranslateX, -maxTranslateX],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      relativePitch.value,
      [-sensorRange, sensorRange],
      [-maxTranslateY, maxTranslateY],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: withSpring(translateX, springConfig) },
        { translateY: withSpring(translateY, springConfig) },
        { scale: lightScaleMultiplier }
      ]
    };
  });

  const skiaLightTranslateValues = useDerivedValue(() => {
    skiaTranslateX.value = withSpring(
      interpolate(
        relativeRoll.value,
        [-sensorRange, sensorRange],
        [maxTranslateX, -maxTranslateX],
        Extrapolation.CLAMP
      ),
      springConfig
    );

    skiaTranslateY.value = withSpring(
      interpolate(
        relativePitch.value,
        [-sensorRange, sensorRange],
        [-maxTranslateY, maxTranslateY],
        Extrapolation.CLAMP
      ),
      springConfig
    );

    return [
      { translateX: skiaTranslateX.value },
      { translateY: skiaTranslateY.value },
      { scale: lightScaleMultiplier }
    ];
  });

  // Inner card (border excluded)
  const CardInnerMask = () => (
    <RoundedRect
      x={cardBorderWidth}
      y={cardBorderWidth}
      width={(cardSize?.width ?? 0) - cardBorderWidth * 2}
      height={(cardSize?.height ?? 0) - cardBorderWidth * 2}
      r={cardBorderRadius - cardBorderWidth}
      color={IOColors.black}
    />
  );

  const CardLight = () => (
    <SkiaGroup
      opacity={lightSkiaOpacity}
      blendMode={"hardLight"}
      origin={vec((cardSize?.width ?? 0) / 2, (cardSize?.height ?? 0) / 2)}
    >
      <SkiaCircle
        cx={(cardSize?.width ?? 0) / 2}
        cy={(cardSize?.height ?? 0) / 2}
        r={(lightSize?.value ?? 0) / 2}
        transform={skiaLightTranslateValues}
      >
        <SkiaRadialGradient
          c={vec((cardSize?.width ?? 0) / 2, (cardSize?.height ?? 0) / 2)}
          r={(lightSize?.value ?? 0) / 2}
          /* There are many stops because it's an easing gradient. */
          positions={[
            0, 0.081, 0.155, 0.225, 0.29, 0.353, 0.412, 0.471, 0.529, 0.588,
            0.647, 0.71, 0.775, 0.845, 0.919, 1
          ]}
          colors={[
            "rgba(255,255,255,1)",
            "rgba(255,255,255,0.987)",
            "rgba(255,255,255,0.95)",
            "rgba(255,255,255,0.89)",
            "rgba(255,255,255,0.825)",
            "rgba(255,255,255,0.74)",
            "rgba(255,255,255,0.65)",
            "rgba(255,255,255,0.55)",
            "rgba(255,255,255,0.45)",
            "rgba(255,255,255,0.35)",
            "rgba(255,255,255,0.26)",
            "rgba(255,255,255,0.175)",
            "rgba(255,255,255,0.1)",
            "rgba(255,255,255,0.05)",
            "rgba(255,255,255,0.01)",
            "rgba(255,255,255,0)"
          ]}
        />
      </SkiaCircle>
    </SkiaGroup>
  );

  const CardBorder = ({
    color = cardBorderColor,
    opacity = cardBorderOpacity
  }: {
    color?: Color;
    opacity?: number;
  }) => {
    const outerRect = rrect(
      rect(0, 0, cardSize?.width ?? 0, cardSize?.height ?? 0),
      cardBorderRadius,
      cardBorderRadius
    );

    const innerRect = rrect(
      rect(
        cardBorderWidth,
        cardBorderWidth,
        (cardSize?.width ?? 0) - cardBorderWidth * 2,
        (cardSize?.height ?? 0) - cardBorderWidth * 2
      ),
      cardBorderRadius - cardBorderWidth,
      cardBorderRadius - cardBorderWidth
    );

    return (
      <DiffRect
        inner={innerRect}
        outer={outerRect}
        color={color}
        opacity={opacity}
      />
    );
  };

  const CardPatternMask = () => {
    const cardPattern = useImage(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../../../../img/dynamicCardRotation/driver-license-background.png")
    );

    return (
      <Mask mask={<CardInnerMask />}>
        {/* eslint-disable react-native-a11y/has-valid-accessibility-ignores-invert-colors */}
        <Image
          x={0}
          y={0}
          fit="cover"
          image={cardPattern}
          width={cardSize?.width ?? 0}
          height={cardSize?.height ?? 0}
        />
      </Mask>
    );
  };

  const CardBorderMask = () => (
    <Mask mode="alpha" mask={<CardLight />}>
      <CardBorder color={cardBorderHighlighted} opacity={0.8} />
    </Mask>
  );

  return (
    <View style={styles.container}>
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
      <Text style={styles.cardDebugLabel}>Using React Native engine</Text>

      <VSpacer />

      <Canvas
        style={{
          width: "100%",
          aspectRatio: cardAspectRatio
        }}
      >
        <RoundedRect
          x={0}
          y={0}
          width={cardSize?.width ?? 0}
          height={cardSize?.height ?? 0}
          r={cardBorderRadius}
          color={hexToRgba(IOColors["hanPurple-250"], 1)}
        >
          <LinearGradient
            start={vec(0, cardSize?.height ?? 0)}
            end={vec(cardSize?.width ?? 0, 0)}
            colors={cardGradient}
          />
        </RoundedRect>
        <CardBorder color={"#D279AC"} />
        <CardLight />
        <CardPatternMask />
        {/* <CardEUCountry /> */}

        <CardBorderMask />
      </Canvas>
      <Text style={styles.cardDebugLabel}>Using Skia engine</Text>

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
    borderRadius: 400
  },
  cardDebugLabel: {
    fontSize: 11,
    marginTop: 4
  },
  box: {
    justifyContent: "center",
    width: "100%",
    aspectRatio: cardAspectRatio,
    borderRadius: 24,
    borderCurve: "continuous",
    backgroundColor: IOColors["hanPurple-250"]
  },
  debugInfo: {
    alignSelf: "flex-start",
    position: "relative",
    top: 16
  }
});

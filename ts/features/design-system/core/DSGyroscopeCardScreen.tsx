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
  useAnimatedSensor,
  useAnimatedStyle,
  withSpring
} from "react-native-reanimated";

type CardSize = {
  width: LayoutRectangle["width"];
  height: LayoutRectangle["height"];
};

type LightSize = {
  value: LayoutRectangle["width"];
};

const cardAspectRatio: ViewStyle["aspectRatio"] = 7 / 4;

const DSGyroscopeCardScreen = () => {
  const [cardSize, setCardSize] = useState<CardSize>();
  const [lightSize, setLightSize] = useState<LightSize>();

  const rotationSensor = useAnimatedSensor(SensorType.ROTATION);
  const { qx, qy } = rotationSensor.sensor.value;

  const getCardSize = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCardSize({ width, height });
  };

  const getLightSize = (event: LayoutChangeEvent) => {
    const { width: lightSize } = event.nativeEvent.layout;
    setLightSize({ value: lightSize });
  };

  // eslint-disable-next-line no-console
  console.log("Sensor values:", `qx: ${qx}, qy: ${qy}`);

  const animatedStyle = useAnimatedStyle(() => {
    const { qx, qy } = rotationSensor.sensor.value;

    const maxTranslateX =
      ((cardSize?.width ?? 0) - (lightSize?.value ?? 0)) / 2;
    const maxTranslateY =
      ((cardSize?.height ?? 0) - (lightSize?.value ?? 0)) / 2;

    const translateX = interpolate(
      qx,
      /* We don't need to take in account
      the entire rotation range, just the 1/10 */
      [-0.1, 0.1],
      [-maxTranslateX, maxTranslateX],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      qy,
      /* We don't need to take in account
      the entire rotation range, just the 1/10 */
      [-0.1, 0.1],
      [-maxTranslateY, maxTranslateY],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: withSpring(translateX) },
        { translateY: withSpring(translateY) }
      ]
    };
  });

  return (
    <View style={styles.container}>
      <MaskedView maskElement={<View style={styles.mask} />}>
        <View style={styles.box} onLayout={getCardSize}>
          <Animated.View
            style={[styles.circle, animatedStyle]}
            onLayout={getLightSize}
          />
        </View>
      </MaskedView>
      <View style={styles.debugInfo}>
        <H6>Card</H6>
        <Text>{`Size: ${cardSize?.width} × ${cardSize?.height}`}</Text>
        <VSpacer size={8} />
        <H6>Light (Circle)</H6>
        <Text>{`Size: ${lightSize?.value}`}</Text>
        <H6>Sensor values</H6>
        <Text>{`qx: ${qx}, qy: ${qy}`}</Text>
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
  circle: {
    alignSelf: "center",
    width: "50%",
    aspectRatio: 1,
    backgroundColor: IOColors["hanPurple-500"],
    borderRadius: 100
  },
  // eslint-disable-next-line react-native/no-color-literals
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
    backgroundColor: IOColors["hanPurple-250"],
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12
  },
  debugInfo: {
    alignSelf: "flex-start",
    position: "relative",
    top: 16
  }
});

export { DSGyroscopeCardScreen };

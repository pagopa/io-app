import { H6, IOColors } from "@pagopa/io-app-design-system";
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
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  withSpring
} from "react-native-reanimated";

type CardSize = {
  width: LayoutRectangle["width"];
  height: LayoutRectangle["height"];
};

const cardAspectRatio: ViewStyle["aspectRatio"] = 7 / 4;

const DSGyroscopeCardScreen = () => {
  const [cardSize, setCardSize] = useState<CardSize>();
  const rotationSensor = useAnimatedSensor(SensorType.ROTATION);

  const getCardSize = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCardSize({ width, height });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const { qx, qy } = rotationSensor.sensor.value;
    return {
      transform: [
        { translateX: withSpring(qx * 500) },
        { translateY: withSpring(qy * 100) }
      ]
    };
  });

  return (
    <View style={styles.container}>
      <MaskedView maskElement={<View style={styles.mask} />}>
        <View style={styles.box} onLayout={getCardSize}>
          <Animated.View style={[styles.circle, animatedStyle]} />
        </View>
      </MaskedView>
      <View style={styles.debugInfo}>
        <H6>Card</H6>
        <Text>{`${cardSize?.width} × ${cardSize?.height}`}</Text>
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

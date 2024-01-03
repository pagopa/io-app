import { IOColors } from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  withSpring
} from "react-native-reanimated";

const DSGyroscopeCardScreen = () => {
  const rotationSensor = useAnimatedSensor(SensorType.ROTATION);

  const animatedStyle = useAnimatedStyle(() => {
    const qx = rotationSensor.sensor.value.qx;
    return {
      transform: [{ translateX: withSpring(qx * 160) }]
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24
  },
  box: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: IOColors["hanPurple-500"],
    borderRadius: 24,
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12
  }
});

export { DSGyroscopeCardScreen };

import { IOColors } from "@pagopa/io-app-design-system";
import MaskedView from "@react-native-masked-view/masked-view";
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
        <View style={styles.box}>
          <Animated.View style={[styles.circle, animatedStyle]} />
        </View>
      </MaskedView>
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
    aspectRatio: 4 / 3,
    backgroundColor: IOColors.black,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24
  },
  box: {
    justifyContent: "center",
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: IOColors["hanPurple-250"],
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

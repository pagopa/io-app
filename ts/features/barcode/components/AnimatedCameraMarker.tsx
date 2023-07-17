import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import CameraMarkerCorner from "../../../../img/camera-marker-corner.svg";
import CameraMarkerLine from "../../../../img/camera-marker-line.svg";

type Props = {
  size?: number;
  cornerSize?: number;
  state?: "SCANNING" | "IDLE";
};

const defaultMarkerSize = 230;
const defaultCornerSize = 44;

const AnimatedCameraMarker = ({
  size = defaultMarkerSize,
  cornerSize = defaultCornerSize,
  state = "SCANNING"
}: Props) => {
  const lineSpan = size / 2 - cornerSize - 8;

  const translateY = useSharedValue(state === "IDLE" ? 0 : -lineSpan);

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: translateY.value
      }
    ]
  }));

  React.useEffect(() => {
    if (state === "SCANNING") {
      // eslint-disable-next-line functional/immutable-data
      translateY.value = withRepeat(
        withTiming(lineSpan, {
          duration: 1500,
          easing: Easing.inOut(Easing.exp)
        }),
        -1,
        true
      );
    }
  }, [translateY, lineSpan, state]);

  const drawMarkerCorner = (rotation: number, size: number) => (
    <CameraMarkerCorner
      width={size}
      height={size}
      style={{
        transform: [{ rotate: `${rotation}deg` }]
      }}
    />
  );

  return (
    <View style={styles.container}>
      <View style={[styles.marker, { width: size, height: size }]}>
        <View style={styles.corners}>
          <View style={styles.cornersSide}>
            {drawMarkerCorner(0, cornerSize)}
            {drawMarkerCorner(90, cornerSize)}
          </View>
          <View style={styles.cornersSide}>
            {drawMarkerCorner(-90, cornerSize)}
            {drawMarkerCorner(180, cornerSize)}
          </View>
        </View>
        <Animated.View style={animatedLineStyle}>
          <CameraMarkerLine />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "105%",
    justifyContent: "center"
  },
  marker: {
    overflow: "hidden",
    borderRadius: 28
  },
  corners: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    position: "absolute"
  },
  cornersSide: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

export { AnimatedCameraMarker };

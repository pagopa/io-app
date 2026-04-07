import { IOEasingCurves } from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import Animated, { AnimatedStyle, FadeIn } from "react-native-reanimated";

import CameraMarkerCorner from "../../../../img/camera-marker-corner.svg";
import CameraMarkerLine from "../../../../img/camera-marker-line.svg";

const ANIMATION_DURATION = 1500;

type Props = {
  cornerSize?: number;
  isAnimated?: boolean;
  size?: number;
};

const defaultMarkerSize = 230;
const defaultCornerSize = 44;

const AnimatedCameraMarker = ({
  size = defaultMarkerSize,
  cornerSize = defaultCornerSize,
  isAnimated = true
}: Props) => {
  const lineSpan = size / 2 - cornerSize - 8;

  const drawMarkerCorner = (rotation: number) => (
    <CameraMarkerCorner
      height={cornerSize}
      style={{
        transform: [{ rotate: `${rotation}deg` }]
      }}
      width={cornerSize}
    />
  );

  const scanAnimation: AnimatedStyle = {
    animationName: {
      from: { transform: [{ translateY: -lineSpan }] },
      to: { transform: [{ translateY: lineSpan }] }
    },
    animationDuration: ANIMATION_DURATION,
    animationTimingFunction: IOEasingCurves.easeInOutCubic,
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    animationPlayState: isAnimated ? "running" : "paused"
  };

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={[styles.marker, { width: size, height: size }]}>
        <View style={styles.corners}>
          <View style={styles.cornersSide}>
            {drawMarkerCorner(0)}
            {drawMarkerCorner(90)}
          </View>
          <View style={styles.cornersSide}>
            {drawMarkerCorner(-90)}
            {drawMarkerCorner(180)}
          </View>
        </View>
        <Animated.View style={scanAnimation}>
          <CameraMarkerLine height={size} width={size - 10} />
        </Animated.View>
      </View>
    </Animated.View>
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
    justifyContent: "center",
    alignItems: "center"
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

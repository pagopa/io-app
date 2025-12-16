import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import CameraMarkerCorner from "../../../../img/camera-marker-corner.svg";
import CameraMarkerLine from "../../../../img/camera-marker-line.svg";
import { useSineWaveAnimation } from "../../../components/ui/utils/hooks/useSineWaveAnimation";

const ANIMATION_DURATION = 1500;

type Props = {
  size?: number;
  cornerSize?: number;
  isAnimated?: boolean;
};

const defaultMarkerSize = 230;
const defaultCornerSize = 44;

const AnimatedCameraMarker = ({
  size = defaultMarkerSize,
  cornerSize = defaultCornerSize,
  isAnimated = true
}: Props) => {
  const lineSpan = size / 2 - cornerSize - 8;

  const { animatedStyle: animatedLineStyle } = useSineWaveAnimation({
    enabled: isAnimated,
    span: lineSpan,
    duration: ANIMATION_DURATION,
    axis: "y"
  });

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
    <Animated.View style={styles.container} entering={FadeIn}>
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
          <CameraMarkerLine width={size - 10} height={size} />
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

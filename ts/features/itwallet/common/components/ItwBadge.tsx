import { memo, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import { Caption, Icon, IOColors } from "@pagopa/io-app-design-system";
import {
  Easing,
  Extrapolation,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";

export const ItwBadge = memo(() => (
  <View style={styles.badge}>
    <AnimatedStrokeGradient />
    <View style={styles.content}>
      <Caption style={styles.text}>It-wallet</Caption>
      {/* TODO: Temporary icon, it must be changed with the ITW Logo  */}
      <Icon name="navWallet" color="white" size={16} />
    </View>
  </View>
));

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  text: {
    color: IOColors.white,
    fontWeight: "500",
    letterSpacing: 0
  }
});

const AnimatedStrokeGradient = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    progress.value = withRepeat(
      withTiming(1, { duration: 30000, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const animatedStart = useDerivedValue(() => {
    const startX = interpolate(
      progress.value,
      [0, 1],
      [-width, width],
      Extrapolation.CLAMP
    );
    return vec(startX, height);
  }, [height]);

  const animatedEnd = useDerivedValue(() => {
    const endX = interpolate(
      progress.value,
      [0, 1],
      [0, width],
      Extrapolation.CLAMP
    );
    return vec(endX, 0);
  }, [width]);

  return (
    <Canvas
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <RoundedRect
        x={1}
        y={1}
        style="stroke"
        strokeWidth={1}
        width={width - 2}
        height={height - 2}
        r={16}
      >
        <LinearGradient
          start={animatedStart}
          end={animatedEnd}
          mode="repeat"
          colors={[
            "#86A1FF",
            "#CFDAFF",
            "#B3C5FF",
            "#7C9AFF",
            "#C8D5FF",
            "#86A1FF"
          ]}
        />
      </RoundedRect>
    </Canvas>
  );
};

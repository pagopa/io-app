import { memo, useEffect, useState } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import { Caption, IOColors } from "@pagopa/io-app-design-system";
import {
  Easing,
  Extrapolation,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import I18n from "i18next";

type Props = {
  variant?: "filled" | "outlined";
};

/**
 * This component renders the logo of the IT Wallet, image and text.
 */
// TODO: replace with the correct image [SIW-2412]
export const ItwBadge = memo(({ variant = "filled" }: Props) => {
  const SkiaComponent = skiaComponentMap[variant];

  return (
    <View style={styles.container}>
      <SkiaComponent />
      <View style={styles.content}>
        <Image
          accessibilityIgnoresInvertColors
          accessible={true}
          resizeMode="contain"
          style={styles.icon}
        />
        <Caption style={styles.text}>
          {I18n.t("features.itWallet.title")}
        </Caption>
      </View>
    </View>
  );
});

const StaticGradientBackground = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <RoundedRect x={0} y={0} width={width} height={height} r={100}>
          <LinearGradient
            start={vec(0, height)}
            end={vec(width, height + width * Math.tan((60 * Math.PI) / 180))}
            colors={["#002FCB", "#003BFE", "#0335DA", "#053FFF", "#0335DD"]}
          />
        </RoundedRect>
      </Canvas>
    </View>
  );
};

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
    <View
      style={StyleSheet.absoluteFill}
      // eslint-disable-next-line sonarjs/no-identical-functions
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
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
    </View>
  );
};

const skiaComponentMap = {
  filled: StaticGradientBackground,
  outlined: AnimatedStrokeGradient
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderCurve: "continuous",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    })
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  text: {
    color: IOColors.white,
    fontWeight: "bold"
  },
  icon: {
    width: 14,
    height: 14,
    backgroundColor: IOColors.white
  }
});

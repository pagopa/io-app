import { IconButtonSolid, VSpacer } from "@io-app/design-system";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { GifImage, GifImageProps } from "../../../../components/GifImage";
import { useAnimationPlayback } from "../../../../hooks/useAnimationPlayback";

const DEFAULT_MAX_DURATION_MS = 8000;

export type ItwAnimatedImageProps = Omit<
  GifImageProps,
  "isPlaying" | "staticSource"
> & {
  /** Starts playback when the component mounts. Defaults to `true`. */
  autoPlay?: boolean;
  /** Stops playback after this duration. Defaults to eight seconds. */
  maxDurationMs?: number;
  /** Accessible name announced by the control while the animation is playing. */
  pauseAccessibilityLabel: string;
  /** Accessible name announced by the control while the animation is paused. */
  playAccessibilityLabel: string;
  /** Still frame shown when playback stops or reduced motion is enabled. */
  staticSource: ImageSourcePropType;
};

/**
 * Renders an IT Wallet GIF with accessible play and stop controls.
 *
 * Playback stops automatically after `maxDurationMs`. When reduced motion is
 * enabled, the component shows `staticSource` and disables playback. All
 * remaining props are forwarded to the underlying `GifImage`.
 */
export const ItwAnimatedImage = ({
  autoPlay = true,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  pauseAccessibilityLabel,
  playAccessibilityLabel,
  staticSource,
  style,
  ...imageProps
}: ItwAnimatedImageProps) => {
  const reduceMotion = useReducedMotion();
  const { imageKey, isPlaying, togglePlayback } = useAnimationPlayback({
    autoPlay,
    maxDurationMs,
    reduceMotion
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <GifImage
          {...imageProps}
          isPlaying={isPlaying}
          key={imageKey}
          staticSource={staticSource}
          style={[styles.image, style]}
        />
      </View>
      <VSpacer size={16} />
      <View style={styles.buttonContainer}>
        <IconButtonSolid
          accessibilityLabel={
            isPlaying ? pauseAccessibilityLabel : playAccessibilityLabel
          }
          color="primary"
          disabled={reduceMotion}
          icon={isPlaying ? "stop" : "play"}
          onPress={togglePlayback}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%"
  },
  container: {
    flex: 1
  },
  image: {
    height: "100%",
    width: "100%"
  },
  imageWrapper: {
    flex: 1,
    width: "100%"
  }
});

import { IconButtonSolid, VSpacer } from "@io-app/design-system";
import { useIsFocused } from "@react-navigation/native";
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
  View
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { useAnimationPlayback } from "../hooks/useAnimationPlayback";

const DEFAULT_MAX_DURATION_MS = 8000;

export type GifImageProps = Omit<ImageProps, "source"> & {
  /** Starts playback when the component mounts. Defaults to `true`. */
  autoPlay?: boolean;
  /** Stops playback after this duration. Defaults to eight seconds. */
  maxDurationMs?: number;
  /** Accessible name announced while the animation is playing. */
  pauseAccessibilityLabel: string;
  /** Accessible name announced while the animation is paused. */
  playAccessibilityLabel: string;
  /** Animated GIF displayed during playback. */
  source: ImageSourcePropType;
  /** Still frame displayed when playback stops or reduced motion is enabled. */
  staticSource: ImageSourcePropType;
};

/**
 * Renders a GIF with accessible play and stop controls.
 *
 * Playback stops after `maxDurationMs`. Reduced motion keeps the static image
 * visible and disables playback. The content unmounts while its screen is not
 * focused so native GIF playback cannot continue in the background. Native
 * image props are forwarded to the GIF.
 */
export const GifImage = (props: GifImageProps) => {
  const isFocused = useIsFocused();

  // Screens remain mounted in the navigation back stack. Unmounting the
  // playback content on blur stops the native GIF and resets playback state
  // before the screen is focused again.
  return isFocused ? <FocusedGifImage {...props} /> : null;
};

const FocusedGifImage = ({
  accessibilityIgnoresInvertColors = false,
  autoPlay = true,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  pauseAccessibilityLabel,
  playAccessibilityLabel,
  source,
  staticSource,
  style,
  ...imageProps
}: GifImageProps) => {
  const reduceMotion = useReducedMotion();
  const { imageKey, isPlaying, togglePlayback } = useAnimationPlayback({
    autoPlay,
    maxDurationMs,
    reduceMotion
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          {...imageProps}
          accessibilityIgnoresInvertColors={accessibilityIgnoresInvertColors}
          key={imageKey}
          source={isPlaying ? source : staticSource}
          style={[styles.image, style]}
        />
      </View>
      {!reduceMotion && (
        <>
          <VSpacer size={16} />
          <View style={styles.buttonContainer}>
            <IconButtonSolid
              accessibilityLabel={
                isPlaying ? pauseAccessibilityLabel : playAccessibilityLabel
              }
              color="primary"
              icon={isPlaying ? "stop" : "play"}
              onPress={togglePlayback}
            />
          </View>
        </>
      )}
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

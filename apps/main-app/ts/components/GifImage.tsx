import { BodySmall, Icon, useIOTheme, VStack } from "@io-app/design-system";
import { useIsFocused } from "@react-navigation/native";
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { useAnimationPlayback } from "../hooks/useAnimationPlayback";

type Props = Omit<ImageProps, "source"> & {
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
 * Renders a GIF whose entire area is an accessible play and stop button. Only
 * stopped playback shows a play overlay over the faded first frame.
 *
 * Playback stops after `maxDurationMs`. Reduced motion keeps the static image
 * visible and disables playback. The content unmounts while its screen is not
 * focused so native GIF playback cannot continue in the background. Native
 * image props are forwarded to the GIF.
 */
export const GifImage = (props: Props) => {
  const isFocused = useIsFocused();

  // Screens remain mounted in the navigation back stack. Unmounting the
  // playback content on blur stops the native GIF and resets playback state
  // before the screen is focused again.
  return isFocused ? <FocusedGifImage {...props} /> : null;
};

const FocusedGifImage = ({
  accessibilityIgnoresInvertColors = false,
  autoPlay = true,
  maxDurationMs = 8000,
  pauseAccessibilityLabel,
  playAccessibilityLabel,
  source,
  staticSource,
  style,
  ...imageProps
}: Props) => {
  const theme = useIOTheme();
  const reduceMotion = useReducedMotion();
  const { imageKey, isPlaying, togglePlayback } = useAnimationPlayback({
    autoPlay,
    maxDurationMs,
    reduceMotion
  });
  const showPlayOverlay = !isPlaying && !reduceMotion;
  const image = (
    <Image
      {...imageProps}
      accessibilityIgnoresInvertColors={accessibilityIgnoresInvertColors}
      key={imageKey}
      source={isPlaying ? source : staticSource}
      style={[styles.image, style, showPlayOverlay && styles.pausedImage]}
    />
  );

  if (reduceMotion) {
    return image;
  }

  return (
    <Pressable
      accessibilityLabel={
        isPlaying ? pauseAccessibilityLabel : playAccessibilityLabel
      }
      accessibilityRole="button"
      accessible
      onPress={togglePlayback}
      style={styles.container}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.container}
      >
        {image}
        {showPlayOverlay && (
          <VStack space={8} style={styles.playOverlay}>
            <BodySmall>{playAccessibilityLabel}</BodySmall>
            <Icon color={theme["interactiveElem-default"]} name="play" />
          </VStack>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  image: {
    height: "100%",
    width: "100%"
  },
  pausedImage: {
    // Keep the first frame at 10% opacity behind the play overlay.
    opacity: 0.1
  },
  playOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center"
  }
});

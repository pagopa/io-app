import { IconButtonSolid, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useCiePreparationAnimationPlayback } from "../hooks/useCiePreparationAnimationPlayback";

/**
 * Animated image block used in CIE preparation screens.
 * It renders:
 * - an animated asset while playback is active
 * - a static fallback image when playback is stopped
 * - a play/pause control button
 */

type ItwCiePreparationAnimatedImageProps = {
  animatedSource: ImageSourcePropType;
  staticSource: ImageSourcePropType;
  autoPlay?: boolean;
  maxDurationMs?: number;
  testID?: string;
};

export const ItwCiePreparationAnimatedImage = ({
  animatedSource,
  staticSource,
  autoPlay = true,
  maxDurationMs = 8000,
  testID
}: ItwCiePreparationAnimatedImageProps) => {
  const reduceMotion = useReducedMotion();
  const { isPlaying, imageKey, togglePlayback } =
    useCiePreparationAnimationPlayback({
      autoPlay,
      maxDurationMs,
      reduceMotion
    });

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.imageWrapper}>
        <Image
          accessibilityIgnoresInvertColors
          source={isPlaying ? animatedSource : staticSource}
          resizeMode="contain"
          style={styles.image}
          // Changing the key forces GIF restart when playback starts again.
          key={imageKey}
        />
      </View>
      <VSpacer size={16} />
      <View style={styles.buttonContainer}>
        <IconButtonSolid
          color="primary"
          accessibilityLabel={I18n.t(
            isPlaying
              ? "features.itWallet.identification.cie.prepare.animation.pause"
              : "features.itWallet.identification.cie.prepare.animation.play"
          )}
          icon={isPlaying ? "pause" : "play"}
          disabled={reduceMotion}
          onPress={togglePlayback}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  imageWrapper: {
    flex: 1,
    width: "100%"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  buttonContainer: {
    width: "100%",
    justifyContent: "flex-end",
    flexDirection: "row"
  }
});

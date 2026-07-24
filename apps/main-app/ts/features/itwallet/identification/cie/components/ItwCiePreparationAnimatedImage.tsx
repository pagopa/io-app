import { IconButtonSolid, VSpacer } from "@io-app/design-system";
import I18n from "i18next";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { useCiePreparationAnimationPlayback } from "../hooks/useCiePreparationAnimationPlayback";

/**
 * Animated image block used in CIE preparation screens.
 * It renders:
 * - an animated asset while playback is active
 * - a static fallback image when playback is stopped
 * - a play/stop control button
 */

type ItwCiePreparationAnimatedImageProps = {
  animatedSource: ImageSourcePropType;
  autoPlay?: boolean;
  maxDurationMs?: number;
  staticSource: ImageSourcePropType;
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
          // Changing the key forces GIF restart when playback starts again.
          key={imageKey}
          resizeMode="contain"
          source={isPlaying ? animatedSource : staticSource}
          style={styles.image}
        />
      </View>
      <VSpacer size={16} />
      <View style={styles.buttonContainer}>
        <IconButtonSolid
          accessibilityLabel={I18n.t(
            isPlaying
              ? "features.itWallet.identification.cie.prepare.animation.pause"
              : "features.itWallet.identification.cie.prepare.animation.play"
          )}
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

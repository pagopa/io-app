import { ContentWrapper, VStack } from "@io-app/design-system";
import { useIsFocused } from "@react-navigation/core";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View
} from "react-native";

import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";

// Caps how long the looping GIF illustration plays before it freezes on its
// static poster frame, keeping it under the 5s threshold WCAG 2.2.2 allows
// for automatically moving content with no pause/stop control.
const ANIMATION_DURATION_MS = 4000;

type Props = {
  actions?: IOScrollViewActions;
  description: string;
  goBack?: () => void;
  imageSrc: ImageSourcePropType;
  // Static frame the animated `imageSrc` GIF freezes on once
  // `ANIMATION_DURATION_MS` elapses. Omit when `imageSrc` is already static.
  posterSrc?: ImageSourcePropType;
  title: string;
};

export const ItwCiePreparationScreenContent = ({
  title,
  description,
  imageSrc,
  posterSrc,
  actions,
  children,
  goBack
}: PropsWithChildren<Props>) => {
  const isFocused = useIsFocused();
  const [isAnimationPlaying, setAnimationPlaying] = useState(true);

  // The GIF has no native pause control and no fixed loop count, so the
  // "playing" window is re-armed on every focus and torn down on blur,
  // switching the `Image` source to a static poster once it elapses.
  useEffect(() => {
    if (!isFocused || posterSrc === undefined) {
      return undefined;
    }
    setAnimationPlaying(true);
    const timeout = setTimeout(
      () => setAnimationPlaying(false),
      ANIMATION_DURATION_MS
    );
    return () => clearTimeout(timeout);
  }, [isFocused, posterSrc]);

  return (
    <IOScrollViewWithLargeHeader
      actions={actions}
      description={description}
      goBack={goBack}
      headerActionsProp={{ showHelp: true }}
      title={{ label: title }}
    >
      <ContentWrapper>
        <VStack space={16}>
          {children}
          <View style={styles.imageContainer}>
            {isFocused && (
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="contain"
                source={
                  isAnimationPlaying || posterSrc === undefined
                    ? imageSrc
                    : posterSrc
                }
                style={styles.image}
              />
            )}
          </View>
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    // Define image container height as 50% of screen height
    height: screenHeight * 0.5
  },
  image: {
    width: "100%",
    height: "100%"
  }
});

import { ContentWrapper, VStack } from "@io-app/design-system";
import { useIsFocused } from "@react-navigation/core";
import { PropsWithChildren } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View
} from "react-native";

import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";

type Props = {
  actions?: IOScrollViewActions;
  description: string;
  goBack?: () => void;
  imageSrc: ImageSourcePropType;
  title: string;
};

export const ItwCiePreparationScreenContent = ({
  title,
  description,
  imageSrc,
  actions,
  children,
  goBack
}: PropsWithChildren<Props>) => {
  // The image source can be an animated GIF. Since native GIF playback isn't
  // driven by React re-renders, the animation keeps running as long as the
  // `Image` view stays mounted, which is still the case when this screen is
  // pushed to the back stack after navigating forward. Unmounting the image
  // while the screen isn't focused stops the animation instead of letting it
  // run indefinitely in the background.
  const isFocused = useIsFocused();

  return (
    <IOScrollViewWithLargeHeader
      actions={actions}
      description={description}
      goBack={goBack}
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
                source={imageSrc}
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

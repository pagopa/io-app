import { ContentWrapper, VStack } from "@io-app/design-system";
import { PropsWithChildren, ReactElement } from "react";
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
  title: string;
} & (
  | { imageComponent: ReactElement; imageSrc?: never }
  | { imageComponent?: never; imageSrc: ImageSourcePropType }
);

export const ItwCiePreparationScreenContent = ({
  title,
  description,
  imageSrc,
  imageComponent,
  actions,
  children,
  goBack
}: PropsWithChildren<Props>) => {
  const image = imageSrc ? (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={imageSrc}
      style={styles.image}
    />
  ) : (
    imageComponent
  );

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
          <View style={styles.imageContainer}>{image}</View>
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

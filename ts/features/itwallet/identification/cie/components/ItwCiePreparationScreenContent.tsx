import { ContentWrapper, VStack } from "@pagopa/io-app-design-system";
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
  title: string;
  description: string;
  imageSrc: ImageSourcePropType;
  actions?: IOScrollViewActions;
  goBack?: () => void;
};

export const ItwCiePreparationScreenContent = ({
  title,
  description,
  imageSrc,
  actions,
  children,
  goBack
}: PropsWithChildren<Props>) => (
  <IOScrollViewWithLargeHeader
    title={{ label: title }}
    description={description}
    headerActionsProp={{ showHelp: true }}
    actions={actions}
    goBack={goBack}
  >
    <ContentWrapper>
      <VStack space={16}>
        {children}
        <View style={styles.imageContainer}>
          <Image
            accessibilityIgnoresInvertColors
            source={imageSrc}
            resizeMode="contain"
            style={styles.image}
          />
        </View>
      </VStack>
    </ContentWrapper>
  </IOScrollViewWithLargeHeader>
);

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

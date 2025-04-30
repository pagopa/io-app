import {
  H6,
  IOButton,
  IOIcons,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { AnimatedImage } from "../../../../components/AnimatedImage.tsx";

type ItwIdentificationContentType = {
  title?: string;
  body: string;
};

type ItwIdentificationFooterButton = {
  label: string;
  onPress: () => void;
  icon?: IOIcons;
};

type ItwIdentificationBottomSheetProps = {
  title: string;
  content: Array<ItwIdentificationContentType>;
  imageSrc?: ImageSourcePropType;
  footerButtons?: Array<ItwIdentificationFooterButton>;
};

/**
 * A hook that returns a function to present an identification bottom sheet.
 * @param title - the title of the bottom sheet.
 * @param content - the content of the bottom sheet. Consists of an array of objects with a title and a body.
 * @param imageSrc - the source of the image to be displayed in the bottom sheet.
 * @param footerButtons - the array of buttons to be displayed in the bottom sheet footer.
 */
export const useItwIdentificationBottomSheet = ({
  title,
  content,
  imageSrc,
  footerButtons = []
}: ItwIdentificationBottomSheetProps) => {
  const Footer = () => {
    // If there's only one button
    if (footerButtons.length === 1) {
      const button = footerButtons[0];
      return (
        <IOButton
          variant="solid"
          label={button.label}
          onPress={button.onPress}
          icon={button.icon}
        />
      );
    }

    // If there are two buttons
    if (footerButtons.length >= 2) {
      // Use the first two buttons in the array
      const primaryButton = footerButtons[0];
      const secondaryButton = footerButtons[1];

      return (
        <>
          <VStack space={8}>
            <IOButton
              variant="solid"
              label={primaryButton.label}
              onPress={primaryButton.onPress}
              icon={primaryButton.icon}
            />
            <View style={{ alignSelf: "center" }}>
              <IOButton
                variant="link"
                label={secondaryButton.label}
                onPress={secondaryButton.onPress}
                icon={secondaryButton.icon}
              />
            </View>
          </VStack>
        </>
      );
    }

    return undefined;
  };

  const BottomSheetBody = () => (
    <View style={{ flex: 1 }}>
      {content.map((item, index) => (
        <VStack key={`${index}_${item.title}`} space={8}>
          {item.title && <H6>{item.title}</H6>}
          <IOMarkdown content={item.body} />
          {imageSrc && <AnimatedImage source={imageSrc} style={styles.image} />}
        </VStack>
      ))}
      <VSpacer size={24} />
      <Footer />
      <VSpacer size={12} />
    </View>
  );

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title,
    component: <BottomSheetBody />
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};

const styles = StyleSheet.create({
  image: { resizeMode: "contain", width: "100%" }
});

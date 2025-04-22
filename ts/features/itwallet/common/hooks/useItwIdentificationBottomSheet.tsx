import {
  FooterActions,
  H6,
  IOIcons,
  IOStyles,
  VStack
} from "@pagopa/io-app-design-system";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
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
 * A hook that returns a function to present an info bottom sheet.
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
  const BottomSheetBody = () => (
    <View style={IOStyles.flex}>
      {content.map((item, index) => (
        <VStack key={`${index}_${item.title}`} space={8}>
          {item.title && <H6>{item.title}</H6>}
          <IOMarkdown content={item.body} />
          {imageSrc && <AnimatedImage source={imageSrc} style={styles.image} />}
        </VStack>
      ))}
    </View>
  );

  // Function to convert footerButtons array to FooterActions format
  const getFooterActions = () => {
    // If there's only one button
    if (footerButtons.length === 1) {
      const button = footerButtons[0];
      return (
        <FooterActions
          excludeSafeAreaMargins={true}
          transparent={true}
          actions={{
            type: "SingleButton",
            primary: {
              label: button.label,
              onPress: button.onPress,
              icon: button.icon
            }
          }}
        />
      );
    }

    // If there are two buttons
    if (footerButtons.length >= 2) {
      // Use the first two buttons in the array
      const primaryButton = footerButtons[0];
      const secondaryButton = footerButtons[1];

      return (
        <FooterActions
          excludeSafeAreaMargins={true}
          transparent={true}
          actions={{
            type: "TwoButtons",
            primary: {
              label: primaryButton.label,
              onPress: primaryButton.onPress,
              icon: primaryButton.icon
            },
            secondary: {
              label: secondaryButton.label,
              onPress: secondaryButton.onPress,
              icon: secondaryButton.icon
            }
          }}
        />
      );
    }

    return undefined;
  };

  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      title,
      component: <BottomSheetBody />,
      footer: getFooterActions()
    },
    200
  );

  return {
    dismiss,
    present,
    bottomSheet
  };
};

const styles = StyleSheet.create({
  image: { resizeMode: "contain", width: "100%" }
});

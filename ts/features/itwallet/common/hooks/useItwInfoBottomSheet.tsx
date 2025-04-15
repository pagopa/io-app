import { H6, IOStyles, VSpacer, VStack } from "@pagopa/io-app-design-system";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { AnimatedImage } from "../../../../components/AnimatedImage.tsx";

/**
 * The type of the content of the bottom sheet.
 */
type ItwInfoFlowContentType = {
  title?: string;
  body: string;
};

/**
 * Type of the props of the hook.
 */
type ItwInfoFlowProps = {
  title: string;
  content: Array<ItwInfoFlowContentType>;
  imageSrc?: ImageSourcePropType;
};

/**
 * A hook that returns a function to present an info bottom sheet.
 * @param title - the title of the bottom sheet.
 * @param content - the content of the bottom sheet. Consists of an array of objects with a title and a body.
 * @param imageSrc - the source of the image to be displayed in the bottom sheet.
 */
export const useItwInfoBottomSheet = ({
  title,
  content,
  imageSrc
}: ItwInfoFlowProps) => {
  const BottomSheetBody = () => (
    <View style={IOStyles.flex}>
      {content.map((item, index) => (
        <VStack key={`${index}_${item.title}`} space={8}>
          {item.title && <H6>{item.title}</H6>}
          <IOMarkdown content={item.body} />
          <VSpacer size={16} />
          {imageSrc && <AnimatedImage source={imageSrc} style={styles.image} />}
        </VStack>
      ))}
      <VSpacer size={24} />
    </View>
  );

  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal({
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
  image: { resizeMode: "cover", width: "100%" }
});

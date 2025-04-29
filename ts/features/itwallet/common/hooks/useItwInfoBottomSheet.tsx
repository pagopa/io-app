import { H6, VSpacer, VStack } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

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
};

/**
 * A hook that returns a function to present an info bottom sheet.
 * @param title - the title of the bottom sheet.
 * @param content - the content of the bottom sheet. Consists of an array of objects with a title and a body.
 */
export const useItwInfoBottomSheet = ({ title, content }: ItwInfoFlowProps) => {
  const BottomSheetBody = () => (
    <View style={{ flex: 1 }}>
      {content.map((item, index) => (
        <VStack key={`${index}_${item.title}`} space={8}>
          {item.title && <H6>{item.title}</H6>}
          <IOMarkdown content={item.body} />
        </VStack>
      ))}
      <VSpacer size={24} />
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

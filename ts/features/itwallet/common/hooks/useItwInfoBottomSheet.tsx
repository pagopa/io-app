import { View } from "react-native";
import { H6, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import ItwMarkdown from "../components/ItwMarkdown";

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
    <View style={IOStyles.flex}>
      {content.map((item, index) => (
        <View key={`${index}_${item.title}`}>
          {item.title && (
            <>
              <H6>{item.title}</H6>
              <VSpacer size={8} />
            </>
          )}
          <ItwMarkdown>{item.body}</ItwMarkdown>
        </View>
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

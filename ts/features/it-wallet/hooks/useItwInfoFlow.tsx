import React from "react";
import { View } from "react-native";
import { Body, H6, VSpacer } from "@pagopa/io-app-design-system";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";

type ItwInfoFlowContentType = {
  title: string;
  body: string;
};

type ItwInfoFlowProps = {
  title: string;
  content: Array<ItwInfoFlowContentType>;
};

/**
 * A hook that returns a function to present the reset wallet bottom sheet in the wallet home screen.
 */
export const useItwInfoFlow = ({ title, content }: ItwInfoFlowProps) => {
  const BottomSheetBody = () => (
    <View style={IOStyles.flex}>
      {content.map((item, index) => (
        <View key={`${index}_${item.title}`}>
          <H6>{item.title}</H6>
          <VSpacer size={8} />
          <Body>{item.body}</Body>
          <VSpacer size={16} />
        </View>
      ))}
    </View>
  );

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title,
    component: <BottomSheetBody />,
    snapPoint: [300]
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};

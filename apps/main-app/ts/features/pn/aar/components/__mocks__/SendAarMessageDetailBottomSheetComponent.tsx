import { View } from "react-native";

import { SendAarMessageDetailBottomSheetComponentProps } from "../SendAarMessageDetailBottomSheetComponent";

export const SendAarMessageDetailBottomSheetComponent = ({
  aarBottomSheetRef,
  sendUserType
}: SendAarMessageDetailBottomSheetComponentProps) => {
  // eslint-disable-next-line functional/immutable-data
  aarBottomSheetRef.current = jest.fn();
  return (
    <View>
      <View>{`Mock SendAarMessageDetailBottomSheetComponent`}</View>
      <View>{`Ref container: set to jest.fn() internally`}</View>
      <View>{`User type:     ${sendUserType}`}</View>
    </View>
  );
};

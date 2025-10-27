import { View } from "react-native";
import { SendAARMessageDetailBottomSheetComponentProps } from "../SendAARMessageDetailBottomSheetComponent";

export const SendAARMessageDetailBottomSheetComponent = ({
  aarBottomSheetRef,
  isDelegate
}: SendAARMessageDetailBottomSheetComponentProps) => {
  // eslint-disable-next-line functional/immutable-data
  aarBottomSheetRef.current = jest.fn();
  return (
    <View>
      <View>{`Mock SendAARMessageDetailBottomSheetComponent`}</View>
      <View>{`Ref container: set to jest.fn() internally`}</View>
      <View>{`Is delegate:   ${isDelegate}`}</View>
    </View>
  );
};

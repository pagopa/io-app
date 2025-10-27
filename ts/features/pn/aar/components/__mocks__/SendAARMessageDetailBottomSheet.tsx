import { Pressable, View } from "react-native";
import { SendAARMessageDetailBottomSheetProps } from "../SendAARMessageDetailBottomSheet";

export const SendAARMessageDetailBottomSheet = ({
  onPrimaryActionPress,
  onSecondaryActionPress,
  userType
}: SendAARMessageDetailBottomSheetProps) => (
  <View>
    <View>{`Mock SendAARMessageDetailBottomSheet`}</View>
    <View>{`Send user type: ${userType}`}</View>
    <Pressable
      accessibilityLabel=""
      onPress={onPrimaryActionPress}
      testID="primary_button"
    >{`Mock Primary Action`}</Pressable>
    <Pressable
      accessibilityLabel=""
      onPress={onSecondaryActionPress}
      testID="secondary_button"
    >{`Mock Secondary Action`}</Pressable>
  </View>
);

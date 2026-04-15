import { Pressable, View } from "react-native";
import { SendAarMessageDetailBottomSheetProps } from "../SendAarMessageDetailBottomSheet";

export const SendAarMessageDetailBottomSheet = ({
  onPrimaryActionPress,
  onSecondaryActionPress,
  sendUserType
}: SendAarMessageDetailBottomSheetProps) => (
  <View>
    <View>{`Mock SendAarMessageDetailBottomSheet`}</View>
    <View>{`Send user type: ${sendUserType}`}</View>
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

import { Pressable, View } from "react-native";
import { SendEngagementComponentProps } from "../SendEngagementComponent";

export const SendEngagementComponent = ({
  isLoading,
  onClose,
  onPrimaryAction
}: SendEngagementComponentProps) => (
  <View>
    <View>{"Mock Send Engagement Component"}</View>
    <View>{`isLoading: ${isLoading}`}</View>
    <Pressable accessibilityLabel="" onPress={onClose} testID="close-button">
      {"onClose"}
    </Pressable>
    <Pressable
      accessibilityLabel=""
      onPress={onPrimaryAction}
      testID="primary-action"
    >
      {"onPrimaryAction"}
    </Pressable>
  </View>
);

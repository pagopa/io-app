import { View } from "react-native";
import { F24SectionProps } from "../F24Section";

export const F24Section = ({
  isCancelled,
  messageId,
  serviceId,
  sendOpeningSource,
  sendUserType
}: F24SectionProps) => (
  <View>
    <View>{`Mock F24Section`}</View>
    <View>{`Message Id:     ${messageId}`}</View>
    <View>{`Service Id:     ${serviceId}`}</View>
    <View>{`Cancelled:      ${isCancelled}`}</View>
    <View>{`Opening Source: ${sendOpeningSource}`}</View>
    <View>{`User Type:      ${sendUserType}`}</View>
  </View>
);

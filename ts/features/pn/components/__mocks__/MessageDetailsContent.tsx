import { View } from "react-native";
import { MessageDetailsContentProps } from "../MessageDetailsContent";

export const MessageDetailsContent = ({
  message
}: MessageDetailsContentProps) => (
  <View>
    <View>{`Mock MessageDetailsContent`}</View>
    <View>${`Abstract:            ${message.abstract}`}</View>
    <View>${`IUN:                 ${message.iun}`}</View>
    <View>${`Sender Denomination: ${message.senderDenomination}`}</View>
  </View>
);

import { View } from "react-native";
import { MessageCancelledContentProps } from "../MessageCancelledContent";

export const MessageCancelledContent = ({
  isCancelled,
  paidNoticeCodes,
  payments
}: MessageCancelledContentProps) => (
  <View>
    <View>{`Mock MessageCancelledContent`}</View>
    <View>{`Is cancelled:            ${isCancelled}`}</View>
    <View>{`Paid notice codes count: ${
      paidNoticeCodes?.length ?? "undefined"
    }`}</View>
    <View>{`Payments count:          ${payments?.length ?? "undefined"}`}</View>
  </View>
);

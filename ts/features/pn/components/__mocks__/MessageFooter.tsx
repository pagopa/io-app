import { View } from "react-native";
import { MessageFooterProps } from "../MessageFooter";

export const MessageFooter = ({
  isCancelled,
  maxVisiblePaymentCount,
  messageId,
  onMeasure,
  payments,
  presentPaymentsBottomSheetRef
}: MessageFooterProps) => (
  <View>
    <View>{`Mock MessageFooterProps`}</View>
    <View>{`Is cancelled:  ${isCancelled}`}</View>
    <View>{`Max Payments:  ${maxVisiblePaymentCount}`}</View>
    <View>{`Message Id:    ${messageId}`}</View>
    <View>{`On measure:    ${onMeasure}`}</View>
    <View>{`Payment Count: ${payments?.length ?? "none"}`}</View>
    <View>{`Bottom Sheet:  ${
      presentPaymentsBottomSheetRef ? "defined" : "undefined"
    }`}</View>
  </View>
);

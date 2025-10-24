import { View } from "react-native";
import { MessagePaymentsProps } from "../MessagePayments";

export const MessagePayments = ({
  completedPaymentNoticeCodes,
  isCancelled,
  maxVisiblePaymentCount,
  messageId,
  payments,
  presentPaymentsBottomSheetRef,
  serviceId
}: MessagePaymentsProps) => (
  <View>
    <View>{`Mock MessagePayments`}</View>
    <View>{`Completed payments: ${
      completedPaymentNoticeCodes?.length ?? "none"
    }`}</View>
    <View>{`Cancelled:          ${isCancelled}`}</View>
    <View>{`Max Payment Count:  ${maxVisiblePaymentCount}`}</View>
    <View>{`Message Id:         ${messageId}`}</View>
    <View>{`Payments:           ${payments?.length ?? "none"}`}</View>
    <View>{`Bottom Sheet ref:   ${
      presentPaymentsBottomSheetRef ? "defined" : "undefined"
    }`}</View>
    <View>{`Service Id:         ${serviceId}`}</View>
  </View>
);

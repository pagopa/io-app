import { View } from "react-native";
import { MessagePaymentBottomSheetProps } from "../MessagePaymentBottomSheet";

export const MessagePaymentBottomSheet = ({
  messageId,
  payments,
  presentPaymentsBottomSheetRef,
  serviceId
}: MessagePaymentBottomSheetProps) => (
  <View>
    <View>{`Mock MessagePaymentBottomSheet`}</View>
    <View>{`Message Id:       ${messageId}`}</View>
    <View>{`Payment Count:    ${payments.length}`}</View>
    <View>{`Bottom Sheet Ref: ${
      presentPaymentsBottomSheetRef ? "defined" : "undefined"
    }`}</View>
    <View>{`Service Id:       ${serviceId}`}</View>
  </View>
);

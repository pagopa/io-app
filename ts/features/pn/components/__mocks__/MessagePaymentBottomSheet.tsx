import { View } from "react-native";
import { MessagePaymentBottomSheetProps } from "../MessagePaymentBottomSheet";

export const MessagePaymentBottomSheet = ({
  messageId,
  payments,
  presentPaymentsBottomSheetRef,
  serviceId,
  sendOpeningSource,
  sendUserType
}: MessagePaymentBottomSheetProps) => (
  <View>
    <View>{`Mock MessagePaymentBottomSheet`}</View>
    <View>{`Message Id:       ${messageId}`}</View>
    <View>{`Payment Count:    ${payments.length}`}</View>
    <View>{`Bottom Sheet Ref: ${
      presentPaymentsBottomSheetRef ? "defined" : "undefined"
    }`}</View>
    <View>{`Service Id:       ${serviceId}`}</View>
    <View>{`Opening Source:   ${sendOpeningSource}`}</View>
    <View>{`User Type:        ${sendUserType}`}</View>
  </View>
);

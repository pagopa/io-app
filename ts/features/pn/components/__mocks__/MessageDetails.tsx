import { View } from "react-native";
import { MessageDetailsProps } from "../MessageDetails";

export const MessageDetails = ({
  message,
  messageId,
  serviceId,
  payments,
  isAARMessage,
  isDelegate
}: MessageDetailsProps) => (
  <View>
    <View>Mock MessageDetails</View>
    {message.abstract && <View>{message.abstract}</View>}
    {message.attachments &&
      message.attachments.map((attachment, index) => (
        <View key={`a_${index}`}>
          {attachment.category && <View>{attachment.category}</View>}
          {attachment.content_type && <View>{attachment.content_type}</View>}
          <View>{attachment.id}</View>
          {attachment.name && <View>{attachment.name}</View>}
          <View>{attachment.url}</View>
        </View>
      ))}
    {message.completedPayments &&
      message.completedPayments.map((completedPayment, index) => (
        <View key={`cp_${index}`}>{completedPayment}</View>
      ))}
    <View>{`${message.created_at}`}</View>
    {message.isCancelled && <View>{`${message.isCancelled}`}</View>}
    <View>{message.iun}</View>
    {message.notificationStatusHistory.map(
      (pieceOfNotificationStatusHistory, index) => (
        <View key={`ponsh_${index}`}>
          <View>{`${pieceOfNotificationStatusHistory.activeFrom}`}</View>
          <View>
            {pieceOfNotificationStatusHistory.relatedTimelineElements.map(
              (relatedTimelineElement, rteIndex) => (
                <View key={`rte_${rteIndex}`}>{relatedTimelineElement}</View>
              )
            )}
          </View>
          <View>{`${pieceOfNotificationStatusHistory.status}`}</View>
        </View>
      )
    )}
    {message.recipients &&
      message.recipients.map((recipient, index) => (
        <View key={`rec_${index}`}>
          <View>{recipient.denomination}</View>
          {recipient.payment && (
            <View>
              <View>{recipient.payment.creditorTaxId}</View>
              <View>{recipient.payment.noticeCode}</View>
            </View>
          )}
          <View>{recipient.recipientType}</View>
          <View>{recipient.taxId}</View>
        </View>
      ))}
    {message.senderDenomination && <View>{message.senderDenomination}</View>}
    <View>{message.subject}</View>
    <View>{messageId}</View>
    <View>{serviceId}</View>
    {payments &&
      payments.map((payment, index) => (
        <View key={`p_${index}`}>
          <View>{payment.creditorTaxId}</View>
          <View>{payment.noticeCode}</View>
        </View>
      ))}
    <View>{`Is AAR: ${isAARMessage}`}</View>
    <View>{`Is Delegate: ${isDelegate}`}</View>
  </View>
);

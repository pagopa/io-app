import { View } from "react-native";
import { MessageBottomMenuProps } from "../MessageBottomMenu";

export const MessageBottomMenu = ({
  history,
  isAARMessage,
  isCancelled,
  iun,
  messageId,
  paidNoticeCodes,
  payments,
  serviceId
}: MessageBottomMenuProps) => (
  <>
    <View>Mock MessageBottomMenu</View>
    {history.map((pieceOfHistory, index) => (
      <View key={`poh_${index}`}>
        <View>{`Mock TimelineListItem at ${index}`}</View>
        <View>{`${pieceOfHistory.activeFrom}`}</View>
        <View>
          {pieceOfHistory.relatedTimelineElements.map(
            (relatedTimelineElement, rteIndex) => (
              <View key={`rte_${rteIndex}`}>{relatedTimelineElement}</View>
            )
          )}
        </View>
        <View>{`${pieceOfHistory.status}`}</View>
      </View>
    ))}
    {isAARMessage && <View>{`${isAARMessage}`}</View>}
    {isCancelled && <View>{`${isCancelled}`}</View>}
    <View>{iun}</View>
    <View>{messageId}</View>
    {paidNoticeCodes &&
      paidNoticeCodes.map((paidNoticeCode, index) => (
        <View key={`pnc_${index}`}>{paidNoticeCode}</View>
      ))}
    {payments &&
      payments.map((payment, index) => (
        <View key={`p_${index}`}>
          <View>{payment.creditorTaxId}</View>
          <View>{payment.noticeCode}</View>
        </View>
      ))}
    <View>{serviceId}</View>
  </>
);

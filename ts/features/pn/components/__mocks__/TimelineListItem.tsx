import { View } from "react-native";
import { TimelineListItemProps } from "../TimelineListItem";

export const TimelineListItem = ({
  hideFooter,
  history
}: TimelineListItemProps) => (
  <>
    {history.map((pieceOfHistory, index) => (
      <View key={`poh_${index}`}>
        <View>{`Mock TimelineListItem at ${index}`}</View>
        <View>{`${pieceOfHistory.activeFrom}`}</View>
        {pieceOfHistory.relatedTimelineElements.map(
          (relatedTimelineElement, rteIndex) => (
            <View key={`rte_${rteIndex}`}>
              <View>{relatedTimelineElement}</View>
            </View>
          )
        )}
        <View>{pieceOfHistory.status}</View>
      </View>
    ))}
    <View>{`${hideFooter}`}</View>
  </>
);

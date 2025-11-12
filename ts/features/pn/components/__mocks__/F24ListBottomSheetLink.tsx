import { View } from "react-native";
import { F24ListBottomSheetLinkProps } from "../F24ListBottomSheetLink";

export const F24ListBottomSheetLink = ({
  f24List,
  messageId,
  serviceId,
  sendOpeningSource,
  sendUserType
}: F24ListBottomSheetLinkProps) => (
  <View>
    <View>{"Mock F24ListBottomSheetLink"}</View>
    <View>{`Item count:     ${f24List.length}`}</View>
    <View>{`Message Id:     ${messageId}`}</View>
    <View>{`Service Id:     ${serviceId}`}</View>
    <View>{`Opening Source: ${sendOpeningSource}`}</View>
    <View>{`User Type:      ${sendUserType}`}</View>
  </View>
);

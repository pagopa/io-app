import { View } from "react-native";
import { MessageDetailsAttachmentsProps } from "../MessageDetailsAttachments";

export const MessageDetailsAttachments = ({
  banner,
  disabled,
  messageId,
  serviceId,
  sendOpeningSource,
  sendUserType
}: MessageDetailsAttachmentsProps) => (
  <>
    <View>Mock MessageDetailsAttachments</View>
    <View>{`${banner ? "Has" : "Does not have"} Banner`}</View>
    <View>{`Is ${disabled ? "" : "not "}disabled`}</View>
    <View>{`Send Opening Source ${sendOpeningSource}`}</View>
    <View>{`Send User Type ${sendUserType}`}</View>
    <View>{`Message Id: ${messageId}`}</View>
    <View>{`Service Id: ${serviceId}`}</View>
  </>
);

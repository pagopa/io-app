import { View } from "react-native";
import { MessageDetailsAttachmentsProps } from "../MessageDetailsAttachments";

export const MessageDetailsAttachments = ({
  banner,
  disabled,
  isPN,
  messageId,
  serviceId
}: MessageDetailsAttachmentsProps) => (
  <>
    <View>Mock MessageDetailsAttachments</View>
    <View>{`${banner ? "Has" : "Does not have"} Banner`}</View>
    <View>{`Is ${disabled ? "" : "not "}disabled`}</View>
    <View>{`Is ${isPN ? "" : "not "}SEND`}</View>
    <View>{`Message Id: ${messageId}`}</View>
    <View>{`Service Id: ${serviceId}`}</View>
  </>
);

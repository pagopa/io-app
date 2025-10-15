import { Pressable, View } from "react-native";
import { MessageDetailsAttachmentItemProps } from "../MessageDetailsAttachmentItem";

export const MessageDetailsAttachmentItem = ({
  attachment,
  bottomSpacer,
  disabled,
  isPN,
  messageId,
  onPreNavigate,
  serviceId
}: MessageDetailsAttachmentItemProps) => (
  <>
    <View>Mock MessageDetailsAttachmentItem</View>
    <View>
      <View>{`Attachment category:     ${attachment.category}`}</View>
      <View>{`Attachment content-type: ${attachment.content_type}`}</View>
      <View>{`Attachment id:           ${attachment.id}`}</View>
      <View>{`Attachment name:         ${attachment.name}`}</View>
      <View>{`Attachment url:          ${attachment.url}`}</View>
    </View>
    <View>{`Has${bottomSpacer ? "" : " no"} bottom spacer`}</View>
    <View>{`Is ${disabled ? "" : "not "}disabled`}</View>
    <View>{`Is ${isPN ? "" : "not "}SEND`}</View>
    <View>{`Message Id: ${messageId}`}</View>
    <View>{`Service Id: ${serviceId}`}</View>
    <Pressable accessibilityLabel="" onPress={onPreNavigate}>
      {`Has${onPreNavigate != null ? "" : " no"} onPreNavigate callback`}
    </Pressable>
  </>
);

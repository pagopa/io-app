import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessageAttachment } from "../../messages/components/MessageAttachment/MessageAttachment";
import { PnParamsList } from "../navigation/params";

export type MessageAttachmentScreenRouteParams = Readonly<{
  attachmentId: string;
  messageId: string;
}>;

type MessageAttachmentScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  "PN_ROUTES_MESSAGE_ATTACHMENT"
>;

export const MessageAttachmentScreen = (
  props: MessageAttachmentScreenProps
) => {
  const { attachmentId, messageId } = props.route.params;

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  return (
    <MessageAttachment
      attachmentId={attachmentId}
      isPN={true}
      messageId={messageId}
    />
  );
};

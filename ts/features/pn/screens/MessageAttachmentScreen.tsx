import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { PnParamsList } from "../navigation/params";
import { MessageAttachment } from "../../messages/components/MessageAttachment/MessageAttachment";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

export type MessageAttachmentScreenRouteParams = Readonly<{
  messageId: string;
  attachmentId: string;
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

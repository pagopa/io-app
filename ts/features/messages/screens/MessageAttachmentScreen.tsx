import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../navigation/params";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { MessageAttachment } from "../components/MessageAttachment/MessageAttachment";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

export type MessageAttachmentScreenRouteParams = {
  messageId: string;
  attachmentId: string;
  serviceId?: ServiceId;
};

type MessageAttachmentScreenProps = IOStackNavigationRouteProps<
  MessagesParamsList,
  "MESSAGE_DETAIL_ATTACHMENT"
>;

export const MessageAttachmentScreen = (
  props: MessageAttachmentScreenProps
) => {
  const { attachmentId, messageId, serviceId } = props.route.params;

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  return (
    <MessageAttachment
      attachmentId={attachmentId}
      isPN={false}
      messageId={messageId}
      serviceId={serviceId}
    />
  );
};

import { ServiceId } from "../../../../definitions/services/ServiceId";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessageAttachment } from "../components/MessageAttachment/MessageAttachment";
import { MessagesParamsList } from "../navigation/params";

export type MessageAttachmentScreenRouteParams = {
  attachmentId: string;
  messageId: string;
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

import { CreatedMessageWithContent } from "../../../../definitions/backend/CreatedMessageWithContent";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { PNMessage } from "./PNMessage";

export const toPNMessage = (
  messageFromApi: CreatedMessageWithContent
): PNMessage => ({
  id: messageFromApi.id as UIMessageId,
  sender: "string",
  subject: "string",
  markdown: messageFromApi.content.markdown,
  attachments: undefined,
  paymentData: undefined
});

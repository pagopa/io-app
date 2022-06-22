import { MessageBodyMarkdown } from "../../../../definitions/backend/MessageBodyMarkdown";
import {
  Attachment,
  PaymentData,
  WithUIMessageId
} from "../../../store/reducers/entities/messages/types";

export type PNMessage = WithUIMessageId<{
  sender: string;
  subject: string;
  markdown: MessageBodyMarkdown;
  attachments?: ReadonlyArray<Attachment>;
  paymentData?: PaymentData;
}>;

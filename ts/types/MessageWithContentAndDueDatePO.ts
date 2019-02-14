import { MessageContent } from "../../definitions/backend/MessageContent";
import { MessageWithContentPO } from "./MessageWithContentPO";

type MessageContentWithDueDate = MessageContent & {
  due_date: NonNullable<MessageContent["due_date"]>;
};

export type MessageWithContentAndDueDatePO = MessageWithContentPO & {
  content: MessageContentWithDueDate;
};

export const isMessageWithContentAndDueDatePO = (
  message: MessageWithContentPO
): message is MessageWithContentAndDueDatePO =>
  message.content.due_date !== undefined;

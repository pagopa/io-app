import * as t from "io-ts";
import {
  replaceProp1 as repP,
  requiredProp1 as reqP
} from "io-ts-commons/lib/types";

import { MessageContent } from "../../definitions/backend/MessageContent";
import { MessageWithContentPO } from "./MessageWithContentPO";

export const MessageWithContentAndDueDatePO = repP(
  MessageWithContentPO,
  "content",
  reqP(MessageContent, "due_date")
);

export type MessageWithContentAndDueDatePO = t.TypeOf<
  typeof MessageWithContentAndDueDatePO
>;

export const isMessageWithContentAndDueDatePO = (
  message: MessageWithContentPO
): message is MessageWithContentAndDueDatePO =>
  message.content.due_date !== undefined;

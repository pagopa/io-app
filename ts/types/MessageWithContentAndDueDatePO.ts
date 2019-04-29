import * as t from "io-ts";
import {
  replaceProp1 as repP,
  requiredProp1 as reqP
} from "italia-ts-commons/lib/types";

import { CreatedMessageWithContent } from "../../definitions/backend/CreatedMessageWithContent";
import { MessageContent } from "../../definitions/backend/MessageContent";

export const MessageWithContentAndDueDatePO = repP(
  CreatedMessageWithContent,
  "content",
  reqP(MessageContent, "due_date")
);

export type MessageWithContentAndDueDatePO = t.TypeOf<
  typeof MessageWithContentAndDueDatePO
>;

export const isMessageWithContentAndDueDatePO = (
  message: CreatedMessageWithContent
): message is MessageWithContentAndDueDatePO =>
  message.content.due_date !== undefined;

import * as t from "io-ts";
import {
  replaceProp1 as repP,
  requiredProp1 as reqP
} from "italia-ts-commons/lib/types";
import { CreatedMessageWithContent } from "../../definitions/backend/CreatedMessageWithContent";
import { MessageContent } from "../../definitions/backend/MessageContent";

const CreatedMessageWithContentAndDueDate = repP(
  CreatedMessageWithContent,
  "content",
  reqP(MessageContent, "due_date")
);

export type CreatedMessageWithContentAndDueDate = t.TypeOf<
  typeof CreatedMessageWithContentAndDueDate
>;

export const isMessageWithContentAndDueDatePO = (
  _: CreatedMessageWithContent
): _ is CreatedMessageWithContentAndDueDate => _.content.due_date !== undefined;

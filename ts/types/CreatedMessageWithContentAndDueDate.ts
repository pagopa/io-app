import * as t from "io-ts";
import {
  replaceProp1 as repP,
  requiredProp1 as reqP
} from "italia-ts-commons/lib/types";
import { CreatedMessageWithContentAndAttachments } from "../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { MessageContent } from "../../definitions/backend/MessageContent";

const CreatedMessageWithContentAndDueDate = repP(
  CreatedMessageWithContentAndAttachments,
  "content",
  reqP(MessageContent, "due_date")
);

export type CreatedMessageWithContentAndDueDate = t.TypeOf<
  typeof CreatedMessageWithContentAndDueDate
>;

export const isCreatedMessageWithContentAndDueDate = (
  _: CreatedMessageWithContentAndAttachments
): _ is CreatedMessageWithContentAndDueDate => _.content.due_date !== undefined;

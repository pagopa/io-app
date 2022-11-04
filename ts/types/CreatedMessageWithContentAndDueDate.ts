import * as t from "io-ts";
import {
  replaceProp1 as repP,
  requiredProp1 as reqP
} from "@pagopa/ts-commons/lib/types";
import { CreatedMessageWithContentAndAttachments } from "../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { NewMessageContent } from "../../definitions/backend/NewMessageContent";

const CreatedMessageWithContentAndDueDate = repP(
  CreatedMessageWithContentAndAttachments,
  "content",
  reqP(NewMessageContent, "due_date")
);

export type CreatedMessageWithContentAndDueDate = t.TypeOf<
  typeof CreatedMessageWithContentAndDueDate
>;

export const isCreatedMessageWithContentAndDueDate = (
  _: CreatedMessageWithContentAndAttachments
): _ is CreatedMessageWithContentAndDueDate => _.content.due_date !== undefined;

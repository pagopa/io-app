/**
 * A reducer to store the messages normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import * as pot from "@pagopa/ts-commons/lib/pot";

import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { CreatedMessageWithoutContent } from "../../../../../definitions/backend/CreatedMessageWithoutContent";

export type MessageState = {
  meta: CreatedMessageWithoutContent;
  message: pot.Pot<CreatedMessageWithContentAndAttachments, string | undefined>;
};

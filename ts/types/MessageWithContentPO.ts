import * as t from "io-ts";

import { CreatedMessageWithContent } from "../../definitions/backend/CreatedMessageWithContent";

/**
 * A plain object representation of a MessageWithContent useful to avoid problems with the redux store.
 * The create_at date object is transformed in a string.
 */
export const MessageWithContentPO = t.exact(
  t.intersection(
    [
      t.type({
        ...CreatedMessageWithContent.type.types[0].props,
        created_at: t.string
      }),
      CreatedMessageWithContent.type.types[1]
    ],
    "MessageWithContentPO"
  )
);

export type MessageWithContentPO = t.TypeOf<typeof MessageWithContentPO>;

/**
 * Converts a MessageWithContent to a plain object
 *
 * @param {CreatedMessageWithContent} from - The original message received from the Backend
 * @returns {MessageWithContentPO}  A plain object version of the original message
 */
export function toMessageWithContentPO(
  from: CreatedMessageWithContent
): MessageWithContentPO {
  return { ...from, created_at: from.created_at.toISOString() };
}

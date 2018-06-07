import * as t from "io-ts";

import { MessageWithContent } from "../../definitions/backend/MessageWithContent";

/**
 * A plain object representation of a MessageWithContent useful to avoid problems with the redux store.
 * The create_at date object is transformed in a string.
 */
const MessageWithContentPO = t.exact(
  t.intersection(
    [
      t.type({
        ...MessageWithContent.type.types[0].props,
        created_at: t.string
      }),
      MessageWithContent.type.types[1]
    ],
    "MessageWithContentPO"
  )
);

export type MessageWithContentPO = t.TypeOf<typeof MessageWithContentPO>;

/**
 * Converts a MessageWithContent to a plain object
 *
 * @param {MessageWithContent} from - The original message received from the Backend
 * @returns {MessageWithContentPO}  A plain object version of the original message
 */
export function toMessageWithContentPO(
  from: MessageWithContent
): MessageWithContentPO {
  return { ...from, created_at: from.created_at.toISOString() };
}

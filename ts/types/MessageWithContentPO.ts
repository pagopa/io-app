import * as t from "io-ts";

import { MessageBodyMarkdown } from "../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../definitions/backend/MessageSubject";
import { MessageWithContent } from "../../definitions/backend/MessageWithContent";

// Required attributes
const MessageWithContentPOR = t.interface({
  created_at: t.string,

  id: t.string,

  sender_service_id: t.string
});

// Optional attributes
const MessageWithContentPOO = t.partial({
  markdown: MessageBodyMarkdown,

  subject: MessageSubject
});

/**
 * A plain object representation of a MessageWithContent useful to avoid problems with the redux store.
 * The create_at date object is transformed in a string.
 */
export const MessageWithContentPO = t.exact(
  t.intersection(
    [MessageWithContentPOR, MessageWithContentPOO],
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

/**
 * Generic utilities for messages
 */

import { MessageWithContentPO } from "../types/MessageWithContentPO";
import { isTextIncludedCaseInsensitive } from "./strings";

export function messageContainsText(
  message: MessageWithContentPO,
  searchText: string
) {
  return (
    isTextIncludedCaseInsensitive(message.content.subject, searchText) ||
    isTextIncludedCaseInsensitive(message.content.markdown, searchText)
  );
}

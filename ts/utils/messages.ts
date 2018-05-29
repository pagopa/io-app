import { MessageWithContentPO } from "../types/MessageWithContentPO";

/**
 * A function to compare two messages by date (created_at)
 *
 * @param {MessageWithContentPO} m1
 * @param {MessageWithContentPO} m2
 * @returns {number}
 */
export function messagesComparatorByDateDesc(
  m1: MessageWithContentPO,
  m2: MessageWithContentPO
): number {
  return Date.parse(m2.created_at) - Date.parse(m1.created_at);
}

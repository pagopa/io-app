import { MessageWithContentPO } from "../types/MessageWithContentPO";

/**
 * A function to compare two messages by id.
 * We use ULID as ID so the comparator just need to order lexicographically.
 * More @https://github.com/ulid/javascript#monotonic-ulids
 *
 * @param {MessageWithContentPO} m1
 * @param {MessageWithContentPO} m2
 * @returns {number}
 */
export function messagesComparatorByIdDesc(
  m1: MessageWithContentPO,
  m2: MessageWithContentPO
): number {
  return m1.id === m2.id ? 0 : m1.id < m2.id ? 1 : -1;
}

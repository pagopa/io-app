/**
 * Utils for Option items
 */
import { Option } from "fp-ts/lib/Option";

// Check if 2 option set contains the same items
export function areSetEqual(a: Option<Set<string>>, b: Option<Set<string>>) {
  const setA = a.getOrElse(new Set());
  const setB = b.getOrElse(new Set());

  const diff = setA.size > setB.size ? new Set(setA) : new Set(setB);
  const items = setA.size > setB.size ? new Set(setB) : new Set(setA);

  items.forEach(item => diff.delete(item));
  return diff.size === 0;
}

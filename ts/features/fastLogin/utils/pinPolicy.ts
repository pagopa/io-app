type SequenceOrder = "ASCENDING" | "DESCENDING";

const checkSequence =
  (sequenceOrder: SequenceOrder) => (digits: Array<number>) =>
    digits
      .slice(1)
      .every(
        (digit, i) =>
          digit === digits[i] + (sequenceOrder === "ASCENDING" ? 1 : -1)
      );

export function isValidSixDigitNumber(input: number | string): boolean {
  const str = String(input);

  // Check for non-numeric strings and for strings of incorrect length
  if (!/^\d{6}$/.test(str)) {
    return false;
  }

  // Check if all digits are the same
  if (new Set(str).size === 1) {
    return false;
  }

  // Generate an array of digits
  const digits = Array.from(str, Number);

  // Check for ascending sequence
  const isAscending = checkSequence("ASCENDING")(digits);

  if (isAscending) {
    return false;
  }

  // Check for descending sequence
  const isDescending = checkSequence("DESCENDING")(digits);

  if (isDescending) {
    return false;
  }

  return true;
}

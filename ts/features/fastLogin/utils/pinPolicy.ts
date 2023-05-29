type SequenceOrder = "ASCENDING" | "DESCENDING";

const checkSequence = (order: SequenceOrder) => (digits: Array<number>) =>
  digits
    .slice(1)
    .every(
      (digit, i) => digit === digits[i] + (order === "ASCENDING" ? 1 : -1)
    );

export function isValidSixDigitNumber(input: number | string): boolean {
  const str = String(input);

  // Check for non-numeric strings and for strings of incorrect length
  if (!/^\d{6}$/.test(str)) {
    return false;
  }

  // Check if all digits are the same
  if (new Set(str.split("")).size === 1) {
    return false;
  }

  // Generate an array of digits
  const digits = str.split("").map(Number);

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

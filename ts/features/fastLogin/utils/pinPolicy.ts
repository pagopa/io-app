export function isValidSixDigitNumber(input: number | string): boolean {
  const str = String(input);

  // Check for non-numeric strings and for strings of incorrect length
  if (str.length !== 6 || /\D/.test(str)) {
    return false;
  }

  // Check if all digits are the same
  if (new Set(str.split("")).size === 1) {
    return false;
  }

  // Generate an array of digits
  const digits = str.split("").map(Number);

  // Check for ascending sequence
  const isAscending = digits
    .slice(1)
    .every((digit, i) => digit === digits[i] + 1);

  if (isAscending) {
    return false;
  }

  // Check for descending sequence
  const isDescending = digits
    .slice(1)
    .every((digit, i) => digit === digits[i] - 1);

  if (isDescending) {
    return false;
  }

  return true;
}

import { randomBytes } from "crypto";

import { OtpCode } from "../../../../generated/definitions/cgn/OtpCode";

// Bonus codes are made of characters picked from the following alphabet
const ALPHABET = "ACEFGHLMNPRUV3469";
const ALPHABET_LEN = ALPHABET.length;

// Bonus codes have a length of 12 characthers
const BONUSCODE_LENGTH = 12;

/**
 * Generates a new random bonus code
 */
export function genRandomOtpCode(length: number = BONUSCODE_LENGTH): OtpCode {
  const randomBuffer = randomBytes(length);
  const code = [...Array.from(randomBuffer)]
    .map(b => ALPHABET[b % ALPHABET_LEN])
    .join("");
  return code as OtpCode;
}

import { none, Option, some } from "fp-ts/lib/Option";

/**
 * method to modify the formatting of the expiration date
 * it currently adds a "/" after the month (if a valid
 * value is entered) and converts 4-digits years in their
 * 2-digits versions
 * This is a draft version -- the exact behavior should be
 * defined somewhere in order for it to be implemented
 */
export const fixExpirationDate = (value: string): Option<string> => {
  const filteredValue = value
    .replace(/[^\d\/]/g, "") // replace all non-numbers, non-/ with ""
    .replace(/\/(?=.*\/)/g, ""); // replace all /'s that are followed by a / with "" (only leave last /)

  // month has already been entered fully ("1" is ignored as another number may follow)
  if (filteredValue.match(/^(1[012]|0[1-9]|[2-9])$/)) {
    return some(`${filteredValue}/`); // make "/" pop up
  } else if (filteredValue.match(/\/\d{3,}$/)) {
    // if the year is on 3+ digits, cut the
    // first one (so if user
    // is entering 2022 it will accept
    // [in () the cropped part]
    // 2 -> 20 -> (2)02 -> (20)22
    const [month, year] = filteredValue.split("/");
    return some(`${month}/${year.slice(-2)}`);
  } else {
    return filteredValue.length > 0 ? some(filteredValue) : none;
  }
};

// update pan so as to add a space every 4 digits
// the exact behavior should be defined before
// being implemented
export const fixPan = (value: string): Option<string> => {
  const groups = value.replace(/[^\d]/g, "").match(/\d{1,4}/g);
  if (groups !== null) {
    const formatted = groups.join(" ");
    return formatted.length > 0
      ? some(
          // add trailing space if last group of digits has 4 elements
          groups[groups.length - 1].length === 4 ? `${formatted} ` : formatted
        )
      : none;
  }
  return none;
};

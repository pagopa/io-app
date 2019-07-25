import { format as dateFnsFormat } from "date-fns";
import { FiscalCode } from "../../definitions/backend/FiscalCode";
import { formatDateAsLocal } from "./dates";

/**
 * Generic utilities for profile
 */

// TODO: add voice related to
type FiscalCodeData = Readonly<{
  gender: "M" | "F";
  birthDate: ReturnType<typeof dateFnsFormat>;
}>;

//
export function extractFiscalCodeData(fiscalCode: FiscalCode): FiscalCodeData {
  const gender = parseInt(fiscalCode.substring(6, 7), 10) - 40 > 0 ? "F" : "M";
  const months: { [k: string]: number } = {
    ["A"]: 1,
    ["B"]: 2,
    ["C"]: 3,
    ["D"]: 4,
    ["E"]: 5,
    ["H"]: 6,
    ["L"]: 7,
    ["M"]: 8,
    ["P"]: 9,
    ["R"]: 10,
    ["S"]: 11,
    ["T"]: 12
  };
  // tslint:disable-next-line no-let
  let day = parseInt(fiscalCode.substring(9, 11), 10);
  day = day - 40 > 0 ? day - 40 : day;
  const year = parseInt(fiscalCode.substring(6, 8), 10);
  const month = months[fiscalCode.charAt(8)];
  // TODO: evaluate if date format should be the italian one or localized by language preference
  const birthDate = formatDateAsLocal(
    new Date(year, month - 1, day), // date month is indexed from index 0
    true,
    true
  );

  return {
    gender,
    birthDate
  };
}

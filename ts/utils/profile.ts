import { format, format as dateFnsFormat } from "date-fns";
import * as pot from "italia-ts-commons/lib/pot";
import { FiscalCode } from "../../definitions/backend/FiscalCode";
import { MunicipalityState } from "../store/reducers/content";

/**
 * Generic utilities for profile
 */
type FiscalCodeDerivedData = Readonly<{
  gender: "M" | "F";
  birthDate: ReturnType<typeof dateFnsFormat>;
  denominazione: string;
  siglaProvincia: string;
}>;

// Generate object including data expressed into the given fiscal code
export function extractFiscalCodeData(
  fiscalCode: FiscalCode,
  municipality: MunicipalityState
): FiscalCodeDerivedData {
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
  const birthDate = format(
    new Date(year, month - 1, day), // months are indexed from index 0
    "DD/MM/YYYY"
  );

  const siglaProvincia = pot.isSome(municipality.data)
    ? municipality.data.value.siglaProvincia
    : "";
  const denominazione = pot.isSome(municipality.data)
    ? municipality.data.value.codiceProvincia
    : "";

  return {
    gender,
    birthDate,
    siglaProvincia,
    denominazione
  };
}

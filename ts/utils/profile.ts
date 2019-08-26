import { format, format as dateFnsFormat } from "date-fns";
import * as pot from "italia-ts-commons/lib/pot";
import { FiscalCode } from "../../definitions/backend/FiscalCode";
import { MunicipalityState } from "../store/reducers/content";

type GenderType = "M" | "F" | undefined;

/**
 * Generic utilities for profile
 */
type FiscalCodeDerivedData = Readonly<{
  gender?: GenderType;
  birthDate?: ReturnType<typeof dateFnsFormat>;
  denominazione: string;
  siglaProvincia: string;
}>;

// Generate object including data expressed into the given fiscal code
export function extractFiscalCodeData(
  fiscalCode: FiscalCode,
  municipality: MunicipalityState
): FiscalCodeDerivedData {
  const siglaProvincia = pot.isSome(municipality.data)
    ? municipality.data.value.siglaProvincia
    : "";
  const denominazione = pot.isSome(municipality.data)
    ? municipality.data.value.denominazioneInItaliano
    : "";
  // tslint:disable-next-line: no-let
  let gender: GenderType;
  // tslint:disable-next-line: no-let
  let birthDate;
  if (!RegExp("^[0-9]+$").test(fiscalCode.substring(9, 11))) {
    return {
      gender,
      birthDate,
      siglaProvincia,
      denominazione
    };
  }

  const tempDay = parseInt(fiscalCode.substring(9, 11), 10);
  gender = tempDay - 40 > 0 ? "M" : "F";
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
  const month = months[fiscalCode.charAt(8)];

  if (
    !RegExp("^[0-9]+$").test(fiscalCode.substring(6, 8)) ||
    month === undefined
  ) {
    return {
      gender,
      birthDate,
      siglaProvincia,
      denominazione
    };
  }

  const day = tempDay - 40 > 0 ? tempDay - 40 : tempDay;
  const year = parseInt(fiscalCode.substring(6, 8), 10);
  birthDate = format(
    new Date(year, month - 1, day), // months are indexed from index 0
    "DD/MM/YYYY"
  );

  return {
    gender,
    birthDate,
    siglaProvincia,
    denominazione
  };
}

import { StatoBeneficiarioEnum } from "../../../../../definitions/cdc/StatoBeneficiario";
import { Anno } from "../../../../../definitions/cdc/Anno";
import { EsitoRichiesta } from "../../../../../definitions/cdc/EsitoRichiesta";
import { RichiestaCartaErrataMotivoEnum } from "../../../../../definitions/cdc/RichiestaCartaErrataMotivo";

export type CdcBonusRequest = {
  year: Anno;
  status: StatoBeneficiarioEnum;
};

export type CdcBonusRequestList = ReadonlyArray<CdcBonusRequest>;

export type CdcBonusEnrollment = {
  year: Anno;
};

export type CdcBonusEnrollmentList = ReadonlyArray<CdcBonusEnrollment>;

export type CdcBonusEnrollmentOutcome = {
  year: Anno;
  outcome: EsitoRichiesta;
};

export type CdcBonusEnrollmentOutcomeList =
  ReadonlyArray<CdcBonusEnrollmentOutcome>;

export type ResidentChoice = "italy" | "notItaly";

export type CdcSelectedBonus = {
  year: Anno;
  residence?: ResidentChoice;
};

export type CdcSelectedBonusList = ReadonlyArray<CdcSelectedBonus>;

/**
 * All the years for which the bonus is requested returns ok in the body (200)
 */
type CdcBonusRequestResponseCompleteSuccess = {
  kind: "success";
  value: CdcBonusEnrollmentOutcomeList;
};

/**
 * Not all the years for which the bonus is requested returns ok in the body (200)
 */
type CdcBonusRequestResponsePartialSuccess = {
  kind: "partialSuccess";
  value: CdcBonusEnrollmentOutcomeList;
};

/**
 * Validations not passed (400)
 */
type CdcBonusRequestResponseWrongFormat = {
  kind: "wrongFormat";
  reason?: RichiestaCartaErrataMotivoEnum;
};

/**
 * Union of all the success case
 */
export type CdcBonusRequestResponseSuccess =
  | CdcBonusRequestResponseCompleteSuccess
  | CdcBonusRequestResponsePartialSuccess;

/**
 * Union of all the error case
 */
export type CdcBonusRequestResponseFailure = CdcBonusRequestResponseWrongFormat;

/**
 * This type represents all the possible remote responses
 */
export type CdcBonusRequestResponse =
  | CdcBonusRequestResponseSuccess
  | CdcBonusRequestResponseWrongFormat;

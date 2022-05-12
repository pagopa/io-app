import { StatoBeneficiarioEnum } from "../../../../../definitions/cdc/StatoBeneficiario";
import { Anno } from "../../../../../definitions/cdc/Anno";
import { EsitoRichiesta } from "../../../../../definitions/cdc/EsitoRichiesta";

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

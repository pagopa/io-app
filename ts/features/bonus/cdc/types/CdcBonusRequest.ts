import { StatoBeneficiario } from "../../../../../definitions/cdc/StatoBeneficiario";
import { Anno } from "../../../../../definitions/cdc/Anno";

export type CdcBonusRequest = {
  year: Anno;
  status: StatoBeneficiario;
};

export type CdcBonusRequestList = ReadonlyArray<CdcBonusRequest>;

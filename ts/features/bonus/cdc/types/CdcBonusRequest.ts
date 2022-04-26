import { StatoBeneficiarioEnum } from "../../../../../definitions/cdc/StatoBeneficiario";
import { Anno } from "../../../../../definitions/cdc/Anno";

export type CdcBonusRequest = {
  year: Anno;
  status: StatoBeneficiarioEnum;
};

export type CdcBonusRequestList = ReadonlyArray<CdcBonusRequest>;

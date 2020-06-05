import * as pot from "italia-ts-commons/lib/pot";
import { canBonusVacanzeBeRequestedSelector } from "../bonusVacanzeActivation";

import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";
import { BonusActivation } from "../../../../../../definitions/bonus_vacanze/BonusActivation";
import { BonusActivationDsu } from "../../../../../../definitions/bonus_vacanze/BonusActivationDsu";
import { BonusActivationStatusEnum } from "../../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { EligibilityCheckSuccess } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckSuccess";
import { StatusEnum } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckSuccessEligible";
import { MaxBonusAmount } from "../../../../../../definitions/bonus_vacanze/MaxBonusAmount";
import { MaxBonusTaxBenefit } from "../../../../../../definitions/bonus_vacanze/MaxBonusTaxBenefit";

export const mockedElegibilityCheck: EligibilityCheckSuccess = {
  family_members: [
    {
      name: "Mario" as NonEmptyString,
      surname: "Rossi" as NonEmptyString,
      fiscal_code: "EFCMZZ80A12L720R" as FiscalCode
    },
    {
      name: "Giulia" as NonEmptyString,
      surname: "Rossi" as NonEmptyString,
      fiscal_code: "CDCMQQ81A12L721R" as FiscalCode
    },
    {
      name: "Piero" as NonEmptyString,
      surname: "Rossi" as NonEmptyString,
      fiscal_code: "ABCMYY82A12L722R" as FiscalCode
    }
  ],
  max_amount: 50000 as MaxBonusAmount,
  max_tax_benefit: 3000 as MaxBonusTaxBenefit,
  id: "d296cf6a-11f8-412b-972a-ede34d629680" as NonEmptyString,
  status: StatusEnum.ELIGIBLE,
  valid_before: new Date("2020-07-04T12:20:00.000Z")
};

export const bonus: BonusActivation = {
  id: "XYZ" as NonEmptyString,
  code: "ABCDE123XYZ" as NonEmptyString,
  applicant_fiscal_code: "ABCMYY82A12L722R" as FiscalCode,
  status: BonusActivationStatusEnum.ACTIVE,
  dsu_request: mockedElegibilityCheck as BonusActivationDsu,
  updated_at: new Date("2020-07-04T12:20:00.000Z")
};

describe("canBonusVacanzeBeRequestedSelector selector", () => {
  it("should return true when bonus doen't exist", () => {
    expect(
      canBonusVacanzeBeRequestedSelector().resultFunc(pot.none)
    ).toBeTruthy();
  });

  it("should return false when bonus exists and is active", () => {
    expect(
      canBonusVacanzeBeRequestedSelector().resultFunc(pot.some(bonus))
    ).toBeFalsy();
  });

  it("should return false when bonus exists and is consumed", () => {
    expect(
      canBonusVacanzeBeRequestedSelector().resultFunc(
        pot.some({ ...bonus, status: BonusActivationStatusEnum.CONSUMED })
      )
    ).toBeFalsy();
  });

  it("should return true when bonus exists and is voided", () => {
    expect(
      canBonusVacanzeBeRequestedSelector().resultFunc(
        pot.some({ ...bonus, status: BonusActivationStatusEnum.FAILED })
      )
    ).toBeTruthy();
  });
});

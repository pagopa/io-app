import * as pot from "italia-ts-commons/lib/pot";
import { canBonusVacanzeBeRequestedSelector } from "../bonusVacanzeActivation";
import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";
import { BonusActivationStatusEnum } from "../../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { BonusCode } from "../../../../../../definitions/bonus_vacanze/BonusCode";
import { Dsu } from "../../../../../../definitions/bonus_vacanze/Dsu";
import { MaxBonusAmount } from "../../../../../../definitions/bonus_vacanze/MaxBonusAmount";
import { MaxBonusTaxBenefit } from "../../../../../../definitions/bonus_vacanze/MaxBonusTaxBenefit";

const familyMembers: FamilyMembers = [
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
];

const dsuData: Dsu = {
  request_id: "request_id" as NonEmptyString,
  isee_type: "isee_id",
  dsu_protocol_id: "dsu_protocol_id" as NonEmptyString,
  dsu_created_at: "2020-05-25T00:00:00.000Z",
  has_discrepancies: false,
  family_members: familyMembers,
  max_amount: 499 as MaxBonusAmount,
  max_tax_benefit: 30 as MaxBonusTaxBenefit
};

export const bonus: BonusActivationWithQrCode = {
  id: "BONUS_ID" as BonusCode,
  applicant_fiscal_code: "SPNDNL80R11C522K" as FiscalCode,
  qr_code: [
    {
      mime_type: "image/png",
      content: "content"
    },
    {
      mime_type: "svg+xml",
      content: "content"
    }
  ],
  dsu_request: dsuData,
  created_at: new Date(),
  status: BonusActivationStatusEnum.ACTIVE
};

describe("canBonusVacanzeBeRequestedSelector selector", () => {
  it("should return true when bonus doen't exist", () => {
    expect(
      canBonusVacanzeBeRequestedSelector.resultFunc(pot.none)
    ).toBeTruthy();
  });

  it("should return false when bonus exists and is active", () => {
    expect(
      canBonusVacanzeBeRequestedSelector.resultFunc(pot.some(bonus))
    ).toBeFalsy();
  });

  it("should return false when bonus exists and is consumed", () => {
    expect(
      canBonusVacanzeBeRequestedSelector.resultFunc(
        pot.some({ ...bonus, status: BonusActivationStatusEnum.REDEEMED })
      )
    ).toBeFalsy();
  });

  it("should return true when bonus exists and is voided", () => {
    expect(
      canBonusVacanzeBeRequestedSelector.resultFunc(
        pot.some({ ...bonus, status: BonusActivationStatusEnum.FAILED })
      )
    ).toBeTruthy();
  });
});

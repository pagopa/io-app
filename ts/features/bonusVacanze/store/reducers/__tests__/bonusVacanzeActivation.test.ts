import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import * as pot from "italia-ts-commons/lib/pot";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import {
  BonusStatusEnum,
  BonusVacanze
} from "../../../types/bonusVacanzeActivation";
import { canBonusVacanzeBeRequestedSelector } from "../bonusVacanzeActivation";

const bonus: BonusVacanze = {
  id: "XYZ",
  code: "ABCDE123XYZ",
  applicant_fiscal_code: "ABCMYY82A12L722R" as FiscalCode,
  status: BonusStatusEnum.ACTIVE,
  qr_code: [
    {
      mime_type: "svg+xml",
      base64_content: "content"
    },
    {
      mime_type: "image/png",
      base64_content: "content"
    }
  ],
  max_amount: 50000 as NonNegativeInteger,
  max_tax_benefit: 3000 as NonNegativeInteger,
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
        pot.some({ ...bonus, status: BonusStatusEnum.CONSUMED })
      )
    ).toBeFalsy();
  });

  it("should return true when bonus exists and is voided", () => {
    expect(
      canBonusVacanzeBeRequestedSelector().resultFunc(
        pot.some({ ...bonus, status: BonusStatusEnum.VOIDED })
      )
    ).toBeTruthy();
  });

  it("should return true when bonus exists and is failed", () => {
    expect(
      canBonusVacanzeBeRequestedSelector().resultFunc(
        pot.some({ ...bonus, status: BonusStatusEnum.FAILED })
      )
    ).toBeTruthy();
  });
});

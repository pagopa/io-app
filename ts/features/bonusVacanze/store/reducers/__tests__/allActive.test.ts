import * as pot from "italia-ts-commons/lib/pot";
import {
  EmailString,
  FiscalCode,
  NonEmptyString
} from "italia-ts-commons/lib/strings";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";
import { Version } from "../../../../../../definitions/backend/Version";
import { BonusActivationStatusEnum } from "../../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { mockedBonus } from "../../../mock/mockData";
import { ownedActiveBonus } from "../allActive";

const fiscalCode = "ABCDEF83A12L719R" as FiscalCode;
const profile: InitializedProfile = {
  has_profile: true,
  is_inbox_enabled: true,
  is_webhook_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  email: "test@example.com" as EmailString,
  spid_email: "test@example.com" as EmailString,
  family_name: "Connor",
  name: "John",
  fiscal_code: fiscalCode,
  spid_mobile_phone: "123" as NonEmptyString,
  version: 1 as Version
};

const potProfile = pot.some(profile);
const bonusDifferentApplicant = pot.some({
  ...mockedBonus,
  status: BonusActivationStatusEnum.ACTIVE,
  applicant_fiscal_code: "XXXTT83A12L7XXX" as FiscalCode
});

describe("ownedActiveBonus", () => {
  it("should return an empty array", () => {
    expect(ownedActiveBonus.resultFunc([], potProfile)).toStrictEqual([]);
  });

  it("should return an empty array", () => {
    expect(
      ownedActiveBonus.resultFunc(
        [pot.none, pot.none, pot.noneError(new Error("some error"))],
        potProfile
      )
    ).toStrictEqual([]);
  });

  it("should return an empty array (different applicant)", () => {
    expect(
      ownedActiveBonus.resultFunc([bonusDifferentApplicant], potProfile)
    ).toStrictEqual([]);
  });

  it("should return an empty array (status !== ACTIVE)", () => {
    const bonusRedeemed = pot.some({
      ...mockedBonus,
      status: BonusActivationStatusEnum.REDEEMED,
      applicant_fiscal_code: fiscalCode
    });
    expect(
      ownedActiveBonus.resultFunc([bonusRedeemed], potProfile)
    ).toStrictEqual([]);
  });

  it("should return the active bonus", () => {
    const bonusActive = pot.some({
      ...mockedBonus,
      status: BonusActivationStatusEnum.ACTIVE,
      applicant_fiscal_code: fiscalCode
    });
    expect(
      ownedActiveBonus.resultFunc(
        [bonusDifferentApplicant, bonusActive],
        potProfile
      )
    ).toStrictEqual([bonusActive.value]);
  });
});

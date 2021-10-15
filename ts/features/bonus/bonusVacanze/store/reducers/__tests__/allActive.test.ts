import * as pot from "italia-ts-commons/lib/pot";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { BonusActivationStatusEnum } from "../../../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusCode } from "../../../../../../../definitions/bonus_vacanze/BonusCode";
import mockedProfile from "../../../../../../__mocks__/initializedProfile";
import { mockedBonus } from "../../../__mock__/mockData";
import { ownedActiveOrRedeemedBonus } from "../allActive";

const fiscalCode = "ABCDEF83A12L719R" as FiscalCode;

const potProfile = pot.some(mockedProfile);
const bonusDifferentApplicant = pot.some({
  ...mockedBonus,
  status: BonusActivationStatusEnum.ACTIVE,
  applicant_fiscal_code: "XXXTT83A12L7XXX" as FiscalCode
});
const bonusActive = pot.some({
  ...mockedBonus,
  status: BonusActivationStatusEnum.ACTIVE,
  applicant_fiscal_code: fiscalCode
});

const bonusRedeemed = pot.some({
  ...mockedBonus,
  status: BonusActivationStatusEnum.REDEEMED,
  applicant_fiscal_code: fiscalCode
});

describe("ownedActiveOrRedeemedBonus", () => {
  it("should return an empty array", () => {
    expect(ownedActiveOrRedeemedBonus.resultFunc([], potProfile)).toStrictEqual(
      []
    );
  });

  it("should return an empty array", () => {
    expect(
      ownedActiveOrRedeemedBonus.resultFunc(
        [pot.none, pot.none, pot.noneError(new Error("some error"))],
        potProfile
      )
    ).toStrictEqual([]);
  });

  it("should return an empty array (different applicant)", () => {
    expect(
      ownedActiveOrRedeemedBonus.resultFunc(
        [bonusDifferentApplicant],
        potProfile
      )
    ).toStrictEqual([]);
  });

  it("should return the bonus redeemed", () => {
    expect(
      ownedActiveOrRedeemedBonus.resultFunc([bonusRedeemed], potProfile)
    ).toStrictEqual([bonusRedeemed.value]);
  });

  it("should return the bonus redeemed and active", () => {
    expect(
      ownedActiveOrRedeemedBonus.resultFunc(
        [bonusRedeemed, bonusActive],
        potProfile
      )
    ).toStrictEqual([bonusRedeemed.value, bonusActive.value]);
  });

  it("should return the bonus redeemed and active", () => {
    expect(
      ownedActiveOrRedeemedBonus.resultFunc(
        [bonusRedeemed, bonusActive, pot.none, bonusDifferentApplicant],
        potProfile
      )
    ).toStrictEqual([bonusRedeemed.value, bonusActive.value]);
  });

  it("should return an empty array (status !== ACTIVE|REDEEMED)", () => {
    const bonusProcessing = pot.some({
      ...mockedBonus,
      status: BonusActivationStatusEnum.PROCESSING,
      applicant_fiscal_code: fiscalCode
    });
    expect(
      ownedActiveOrRedeemedBonus.resultFunc([bonusProcessing], potProfile)
    ).toStrictEqual([]);
  });

  it("should return the active bonus", () => {
    expect(
      ownedActiveOrRedeemedBonus.resultFunc(
        [bonusDifferentApplicant, bonusActive],
        potProfile
      )
    ).toStrictEqual([bonusActive.value]);
  });

  it("should return the active bonus", () => {
    expect(
      ownedActiveOrRedeemedBonus.resultFunc(
        [bonusDifferentApplicant, bonusActive, pot.none],
        potProfile
      )
    ).toStrictEqual([bonusActive.value]);
  });

  it("should return the active bonus(2)", () => {
    const anotherBonusActive = pot.some({
      ...bonusActive.value,
      id: "XYZ" as BonusCode
    });
    expect(
      ownedActiveOrRedeemedBonus.resultFunc(
        [bonusDifferentApplicant, bonusActive, anotherBonusActive, pot.none],
        potProfile
      )
    ).toStrictEqual([bonusActive.value, anotherBonusActive.value]);
  });
});

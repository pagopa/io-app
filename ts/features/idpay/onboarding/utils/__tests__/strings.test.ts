import I18n from "i18next";
import { CodeEnum } from "../../../../../../definitions/idpay/AutomatedCriteriaDTO";
import { getPDNDCriteriaValueString } from "../strings";

describe("getPDNDCriteriaValueString", () => {
  it("returns correct string for ISEE value", () => {
    const tAmountCents = 1000;
    const tAmountDecimal = tAmountCents / 100;
    const tString = `${new Intl.NumberFormat(I18n.language, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(tAmountDecimal)} €`;
    const result = getPDNDCriteriaValueString(
      CodeEnum.ISEE,
      tAmountCents.toString()
    );
    expect(result).toStrictEqual(tString);
  });
  it("returns default value for malformed ISEE value", () => {
    const result = getPDNDCriteriaValueString(
      CodeEnum.ISEE,
      "Not a number, lol"
    );
    expect(result).toStrictEqual("-");
  });
  it("returns correct string for BIRTHDAY value", () => {
    const tYear = 1993;
    const tString = tYear.toString();
    const result = getPDNDCriteriaValueString(
      CodeEnum.BIRTHDAY,
      tYear.toString()
    );
    expect(result).toStrictEqual(tString);
  });
  it("returns correct string for RESIDENCE value", () => {
    const tCountry = "Italia";
    const result = getPDNDCriteriaValueString(CodeEnum.RESIDENCE, tCountry);
    expect(result).toStrictEqual(tCountry);
  });
  it("returns default value for undefined value", () => {
    const result = getPDNDCriteriaValueString(CodeEnum.RESIDENCE, undefined);
    expect(result).toStrictEqual("-");
  });
});

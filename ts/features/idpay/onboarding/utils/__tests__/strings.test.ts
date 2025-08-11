import { CodeEnum } from "../../../../../../definitions/idpay/AutomatedCriteriaDTO";
import I18n from "../../../../../i18n";
import { getPDNDCriteriaValueString } from "../strings";

describe("getPDNDCriteriaValueString", () => {
  it("returns correct string for ISEE value", () => {
    const tAmountCents = 1000;
    const tAmountDecimal = tAmountCents / 100;
    const tString = I18n.toCurrency(tAmountDecimal, {
      precision: 2,
      delimiter: I18n.t("global.localization.delimiterSeparator"),
      separator: I18n.t("global.localization.decimalSeparator"),
      format: "%n €"
    });
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

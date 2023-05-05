import { CodeEnum } from "../../../../../../definitions/idpay/PDNDCriteriaDTO";
import I18n from "../../../../../i18n";
import { getPDNDCriteriaValueString } from "../strings";

describe("getPDNDCriteriaValueString", () => {
  it("returns correct string for ISEE value", () => {
    const tAmount = 1000;
    const tString = I18n.toCurrency(tAmount, {
      precision: 2,
      delimiter: I18n.t("global.localization.delimiterSeparator"),
      separator: I18n.t("global.localization.decimalSeparator"),
      format: "%n €"
    });
    const result = getPDNDCriteriaValueString(
      CodeEnum.ISEE,
      tAmount.toString()
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
  it("returns correct string for BIRTHDATE value", () => {
    const tYear = 1993;
    const tString = tYear.toString();
    const result = getPDNDCriteriaValueString(
      CodeEnum.BIRTHDATE,
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

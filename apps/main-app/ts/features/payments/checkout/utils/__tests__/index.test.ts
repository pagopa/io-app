import {
  getPaymentPhaseFromStep,
  getPspFlagType,
  getSubCategoryFromFaultCode,
  formatAndValidateDueDate,
  trimAndLimitValue
} from "..";
import { ZendeskSubCategoriesMap } from "../../../../../../definitions/content/ZendeskSubCategoriesMap";
import { WalletPaymentStepEnum } from "../../types";

const mockCategories: ZendeskSubCategoriesMap = {
  subcategories: {
    "12345": ["subcategory1"],
    "67890": ["subcategory2"]
  },
  subcategoryId: "313"
};

describe("trimAndLimitValue", () => {
  it("should remove all spaces from the string", () => {
    const input = "a b c d e";
    const result = trimAndLimitValue(input, 10);
    expect(result).toBe("abcde");
  });

  it("should limit the string to the maximum length", () => {
    const input = "abcdefghij";
    const result = trimAndLimitValue(input, 5);
    expect(result).toBe("abcde");
  });

  it("should return the string as is if under the maximum length", () => {
    const input = "abcde";
    const result = trimAndLimitValue(input, 10);
    expect(result).toBe("abcde");
  });

  it("should both trim spaces and limit the string to the maximum length", () => {
    const input = "a b c d e f g";
    const result = trimAndLimitValue(input, 5);
    expect(result).toBe("abcde");
  });

  it("should return an empty string when input is an empty string", () => {
    const input = "";
    const result = trimAndLimitValue(input, 5);
    expect(result).toBe("");
  });

  it("should handle strings with only spaces", () => {
    const input = "     ";
    const result = trimAndLimitValue(input, 5);
    expect(result).toBe("");
  });
});

describe("formatAndValidateDueDate", () => {
  it("should return the formatted date when the date is valid", () => {
    const date = "2021-12-31";
    const result = formatAndValidateDueDate(date);
    expect(result).toBe("31/12/2021");
  });

  it("should return undefined when the date is invalid", () => {
    const date = "invalid date";
    const result = formatAndValidateDueDate(date);
    expect(result).toBeUndefined();
  });

  it("should return undefined when the date is more than 10 years in the future", () => {
    const date = "5000-12-31";
    const result = formatAndValidateDueDate(date);
    expect(result).toBeUndefined();
  });

  it("should return undefined when the date is after 10 years in the future", () => {
    const tenYearsFromNow = new Date();
    tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
    tenYearsFromNow.setHours(tenYearsFromNow.getHours() + 1);
    const result = formatAndValidateDueDate(tenYearsFromNow.toISOString());
    expect(result).toBeUndefined();
  });
});

describe("getPspFlagType", () => {
  it("should return 'none' when pspList is undefined", () => {
    const psp = { onUs: false, idBundle: "1" };
    const result = getPspFlagType(psp);
    expect(result).toBe("none");
  });

  it("should return 'customer' when psp.onUs is true and pspList is not empty", () => {
    const psp = { onUs: true, idBundle: "1" };
    const result = getPspFlagType(psp, [
      { onUs: true, taxPayerFee: 1, idBundle: "1" }
    ]);
    expect(result).toBe("customer");
  });

  it("should return 'none' when pspList is empty", () => {
    const psp = { onUs: true, idBundle: "1" };
    const result = getPspFlagType(psp, []);
    expect(result).toBe("none");
  });

  it("should return 'unique' when pspList has only one element", () => {
    const psp = { onUs: false, idBundle: "1" };
    const pspList = [psp];
    const result = getPspFlagType(psp, pspList);
    expect(result).toBe("unique");
  });

  it("should return 'cheaper' when psp is the cheapest in pspList", () => {
    const psp = { onUs: false, taxPayerFee: 1, idBundle: "1" };
    const pspList = [
      { onUs: false, taxPayerFee: 1, idBundle: "1" },
      { onUs: false, idBundle: "2", taxPayerFee: 2 },
      { onUs: false, idBundle: "3", taxPayerFee: 3 }
    ];
    const result = getPspFlagType(psp, pspList);
    expect(result).toBe("cheaper");
  });

  it("should return 'none' when psp is not the cheapest in pspList", () => {
    const psp = { onUs: false, idBundle: "2", taxPayerFee: 2 };
    const pspList = [
      { onUs: false, idBundle: "1", taxPayerFee: 1 },
      { onUs: false, idBundle: "3", taxPayerFee: 3 }
    ];
    const result = getPspFlagType(psp, pspList);
    expect(result).toBe("none");
  });
});

describe("getPaymentPhaseFromStep", () => {
  it("should return 'attiva' for PICK_PAYMENT_METHOD and PICK_PSP steps", () => {
    const result1 = getPaymentPhaseFromStep(
      WalletPaymentStepEnum.PICK_PAYMENT_METHOD
    );
    const result2 = getPaymentPhaseFromStep(WalletPaymentStepEnum.PICK_PSP);
    expect(result1).toBe("attiva");
    expect(result2).toBe("attiva");
  });

  it("should return 'pagamento' for CONFIRM_TRANSACTION step", () => {
    const result = getPaymentPhaseFromStep(
      WalletPaymentStepEnum.CONFIRM_TRANSACTION
    );
    expect(result).toBe("pagamento");
  });

  it("should return 'verifica' for any other step", () => {
    const result = getPaymentPhaseFromStep(WalletPaymentStepEnum.NONE);
    expect(result).toBe("verifica");
  });
});

describe("getSubCategoryFromFaultCode", () => {
  it("should return the subcategory if the fault code is in the map", () => {
    const result = getSubCategoryFromFaultCode(mockCategories, "subcategory1");
    expect(result).toStrictEqual({
      value: "12345",
      zendeskSubCategoryId: "313"
    });
  });

  it("should return nullable if the fault code is not in the map or is empty string", () => {
    const result = getSubCategoryFromFaultCode(mockCategories, "subcategory3");
    expect(result).toStrictEqual(null);

    const emptyResult = getSubCategoryFromFaultCode(mockCategories, "");
    expect(emptyResult).toStrictEqual(null);
  });
});

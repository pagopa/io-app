import { format } from "date-fns";
import { getSortedPspList, isPaymentMethodExpired } from "..";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";

describe("isPaymentMethodExpired", () => {
  it("should return true if payment method is expired", () => {
    const result = isPaymentMethodExpired({ expiryDate: "202103" });
    expect(result).toBeTruthy();
  });
  it("should return false if payment method expires this month", () => {
    const result = isPaymentMethodExpired({
      expiryDate: format(new Date(), "yyyyMM")
    });
    expect(result).toBeFalsy();
  });
  it("should return false if payment method expires in the future", () => {
    const now = new Date();
    const result = isPaymentMethodExpired({
      expiryDate: format(
        new Date(now.getFullYear() + 2, now.getMonth()),
        "yyyyMM"
      )
    });
    expect(result).toBeFalsy();
  });
});

describe("getSortedPspList", () => {
  const CHEAPER_VALUE = 123;
  const MIDDLE_VALUE = 456;
  const EXPENSIVE_VALUE = 789;
  const MOCKED_PSP_LIST: ReadonlyArray<Bundle> = [
    {
      idPsp: "1",
      abi: "01010",
      pspBusinessName: "BANCO di NAPOLI",
      taxPayerFee: CHEAPER_VALUE,
      primaryCiIncurredFee: CHEAPER_VALUE,
      idBundle: "A"
    },
    {
      idPsp: "2",
      abi: "01015",
      pspBusinessName: "Banco di Sardegna",
      taxPayerFee: MIDDLE_VALUE,
      primaryCiIncurredFee: MIDDLE_VALUE,
      idBundle: "B",
      onUs: true
    },
    {
      idPsp: "3",
      abi: "03015",
      pspBusinessName: "FINECO",
      taxPayerFee: EXPENSIVE_VALUE,
      primaryCiIncurredFee: EXPENSIVE_VALUE,
      idBundle: "C"
    }
  ];

  it("should return as first element the element with onUs flag if default sorting", () => {
    const result = getSortedPspList(MOCKED_PSP_LIST, "default");
    expect(result[0].onUs).toBe(true);
  });

  it("should return the list by amount from the cheaper to the more expensive if amount sorting", () => {
    const result = getSortedPspList(MOCKED_PSP_LIST, "amount");
    expect(result[0].taxPayerFee).toBe(CHEAPER_VALUE);
    expect(result[1].taxPayerFee).toBe(MIDDLE_VALUE);
    expect(result[2].taxPayerFee).toBe(EXPENSIVE_VALUE);
  });

  it("should return the list sorted by name if name sorting", () => {
    const result = getSortedPspList(MOCKED_PSP_LIST, "name");
    expect(result[0].pspBusinessName).toBe("BANCO di NAPOLI");
    expect(result[1].pspBusinessName).toBe("Banco di Sardegna");
    expect(result[2].pspBusinessName).toBe("FINECO");
  });

  it("should return the exact same list if default sorting and not present the onUs flag", () => {
    const MOCKED_PSP_LIST_WITHOUT_ONUS = MOCKED_PSP_LIST.map(psp => {
      const { onUs, ...rest } = psp;
      return rest;
    });
    const result = getSortedPspList(MOCKED_PSP_LIST_WITHOUT_ONUS, "default");
    expect(result).toEqual(MOCKED_PSP_LIST_WITHOUT_ONUS);
  });
});

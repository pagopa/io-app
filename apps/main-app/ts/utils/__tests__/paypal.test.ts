import I18n from "i18next";
import { pspAccountList } from "../__mocks__/paypalAccountPsp";
import { PayPalInfo } from "../../../definitions/pagopa/PayPalInfo";
import { getPaypalAccountEmail } from "../paypal";

const payPalInfo: PayPalInfo = { pspInfo: pspAccountList };
const notAvailable = I18n.t("wallet.onboarding.paypal.emailNotAvailable");
const testCases: ReadonlyArray<
  [input: PayPalInfo, expectedResult: string | undefined]
> = [
  [payPalInfo, "email1@email.it"],
  [{ ...payPalInfo, pspInfo: [] }, notAvailable],
  [
    {
      ...payPalInfo,
      pspInfo: payPalInfo.pspInfo.map(p => ({ ...p, default: false }))
    },
    notAvailable
  ],
  [
    {
      ...payPalInfo,
      pspInfo: payPalInfo.pspInfo.map(p => ({ ...p, default: true }))
    },
    "email1@email.it"
  ],
  [
    {
      ...payPalInfo,
      pspInfo: [
        { ...pspAccountList[0], default: false },
        { ...pspAccountList[1], default: true }
      ]
    },
    "email2@email.it"
  ]
];

describe("getPaypalAccountEmail", () => {
  test.each(testCases)(
    "given %p as argument, returns %p",
    (firstArg, expectedResult) => {
      const result = getPaypalAccountEmail(firstArg);
      expect(result).toEqual(expectedResult);
    }
  );
});

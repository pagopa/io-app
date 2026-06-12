import { PayPalAccountPspInfo } from "../../../definitions/pagopa/PayPalAccountPspInfo";

export const pspAccountList: ReadonlyArray<PayPalAccountPspInfo> = [
  {
    abi: "03110",
    default: true,
    email: "email1@email.it",
    ragioneSociale: "PayPal - psp - test 1"
  },
  {
    abi: "03111",
    default: false,
    email: "email2@email.it",
    ragioneSociale: "PayPal - psp - test 2"
  }
];

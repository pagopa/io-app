import { BPay } from "../../../../../../../../definitions/pagopa/BPay";

export const bPayAttMock: BPay = {
  bankName: "Bank Name",
  instituteCode: "123",
  numberObfuscated: "+3934*****123",
  paymentInstruments: [],
  serviceState: "ATT",
  uidHash: "uidHash"
};

export const bPayDisMock: BPay = {
  bankName: "Bank Name",
  instituteCode: "123",
  numberObfuscated: "+3934*****123",
  paymentInstruments: [],
  serviceState: "DIS",
  uidHash: "uidHash"
};

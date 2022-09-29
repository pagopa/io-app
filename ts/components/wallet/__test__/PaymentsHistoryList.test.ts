import * as O from "fp-ts/lib/Option";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { IPatternStringTag } from "@pagopa/ts-commons/lib/strings";

import { PaymentHistory } from "../../../store/reducers/payments/history";
import { isPaymentDoneSuccessfully } from "../../../store/reducers/payments/utils";
import { paymentVerificaResponseWithMessage as verifiedData } from "../../../__mocks__/paymentPayloads";

const data: RptId = {
  organizationFiscalCode: "01199250158" as string &
    IPatternStringTag<"^[0-9]{11}$">,
  paymentNoticeNumber: {
    applicationCode: "12" as string & IPatternStringTag<"[0-9]{2}">,
    auxDigit: "0",
    checkDigit: "19" as string & IPatternStringTag<"[0-9]{2}">,
    iuv13: "3456789999999" as string & IPatternStringTag<"[0-9]{13}">
  }
};

// a successful payment
const paymentHistorySuccess: PaymentHistory = {
  started_at: "2020-04-16T13:59:19.031Z",
  data,
  paymentId: "ca7d9be4-7da1-442d-92c6-d403d7361f65",
  transaction: {
    id: 7090047996,
    created: new Date("2020-02-07T08:43:38.000Z"),
    updated: new Date("2020-02-07T08:43:38.000Z"),
    amount: {
      currency: "EUR",
      amount: 1,
      decimalDigits: 2
    },
    grandTotal: {
      currency: "EUR",
      amount: 51,
      decimalDigits: 2
    },
    description: "/RFB/719094842555711/0.01/TXT/Avviso di prova app IO",
    merchant: "Comune di Milano",
    idStatus: 3,
    statusMessage: "Confermato",
    error: false,
    success: true,
    fee: {
      currency: "EUR",
      amount: 50,
      decimalDigits: 2
    },
    token: "NzA5MDA0ODAwOQ==",
    idWallet: 38404,
    idPsp: 401164,
    idPayment: 71160,
    nodoIdPayment: "375daf96-d8e6-42fb-b095-4e3c270923ad",
    spcNodeStatus: 0,
    accountingStatus: 1,
    authorizationCode: "00",
    orderNumber: 7090048009,
    rrn: "200380002021",
    numAut: "431061"
  },
  verifiedData,
  startOrigin: "message"
};

// an incomplete payment
const paymentHistoryIncomplete: PaymentHistory = {
  started_at: "2020-04-16T13:59:19.031Z",
  data,
  paymentId: "ca7d9be4-7da1-442d-92c6-d403d7361f65",
  verifiedData,
  startOrigin: "message"
};

// a failed payment
const paymentHistoryFailed: PaymentHistory = {
  data: {
    paymentNoticeNumber: {
      auxDigit: "3",
      checkDigit: "37" as string & IPatternStringTag<"[0-9]{2}">,
      iuv13: "0000000004976" as string & IPatternStringTag<"[0-9]{13}">,
      segregationCode: "02" as string & IPatternStringTag<"[0-9]{2}">
    },
    organizationFiscalCode: "00122230196" as string &
      IPatternStringTag<"^[0-9]{11}$">
  },
  started_at: "2020-04-05T15:51:16.237Z",
  failure: "PPT_DOMINIO_SCONOSCIUTO",
  startOrigin: "message"
};

describe("test the checkPaymentOutcome function", () => {
  it("the first test must show the payment status as Success, because paymentState and transactionState exist", () => {
    expect(isPaymentDoneSuccessfully(paymentHistorySuccess)).toEqual(
      O.some(true)
    );
  });

  it("the second test must show the payment status as Failed, because paymentState and transactionState do not exist", () => {
    expect(isPaymentDoneSuccessfully(paymentHistoryFailed)).toEqual(
      O.some(false)
    );
  });

  it("the last test must show the payment status as Incomplete, because only paymentState is set and transactionState is undefined or set to false", () => {
    expect(isPaymentDoneSuccessfully(paymentHistoryIncomplete)).toEqual(O.none);
  });
});

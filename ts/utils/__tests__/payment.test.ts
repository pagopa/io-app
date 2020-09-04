/* eslint-disable */

import { isSome, none, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";

import { Tuple2 } from "italia-ts-commons/lib/tuples";
import { PaymentAmount } from "../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../definitions/backend/PaymentNoticeNumber";
import { Transaction } from "../../types/pagopa";
import {
  cleanTransactionDescription,
  getTransactionFee,
  getTransactionIUV
} from "../payment";
import {
  decodePagoPaQrCode,
  getAmountFromPaymentAmount,
  getRptIdFromNoticeNumber
} from "../payment";
import I18n from "react-native-i18n";

describe("getAmountFromPaymentAmount", () => {
  const aPaymentAmount = PaymentAmount.decode(1).value as PaymentAmount;
  it("should convert a valid PaymentAmount into an AmountInEuroCents", () => {
    const amountInEuroCents = getAmountFromPaymentAmount(aPaymentAmount);
    expect(isSome(amountInEuroCents)).toBeTruthy();
    if (isSome(amountInEuroCents)) {
      expect(amountInEuroCents.value).toEqual("01" as AmountInEuroCents);
    }
  });
});

describe("getRptIdFromNoticeNumber", () => {
  const anOrganizationFiscalCode = OrganizationFiscalCode.decode("00000123456")
    .value as OrganizationFiscalCode;
  const aNoticeNumber = PaymentNoticeNumber.decode("002160020399398578")
    .value as PaymentNoticeNumber;
  const anRptId = RptId.decode({
    organizationFiscalCode: "00000123456",
    paymentNoticeNumber: {
      applicationCode: "02",
      auxDigit: "0",
      checkDigit: "78",
      iuv13: "1600203993985"
    }
  }).value as RptId;
  it("should convert a PaymentNoticeNumber into an RptId", () => {
    const rptId = getRptIdFromNoticeNumber(
      anOrganizationFiscalCode,
      aNoticeNumber
    );
    expect(isSome(rptId)).toBeTruthy();
    if (isSome(rptId)) {
      expect(rptId.value).toEqual(anRptId);
    }
  });
});

describe("cleanTransactionDescription", () => {
  it("should remove the tag returning just the description", () => {
    [
      [
        "/RFB/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "RFB/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "/RFA/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "RFA/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "RFS/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "/RFS/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "/RFS/0123456789012/666.98/TXT/ actual description/other text",
        "actual description/other text"
      ],
      [
        "/RFB/000001234556859/143.00",
        `${I18n.t("payment.IUV_extended")} (${I18n.t(
          "payment.IUV"
        )}) 000001234556859`
      ],
      ["/XYZ/TXT/some text", "some text"],
      ["/TXT/some text", "some text"],
      ["TXT/some text", "some text"],
      ["/TXT/some text/other text", "some text/other text"],
      ["TXT/some text/other text", "some text/other text"],
      ["actual description", "actual description"]
    ].forEach(([dirty, cleaned]) => {
      expect(cleanTransactionDescription(dirty)).toEqual(cleaned);
    });
  });
});

describe("decodePagoPaQrCode", () => {
  it("should decode a string encoded into a pagoPa QRcode", () => {
    [
      Tuple2(
        "PAGOPA|002|322201151398574181|81005750021|01",
        some(
          Tuple2(
            {
              organizationFiscalCode: "81005750021",
              paymentNoticeNumber: {
                auxDigit: "3",
                checkDigit: "81",
                iuv13: "2011513985741",
                segregationCode: "22"
              }
            },
            "01"
          )
        )
      ),
      // not supported version
      Tuple2("PAGOPA|003|322201151398574181|810057500211|01A", none),
      // invalid amount
      Tuple2("PAGOPA|002|322201151398574181|810057500211|01A", none),
      // invalid header
      Tuple2("PAPAGO|002|322201151398574181|810057500211|01", none),
      // this is valid
      Tuple2(
        "PAGOPA|002|322201151398574181|81005750021|1",
        some(
          Tuple2(
            {
              organizationFiscalCode: "81005750021",
              paymentNoticeNumber: {
                auxDigit: "3",
                checkDigit: "81",
                iuv13: "2011513985741",
                segregationCode: "22"
              }
            },
            "1"
          )
        )
      ),
      // invalid organization fiscal code (12 digit instead of 11)
      Tuple2("PAGOPA|002|322201151398574181|810057500211|01", none)
    ].forEach(tuple => {
      expect(decodePagoPaQrCode(tuple.e1)).toEqual(tuple.e2);
    });
  });
});

const mockTranction: Transaction = {
  accountingStatus: 1,
  amount: { amount: 20000 },
  created: new Date(2018, 10, 30, 13, 12, 22, 30),
  description: `hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world`,
  error: false,
  fee: { amount: 123 },
  grandTotal: { amount: 32100 },
  id: 1,
  idPayment: 1,
  idPsp: 43188,
  idStatus: 3,
  idWallet: 12345,
  merchant: "merchant",
  nodoIdPayment: "nodoIdPayment",
  paymentModel: 5,
  spcNodeDescription: "spcNodeDescription",
  spcNodeStatus: 6,
  statusMessage: "statusMessage",
  success: true,
  token: "token",
  updated: undefined,
  urlCheckout3ds: "urlCheckout3ds",
  urlRedirectPSP: "urlRedirectPSP"
};

describe("getTransactionFee", () => {
  [
    Tuple2(mockTranction, `${123}`),
    Tuple2({ ...mockTranction, fee: undefined }, null),
    Tuple2({ ...mockTranction, fee: { amount: 54321 } }, `${54321}`),
    Tuple2({ ...mockTranction, fee: { amount: 0 } }, `${0}`)
  ].forEach(tuple => {
    expect(getTransactionFee(tuple.e1, f => `${f}`)).toEqual(tuple.e2);
  });
});

describe("getTransactionIUV", () => {
  [
    Tuple2(
      "/RFB/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      some("02000000000495213")
    ),
    Tuple2(
      "RFB/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      some("02000000000495213")
    ),
    Tuple2(
      "/RFA/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      some("02000000000495213")
    ),
    Tuple2(
      "RFA/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      some("02000000000495213")
    ),
    Tuple2(
      "/RFS/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      some("02000000000495213")
    ),
    Tuple2(
      "RFS/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      some("02000000000495213")
    ),
    Tuple2("", none),
    Tuple2("RFC/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION", none),
    Tuple2("RFB/", none)
  ].forEach(tuple => {
    expect(getTransactionIUV(tuple.e1)).toEqual(tuple.e2);
  });
});

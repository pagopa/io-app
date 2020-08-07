// tslint:disable:no-useless-cast

import { isSome, none, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";

import { Tuple2 } from "italia-ts-commons/lib/tuples";
import { PaymentAmount } from "../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../definitions/backend/PaymentNoticeNumber";
import { cleanTransactionDescription } from "../payment";
import {
  decodePagoPaQrCode,
  getAmountFromPaymentAmount,
  getRptIdFromNoticeNumber
} from "../payment";

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
      // invalid organization fiscal code (12 digit instead of 11)
      Tuple2("PAGOPA|002|322201151398574181|810057500211|01", none)
    ].forEach(tuple => {
      expect(decodePagoPaQrCode(tuple.e1)).toEqual(tuple.e2);
    });
  });
});

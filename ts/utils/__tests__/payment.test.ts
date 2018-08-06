// tslint:disable:no-useless-cast

import { isSome } from "fp-ts/lib/Option";

import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";

import { PaymentAmount } from "../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../definitions/backend/PaymentNoticeNumber";

import {
  getAmountFromPaymentAmount,
  getRptIdFromNoticeNumber
} from "../payment";

describe("getAmountFromPaymentAmount", () => {
  const aPaymentAmount = PaymentAmount.decode(1).value as PaymentAmount;
  it("should convert a valid PaymentAmount into an AmountInEuroCents", () => {
    const amountInEuroCents = getAmountFromPaymentAmount(aPaymentAmount);
    expect(isSome(amountInEuroCents)).toBeTruthy();
    if (isSome(amountInEuroCents)) {
      expect(amountInEuroCents.value).toEqual("1" as AmountInEuroCents);
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

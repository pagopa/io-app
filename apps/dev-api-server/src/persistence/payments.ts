import { fakerIT as faker } from "@faker-js/faker";
import { PaymentAmount } from "@io-app/api-types/generated/definitions/communication/PaymentAmount";
import { PaymentDataWithRequiredPayee } from "@io-app/api-types/generated/definitions/communication/PaymentDataWithRequiredPayee";
import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { PaymentInfoResponse } from "@io-app/api-types/generated/definitions/communication/PaymentInfoResponse";
import { PaymentNoticeNumber } from "@io-app/api-types/generated/definitions/communication/PaymentNoticeNumber";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import {
  PaymentStatus,
  processablePayment,
  processedPayment
} from "../types/PaymentStatus";
import { getRandomIntInRange } from "../utils/id";
import {
  detailV2EnumToPaymentProblemJSON,
  rptIdFromPaymentDataWithRequiredPayee
} from "../utils/payment";
import { decodePayload } from "../utils/validator";

const paymentData = new Map<string, PaymentDataWithRequiredPayee>();
const paymentStatuses = new Map<string, PaymentStatus>();

const addOrUpdatePayment = (
  paymentDataWithRequiredPayee: PaymentDataWithRequiredPayee
): PaymentDataWithRequiredPayee =>
  pipe(
    rptIdFromPaymentDataWithRequiredPayee(paymentDataWithRequiredPayee),
    rptId => paymentData.set(rptId, paymentDataWithRequiredPayee),
    _ => paymentDataWithRequiredPayee
  );

const addOrUpdatePaymentStatus = (
  rptId: string,
  paymentStatus: PaymentStatus
): PaymentStatus =>
  pipe(paymentStatuses.set(rptId, paymentStatus), _ => paymentStatus);

const createPaymentData = (
  organizationFiscalCode: OrganizationFiscalCode,
  invalidAfterDueDate = false,
  noticeNumber: PaymentNoticeNumber = `0${faker.string.numeric(
    17
  )}` as PaymentNoticeNumber,
  amount: PaymentAmount = getRandomIntInRange(1, 10000) as PaymentAmount
): E.Either<Array<string>, PaymentDataWithRequiredPayee> =>
  pipe(
    {
      notice_number: noticeNumber,
      amount,
      invalid_after_due_date: invalidAfterDueDate,
      payee: {
        fiscal_code: organizationFiscalCode
      }
    },
    rawPaymentData =>
      decodePayload(PaymentDataWithRequiredPayee, rawPaymentData),
    E.map(addOrUpdatePayment)
  );

const createProcessablePayment = (
  rptId: string,
  amount: PaymentAmount,
  organizationFiscalCode: OrganizationFiscalCode,
  organizationName: string,
  nativeDueDate: Date = faker.date.soon()
): PaymentStatus =>
  pipe(
    {
      rptId,
      amount: amount as unknown as PaymentInfoResponse["amount"],
      description: faker.finance.transactionDescription(),
      dueDate: nativeDueDate.toISOString().split("T")[0],
      paFiscalCode: organizationFiscalCode,
      paName: organizationName
    } as PaymentInfoResponse,
    processablePayment,
    processablePayment => addOrUpdatePaymentStatus(rptId, processablePayment)
  );

const createProcessedPayment = (
  rptId: string,
  details: PaymentFaultV2Enum
): PaymentStatus =>
  pipe(
    details,
    detailV2EnumToPaymentProblemJSON,
    processedPayment,
    processedPayment => addOrUpdatePaymentStatus(rptId, processedPayment)
  );

const getPaymentStatus = (rptId: string): O.Option<PaymentStatus> =>
  pipe(paymentStatuses.get(rptId), O.fromNullable);

export interface IPaymentsDatabase {
  createPaymentData: (
    organizationFiscalCode: OrganizationFiscalCode,
    invalidAfterDueDate?: boolean,
    noticeNumber?: PaymentNoticeNumber,
    amount?: PaymentAmount
  ) => E.Either<Array<string>, PaymentDataWithRequiredPayee>;
  createProcessablePayment: (
    rptId: string,
    amount: PaymentAmount,
    organizationFiscalCode: OrganizationFiscalCode,
    organizationName: string,
    nativeDueDate?: Date
  ) => PaymentStatus;
  createProcessedPayment: (
    rptId: string,
    details: PaymentFaultV2Enum
  ) => PaymentStatus;
  getPaymentStatus: (rptId: string) => O.Option<PaymentStatus>;
}

export const PaymentsDatabase: IPaymentsDatabase = {
  createPaymentData,
  createProcessablePayment,
  createProcessedPayment,
  getPaymentStatus
};

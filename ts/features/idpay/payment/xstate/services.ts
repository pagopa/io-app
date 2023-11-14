import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { flow, pipe } from "fp-ts/lib/function";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { CodeEnum as TransactionErrorCodeEnum } from "../../../../../definitions/idpay/TransactionErrorDTO";
import { IDPayClient } from "../../common/api/client";
import { Context } from "./context";
import { PaymentFailure, PaymentFailureEnum } from "./failure";

export type Services = {
  preAuthorizePayment: {
    data: AuthPaymentResponseDTO;
  };
  authorizePayment: {
    data: AuthPaymentResponseDTO;
  };
};

// FIXME: mapping is incomplete [IOBP-379]
// prettier-ignore
export const paymentFailureMap: Partial<
  Record<TransactionErrorCodeEnum, PaymentFailureEnum>
> = {
  [TransactionErrorCodeEnum.PAYMENT_NOT_FOUND_OR_EXPIRED]: PaymentFailureEnum.EXPIRED,
  [TransactionErrorCodeEnum.PAYMENT_BUDGET_EXHAUSTED]: PaymentFailureEnum.BUDGET_EXHAUSTED,
  [TransactionErrorCodeEnum.PAYMENT_GENERIC_REJECTED]: PaymentFailureEnum.REJECTED,
  [TransactionErrorCodeEnum.PAYMENT_TOO_MANY_REQUESTS]: PaymentFailureEnum.TOO_MANY_REQUESTS,
  [TransactionErrorCodeEnum.PAYMENT_ALREADY_AUTHORIZED]: PaymentFailureEnum.AUTHORIZED,
  [TransactionErrorCodeEnum.PAYMENT_USER_SUSPENDED]: PaymentFailureEnum.AUTHORIZED,
};

/**
 * This function maps errors from the fetch to the PaymentFailure type
 * This helps to know if the error comes from a 429 status code
 */
const mapFetchError = (error: unknown): PaymentFailure => {
  if (error === "max-retries") {
    return PaymentFailureEnum.TOO_MANY_REQUESTS;
  }
  return PaymentFailureEnum.GENERIC;
};

const createServicesImplementation = (client: IDPayClient, token: string) => {
  const preAuthorizePayment = async (
    context: Context
  ): Promise<AuthPaymentResponseDTO> => {
    const putPreAuthPaymentTask = (trxCode: string) =>
      TE.tryCatch(
        async () =>
          await client.putPreAuthPayment({
            bearerAuth: token,
            trxCode
          }),
        mapFetchError
      );

    const dataResponse = await pipe(
      context.trxCode,
      TE.fromOption(() => PaymentFailureEnum.GENERIC),
      TE.chain(putPreAuthPaymentTask)
    )();

    return pipe(
      dataResponse,
      E.fold(
        failure => Promise.reject(failure),
        flow(
          E.map(({ status, value }) => {
            switch (status) {
              case 200:
                return Promise.resolve(value);
              case 401:
                return Promise.reject(PaymentFailureEnum.SESSION_EXPIRED);
              default:
                const failure = paymentFailureMap[value.code];
                return Promise.reject(failure || PaymentFailureEnum.GENERIC);
            }
          }),
          E.getOrElse(() => Promise.reject(PaymentFailureEnum.GENERIC))
        )
      )
    );
  };

  const authorizePayment = async (
    context: Context
  ): Promise<AuthPaymentResponseDTO> => {
    const putAuthPaymentTask = (trxCode: string) =>
      TE.tryCatch(
        async () =>
          await client.putAuthPayment({
            bearerAuth: token,
            trxCode
          }),
        mapFetchError
      );

    const dataResponse = await pipe(
      context.transactionData,
      O.map(({ trxCode }) => trxCode),
      TE.fromOption(() => PaymentFailureEnum.GENERIC),
      TE.chain(putAuthPaymentTask)
    )();

    return pipe(
      dataResponse,
      E.fold(
        failure => Promise.reject(failure),
        flow(
          // eslint-disable-next-line sonarjs/no-identical-functions
          E.map(({ status, value }) => {
            switch (status) {
              case 200:
                return Promise.resolve(value);
              case 401:
                return Promise.reject(PaymentFailureEnum.SESSION_EXPIRED);
              default:
                const failure = paymentFailureMap[value.code];
                return Promise.reject(failure || PaymentFailureEnum.GENERIC);
            }
          }),
          E.getOrElse(() => Promise.reject(PaymentFailureEnum.GENERIC))
        )
      )
    );
  };

  const deletePayment = async (context: Context): Promise<undefined> => {
    const deletePaymentTask = (trxCode: string) =>
      TE.tryCatch(
        async () =>
          await client.deletePayment({
            bearerAuth: token,
            trxCode
          }),
        mapFetchError
      );

    const dataResponse = await pipe(
      context.transactionData,
      O.map(({ trxCode }) => trxCode),
      TE.fromOption(() => PaymentFailureEnum.GENERIC),
      TE.chain(deletePaymentTask)
    )();

    return pipe(
      dataResponse,
      E.fold(
        failure => Promise.reject(failure),
        flow(
          // eslint-disable-next-line sonarjs/no-identical-functions
          E.map(({ status, value }) => {
            switch (status) {
              case 200:
                return Promise.resolve(value);
              case 401:
                return Promise.reject(PaymentFailureEnum.SESSION_EXPIRED);
              default:
                const failure = paymentFailureMap[value.code];
                return Promise.reject(failure || PaymentFailureEnum.GENERIC);
            }
          }),
          E.getOrElse(() => Promise.reject(PaymentFailureEnum.GENERIC))
        )
      )
    );
  };

  return {
    preAuthorizePayment,
    authorizePayment,
    deletePayment
  };
};

export { createServicesImplementation };

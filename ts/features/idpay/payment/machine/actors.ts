import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { flow, pipe } from "fp-ts/lib/function";
import { fromPromise } from "xstate";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { CodeEnum as TransactionErrorCodeEnum } from "../../../../../definitions/idpay/TransactionErrorDTO";
import { useIODispatch } from "../../../../store/hooks";
import { refreshSessionToken } from "../../../authentication/fastLogin/store/actions/tokenRefreshActions";
import { IDPayClient } from "../../common/api/client";
import { PaymentFailure, PaymentFailureEnum } from "../types/PaymentFailure";

export const createActorsImplementation = (
  client: IDPayClient,
  token: string,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const handleSessionExpired = () => {
    dispatch(
      refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  };

  const preAuthorizePayment = fromPromise<AuthPaymentResponseDTO, string>(
    async ({ input }) => {
      const putPreAuthPaymentTask = (trxCode: string) =>
        TE.tryCatch(
          async () =>
            await client.putPreAuthPayment({
              bearerAuth: token,
              trxCode
            }),
          mapFetchError
        );

      const dataResponse = await putPreAuthPaymentTask(input)();

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
                  handleSessionExpired();
                  return Promise.reject(PaymentFailureEnum.SESSION_EXPIRED);
                default:
                  return Promise.reject(mapErrorCodeToFailure(value.code));
              }
            }),
            E.getOrElse(() =>
              Promise.reject(PaymentFailureEnum.PAYMENT_GENERIC_ERROR)
            )
          )
        )
      );
    }
  );

  const authorizePayment = fromPromise<AuthPaymentResponseDTO, string>(
    async ({ input }) => {
      const authPaymentTask = (trxCode: string) =>
        TE.tryCatch(
          async () =>
            await client.putAuthPayment({
              bearerAuth: token,
              trxCode
            }),
          mapFetchError
        );

      const dataResponse = await authPaymentTask(input)();

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
                  handleSessionExpired();
                  return Promise.reject(PaymentFailureEnum.SESSION_EXPIRED);
                default:
                  return Promise.reject(mapErrorCodeToFailure(value.code));
              }
            }),
            E.getOrElse(() =>
              Promise.reject(PaymentFailureEnum.PAYMENT_GENERIC_ERROR)
            )
          )
        )
      );
    }
  );

  const deletePayment = fromPromise<undefined, string>(async ({ input }) => {
    const deletePaymentTask = (trxCode: string) =>
      TE.tryCatch(
        async () =>
          await client.deletePayment({
            bearerAuth: token,
            trxCode
          }),
        mapFetchError
      );

    const dataResponse = await deletePaymentTask(input)();

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
                handleSessionExpired();
                return Promise.reject(PaymentFailureEnum.SESSION_EXPIRED);
              default:
                return Promise.reject(mapErrorCodeToFailure(value.code));
            }
          }),
          E.getOrElse(() =>
            Promise.reject(PaymentFailureEnum.PAYMENT_GENERIC_ERROR)
          )
        )
      )
    );
  });

  return {
    preAuthorizePayment,
    authorizePayment,
    deletePayment
  };
};

/**
 * Maps the backed error codes to UI failure states
 * @param code Error code from backend
 * @returns The associated failure state
 */
const mapErrorCodeToFailure = (
  code: TransactionErrorCodeEnum
): PaymentFailureEnum => {
  switch (code) {
    case TransactionErrorCodeEnum.PAYMENT_TRANSACTION_EXPIRED:
    case TransactionErrorCodeEnum.PAYMENT_NOT_FOUND_OR_EXPIRED:
      return PaymentFailureEnum.PAYMENT_TRANSACTION_EXPIRED;
    case TransactionErrorCodeEnum.PAYMENT_USER_SUSPENDED:
      return PaymentFailureEnum.PAYMENT_USER_SUSPENDED;
    case TransactionErrorCodeEnum.PAYMENT_USER_NOT_ONBOARDED:
      return PaymentFailureEnum.PAYMENT_USER_NOT_ONBOARDED;
    case TransactionErrorCodeEnum.PAYMENT_USER_UNSUBSCRIBED:
      return PaymentFailureEnum.PAYMENT_USER_UNSUBSCRIBED;
    case TransactionErrorCodeEnum.PAYMENT_ALREADY_AUTHORIZED:
      return PaymentFailureEnum.PAYMENT_ALREADY_AUTHORIZED;
    case TransactionErrorCodeEnum.PAYMENT_BUDGET_EXHAUSTED:
      return PaymentFailureEnum.PAYMENT_BUDGET_EXHAUSTED;
    case TransactionErrorCodeEnum.PAYMENT_ALREADY_ASSIGNED:
      return PaymentFailureEnum.PAYMENT_ALREADY_ASSIGNED;
    case TransactionErrorCodeEnum.PAYMENT_INITIATIVE_INVALID_DATE:
      return PaymentFailureEnum.PAYMENT_INITIATIVE_INVALID_DATE;
    case TransactionErrorCodeEnum.PAYMENT_GENERIC_ERROR:
    case TransactionErrorCodeEnum.PAYMENT_MERCHANT_NOT_ONBOARDED:
    case TransactionErrorCodeEnum.PAYMENT_NOT_ALLOWED_FOR_TRX_STATUS:
    default:
      return PaymentFailureEnum.PAYMENT_GENERIC_ERROR;
  }
};

/**
 * This function maps errors from the fetch to the PaymentFailure type
 * This helps to know if the error comes from a 429 status code
 */
const mapFetchError = (error: unknown): PaymentFailure => {
  if (error === "max-retries") {
    return PaymentFailureEnum.PAYMENT_TOO_MANY_REQUESTS;
  }
  return PaymentFailureEnum.PAYMENT_GENERIC_ERROR;
};

import { AuthPaymentResponseDTO } from "@io-app/api-types/generated/definitions/idpay/AuthPaymentResponseDTO";
import { CodeEnum as TransactionErrorCodeEnum } from "@io-app/api-types/generated/definitions/idpay/TransactionErrorDTO";
import { err, ok, ResultAsync } from "neverthrow";
import { fromPromise } from "xstate";

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
      const dataResponse = await ResultAsync.fromPromise(
        client.putPreAuthPayment({ bearerAuth: token, trxCode: input }),
        mapFetchError
      ).andThen(result =>
        "right" in result ? ok(result.right) : err(result.left)
      );
      return dataResponse.match(
        ({ status, value }) => {
          switch (status) {
            case 200:
              return Promise.resolve(value);
            case 401:
              handleSessionExpired();
              return Promise.reject(PaymentFailureEnum.SESSION_EXPIRED);
            default:
              return Promise.reject(mapErrorCodeToFailure(value.code));
          }
        },
        failure => Promise.reject(failure)
      );
    }
  );

  const authorizePayment = fromPromise<AuthPaymentResponseDTO, string>(
    async ({ input }) => {
      const dataResponse = await ResultAsync.fromPromise(
        client.putAuthPayment({ bearerAuth: token, trxCode: input }),
        mapFetchError
      ).andThen(result =>
        "right" in result ? ok(result.right) : err(result.left)
      );
      return dataResponse.match(
        ({ status, value }) => {
          switch (status) {
            case 200:
              return Promise.resolve(value);
            case 401:
              handleSessionExpired();
              return Promise.reject(PaymentFailureEnum.SESSION_EXPIRED);
            default:
              return Promise.reject(mapErrorCodeToFailure(value.code));
          }
        },
        failure => Promise.reject(failure)
      );
    }
  );

  const deletePayment = fromPromise<undefined, string>(async ({ input }) => {
    const dataResponse = await ResultAsync.fromPromise(
      client.deletePayment({ bearerAuth: token, trxCode: input }),
      mapFetchError
    ).andThen(result =>
      "right" in result ? ok(result.right) : err(result.left)
    );
    return dataResponse.match(
      ({ status, value }) => {
        switch (status) {
          case 200:
            return Promise.resolve(value);
          case 401:
            handleSessionExpired();
            return Promise.reject(PaymentFailureEnum.SESSION_EXPIRED);
          default:
            return Promise.reject(mapErrorCodeToFailure(value.code));
        }
      },
      failure => Promise.reject(failure)
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
    case TransactionErrorCodeEnum.PAYMENT_ALREADY_ASSIGNED:
      return PaymentFailureEnum.PAYMENT_ALREADY_ASSIGNED;
    case TransactionErrorCodeEnum.PAYMENT_ALREADY_AUTHORIZED:
      return PaymentFailureEnum.PAYMENT_ALREADY_AUTHORIZED;
    case TransactionErrorCodeEnum.PAYMENT_BUDGET_EXHAUSTED:
      return PaymentFailureEnum.PAYMENT_BUDGET_EXHAUSTED;
    case TransactionErrorCodeEnum.PAYMENT_INITIATIVE_INVALID_DATE:
      return PaymentFailureEnum.PAYMENT_INITIATIVE_INVALID_DATE;
    case TransactionErrorCodeEnum.PAYMENT_NOT_FOUND_OR_EXPIRED:
    case TransactionErrorCodeEnum.PAYMENT_TRANSACTION_EXPIRED:
      return PaymentFailureEnum.PAYMENT_TRANSACTION_EXPIRED;
    case TransactionErrorCodeEnum.PAYMENT_USER_NOT_ONBOARDED:
      return PaymentFailureEnum.PAYMENT_USER_NOT_ONBOARDED;
    case TransactionErrorCodeEnum.PAYMENT_USER_SUSPENDED:
      return PaymentFailureEnum.PAYMENT_USER_SUSPENDED;
    case TransactionErrorCodeEnum.PAYMENT_USER_UNSUBSCRIBED:
      return PaymentFailureEnum.PAYMENT_USER_UNSUBSCRIBED;
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

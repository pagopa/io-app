import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { flow, pipe } from "fp-ts/lib/function";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay_payment/AuthPaymentResponseDTO";
import { SyncTrxStatus } from "../../../../../definitions/idpay_payment/SyncTrxStatus";
import { IDPayPaymentClient } from "../api/client";
import { Context } from "./context";
import { PaymentFailureEnum } from "./failure";

export type Services = {
  preAuthorizePayment: {
    data: AuthPaymentResponseDTO;
  };
  getTransaction: {
    data: SyncTrxStatus;
  };
  authorizePayment: {
    data: AuthPaymentResponseDTO;
  };
};

const createServicesImplementation = (
  client: IDPayPaymentClient,
  token: string
) => {
  const preAuthorizePayment = async (
    context: Context
  ): Promise<AuthPaymentResponseDTO> => {
    if (context.trxCode === undefined) {
      return Promise.reject(PaymentFailureEnum.GENERIC);
    }

    const dataResponse = await TE.tryCatch(
      () =>
        client.putPreAuthPayment({
          Bearer: token,
          trxCode: context.trxCode || ""
        }),
      E.toError
    )();

    return pipe(
      dataResponse,
      E.fold(
        () => Promise.reject(PaymentFailureEnum.GENERIC),
        flow(
          E.map(({ status, value }) => {
            switch (status) {
              case 200:
                return Promise.resolve(value);
              case 403:
                return Promise.reject(PaymentFailureEnum.NOT_ACTIVE);
              case 404:
                return Promise.reject(PaymentFailureEnum.NOT_FOUND);
              default:
                return Promise.reject(PaymentFailureEnum.GENERIC);
            }
          }),
          E.getOrElse(() => Promise.reject(PaymentFailureEnum.GENERIC))
        )
      )
    );
  };

  const getTransaction = async (context: Context): Promise<SyncTrxStatus> => {
    if (context.transaction === undefined) {
      return Promise.reject(PaymentFailureEnum.GENERIC);
    }

    const dataResponse = await TE.tryCatch(
      async () =>
        await client.getTransaction({
          Bearer: token,
          transactionId: context.transaction?.id || ""
        }),
      E.toError
    )();

    return pipe(
      dataResponse,
      E.fold(
        error => Promise.reject(error),
        flow(
          E.map(({ status, value }) => {
            switch (status) {
              case 200:
                return Promise.resolve(value);
              case 404:
                return Promise.reject(PaymentFailureEnum.NOT_FOUND);
              default:
                return Promise.reject(PaymentFailureEnum.GENERIC);
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
    if (context.trxCode === undefined) {
      return Promise.reject(PaymentFailureEnum.GENERIC);
    }

    const dataResponse = await TE.tryCatch(
      () =>
        client.putAuthPayment({
          Bearer: token,
          trxCode: context.trxCode || ""
        }),
      E.toError
    )();

    return pipe(
      dataResponse,
      E.fold(
        () => Promise.reject(PaymentFailureEnum.GENERIC),
        flow(
          E.map(({ status, value }) => {
            switch (status) {
              case 200:
                return Promise.resolve(value);
              case 400:
                return Promise.reject(PaymentFailureEnum.NOT_VALID);
              case 403:
                return Promise.reject(PaymentFailureEnum.NOT_ACTIVE);
              case 404:
                return Promise.reject(PaymentFailureEnum.NOT_FOUND);
              default:
                return Promise.reject(PaymentFailureEnum.GENERIC);
            }
          }),
          E.getOrElse(() => Promise.reject(PaymentFailureEnum.GENERIC))
        )
      )
    );
  };

  return {
    getTransaction,
    preAuthorizePayment,
    authorizePayment
  };
};

export { createServicesImplementation };

/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { flow, pipe } from "fp-ts/lib/function";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay_payment/AuthPaymentResponseDTO";
import { SyncTrxStatus } from "../../../../../definitions/idpay_payment/SyncTrxStatus";
import { IDPayAuthorizationClient } from "../api/client";
import { Context } from "./context";

export type Services = {
  getTransaction: {
    data: SyncTrxStatus;
  };
  preAuthorizePayment: {
    data: AuthPaymentResponseDTO;
  };
  authorizePayment: {
    data: AuthPaymentResponseDTO;
  };
};

const createServicesImplementation = (
  client: IDPayAuthorizationClient,
  token: string
) => {
  const getTransaction = async (context: Context): Promise<SyncTrxStatus> => {
    if (context.transactionId === undefined) {
      return Promise.reject(new Error("undefined transactionId"));
    }
    const dataResponse = await TE.tryCatch(
      async () =>
        await client.getTransaction({
          Bearer: token,
          transactionId: context.transactionId || ""
        }),
      E.toError
    )();

    return pipe(
      dataResponse,
      E.fold(
        error => Promise.reject(error),
        flow(
          E.map(({ status, value }) =>
            status !== 200 ? Promise.reject(undefined) : Promise.resolve(value)
          ),
          E.getOrElse(() => Promise.reject(undefined))
        )
      )
    );
  };

  const preAuthorizePayment = async (
    context: Context
  ): Promise<AuthPaymentResponseDTO> => {
    if (context.transaction === undefined) {
      return Promise.reject(new Error("undefined transaction"));
    }

    const dataResponse = await TE.tryCatch(
      async () =>
        await client.putPreAuthPayment({
          Bearer: token,
          trxCode: context.transaction?.trxCode || ""
        }),
      E.toError
    )();

    return pipe(
      dataResponse,
      E.fold(
        () => Promise.reject(undefined),
        flow(
          E.map(({ status, value }) =>
            status !== 200 ? Promise.reject(undefined) : Promise.resolve(value)
          ),
          E.getOrElse(() => Promise.reject(undefined))
        )
      )
    );
  };

  const authorizePayment = async (
    context: Context
  ): Promise<AuthPaymentResponseDTO> => {
    if (context.transaction === undefined) {
      return Promise.reject(new Error("undefined trxCode"));
    }

    const dataResponse = await TE.tryCatch(
      async () =>
        await client.putAuthPayment({
          Bearer: token,
          trxCode: context.transaction?.trxCode || ""
        }),
      E.toError
    )();

    return pipe(
      dataResponse,
      E.fold(
        () => Promise.reject(undefined),
        flow(
          E.map(({ status, value }) =>
            status !== 200 ? Promise.reject(undefined) : Promise.resolve(value)
          ),
          E.getOrElse(() => Promise.reject(undefined))
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

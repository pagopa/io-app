/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { flow, pipe } from "fp-ts/lib/function";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { IDPayClient } from "../../common/api/client";
import { Context } from "./context";
import { UnsubscriptionFailureEnum } from "./failure";

export type Services = {
  getInitiativeInfo: {
    data: InitiativeDTO;
  };
  unsubscribeFromInitiative: {
    data: undefined;
  };
};

const createServicesImplementation = (
  client: IDPayClient,
  token: string,
  language: PreferredLanguage
) => {
  const getInitiativeInfo = async (
    context: Context
  ): Promise<InitiativeDTO> => {
    const dataResponse = await TE.tryCatch(
      async () =>
        await client.getWalletDetail({
          bearerAuth: token,
          "Accept-Language": language,
          initiativeId: context.initiativeId
        }),
      E.toError
    )();

    return pipe(
      dataResponse,
      E.fold(
        () => Promise.reject(UnsubscriptionFailureEnum.UNEXPECTED),
        flow(
          E.map(({ status, value }) => {
            switch (status) {
              case 200:
                return Promise.resolve(value);
              case 401:
                return Promise.reject(
                  UnsubscriptionFailureEnum.SESSION_EXPIRED
                );
              default:
                return Promise.reject(UnsubscriptionFailureEnum.GENERIC);
            }
          }),
          E.getOrElse(() => Promise.reject(undefined))
        )
      )
    );
  };

  const unsubscribeFromInitiative = async (
    context: Context
  ): Promise<undefined> => {
    const dataResponse = await TE.tryCatch(
      async () =>
        await client.unsubscribe({
          bearerAuth: token,
          "Accept-Language": language,
          initiativeId: context.initiativeId
        }),
      E.toError
    )();

    return pipe(
      dataResponse,
      E.fold(
        () => Promise.reject(UnsubscriptionFailureEnum.UNEXPECTED),
        flow(
          E.map(({ status }) => {
            switch (status) {
              case 204:
                return Promise.resolve(undefined);
              case 401:
                return Promise.reject(
                  UnsubscriptionFailureEnum.SESSION_EXPIRED
                );
              default:
                return Promise.reject(UnsubscriptionFailureEnum.GENERIC);
            }
          }),
          E.getOrElse(() => Promise.reject(undefined))
        )
      )
    );
  };

  return {
    getInitiativeInfo,
    unsubscribeFromInitiative
  };
};

export { createServicesImplementation };

import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { flow, pipe } from "fp-ts/lib/function";
import { fromPromise } from "xstate5";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { IDPayClient } from "../../common/api/client";
import { UnsubscriptionFailureEnum } from "../types/failure";

export const createActorsImplementation = (
  client: IDPayClient,
  token: string,
  language: PreferredLanguage
) => {
  const getInitiativeInfo = fromPromise(
    async (params: { input: string }): Promise<InitiativeDTO> => {
      const dataResponse = await TE.tryCatch(
        async () =>
          await client.getWalletDetail({
            bearerAuth: token,
            "Accept-Language": language,
            initiativeId: params.input
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
            E.getOrElse(() => Promise.reject(UnsubscriptionFailureEnum.GENERIC))
          )
        )
      );
    }
  );

  const unsubscribeFromInitiative = fromPromise(
    async (params: { input: string }): Promise<undefined> => {
      const dataResponse = await TE.tryCatch(
        async () =>
          await client.unsubscribe({
            bearerAuth: token,
            "Accept-Language": language,
            initiativeId: params.input
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
            E.getOrElse(() => Promise.reject(UnsubscriptionFailureEnum.GENERIC))
          )
        )
      );
    }
  );

  return {
    getInitiativeInfo,
    unsubscribeFromInitiative
  };
};

/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { IDPayClient } from "../../common/api/client";
import { Context } from "./context";

export type Services = {
  unsubscribeFromInitiative: {
    data: undefined;
  };
};

const createServicesImplementation = (
  client: IDPayClient,
  token: string,
  language: PreferredLanguage
) => {
  const unsubscribeFromInitiative = async (context: Context) =>
    pipe(
      context.initiativeId,
      O.fold(
        () => Promise.reject("initiativeId is undefined"),
        async initiativeId => {
          const dataResponse = await client.unsubscribe({
            bearerAuth: token,
            "Accept-Language": language,
            initiativeId
          });

          const data: Promise<undefined> = pipe(
            dataResponse,
            E.fold(
              _ => Promise.reject(undefined),
              response => {
                if (response.status !== 200) {
                  return Promise.reject(undefined);
                }
                return Promise.resolve(undefined);
              }
            )
          );

          return data;
        }
      )
    );

  return {
    unsubscribeFromInitiative
  };
};

export { createServicesImplementation };

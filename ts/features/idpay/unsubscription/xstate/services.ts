/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { IDPayClient } from "../../common/api/client";
import { Context } from "./context";

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
  const getInitiativeInfo = async (context: Context) => {
    const dataResponse = await client.getWalletDetail({
      bearerAuth: token,
      "Accept-Language": language,
      initiativeId: context.initiativeId
    });

    const data: Promise<InitiativeDTO> = pipe(
      dataResponse,
      E.fold(
        _ => Promise.reject(undefined),
        response => {
          if (response.status !== 200) {
            return Promise.reject(undefined);
          }
          return Promise.resolve(response.value);
        }
      )
    );

    return data;
  };

  const unsubscribeFromInitiative = async (context: Context) => {
    const dataResponse = await client.unsubscribe({
      bearerAuth: token,
      "Accept-Language": language,
      initiativeId: context.initiativeId
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
  };

  return {
    getInitiativeInfo,
    unsubscribeFromInitiative
  };
};

export { createServicesImplementation };

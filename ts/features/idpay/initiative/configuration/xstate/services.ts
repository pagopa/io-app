import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { IDPayWalletClient } from "../../../wallet/api/client";
import { Context } from "./machine";

const createServicesImplementation = (
  walletClient: IDPayWalletClient,
  bearerToken: string,
  language: PreferredLanguageEnum
) => {
  const loadInitiative = async (context: Context) => {
    if (context.initiativeId === undefined) {
      return Promise.reject("initiativeId is undefined");
    }

    const response = await walletClient.getWalletDetail({
      initiativeId: context.initiativeId,
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    const data: Promise<InitiativeDTO> = pipe(
      response,
      E.fold(
        _ => Promise.reject("error loading wallet"),
        _ => {
          if (_.status !== 200) {
            return Promise.reject("error loading wallet");
          }
          return Promise.resolve(_.value);
        }
      )
    );

    return data;
  };

  return { loadInitiative };
};

export { createServicesImplementation };

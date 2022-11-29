import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { Wallet } from "../../../../../../definitions/pagopa/Wallet";
import { PaymentManagerClient } from "../../../../../api/pagopa";
import { PaymentManagerToken } from "../../../../../types/pagopa";
import { SessionManager } from "../../../../../utils/SessionManager";
import { IDPayWalletClient } from "../../../wallet/api/client";
import { Context } from "./machine";

const createServicesImplementation = (
  walletClient: IDPayWalletClient,
  paymentManagerClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
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

  const loadInstruments = async (context: Context) => {
    if (context.initiativeId === undefined) {
      return Promise.reject("initiativeId is undefined");
    }

    const pagoPAResponse = await pmSessionManager.withRefresh(
      paymentManagerClient.getWalletsV2
    )();

    if (E.isLeft(pagoPAResponse)) {
      return Promise.reject("error loading instruments");
    }

    if (pagoPAResponse.right.status !== 200) {
      return Promise.reject("error loading instruments");
    }

    return pipe(
      pagoPAResponse.right.value.data,
      O.fromNullable,
      O.getOrElse(() => [] as ReadonlyArray<Wallet>)
    );
  };

  return { loadInitiative, loadInstruments };
};

export { createServicesImplementation };

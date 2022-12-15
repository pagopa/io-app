import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { IbanDTO } from "../../../../../../definitions/idpay/iban/IbanDTO";
import { IbanListDTO } from "../../../../../../definitions/idpay/iban/IbanListDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { PaymentManagerClient } from "../../../../../api/pagopa";
import { PaymentManagerToken, Wallet } from "../../../../../types/pagopa";
import { SessionManager } from "../../../../../utils/SessionManager";
import { convertWalletV2toWalletV1 } from "../../../../../utils/walletv2";
import { IDPayWalletClient } from "../../../wallet/api/client";
import { IDPayIbanClient } from "../api/client";
import { Context } from "./machine";

const createServicesImplementation = (
  walletClient: IDPayWalletClient,
  ibanClient: IDPayIbanClient,
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

  const testIbanList: ReadonlyArray<IbanDTO> = [
    {
      iban: "IT60X0542811101000000123456",
      checkIbanStatus: "VALID",
      holderBank: "BANCA POPOLARE DI SONDRIO",
      description: "IBAN di test",
      channel: "WEB",
      bicCode: "BPPIITRRXXX",
      queueDate: "2020-12-01T00:00:00.000Z",
      checkIbanResponseDate: new Date()
    }
  ];

  const loadIbanList = async (_: Context) => {
    const response = await ibanClient.getIbanList({
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    const data: Promise<IbanListDTO> = pipe(
      response,
      E.fold(
        _ => Promise.reject("error loading iban list"),
        _ => {
          if (_.status !== 200) {
            return Promise.reject("error loading iban list");
          }

          // TODO remove this when the backend is ready
          if (_.value.ibanList.length === 0) {
            return Promise.resolve({ ibanList: testIbanList });
          }

          return Promise.resolve(_.value);
        }
      )
    );

    return data;
  };

  const addIban = async (context: Context) => {
    if (context.initiativeId === undefined) {
      return Promise.reject("initiativeId is undefined");
    }

    if (context.selectedIban === undefined) {
      return Promise.reject("selectedIban is undefined");
    }

    const response = await walletClient.enrollIban({
      initiativeId: context.initiativeId,
      body: {
        iban: context.selectedIban.iban,
        description: context.selectedIban.description
      },
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    if (E.isLeft(response)) {
      return Promise.reject("error enrolling iban");
    }

    if (response.right.status !== 200) {
      return Promise.reject("error enrolling iban");
    }

    return Promise.resolve(undefined);
  };

  const loadPagoPAInstruments = async () => {
    const pagoPAResponse = await pmSessionManager.withRefresh(
      paymentManagerClient.getWalletsV2
    )();

    if (E.isLeft(pagoPAResponse)) {
      return Promise.reject("error loading pagoPA instruments");
    }

    if (pagoPAResponse.right.status !== 200) {
      return Promise.reject("error loading pagoPA instruments");
    }

    const data = pipe(
      pagoPAResponse.right.value.data,
      O.fromNullable,
      O.map(_ => _.map(convertWalletV2toWalletV1)),
      O.getOrElse(() => [] as ReadonlyArray<Wallet>)
    );

    return Promise.resolve(data);
  };

  const loadIDPayInstruments = async (initiativeId: string) => {
    const idPayResponse = await walletClient.getInstrumentList({
      initiativeId,
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    if (E.isLeft(idPayResponse)) {
      return Promise.reject("error loading idPay instruments");
    }

    if (idPayResponse.right.status === 404) {
      return Promise.resolve([]);
    }

    if (idPayResponse.right.status !== 200) {
      return Promise.reject("error loading idPay instruments");
    }

    return Promise.resolve(idPayResponse.right.value.instrumentList);
  };

  const loadInstruments = async (context: Context) => {
    if (context.initiativeId === undefined) {
      return Promise.reject("initiativeId is undefined");
    }

    try {
      const [pagoPAInstruments, idPayInstruments] = await Promise.all([
        loadPagoPAInstruments(),
        loadIDPayInstruments(context.initiativeId)
      ]);

      return Promise.resolve({ pagoPAInstruments, idPayInstruments });
    } catch {
      return Promise.reject("error loading instruments");
    }
  };

  const addInstrument = async (context: Context) => {
    if (context.initiativeId === undefined) {
      return Promise.reject("initiativeId is undefined");
    }

    if (context.selectedInstrumentId === undefined) {
      return Promise.reject("selectedInstrumentId is undefined");
    }

    const response = await walletClient.enrollInstrument({
      initiativeId: context.initiativeId,
      idWallet: context.selectedInstrumentId,
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    if (E.isLeft(response)) {
      return Promise.reject("error enrolling instruments");
    }

    if (response.right.status !== 200) {
      return Promise.reject("error enrolling instruments");
    }

    // After updating the list of instruments, we need to reload the list of enrloled instruments
    return loadIDPayInstruments(context.initiativeId);
  };

  return {
    loadInitiative,
    loadIbanList,
    addIban,
    loadInstruments,
    addInstrument
  };
};

export { createServicesImplementation };

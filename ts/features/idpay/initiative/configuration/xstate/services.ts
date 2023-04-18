import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { InvokeCreator, Receiver, Sender } from "xstate";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { IbanListDTO } from "../../../../../../definitions/idpay/IbanListDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { InstrumentDTO } from "../../../../../../definitions/idpay/InstrumentDTO";
import { PaymentManagerClient } from "../../../../../api/pagopa";
import { PaymentManagerToken, Wallet } from "../../../../../types/pagopa";
import { SessionManager } from "../../../../../utils/SessionManager";
import { convertWalletV2toWalletV1 } from "../../../../../utils/walletv2";
import { IDPayClient } from "../../../common/api/client";
import { Context } from "./context";
import { Events } from "./events";
import { InitiativeFailureType } from "./failure";

const createServicesImplementation = (
  idPayClient: IDPayClient,
  paymentManagerClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  bearerToken: string,
  language: PreferredLanguageEnum
) => {
  const loadInitiative = async (context: Context) => {
    if (context.initiativeId === undefined) {
      return Promise.reject(InitiativeFailureType.GENERIC);
    }

    const response = await idPayClient.getWalletDetail({
      initiativeId: context.initiativeId,
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    const data: Promise<InitiativeDTO> = pipe(
      response,
      E.fold(
        _ => Promise.reject(InitiativeFailureType.INITIATIVE_ERROR),
        _ => {
          if (_.status !== 200) {
            return Promise.reject(InitiativeFailureType.INITIATIVE_ERROR);
          }
          return Promise.resolve(_.value);
        }
      )
    );

    return data;
  };

  const loadIbanList = async (_: Context) => {
    const response = await idPayClient.getIbanList({
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    const data: Promise<IbanListDTO> = pipe(
      response,
      E.fold(
        _ => Promise.reject(InitiativeFailureType.IBAN_LIST_LOAD_FAILURE),
        _ => {
          if (_.status !== 200) {
            return Promise.reject(InitiativeFailureType.IBAN_LIST_LOAD_FAILURE);
          }

          // Every time we enroll an iban to an initiative, BE register it as a new iban
          // so we need to filter the list to avoid duplicates
          // This workaround will be removed when BE will fix the issue
          const uniqueIbanList = _.value.ibanList.filter(
            (iban, index, self) =>
              index === self.findIndex(t => t.iban === iban.iban)
          );

          return Promise.resolve({ ibanList: uniqueIbanList });
        }
      )
    );

    return data;
  };

  const confirmIban = async (context: Context) => {
    if (context.initiativeId === undefined) {
      return Promise.reject(InitiativeFailureType.GENERIC);
    }
    try {
      const res = await idPayClient.enrollIban({
        "Accept-Language": language,
        bearerAuth: bearerToken,
        initiativeId: context.initiativeId,
        body: context.ibanBody
      });
      return pipe(
        res,
        E.fold(
          _ => Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE),
          response => {
            if (response.status !== 200) {
              return Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE);
            }
            return Promise.resolve();
          }
        )
      );
    } catch (e) {
      return Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE);
    }
  };

  const enrollIban = async (context: Context) => {
    if (context.initiativeId === undefined) {
      return Promise.reject(InitiativeFailureType.GENERIC);
    }

    if (context.selectedIban === undefined) {
      return Promise.reject(InitiativeFailureType.GENERIC);
    }

    const response = await idPayClient.enrollIban({
      initiativeId: context.initiativeId,
      body: {
        iban: context.selectedIban.iban,
        description: context.selectedIban.description
      },
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    if (E.isLeft(response)) {
      return Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE);
    }

    if (response.right.status !== 200) {
      return Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE);
    }

    return Promise.resolve(undefined);
  };

  const loadWalletInstruments = async () => {
    const response = await pmSessionManager.withRefresh(
      paymentManagerClient.getWalletsV2
    )();

    const data: Promise<ReadonlyArray<Wallet>> = pipe(
      response,
      E.fold(
        _ =>
          Promise.reject(InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE),
        response => {
          if (response.status !== 200) {
            return Promise.reject(
              InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE
            );
          }

          const wallet = pipe(
            response.value.data,
            O.fromNullable,
            O.map(_ => _.map(convertWalletV2toWalletV1)),
            O.getOrElse(() => [] as ReadonlyArray<Wallet>)
          );

          return Promise.resolve(wallet);
        }
      )
    );

    return data;
  };

  const loadInitiativeInstruments = async (context: Context) => {
    if (context.initiativeId === undefined) {
      return Promise.reject(InitiativeFailureType.GENERIC);
    }

    const response = await idPayClient.getInstrumentList({
      initiativeId: context.initiativeId,
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    const data: Promise<ReadonlyArray<InstrumentDTO>> = pipe(
      response,
      E.fold(
        _ =>
          Promise.reject(InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE),
        response => {
          if (response.status !== 200) {
            return Promise.reject(
              InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE
            );
          }

          return Promise.resolve(response.value.instrumentList);
        }
      )
    );

    return data;
  };

  const enrollInstrument = async (initiativeId?: string, idWallet?: string) => {
    if (initiativeId === undefined || idWallet === undefined) {
      return Promise.reject(InitiativeFailureType.GENERIC);
    }

    const response = await idPayClient.enrollInstrument({
      bearerAuth: bearerToken,
      "Accept-Language": language,
      initiativeId,
      idWallet
    });

    const data: Promise<undefined> = pipe(
      response,
      E.fold(
        _ => Promise.reject(InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE),

        response => {
          if (response.status !== 200) {
            return Promise.reject(
              InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE
            );
          }

          return Promise.resolve(undefined);
        }
      )
    );

    return data;
  };

  const deleteInstrument = async (
    initiativeId?: string,
    instrumentId?: string
  ) => {
    if (initiativeId === undefined || instrumentId === undefined) {
      return Promise.reject(InitiativeFailureType.GENERIC);
    }

    const response = await idPayClient.deleteInstrument({
      bearerAuth: bearerToken,
      "Accept-Language": language,
      initiativeId,
      instrumentId
    });

    const data: Promise<undefined> = pipe(
      response,
      E.fold(
        _ => Promise.reject(InitiativeFailureType.INSTRUMENT_DELETE_FAILURE),

        response => {
          if (response.status !== 200) {
            return Promise.reject(
              InitiativeFailureType.INSTRUMENT_DELETE_FAILURE
            );
          }

          return Promise.resolve(undefined);
        }
      )
    );

    return data;
  };

  const instrumentsEnrollmentService: InvokeCreator<Context, Events> =
    (context: Context) =>
    (callback: Sender<Events>, onReceive: Receiver<Events>) =>
      onReceive(async event => {
        switch (event.type) {
          case "DELETE_INSTRUMENT":
            deleteInstrument(
              context.initiativeId,
              event.instrument.instrumentId
            )
              .then(() =>
                callback({
                  type: "DELETE_INSTRUMENT_SUCCESS",
                  instrument: event.instrument
                })
              )
              .catch(() =>
                callback({
                  type: "DELETE_INSTRUMENT_FAILURE",
                  instrument: event.instrument
                })
              );
            break;
          case "ENROLL_INSTRUMENT":
            enrollInstrument(context.initiativeId, event.walletId)
              .then(() =>
                callback({
                  type: "ENROLL_INSTRUMENT_SUCCESS",
                  walletId: event.walletId
                })
              )
              .catch(() =>
                callback({
                  type: "ENROLL_INSTRUMENT_FAILURE",
                  walletId: event.walletId
                })
              );
            break;
          default:
            break;
        }
      });

  return {
    loadInitiative,
    loadIbanList,
    enrollIban,
    confirmIban,
    loadWalletInstruments,
    loadInitiativeInstruments,
    instrumentsEnrollmentService
  };
};

export { createServicesImplementation };

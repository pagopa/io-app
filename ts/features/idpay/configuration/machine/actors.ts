/* eslint-disable sonarjs/no-identical-functions */
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { fromCallback, fromPromise } from "xstate";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { IbanDTO } from "../../../../../definitions/idpay/IbanDTO";
import { IbanListDTO } from "../../../../../definitions/idpay/IbanListDTO";
import { IbanPutDTO } from "../../../../../definitions/idpay/IbanPutDTO";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { InstrumentDTO } from "../../../../../definitions/idpay/InstrumentDTO";
import { TypeEnum } from "../../../../../definitions/pagopa/Wallet";
import { PaymentManagerClient } from "../../../../api/pagopa";
import { PaymentManagerToken, Wallet } from "../../../../types/pagopa";
import { SessionManager } from "../../../../utils/SessionManager";
import { convertWalletV2toWalletV1 } from "../../../../utils/walletv2";
import { IDPayClient } from "../../common/api/client";
import { InitiativeFailureType } from "../types/failure";
import { IdPayConfigurationEvents } from "./events";

export const createActorsImplementation = (
  idPayClient: IDPayClient,
  paymentManagerClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  bearerToken: string,
  language: PreferredLanguageEnum
) => {
  const getInitiative = fromPromise<InitiativeDTO, string>(async params => {
    const response = await idPayClient.getWalletDetail({
      initiativeId: params.input,
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    const data: Promise<InitiativeDTO> = pipe(
      response,
      E.fold(
        () => Promise.reject(InitiativeFailureType.INITIATIVE_ERROR),
        ({ status, value }) => {
          switch (status) {
            case 200:
              return Promise.resolve(value);
            case 401:
              return Promise.reject(InitiativeFailureType.SESSION_EXPIRED);
            default:
              return Promise.reject(InitiativeFailureType.GENERIC);
          }
        }
      )
    );

    return data;
  });

  const getIbanList = fromPromise<IbanListDTO>(async () => {
    const response = await idPayClient.getIbanList({
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    const data: Promise<IbanListDTO> = pipe(
      response,
      E.fold(
        () => Promise.reject(InitiativeFailureType.IBAN_LIST_LOAD_FAILURE),
        ({ status, value }) => {
          switch (status) {
            case 200:
              // Every time we enroll an iban to an initiative, BE register it as a new iban
              // so we need to filter the list to avoid duplicates
              // This workaround will be removed when BE will fix the issue
              const uniqueIbanList = value.ibanList.filter(
                (iban, index, self) =>
                  index === self.findIndex(t => t.iban === iban.iban)
              );
              return Promise.resolve({ ibanList: uniqueIbanList });
            case 401:
              return Promise.reject(InitiativeFailureType.SESSION_EXPIRED);
            default:
              return Promise.reject(
                InitiativeFailureType.IBAN_LIST_LOAD_FAILURE
              );
          }
        }
      )
    );

    return data;
  });

  const enrollIban = fromPromise<
    undefined,
    { initiativeId: string; iban: IbanDTO | IbanPutDTO }
  >(async ({ input }) => {
    try {
      const res = await idPayClient.enrollIban({
        "Accept-Language": language,
        bearerAuth: bearerToken,
        initiativeId: input.initiativeId,
        body: {
          iban: input.iban.iban,
          description: input.iban.description
        }
      });
      return pipe(
        res,
        E.fold(
          () => Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE),
          ({ status }) => {
            switch (status) {
              case 200:
                return Promise.resolve(undefined);
              case 401:
                return Promise.reject(InitiativeFailureType.SESSION_EXPIRED);
              default:
                return Promise.reject(
                  InitiativeFailureType.IBAN_ENROLL_FAILURE
                );
            }
          }
        )
      );
    } catch (e) {
      return Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE);
    }
  });

  const getWalletInstruments = fromPromise<ReadonlyArray<Wallet>>(async () => {
    const response = await pmSessionManager.withRefresh(
      paymentManagerClient.getWalletsV2
    )();

    const data: Promise<ReadonlyArray<Wallet>> = pipe(
      response,
      E.fold(
        () =>
          Promise.reject(InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE),
        ({ status, value }) => {
          switch (status) {
            case 200:
              const wallet = pipe(
                value.data,
                O.fromNullable,
                O.map(_ =>
                  _.map(convertWalletV2toWalletV1).filter(
                    el => el.type === TypeEnum.CREDIT_CARD
                  )
                ),
                O.getOrElse(() => [] as ReadonlyArray<Wallet>)
              );

              return Promise.resolve(wallet);

            case 401:
              return Promise.reject(InitiativeFailureType.SESSION_EXPIRED);
            default:
              return Promise.reject(
                InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE
              );
          }
        }
      )
    );

    return data;
  });

  const getInitiativeInstruments = fromPromise<
    ReadonlyArray<InstrumentDTO>,
    string
  >(async ({ input }) => {
    const response = await idPayClient.getInstrumentList({
      initiativeId: input,
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

    const data: Promise<ReadonlyArray<InstrumentDTO>> = pipe(
      response,
      E.fold(
        () =>
          Promise.reject(InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE),
        ({ status, value }) => {
          switch (status) {
            case 200:
              return Promise.resolve(value.instrumentList);
            case 401:
              return Promise.reject(InitiativeFailureType.SESSION_EXPIRED);
            default:
              return Promise.reject(
                InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE
              );
          }
        }
      )
    );

    return data;
  });

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
        () => Promise.reject(InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE),
        ({ status }) => {
          switch (status) {
            case 200:
              return Promise.resolve(undefined);
            case 401:
              return Promise.reject(InitiativeFailureType.SESSION_EXPIRED);
            default:
              return Promise.reject(
                InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE
              );
          }
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
        () => Promise.reject(InitiativeFailureType.INSTRUMENT_DELETE_FAILURE),
        ({ status }) => {
          switch (status) {
            case 200:
              return Promise.resolve(undefined);
            case 401:
              return Promise.reject(InitiativeFailureType.SESSION_EXPIRED);
            default:
              return Promise.reject(
                InitiativeFailureType.INSTRUMENT_DELETE_FAILURE
              );
          }
        }
      )
    );

    return data;
  };

  const instrumentsEnrollmentLogic = fromCallback<
    IdPayConfigurationEvents,
    string
  >(({ sendBack, receive, input }) => {
    receive(event => {
      switch (event.type) {
        case "delete-instrument":
          deleteInstrument(input, event.instrumentId)
            .then(() =>
              sendBack({
                ...event,
                type: "update-instrument-success"
              })
            )
            .catch(() =>
              sendBack({
                ...event,
                type: "update-instrument-failure"
              })
            );
          break;
        case "enroll-instrument":
          enrollInstrument(input, event.walletId)
            .then(() =>
              sendBack({
                ...event,
                type: "update-instrument-success",
                enrolling: true
              })
            )
            .catch(() =>
              sendBack({
                ...event,
                type: "update-instrument-failure"
              })
            );
          break;
        default:
          break;
      }
    });
  });

  return {
    getInitiative,
    getIbanList,
    enrollIban,
    getWalletInstruments,
    getInitiativeInstruments,
    instrumentsEnrollmentLogic
  };
};

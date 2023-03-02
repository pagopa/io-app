import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import {
  errorsToReadableMessages,
  readablePrivacyReport
} from "../../../../utils/reporters";
import { IDPayWalletClient } from "../api/client";
import {
  IdpayWalletInitiativeGetPayloadType,
  idPayWalletInitiativesGet
} from "../store/actions";
import { InitiativesWithInstrumentDTO } from "../../../../../definitions/idpay/wallet/InitiativesWithInstrumentDTO";
import { StatusEnum } from "../../../../../definitions/idpay/wallet/InitiativesStatusDTO";

export function* handleGetIDPayInitiativesWithInstrument(
  getInitiativesWithInstrument: IDPayWalletClient["getInitiativesWithInstrument"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdpayWalletInitiativeGetPayloadType
) {
  try {
    const mockCall = () =>
      new Promise((resolve, reject) => {
        setTimeout(
          () =>
            resolve({
              status: 200,
              value: {
                idWallet: payload.idWallet,
                brand: "VISA",
                maskedPan: "1234",
                initiativeList: [
                  {
                    initiativeId: "1234",
                    initiativeName: "Test Initiative",
                    idInstrument: "1234",
                    status: StatusEnum.ACTIVE
                  },
                  {
                    initiativeId: "1235",
                    initiativeName: "Test Initiative",
                    idInstrument: "1234",
                    status: StatusEnum.INACTIVE
                  },
                  {
                    initiativeId: "1236",
                    initiativeName: "Test Initiative",
                    idInstrument: "1234",
                    status: StatusEnum.PENDING_ENROLLMENT_REQUEST
                  }
                ]
              } as InitiativesWithInstrumentDTO
            }),
          2000
        );
      });
    const getInitiativesWithInstrumentResult =
      // : SagaCallReturnType<
      //   typeof getInitiativesWithInstrument
      // >

      yield* call(
        mockCall
        //   , {
        //   idWallet: payload.idWallet,
        //   bearerAuth: token,
        //   "Accept-Language": language
        // }
      );
    yield* put(
      pipe(
        E.right(getInitiativesWithInstrumentResult),
        E.fold(
          error =>
            idPayWalletInitiativesGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return idPayWalletInitiativesGet.success(res.value);
            }
            // console.log(res.value);
            return idPayWalletInitiativesGet.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(idPayWalletInitiativesGet.failure({ ...getNetworkError(e) }));
  }
}

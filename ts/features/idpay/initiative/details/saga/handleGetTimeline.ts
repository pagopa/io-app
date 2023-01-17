import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { OperationTypeEnum as IbanOperationType } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as InstrumentOperationType } from "../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import { OperationTypeEnum as OnboardingOperationType } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { TimelineDTO } from "../../../../../../definitions/idpay/timeline/TimelineDTO";
import { OperationTypeEnum as TransactionOperationType } from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayTimelineClient } from "../api/client";
import {
  idpayTimelineGet,
  IdPayInitiativeGetPayloadType
} from "../store/actions";

// TODO remove mocked data
const mockedData: TimelineDTO = {
  lastUpdate: new Date(),
  operationList: [
    {
      operationType: TransactionOperationType.TRANSACTION,
      operationDate: new Date(),
      amount: 100,
      brandLogo:
        "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_visa.png",
      circuitType: "01",
      maskedPan: "1234",
      operationId: "1"
    },
    {
      operationType: InstrumentOperationType.ADD_INSTRUMENT,
      channel: "APP",
      operationDate: new Date(),
      brandLogo:
        "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_visa.png",
      maskedPan: "1234",
      operationId: "2"
    },
    {
      operationType: IbanOperationType.ADD_IBAN,
      channel: "APP",
      operationDate: new Date(),
      iban: "IT60X0542811101000000123456",
      operationId: "3"
    },
    {
      operationType: OnboardingOperationType.ONBOARDING,
      operationDate: new Date(),
      operationId: "4"
    }
  ]
};

/**
 * Handle the remote call to retrieve the IDPay initiative details
 * @param getTimeline
 * @param action
 * @param initiativeId
 */
export function* handleGetTimeline(
  getTimeline: IDPayTimelineClient["getTimeline"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayInitiativeGetPayloadType
) {
  try {
    const getTimelineResult: SagaCallReturnType<typeof getTimeline> =
      yield* call(getTimeline, {
        bearerAuth: token,
        "Accept-Language": language,
        initiativeId: payload.initiativeId
      });
    yield pipe(
      getTimelineResult,
      E.fold(
        error =>
          put(
            idpayTimelineGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idpayTimelineGet.success(mockedData)
              : idpayTimelineGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idpayTimelineGet.failure({ ...getNetworkError(e) }));
  }
}

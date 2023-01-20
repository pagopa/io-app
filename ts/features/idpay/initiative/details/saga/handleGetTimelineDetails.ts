import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayTimelineClient } from "../api/client";
import {
  idpayTimelineDetailsGet,
  IdPayTimelineDetailsGetPayloadType
} from "../store/actions";

import { OperationTypeEnum as TransactionOperationType } from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { TransactionDetailDTO } from "../../../../../../definitions/idpay/timeline/TransactionDetailDTO";

const mockTransaction: TransactionDetailDTO = {
  operationType: TransactionOperationType.TRANSACTION,
  operationDate: new Date(),
  amount: 100,
  brandLogo:
    "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_visa.png",
  circuitType: "01",
  maskedPan: "1234",
  operationId: "1",
  accrued: 100,
  idTrxAcquirer: "1",
  idTrxIssuer: "1"
};

export function* handleGetTimelineDetails(
  getTimelineDetail: IDPayTimelineClient["getTimelineDetail"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayTimelineDetailsGetPayloadType
) {
  try {
    const getTimelineDetailResult: SagaCallReturnType<
      typeof getTimelineDetail
    > = yield* call(getTimelineDetail, {
      bearerAuth: token,
      "Accept-Language": language,
      initiativeId: payload.initiativeId,
      operationId: payload.operationId
    });
    yield pipe(
      getTimelineDetailResult,
      E.fold(
        error =>
          put(
            idpayTimelineDetailsGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idpayTimelineDetailsGet.success(response.value)
              : idpayTimelineDetailsGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idpayTimelineDetailsGet.failure({ ...getNetworkError(e) }));
  }
}

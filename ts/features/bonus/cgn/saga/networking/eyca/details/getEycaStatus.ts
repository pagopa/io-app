import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";
import { BackendCGN } from "../../../../api/backendCgn";
import { cgnEycaStatus } from "../../../../store/actions/eyca/details";
import { EycaDetailKOStatus } from "../../../../store/reducers/eyca/details";
import { withRefreshApiCall } from "../../../../../../authentication/fastLogin/saga/utils";

const eycaStatusMap: Record<number, EycaDetailKOStatus> = {
  403: "INELIGIBLE",
  404: "NOT_FOUND",
  409: "ERROR"
};

/**
 * Retrieve dispatch the actual status of EYCA card:
 * - 200 -> success - FOUND + EycaCard (CardPending | EycaCardActivated | EycaCardRevoked | EycaCardExpired)
 * - 403 -> success - INELIGIBLE
 * - 404 -> success - NOT FOUND
 * - 409 -> success - ERROR
 * - 401 / 500 -> failure
 * @param getEycaStatus
 */
export function* handleGetEycaStatus(
  getEycaStatus: ReturnType<typeof BackendCGN>["getEycaStatus"],
  getEycaStatusAction: ActionType<(typeof cgnEycaStatus)["request"]>
): Generator<ReduxSagaEffect, void, any> {
  try {
    const eycaInformationRequest = getEycaStatus({});
    const eycaInformationResult = (yield* call(
      withRefreshApiCall,
      eycaInformationRequest,
      getEycaStatusAction
    )) as unknown as SagaCallReturnType<typeof getEycaStatus>;
    if (E.isLeft(eycaInformationResult)) {
      yield* put(
        cgnEycaStatus.failure(
          getGenericError(
            new Error(readablePrivacyReport(eycaInformationResult.left))
          )
        )
      );
      return;
    }

    if (eycaInformationResult.right.status === 200) {
      yield* put(
        cgnEycaStatus.success({
          status: "FOUND",
          card: eycaInformationResult.right.value
        })
      );
      return;
    }
    const status = eycaStatusMap[eycaInformationResult.right.status];
    const action = status
      ? cgnEycaStatus.success({
          status
        })
      : cgnEycaStatus.failure(
          getGenericError(
            new Error(`response status ${eycaInformationResult.right.status}`)
          )
        );
    yield* put(action);
  } catch (e) {
    yield* put(cgnEycaStatus.failure(getNetworkError(e)));
  }
}

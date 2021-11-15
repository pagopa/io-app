import { call, Effect, put } from "redux-saga/effects";
import { BackendCGN } from "../../../../api/backendCgn";
import { SagaCallReturnType } from "../../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../../utils/errors";
import { cgnEycaStatus } from "../../../../store/actions/eyca/details";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";
import { EycaDetailKOStatus } from "../../../../store/reducers/eyca/details";

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
  getEycaStatus: ReturnType<typeof BackendCGN>["getEycaStatus"]
): Generator<Effect, void, any> {
  try {
    const eycaInformationResult: SagaCallReturnType<typeof getEycaStatus> =
      yield call(getEycaStatus, {});
    if (eycaInformationResult.isLeft()) {
      yield put(
        cgnEycaStatus.failure(
          getGenericError(
            new Error(readablePrivacyReport(eycaInformationResult.value))
          )
        )
      );
      return;
    }

    if (eycaInformationResult.value.status === 200) {
      yield put(
        cgnEycaStatus.success({
          status: "FOUND",
          card: eycaInformationResult.value.value
        })
      );
      return;
    }
    const status = eycaStatusMap[eycaInformationResult.value.status];
    const action = status
      ? cgnEycaStatus.success({
          status
        })
      : cgnEycaStatus.failure(
          getGenericError(
            new Error(`response status ${eycaInformationResult.value.status}`)
          )
        );
    yield put(action);
  } catch (e) {
    yield put(cgnEycaStatus.failure(getNetworkError(e)));
  }
}

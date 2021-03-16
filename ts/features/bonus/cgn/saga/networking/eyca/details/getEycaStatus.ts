import { call, put } from "redux-saga/effects";
import { BackendCGN } from "../../../../api/backendCgn";
import { SagaCallReturnType } from "../../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../../utils/errors";
import { cgnEycaDetails } from "../../../../store/actions/eyca/details";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";
import { EycaDetailKOStatus } from "../../../../store/reducers/eyca/details";

const eycaStatusMap: Record<number, EycaDetailKOStatus> = {
  403: "INELIGIBLE",
  404: "NOT_FOUND",
  409: "ERROR"
};

/**
 * Saga to retrieve the actual status of EYCA Details and status:
 * We have a mixture of cases based on EYCA status and API response status:
 * - 200 -> FOUND - got the EycaCard (CardPending | EycaCardActivated | EycaCardRevoked | EycaCardExpired)
 * - 403 -> INELIGIBLE
 * - 404 -> NOT FOUND
 * - 409 / 401 / 500 -> ERROR
 * @param getEycaStatus
 */
export function* handleGetEycaStatus(
  getEycaStatus: ReturnType<typeof BackendCGN>["getEycaStatus"]
) {
  try {
    const eycaInformationResult: SagaCallReturnType<typeof getEycaStatus> = yield call(
      getEycaStatus,
      {}
    );
    if (eycaInformationResult.isLeft()) {
      yield put(
        cgnEycaDetails.failure(
          getGenericError(
            new Error(readablePrivacyReport(eycaInformationResult.value))
          )
        )
      );
      return;
    }

    if (eycaInformationResult.value.status === 200) {
      yield put(
        cgnEycaDetails.success({
          status: "FOUND",
          card: eycaInformationResult.value.value
        })
      );
      return;
    }
    const status = eycaStatusMap[eycaInformationResult.value.status];
    const action = status
      ? cgnEycaDetails.success({
          status
        })
      : cgnEycaDetails.failure(
          getGenericError(
            new Error(`response status ${eycaInformationResult.value.status}`)
          )
        );
    yield put(action);
  } catch (e) {
    yield put(cgnEycaDetails.failure(getNetworkError(e)));
  }
}

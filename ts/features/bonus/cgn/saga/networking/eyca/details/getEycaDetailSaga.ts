import { call, put } from "redux-saga/effects";
import { BackendCGN } from "../../../../api/backendCgn";
import { SagaCallReturnType } from "../../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../../utils/errors";
import { cgnEycaDetails } from "../../../../store/actions/eyca/details";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";

/**
 * Saga to retrieve the actual status of EYCA Details and status:
 * We have a mixture of cases based on EYCA status and API response status:
 * - 200 -> we check if the card is PENDING and check the actual status of the activation process if it's in ERROR
 *          status we should show the Eyca Error component
 * - 409/404 -> The user is ELIGIBLE for an EYCA Card but no information is available, should ask again for EYCA Activation
 * - Others -> User is not ELIGIBLE for an Eyca card we, won't show any information in the screen
 * @param getEycaStatus
 */
export function* eycaGetInformationSaga(
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
    } else {
      switch (eycaInformationResult.value.status) {
        case 200:
          yield put(cgnEycaDetails.success(eycaInformationResult.value.value));
          break;
        // FIXME 409 is really not found?
        case 409:
        case 404:
          yield put(cgnEycaDetails.success(undefined));
          break;
        default:
          yield put(
            cgnEycaDetails.failure(
              getGenericError(
                new Error(
                  `response status ${eycaInformationResult.value.status}`
                )
              )
            )
          );
      }
    }
  } catch (e) {
    yield put(cgnEycaDetails.failure(getNetworkError(e)));
  }
}

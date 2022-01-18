import { call, put } from "redux-saga/effects";
import { cgnUnsubscribe } from "../../../store/actions/unsubscribe";
import { BackendCGN } from "../../../api/backendCgn";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters"; // handle the request for CGN unsubscription

// handle the request for CGN unsubscription
export function* cgnUnsubscriptionHandler(
  startCgnUnsubscription: ReturnType<
    typeof BackendCGN
  >["startCgnUnsubscription"]
) {
  try {
    const unsubscriptionResult: SagaCallReturnType<
      typeof startCgnUnsubscription
    > = yield call(startCgnUnsubscription, {});
    if (unsubscriptionResult.isRight()) {
      if (
        unsubscriptionResult.value.status === 201 ||
        unsubscriptionResult.value.status === 202
      ) {
        yield put(cgnUnsubscribe.success());
        return;
      }
      throw new Error(
        `Response in status ${unsubscriptionResult.value.status}`
      );
    }
    yield put(
      cgnUnsubscribe.failure(
        getGenericError(
          new Error(readablePrivacyReport(unsubscriptionResult.value))
        )
      )
    );
  } catch (e) {
    yield put(cgnUnsubscribe.failure(getNetworkError(e)));
  }
}

import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BackendCGN } from "../../../api/backendCgn";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { cgnDetails } from "../../../store/actions/details";
import { getError } from "../../../../../../utils/errors";

export function* cgnGetInformationSaga(
  getCgnStatus: ReturnType<typeof BackendCGN>["getCgnStatus"]
) {
  try {
    const cgnInformationResult: SagaCallReturnType<typeof getCgnStatus> = yield call(
      getCgnStatus,
      {}
    );
    if (cgnInformationResult.isLeft()) {
      throw Error(readableReport(cgnInformationResult.value));
    } else if (
      cgnInformationResult.isRight() &&
      cgnInformationResult.value.status === 200
    ) {
      yield put(cgnDetails.success(cgnInformationResult.value.value));
    } else {
      throw Error(`response status ${cgnInformationResult.value.status}`);
    }
  } catch (e) {
    yield put(cgnDetails.failure(getError(e)));
  }
}

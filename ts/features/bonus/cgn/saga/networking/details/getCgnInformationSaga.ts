import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BackendCGN } from "../../../api/backendCgn";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { CgnActivatedStatus } from "../../../../../../../definitions/cgn/CgnActivatedStatus";
import { cgnDetails } from "../../../store/actions/details";

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
      CgnActivatedStatus.is(cgnInformationResult.value.value)
    ) {
      yield put(cgnDetails.success(cgnInformationResult.value.value));
    } else {
      throw Error("Card is in another status");
    }
  } catch (e) {
    yield put(cgnDetails.failure(e));
  }
}

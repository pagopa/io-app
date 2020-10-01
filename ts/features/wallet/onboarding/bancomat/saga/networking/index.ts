import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { loadAbi } from "../../store/actions";

// load all bancomat banks
export function* handleLoadAbi(
  getAbi: ReturnType<typeof PaymentManagerClient>["getAbi"],
  sessionManager: SessionManager<PaymentManagerToken>
) {
  try {
    const getAbiWithRefresh = sessionManager.withRefresh(getAbi);
    const getAbiWithRefreshResult: SagaCallReturnType<typeof getAbiWithRefresh> = yield call(
      getAbiWithRefresh
    );
    if (getAbiWithRefreshResult.isRight()) {
      if (getAbiWithRefreshResult.value.status === 200) {
        yield put(loadAbi.success(getAbiWithRefreshResult.value.value));
      } else {
        throw new Error(
          `response status ${getAbiWithRefreshResult.value.status}`
        );
      }
    } else {
      throw new Error(readableReport(getAbiWithRefreshResult.value));
    }
  } catch (e) {
    yield put(loadAbi.failure(e));
  }
}

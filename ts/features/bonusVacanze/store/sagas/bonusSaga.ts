import { readableReport } from "italia-ts-commons/lib/reporters";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { apiUrlPrefix } from "../../../../config";
import { SagaCallReturnType } from "../../../../types/utils";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import { availableBonusListLoad } from "../actions/bonusVacanze";

// handle bonus list loading
function* loadAvailableBonusesSaga(
  getAvailableBonuses: ReturnType<
    typeof BackendBonusVacanze
  >["getAvailableBonuses"]
): SagaIterator {
  try {
    const bonusListReponse: SagaCallReturnType<
      typeof getBonusList
    > = yield call(getBonusList, {});
    if (bonusListReponse.isRight()) {
      if (bonusListReponse.value.status === 200) {
        yield put(availableBonusListLoad.success(bonusListReponse.value.value));
        return;
      }
      throw Error(`response status ${bonusListReponse.value.status}`);
    } else {
      throw Error(readableReport(bonusListReponse.value));
    }
  } catch (e) {
    yield put(availableBonusListLoad.failure(e));
  }
}

// Saga that listen to all bonus requests
export function* watchBonusSaga(): SagaIterator {
  const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);
  // bonus list loading
  yield takeLatest(
    availableBonusListLoad.request,
    loadAvailableBonusesSaga,
    backendBonusVacanze.getAvailableBonuses
  );
}

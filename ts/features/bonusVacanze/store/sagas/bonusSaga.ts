//
import { readableReport } from "italia-ts-commons/lib/reporters";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { apiUrlPrefix } from "../../../../config";
import { SagaCallReturnType } from "../../../../types/utils";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import { bonusListLoad } from "../actions/bonusVacanze";

function* loadBonusListSaga(
  getBonusList: ReturnType<typeof BackendBonusVacanze>["getBonusList"]
): SagaIterator {
  try {
    const bonusListReponse: SagaCallReturnType<
      typeof getBonusList
    > = yield call(getBonusList, {});
    if (bonusListReponse.isRight()) {
      if (bonusListReponse.value.status === 200) {
        yield put(bonusListLoad.success(bonusListReponse.value.value));
        return;
      }
      throw Error(`response status ${bonusListReponse.value.status}`);
    } else {
      throw Error(readableReport(bonusListReponse.value));
    }
  } catch (e) {
    yield put(bonusListLoad.failure(e));
  }
}

export function* watchBonusSaga(): SagaIterator {
  const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);
  yield takeLatest(
    bonusListLoad.request,
    loadBonusListSaga,
    backendBonusVacanze.getBonusList
  );
}

import { readableReport } from "italia-ts-commons/lib/reporters";
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { SagaCallReturnType } from "../../../../types/utils";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import { availableBonusesLoad } from "../actions/bonusVacanze";

// handle bonus list loading
export function* handleLoadAvailableBonuses(
  getAvailableBonuses: ReturnType<
    typeof BackendBonusVacanze
  >["getAvailableBonuses"]
): SagaIterator {
  try {
    const bonusListReponse: SagaCallReturnType<
      typeof getAvailableBonuses
    > = yield call(getAvailableBonuses, {});
    if (bonusListReponse.isRight()) {
      if (bonusListReponse.value.status === 200) {
        yield put(availableBonusesLoad.success(bonusListReponse.value.value));
        return;
      }
      throw Error(`response status ${bonusListReponse.value.status}`);
    } else {
      throw Error(readableReport(bonusListReponse.value));
    }
  } catch (e) {
    yield put(availableBonusesLoad.failure(e));
  }
}

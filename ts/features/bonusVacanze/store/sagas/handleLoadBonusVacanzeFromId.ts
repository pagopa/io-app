import { readableReport } from "italia-ts-commons/lib/reporters";
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import { loadBonusVacanzeFromId } from "../actions/bonusVacanze";

// handle bonus list loading
export function* handleLoadBonusVacanzeFromId(
  getLatestBonusVacanzeFromId: ReturnType<
    typeof BackendBonusVacanze
  >["getLatestBonusVacanzeFromId"],
  action: ActionType<typeof loadBonusVacanzeFromId["request"]>
): SagaIterator {
  try {
    const bonusVacanzaResponse: SagaCallReturnType<
      typeof getLatestBonusVacanzeFromId
    > = yield call(getLatestBonusVacanzeFromId, { bonus_id: action.payload });
    if (bonusVacanzaResponse.isRight()) {
      if (bonusVacanzaResponse.value.status === 200) {
        yield put(
          loadBonusVacanzeFromId.success(bonusVacanzaResponse.value.value)
        );
        return;
      }
      throw Error(`response status ${bonusVacanzaResponse.value.status}`);
    } else {
      throw Error(readableReport(bonusVacanzaResponse.value));
    }
  } catch (e) {
    yield put(loadBonusVacanzeFromId.failure(e));
  }
}

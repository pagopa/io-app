import { readableReport } from "italia-ts-commons/lib/reporters";
import { SagaIterator } from "redux-saga";
import { all, call, put } from "redux-saga/effects";
import { SagaCallReturnType } from "../../../../types/utils";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import {
  loadAllBonusActivations,
  loadBonusVacanzeFromId
} from "../actions/bonusVacanze";
import { RTron } from "../../../../boot/configureStoreAndPersistor";

// handle all bonus activation load
export function* handleLoadAllBonusActivations(
  getAllBonusActivations: ReturnType<
    typeof BackendBonusVacanze
  >["getAllBonusActivations"]
): SagaIterator {
  try {
    const allBonusActivationsResponse: SagaCallReturnType<
      typeof getAllBonusActivations
    > = yield call(getAllBonusActivations, {});
    RTron.log("allBonusActivationsResponse", "1");
    if (allBonusActivationsResponse.isRight()) {
      if (allBonusActivationsResponse.value.status === 200) {
        // for each bonus load details
        const items = allBonusActivationsResponse.value.value.items;
        RTron.log("allBonusActivationsResponse", "2");
        const ids = items.map(i => i.id);
        yield all(ids.map(id => put(loadBonusVacanzeFromId.request(id))));
        RTron.log("allBonusActivationsResponse", "3");
        return;
      }
      throw Error(
        `response status ${allBonusActivationsResponse.value.status}`
      );
    } else {
      throw Error(readableReport(allBonusActivationsResponse.value));
    }
  } catch (e) {
    yield put(loadAllBonusActivations.failure(e));
  }
}

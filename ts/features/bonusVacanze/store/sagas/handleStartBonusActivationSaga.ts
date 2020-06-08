import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { RTron } from "../../../../boot/configureStoreAndPersistor";
import { SagaCallReturnType } from "../../../../types/utils";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";

export function* startBonusActivationSaga(
  startBonusActivationProcedure: ReturnType<
    typeof BackendBonusVacanze
  >["startBonusActivationProcedure"],
  getLatestBonusVacanzeFromId: ReturnType<
    typeof BackendBonusVacanze
  >["getLatestBonusVacanzeFromId"]
): SagaIterator {
  try {
    const startBonusActivationProcedureResult: SagaCallReturnType<
      typeof startBonusActivationProcedure
    > = yield call(startBonusActivationProcedure, {});
    RTron.log(startBonusActivationProcedureResult);
  } catch (e) {}
}

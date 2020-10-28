import { call } from "redux-saga/effects";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { SagaCallReturnType } from "../../../../../types/utils";
import { RTron } from "../../../../../boot/configureStoreAndPersistor";

/**
 * Networking logic to request the periods list
 * TODO: replace with real code
 * @param _
 */
export function* bpdLoadPeriodsSaga(
  awardPeriods: ReturnType<typeof BackendBpdClient>["awardPeriods"]
) {
  try {
    const awardPeriodsResult: SagaCallReturnType<typeof awardPeriods> = yield call(
      awardPeriods,
      {} as any
    );
    RTron.log(awardPeriodsResult);
  } catch (e) {}
}

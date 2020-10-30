import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { bpdAmountLoad } from "../../store/actions/amount";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getError } from "../../../../../utils/errors";

/**
 * Networking code to request the amount for a specified period.
 * TODO: replace with real code
 * @param action
 */
export function* bpdLoadAmountSaga(
  totalCashback: ReturnType<typeof BackendBpdClient>["totalCashback"],
  action: ActionType<typeof bpdAmountLoad.request>
) {
  try {
    const totalCashbackResult: SagaCallReturnType<typeof totalCashback> = yield call(
      totalCashback,
      { awardPeriodId: action.payload } as any
    );
    if (totalCashbackResult.isRight()) {
      if (totalCashbackResult.value.status === 200) {
      } else {
        throw new Error(`response status ${totalCashbackResult.value.status}`);
      }
    } else {
      throw new Error(readableReport(totalCashbackResult.value));
    }
  } catch (e) {
    //yield put(bpdAmountLoad.failure(getError(e)));
  }
}

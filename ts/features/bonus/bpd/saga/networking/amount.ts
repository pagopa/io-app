import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BpdAmount, bpdAmountLoad } from "../../store/actions/amount";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getError } from "../../../../../utils/errors";
import { AwardPeriodId } from "../../store/actions/periods";
import { TotalCashbackResource } from "../../../../../../definitions/bpd/winning_transactions/TotalCashbackResource";

// convert a network payload amount into the relative app domain model
const convertAmount = (
  networkAmount: TotalCashbackResource,
  awardPeriodId: AwardPeriodId
): BpdAmount => ({
  totalCashback: networkAmount.totalCashback,
  transactionNumber: networkAmount.transactionNumber,
  awardPeriodId
});

/**
 * Networking code to request the amount for a specified period.
 * @param totalCashback
 * @param action
 */
export function* bpdLoadAmountSaga(
  totalCashback: ReturnType<typeof BackendBpdClient>["totalCashback"],
  action: ActionType<typeof bpdAmountLoad.request>
) {
  const awardPeriodId = action.payload;
  try {
    const totalCashbackResult: SagaCallReturnType<typeof totalCashback> = yield call(
      totalCashback,
      { awardPeriodId } as any
    );
    if (totalCashbackResult.isRight()) {
      if (totalCashbackResult.value.status === 200) {
        yield put(
          bpdAmountLoad.success(
            convertAmount(totalCashbackResult.value.value, action.payload)
          )
        );
      } else {
        throw new Error(`response status ${totalCashbackResult.value.status}`);
      }
    } else {
      throw new Error(readableReport(totalCashbackResult.value));
    }
  } catch (e) {
    yield put(bpdAmountLoad.failure({ error: getError(e), awardPeriodId }));
  }
}

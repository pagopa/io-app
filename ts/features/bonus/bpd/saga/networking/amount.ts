import { Either, left, right } from "fp-ts/lib/Either";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect } from "redux-saga/effects";
import { TotalCashbackResource } from "../../../../../../definitions/bpd/winning_transactions/TotalCashbackResource";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getError } from "../../../../../utils/errors";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { BpdAmount, BpdAmountError } from "../../store/actions/amount";
import { AwardPeriodId } from "../../store/actions/periods";

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
 * @param awardPeriodId
 */
export function* bpdLoadAmountSaga(
  totalCashback: ReturnType<typeof BackendBpdClient>["totalCashback"],
  awardPeriodId: AwardPeriodId
): Generator<
  Effect,
  Either<BpdAmountError, BpdAmount>,
  SagaCallReturnType<typeof totalCashback>
> {
  try {
    const totalCashbackResult: SagaCallReturnType<typeof totalCashback> = yield call(
      totalCashback,
      { awardPeriodId } as any
    );
    if (totalCashbackResult.isRight()) {
      if (totalCashbackResult.value.status === 200) {
        return right<BpdAmountError, BpdAmount>(
          convertAmount(totalCashbackResult.value.value, awardPeriodId)
        );
      } else {
        throw new Error(`response status ${totalCashbackResult.value.status}`);
      }
    } else {
      throw new Error(readableReport(totalCashbackResult.value));
    }
  } catch (e) {
    return left<BpdAmountError, BpdAmount>({
      error: getError(e),
      awardPeriodId
    });
  }
}

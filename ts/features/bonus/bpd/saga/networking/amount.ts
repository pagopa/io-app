import * as E from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { call } from "typed-redux-saga/macro";
import { TotalCashbackResource } from "../../../../../../definitions/bpd/winning_transactions/TotalCashbackResource";
import { mixpanelTrack } from "../../../../../mixpanel";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../types/utils";
import { convertUnknownToError, getError } from "../../../../../utils/errors";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { AwardPeriodId, WithAwardPeriodId } from "../../store/actions/periods";

export type BpdAmount = WithAwardPeriodId & {
  // The total cashback amount gained by the user in the period (without super cashback)
  totalCashback: number;
  // The total transaction number in the period for the user
  transactionNumber: number;
};

export type BpdAmountError = WithAwardPeriodId & {
  error: Error;
};

// convert a network payload amount into the relative app domain model
const convertAmount = (
  networkAmount: TotalCashbackResource,
  awardPeriodId: AwardPeriodId
): BpdAmount => ({
  totalCashback: networkAmount.totalCashback,
  transactionNumber: networkAmount.transactionNumber,
  awardPeriodId
});

const mixpanelActionRequest = "BPD_AMOUNT_REQUEST";
const mixpanelActionSuccess = "BPD_AMOUNT_SUCCESS";
const mixpanelActionFailure = "BPD_AMOUNT_FAILURE";

/**
 * Networking code to request the amount for a specified period.
 * @param totalCashback
 * @param awardPeriodId
 */
export function* bpdLoadAmountSaga(
  totalCashback: ReturnType<typeof BackendBpdClient>["totalCashback"],
  awardPeriodId: AwardPeriodId
): Generator<
  ReduxSagaEffect,
  E.Either<BpdAmountError, BpdAmount>,
  SagaCallReturnType<typeof totalCashback>
> {
  void mixpanelTrack(mixpanelActionRequest, { awardPeriodId });
  try {
    const totalCashbackResult: SagaCallReturnType<typeof totalCashback> =
      yield* call(totalCashback, { awardPeriodId } as any);
    if (E.isRight(totalCashbackResult)) {
      if (totalCashbackResult.right.status === 200) {
        void mixpanelTrack(mixpanelActionSuccess, { awardPeriodId });
        return E.right<BpdAmountError, BpdAmount>(
          convertAmount(totalCashbackResult.right.value, awardPeriodId)
        );
      } else {
        throw new Error(`response status ${totalCashbackResult.right.status}`);
      }
    } else {
      throw new Error(readableReport(totalCashbackResult.left));
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      awardPeriodId,
      reason: convertUnknownToError(e).message
    });
    return E.left<BpdAmountError, BpdAmount>({
      error: getError(e),
      awardPeriodId
    });
  }
}

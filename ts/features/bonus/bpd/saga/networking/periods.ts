import { Either, left, right } from "fp-ts/lib/Either";
import { fromNullable } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect } from "redux-saga/effects";
import { AwardPeriodResource } from "../../../../../../definitions/bpd/award_periods/AwardPeriodResource";
import { mixpanelTrack } from "../../../../../mixpanel";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getError } from "../../../../../utils/errors";
import { BackendBpdClient } from "../../api/backendBpdClient";
import {
  AwardPeriodId,
  BpdPeriod,
  BpdPeriodStatus
} from "../../store/actions/periods";

// mapping between network payload status and app domain model status
const periodStatusMap: Map<string, BpdPeriodStatus> = new Map<
  string,
  BpdPeriodStatus
>([
  ["ACTIVE", "Active"],
  ["INACTIVE", "Inactive"],
  ["CLOSED", "Closed"]
]);

// convert a network payload award period into the relative app domain model
const convertPeriod = (
  networkPeriod: AwardPeriodResource,
  statusFallback: BpdPeriodStatus = "Inactive"
): BpdPeriod => ({
  ...networkPeriod,
  awardPeriodId: networkPeriod.awardPeriodId as AwardPeriodId,
  superCashbackAmount: networkPeriod.maxAmount,
  status: fromNullable(periodStatusMap.get(networkPeriod.status)).getOrElse(
    statusFallback
  )
});

const mixpanelActionRequest = "BPD_PERIODS_REQUEST";
const mixpanelActionSuccess = "BPD_PERIODS_SUCCESS";
const mixpanelActionFailure = "BPD_PERIODS_FAILURE";

/**
 * Networking logic to request the periods list
 * @param awardPeriods
 */
export function* bpdLoadPeriodsSaga(
  awardPeriods: ReturnType<typeof BackendBpdClient>["awardPeriods"]
): Generator<
  Effect,
  Either<Error, ReadonlyArray<BpdPeriod>>,
  SagaCallReturnType<typeof awardPeriods>
> {
  void mixpanelTrack(mixpanelActionRequest);
  try {
    const awardPeriodsResult: SagaCallReturnType<typeof awardPeriods> =
      yield call(awardPeriods, {} as any);
    if (awardPeriodsResult.isRight()) {
      if (awardPeriodsResult.value.status === 200) {
        const periods = awardPeriodsResult.value.value;
        void mixpanelTrack(mixpanelActionSuccess, {
          count: periods.length
        });
        // convert data into app domain model
        return right<Error, ReadonlyArray<BpdPeriod>>(
          periods.map<BpdPeriod>(p => convertPeriod(p))
        );
      } else {
        throw new Error(`response status ${awardPeriodsResult.value.status}`);
      }
    } else {
      throw new Error(readableReport(awardPeriodsResult.value));
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      reason: e.message
    });
    return left<Error, ReadonlyArray<BpdPeriod>>(getError(e));
  }
}

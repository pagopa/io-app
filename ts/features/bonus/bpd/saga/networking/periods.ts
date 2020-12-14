import { fromNullable } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect } from "redux-saga/effects";
import { Either, left, right } from "fp-ts/lib/Either";
import { AwardPeriodResource } from "../../../../../../definitions/bpd/award_periods/AwardPeriodResource";
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
  superCashbackAmount: 0, // this field isn't yet present in AwardPeriodResource
  status: fromNullable(periodStatusMap.get(networkPeriod.status)).getOrElse(
    statusFallback
  )
});

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
  try {
    const awardPeriodsResult: SagaCallReturnType<typeof awardPeriods> = yield call(
      awardPeriods,
      {} as any
    );
    if (awardPeriodsResult.isRight()) {
      if (awardPeriodsResult.value.status === 200) {
        const periods = awardPeriodsResult.value.value;
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
    return left<Error, ReadonlyArray<BpdPeriod>>(getError(e));
  }
}

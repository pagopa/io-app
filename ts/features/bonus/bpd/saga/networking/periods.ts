import { call, put } from "redux-saga/effects";
import { fromNullable } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { SagaCallReturnType } from "../../../../../types/utils";
import {
  AwardPeriodId,
  BpdPeriod,
  bpdPeriodsLoad,
  BpdPeriodStatus
} from "../../store/actions/periods";
import { AwardPeriodResource } from "../../../../../../definitions/bpd/award_periods/AwardPeriodResource";
import { getError } from "../../../../../utils/errors";

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
  awardPeriodId: networkPeriod.awardPeriodId.toString() as AwardPeriodId,
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
) {
  try {
    const awardPeriodsResult: SagaCallReturnType<typeof awardPeriods> = yield call(
      awardPeriods,
      {} as any
    );
    if (awardPeriodsResult.isRight()) {
      if (awardPeriodsResult.value.status === 200) {
        const periods = awardPeriodsResult.value.value;
        // convert data into app domain model
        yield put(
          bpdPeriodsLoad.success(
            periods.map<BpdPeriod>(p => convertPeriod(p))
          )
        );
      } else {
        throw new Error(`response status ${awardPeriodsResult.value.status}`);
      }
    } else {
      throw new Error(readableReport(awardPeriodsResult.value));
    }
  } catch (e) {
    yield put(bpdPeriodsLoad.failure(getError(e)));
  }
}

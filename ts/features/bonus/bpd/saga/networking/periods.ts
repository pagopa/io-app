import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { call } from "typed-redux-saga/macro";
import { pipe } from "fp-ts/lib/function";
import { AwardPeriodResource } from "../../../../../../definitions/bpd/award_periods/AwardPeriodResource";
import { mixpanelTrack } from "../../../../../mixpanel";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../types/utils";
import { convertUnknownToError, getError } from "../../../../../utils/errors";
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
  status: pipe(
    periodStatusMap.get(networkPeriod.status),
    O.fromNullable,
    O.getOrElse(() => statusFallback)
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
  ReduxSagaEffect,
  E.Either<Error, ReadonlyArray<BpdPeriod>>,
  SagaCallReturnType<typeof awardPeriods>
> {
  void mixpanelTrack(mixpanelActionRequest);
  try {
    const awardPeriodsResult: SagaCallReturnType<typeof awardPeriods> =
      yield* call(awardPeriods, {} as any);
    if (E.isRight(awardPeriodsResult)) {
      if (awardPeriodsResult.right.status === 200) {
        const periods = awardPeriodsResult.right.value;
        void mixpanelTrack(mixpanelActionSuccess, {
          count: periods.length
        });
        // convert data into app domain model
        return E.right<Error, ReadonlyArray<BpdPeriod>>(
          periods.map<BpdPeriod>(p => convertPeriod(p))
        );
      } else {
        throw new Error(`response status ${awardPeriodsResult.right.status}`);
      }
    } else {
      throw new Error(readableReport(awardPeriodsResult.left));
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      reason: convertUnknownToError(e).message
    });
    return E.left<Error, ReadonlyArray<BpdPeriod>>(getError(e));
  }
}

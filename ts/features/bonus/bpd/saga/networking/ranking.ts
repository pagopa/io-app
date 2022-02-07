import * as A from "fp-ts/lib/Array";
import { Either, fromOption, left, right } from "fp-ts/lib/Either";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { CitizenRankingResourceArray } from "../../../../../../definitions/bpd/citizen/CitizenRankingResourceArray";
import { CitizenRankingMilestoneResourceArray } from "../../../../../../definitions/bpd/citizen_v2/CitizenRankingMilestoneResourceArray";
import { MilestoneResource } from "../../../../../../definitions/bpd/citizen_v2/MilestoneResource";
import { bpdTransactionsPaging } from "../../../../../config";
import { mixpanelTrack } from "../../../../../mixpanel";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../types/utils";
import { getError } from "../../../../../utils/errors";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { AwardPeriodId } from "../../store/actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadMilestone
} from "../../store/actions/transactions";
import { BpdRankingReady } from "../../store/reducers/details/periods";
import { BpdPivotTransaction } from "../../store/reducers/details/transactionsv2/entities";

// TODO: clean after V1 removal
const version = bpdTransactionsPaging ? "_V2" : "";

const mixpanelActionRequest = `BPD_RANKING${version}_REQUEST`;
const mixpanelActionSuccess = `BPD_RANKING${version}_SUCCESS`;
const mixpanelActionFailure = `BPD_RANKING${version}_FAILURE`;

// convert the network payload ranking into the relative app domain model
const convertRankingArray = (
  rankings: CitizenRankingResourceArray
): ReadonlyArray<BpdRankingReady> =>
  rankings.map<BpdRankingReady>(rr => ({
    ...rr,
    awardPeriodId: rr.awardPeriodId as AwardPeriodId,
    kind: "ready"
  }));

/**
 * Load the ranking for all the periods
 * @deprecated TODO: remove after replacing transactions v1
 * @param getRanking
 */
export function* bpdLoadRaking(
  getRanking: ReturnType<typeof BackendBpdClient>["getRanking"]
): Generator<
  ReduxSagaEffect,
  Either<Error, ReadonlyArray<BpdRankingReady>>,
  any
> {
  try {
    void mixpanelTrack(mixpanelActionRequest);
    const getRankingResult: SagaCallReturnType<typeof getRanking> = yield* call(
      getRanking,
      {} as any
    );
    if (getRankingResult.isRight()) {
      if (getRankingResult.value.status === 200) {
        void mixpanelTrack(mixpanelActionSuccess, {
          count: getRankingResult.value.value?.length
        });
        return right<Error, ReadonlyArray<BpdRankingReady>>(
          convertRankingArray(getRankingResult.value.value)
        );
      } else if (getRankingResult.value.status === 404) {
        void mixpanelTrack(mixpanelActionSuccess, {
          count: 0
        });
        return right<Error, ReadonlyArray<BpdRankingReady>>([]);
      } else {
        return left<Error, ReadonlyArray<BpdRankingReady>>(
          new Error(`response status ${getRankingResult.value.status}`)
        );
      }
    } else {
      return left<Error, ReadonlyArray<BpdRankingReady>>(
        new Error(readableReport(getRankingResult.value))
      );
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      reason: getError(e).message
    });
    return left<Error, ReadonlyArray<BpdRankingReady>>(getError(e));
  }
}

// convert the network payload ranking into the relative app domain model
const convertRankingArrayV2 = (
  rankings: CitizenRankingMilestoneResourceArray
): ReadonlyArray<BpdRankingReady> =>
  rankings.map<BpdRankingReady>(rr => ({
    ...rr,
    awardPeriodId: rr.awardPeriodId as AwardPeriodId,
    pivot: extractPivot(rr.milestoneResource),
    kind: "ready"
  }));

const extractPivot = (
  mr: MilestoneResource | undefined
): BpdPivotTransaction | undefined => {
  if (mr?.idTrxPivot !== undefined && mr?.cashbackNorm !== undefined) {
    return {
      amount: mr.cashbackNorm,
      idTrx: mr.idTrxPivot as BpdTransactionId
    };
  }
  return undefined;
};

/**
 * Load the ranking for all the periods
 * @param getRanking
 */
export function* bpdLoadRakingV2(
  getRanking: ReturnType<typeof BackendBpdClient>["getRankingV2"]
): Generator<
  ReduxSagaEffect,
  Either<Error, ReadonlyArray<BpdRankingReady>>,
  any
> {
  try {
    void mixpanelTrack(mixpanelActionRequest);
    const getRankingResult: SagaCallReturnType<typeof getRanking> = yield* call(
      getRanking,
      {} as any
    );
    if (getRankingResult.isRight()) {
      if (getRankingResult.value.status === 200) {
        void mixpanelTrack(mixpanelActionSuccess, {
          count: getRankingResult.value.value?.length
        });
        return right<Error, ReadonlyArray<BpdRankingReady>>(
          convertRankingArrayV2(getRankingResult.value.value)
        );
      } else if (getRankingResult.value.status === 404) {
        void mixpanelTrack(mixpanelActionSuccess, {
          count: 0
        });
        return right<Error, ReadonlyArray<BpdRankingReady>>([]);
      } else {
        return left<Error, ReadonlyArray<BpdRankingReady>>(
          new Error(`response status ${getRankingResult.value.status}`)
        );
      }
    } else {
      return left<Error, ReadonlyArray<BpdRankingReady>>(
        new Error(readableReport(getRankingResult.value))
      );
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      reason: getError(e).message
    });
    return left<Error, ReadonlyArray<BpdRankingReady>>(getError(e));
  }
}

/**
 * Handle the action bpdTransactionsLoadMilestone.request
 * @param getRanking
 * @param action
 */
export function* handleLoadMilestone(
  getRanking: ReturnType<typeof BackendBpdClient>["getRankingV2"],
  action: ActionType<typeof bpdTransactionsLoadMilestone.request>
) {
  // get the results
  const result: SagaCallReturnType<typeof bpdLoadRakingV2> = yield* call(
    bpdLoadRakingV2,
    getRanking
  );

  const extractMilestonePivot = result.chain(x =>
    fromOption(
      new Error(`Period ${action.payload} not found in the ranking response`)
    )(
      A.findFirst([...x], x => x.awardPeriodId === action.payload).map(
        x => x.pivot
      )
    )
  );

  // dispatch the related action
  if (extractMilestonePivot.isRight()) {
    yield* put(
      bpdTransactionsLoadMilestone.success({
        awardPeriodId: action.payload,
        result: extractMilestonePivot.value
      })
    );
  } else {
    yield* put(
      bpdTransactionsLoadMilestone.failure({
        awardPeriodId: action.payload,
        error: extractMilestonePivot.value
      })
    );
  }
}

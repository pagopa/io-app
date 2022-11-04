import * as E from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga-test-plan/matchers";
import {
  AwardPeriodId,
  BpdPeriod,
  bpdPeriodsAmountLoad
} from "../../../store/actions/periods";
import {
  notEligibleAmount,
  zeroAmount
} from "../../../store/reducers/__mock__/amount";
import {
  activePeriod,
  closedPeriod,
  inactivePeriod,
  withAwardPeriodId
} from "../../../store/reducers/__mock__/periods";
import {
  notReadyRanking,
  readyRanking
} from "../../../store/reducers/__mock__/ranking";
import { BpdAmount, bpdLoadAmountSaga } from "../amount";
import { loadPeriodsWithInfo } from "../loadPeriodsWithInfo";
import { bpdLoadPeriodsSaga } from "../periods";
import { bpdLoadRakingV2 } from "../ranking";

describe("loadPeriodsAmount, mock networking saga", () => {
  it("Dispatch failure if awardsPeriods fails", async () => {
    const awardPeriodFailure = new Error("Error while loading periods");
    const backendClient = {
      totalCashback: jest.fn(),
      awardPeriods: jest.fn(),
      getRankingV2: jest.fn()
    };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          E.left(awardPeriodFailure)
        ]
      ])
      .put(bpdPeriodsAmountLoad.failure(awardPeriodFailure))
      .run();
  });

  it("Dispatch failure if a single totalCashback is left", async () => {
    const totalCashbackFailure = new Error("Error for a single amount");
    const backendClient = {
      totalCashback: jest.fn(),
      awardPeriods: jest.fn(),
      getRankingV2: jest.fn()
    };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          E.right<Error, ReadonlyArray<BpdPeriod>>([activePeriod, closedPeriod])
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 0),
          E.right(zeroAmount)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 1),
          E.left(totalCashbackFailure)
        ],
        [
          call(bpdLoadRakingV2, backendClient.getRankingV2),
          E.right([readyRanking])
        ]
      ])
      .put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading amounts"))
      )
      .run();
  });
  it("Dispatch failure if all the totalCashback are E.left", async () => {
    const totalCashbackFailure = new Error("Error for a single amount");
    const backendClient = {
      totalCashback: jest.fn(),
      awardPeriods: jest.fn(),
      getRankingV2: jest.fn()
    };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          E.right<Error, ReadonlyArray<BpdPeriod>>([activePeriod, closedPeriod])
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 0),
          E.left(totalCashbackFailure)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 1),
          E.left(totalCashbackFailure)
        ],
        [
          call(bpdLoadRakingV2, backendClient.getRankingV2),
          E.right([readyRanking])
        ]
      ])
      .put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading amounts"))
      )
      .run();
  });

  it("Dispatch failure if load ranking is E.left", async () => {
    const totalCashbackFailure = new Error("Error for a single amount");
    const backendClient = {
      totalCashback: jest.fn(),
      awardPeriods: jest.fn(),
      getRankingV2: jest.fn()
    };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          E.right<Error, ReadonlyArray<BpdPeriod>>([activePeriod, closedPeriod])
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 0),
          E.left(totalCashbackFailure)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 1),
          E.left(totalCashbackFailure)
        ],
        [
          call(bpdLoadRakingV2, backendClient.getRankingV2),
          E.left(new Error("error"))
        ]
      ])
      .put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading rankings"))
      )
      .run();
  });

  it("Dispatch success if all the totalCashback are E.right", async () => {
    const amountForPeriod0: BpdAmount = {
      ...zeroAmount,
      awardPeriodId: 0 as AwardPeriodId
    };
    const amountForPeriod1: BpdAmount = {
      ...notEligibleAmount,
      awardPeriodId: 1 as AwardPeriodId
    };
    const backendClient = {
      totalCashback: jest.fn(),
      awardPeriods: jest.fn(),
      getRankingV2: jest.fn()
    };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          E.right<Error, ReadonlyArray<BpdPeriod>>([activePeriod, closedPeriod])
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 0),
          E.right(amountForPeriod0)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 1),
          E.right(amountForPeriod1)
        ],
        [
          call(bpdLoadRakingV2, backendClient.getRankingV2),
          E.right([readyRanking])
        ]
      ])
      .put(
        bpdPeriodsAmountLoad.success([
          { ...activePeriod, amount: amountForPeriod1, ranking: readyRanking },
          {
            ...closedPeriod,
            amount: amountForPeriod0,
            ranking: notReadyRanking
          }
        ])
      )
      .run();
  });
  it("Dispatch success if all the totalCashback are E.right, do not request inactive periods", async () => {
    const amountForPeriod0: BpdAmount = {
      ...zeroAmount,
      awardPeriodId: 0 as AwardPeriodId
    };
    const amountForPeriod1: BpdAmount = {
      ...notEligibleAmount,
      awardPeriodId: 1 as AwardPeriodId
    };
    const amountForPeriod2: BpdAmount = {
      ...notEligibleAmount,
      awardPeriodId: 2 as AwardPeriodId
    };
    const backendClient = {
      totalCashback: jest.fn(),
      awardPeriods: jest.fn(),
      getRankingV2: jest.fn()
    };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          E.right<Error, ReadonlyArray<BpdPeriod>>([
            activePeriod,
            closedPeriod,
            inactivePeriod
          ])
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 0),
          E.right(amountForPeriod0)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 1),
          E.right(amountForPeriod1)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 2),
          E.right(amountForPeriod2)
        ],
        [
          call(bpdLoadRakingV2, backendClient.getRankingV2),
          E.right([readyRanking])
        ]
      ])
      .put(
        bpdPeriodsAmountLoad.success([
          {
            ...inactivePeriod,
            amount: { ...zeroAmount, awardPeriodId: 2 as AwardPeriodId },
            ranking: withAwardPeriodId(notReadyRanking, 2 as AwardPeriodId)
          },
          { ...activePeriod, amount: amountForPeriod1, ranking: readyRanking },
          {
            ...closedPeriod,
            amount: amountForPeriod0,
            ranking: notReadyRanking
          }
        ])
      )
      .run();
  });
});

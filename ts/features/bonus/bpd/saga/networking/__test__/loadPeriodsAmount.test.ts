import { left, right } from "fp-ts/lib/Either";
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
  inactivePeriod
} from "../../../store/reducers/__mock__/periods";
import { readyRanking } from "../../../store/reducers/__mock__/ranking";
import { BpdAmount, bpdLoadAmountSaga } from "../amount";
import { bpdLoadPeriodsSaga } from "../periods";
import { loadPeriodsWithInfo } from "../prefetchBpdDetails";

describe("loadPeriodsAmount, mock networking saga", () => {
  it("Dispatch failure if awardsPeriods fails", async () => {
    const awardPeriodFailure = new Error("Error while loading periods");
    const backendClient = { totalCashback: jest.fn(), awardPeriods: jest.fn() };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          left(awardPeriodFailure)
        ]
      ])
      .put(bpdPeriodsAmountLoad.failure(awardPeriodFailure))
      .run();
  });

  it("Dispatch failure if a single totalCashback is left", async () => {
    const totalCashbackFailure = new Error("Error for a single amount");
    const backendClient = { totalCashback: jest.fn(), awardPeriods: jest.fn() };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          right<Error, ReadonlyArray<BpdPeriod>>([activePeriod, closedPeriod])
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 0),
          right(zeroAmount)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 1),
          left(totalCashbackFailure)
        ]
      ])
      .put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading amounts"))
      )
      .run();
  });
  it("Dispatch failure if all the totalCashback are left", async () => {
    const totalCashbackFailure = new Error("Error for a single amount");
    const backendClient = { totalCashback: jest.fn(), awardPeriods: jest.fn() };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          right<Error, ReadonlyArray<BpdPeriod>>([activePeriod, closedPeriod])
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 0),
          left(totalCashbackFailure)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 1),
          left(totalCashbackFailure)
        ]
      ])
      .put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading amounts"))
      )
      .run();
  });
  it("Dispatch success if all the totalCashback are right", async () => {
    const amountForPeriod0: BpdAmount = {
      ...zeroAmount,
      awardPeriodId: 0 as AwardPeriodId
    };
    const amountForPeriod1: BpdAmount = {
      ...notEligibleAmount,
      awardPeriodId: 1 as AwardPeriodId
    };
    const backendClient = { totalCashback: jest.fn(), awardPeriods: jest.fn() };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          right<Error, ReadonlyArray<BpdPeriod>>([activePeriod, closedPeriod])
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 0),
          right(amountForPeriod0)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 1),
          right(amountForPeriod1)
        ]
      ])
      .put(
        bpdPeriodsAmountLoad.success([
          { ...activePeriod, amount: amountForPeriod1, ranking: readyRanking },
          { ...closedPeriod, amount: amountForPeriod0, ranking: readyRanking }
        ])
      )
      .run();
  });
  it("Dispatch success if all the totalCashback are right, do not request inactive periods", async () => {
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
    const backendClient = { totalCashback: jest.fn(), awardPeriods: jest.fn() };
    await expectSaga(loadPeriodsWithInfo, backendClient)
      .provide([
        [
          call(bpdLoadPeriodsSaga, backendClient.awardPeriods),
          right<Error, ReadonlyArray<BpdPeriod>>([
            activePeriod,
            closedPeriod,
            inactivePeriod
          ])
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 0),
          right(amountForPeriod0)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 1),
          right(amountForPeriod1)
        ],
        [
          call(bpdLoadAmountSaga, backendClient.totalCashback, 2),
          right(amountForPeriod2)
        ]
      ])
      .put(
        bpdPeriodsAmountLoad.success([
          {
            ...inactivePeriod,
            amount: { ...zeroAmount, awardPeriodId: 2 as AwardPeriodId },
            ranking: readyRanking
          },
          { ...activePeriod, amount: amountForPeriod1, ranking: readyRanking },
          { ...closedPeriod, amount: amountForPeriod0, ranking: readyRanking }
        ])
      )
      .run();
  });
});

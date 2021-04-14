import * as pot from "italia-ts-commons/lib/pot";
import { createStore } from "redux";
import { WinningTransactionMilestoneResource } from "../../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionMilestoneResource";
import { WinningTransactionsOfTheDayResource } from "../../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionsOfTheDayResource";
import { applicationChangeState } from "../../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../../store/reducers";
import { AwardPeriodId, WithAwardPeriodId } from "../../../../actions/periods";
import { bpdTransactionsLoadPage } from "../../../../actions/transactions";

const awardPeriodTest: WithAwardPeriodId = {
  awardPeriodId: 1 as AwardPeriodId
};

const transactionTemplate: WinningTransactionMilestoneResource = {
  awardPeriodId: awardPeriodTest.awardPeriodId,
  idTrx: "1",
  idTrxIssuer: "idTrxIssuer",
  idTrxAcquirer: "idTrxIssuer",
  cashback: 15,
  hashPan: "hPan",
  circuitType: "01",
  trxDate: new Date("2021-01-01"),
  amount: 150
};

const pageOne: WinningTransactionsOfTheDayResource = {
  date: new Date("2021-01-01"),
  transactions: [
    transactionTemplate,
    { ...transactionTemplate, idTrx: "2" },
    { ...transactionTemplate, idTrx: "3" }
  ]
};

const pageTwo: WinningTransactionsOfTheDayResource = {
  date: new Date("2021-01-01"),
  transactions: [
    { ...transactionTemplate, idTrx: "4" },
    { ...transactionTemplate, idTrx: "5" }
  ]
};

const pageThree: WinningTransactionsOfTheDayResource = {
  date: new Date("2021-01-02"),
  transactions: [
    { ...transactionTemplate, idTrx: "6" },
    { ...transactionTemplate, idTrx: "7" }
  ]
};

describe("Test BpdTransactionsV2State store", () => {
  it("When the action bpdTransactionsLoadPage.request is dispatched, the store should have the right shape", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTest));

    const transactionsStore = store.getState().bonus.bpd.details.transactionsV2;

    expect(transactionsStore.ui.sectionItems).toStrictEqual(pot.noneLoading);

    expect(transactionsStore.ui.awardPeriodId).toStrictEqual(
      awardPeriodTest.awardPeriodId
    );
  });
  it("When the action bpdTransactionsLoadPage.failure is dispatched, the store should have the right shape", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const testError = new Error("Test Error");
    store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTest));
    store.dispatch(
      bpdTransactionsLoadPage.failure({
        ...awardPeriodTest,
        error: new Error("Test Error")
      })
    );

    const transactionsStore = store.getState().bonus.bpd.details.transactionsV2;

    expect(transactionsStore.ui.sectionItems).toStrictEqual({
      error: testError,
      kind: "PotNoneError"
    });

    expect(transactionsStore.ui.awardPeriodId).toStrictEqual(
      awardPeriodTest.awardPeriodId
    );
  });
  it("When the action bpdTransactionsLoadPage.success is dispatched, the store should have the right shape", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTest));
    store.dispatch(
      bpdTransactionsLoadPage.success({
        ...awardPeriodTest,
        results: {
          transactions: [pageOne]
        }
      })
    );

    const expectedTrxId = ["1", "2", "3"];
    const transactionsStore = store.getState().bonus.bpd.details.transactionsV2;

    expect(transactionsStore.ui.sectionItems.kind).toStrictEqual("PotSome");

    if (pot.isSome(transactionsStore.ui.sectionItems)) {
      const dateId = new Date("2021-01-01").toISOString();
      expect(transactionsStore.ui.sectionItems.value[dateId]?.dayInfoId).toBe(
        dateId
      );

      expect(
        transactionsStore.ui.sectionItems.value[dateId]?.trxList
      ).toStrictEqual(expectedTrxId);
    }
    expect(transactionsStore.ui.awardPeriodId).toStrictEqual(
      awardPeriodTest.awardPeriodId
    );
    expect(transactionsStore.ui.nextCursor).toBeNull();

    const entities =
      transactionsStore.entitiesByPeriod[awardPeriodTest.awardPeriodId];

    expect(entities).toBeDefined();

    if (entities) {
      expect(entities.foundPivot).toBe(false);

      expect(Object.keys(entities.byId).length).toBe(expectedTrxId.length);

      expectedTrxId.map(x => {
        expect(entities.byId[x]).toBeDefined();
        expect(entities.byId[x]?.idTrx.toString()).toBe(x);
      });
    }
  });

  it("When multiple action bpdTransactionsLoadPage.success are dispatched, the store should have the right shape and add the new data", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTest));
    store.dispatch(
      bpdTransactionsLoadPage.success({
        ...awardPeriodTest,
        results: {
          nextCursor: 1,
          transactions: [pageOne]
        }
      })
    );
    store.dispatch(
      bpdTransactionsLoadPage.request({ ...awardPeriodTest, nextCursor: 1 })
    );
    store.dispatch(
      bpdTransactionsLoadPage.success({
        ...awardPeriodTest,
        results: {
          nextCursor: 2,
          transactions: [pageTwo, pageThree]
        }
      })
    );

    const expectedTrxDayOne = ["1", "2", "3", "4", "5"];
    const expectedTrxDayTwo = ["6", "7"];
    const transactionsStore = store.getState().bonus.bpd.details.transactionsV2;

    expect(transactionsStore.ui.sectionItems.kind).toStrictEqual("PotSome");

    expect(transactionsStore.ui.awardPeriodId).toStrictEqual(
      awardPeriodTest.awardPeriodId
    );

    if (pot.isSome(transactionsStore.ui.sectionItems)) {
      const dateIdDayOne = new Date("2021-01-01").toISOString();
      const dateIdDayTwo = new Date("2021-01-02").toISOString();
      expect(
        transactionsStore.ui.sectionItems.value[dateIdDayOne]?.dayInfoId
      ).toBe(dateIdDayOne);
      expect(
        transactionsStore.ui.sectionItems.value[dateIdDayTwo]?.dayInfoId
      ).toBe(dateIdDayTwo);

      expect(
        transactionsStore.ui.sectionItems.value[dateIdDayOne]?.trxList
      ).toStrictEqual(expectedTrxDayOne);

      expect(
        transactionsStore.ui.sectionItems.value[dateIdDayTwo]?.trxList
      ).toStrictEqual(expectedTrxDayTwo);
    }

    expect(transactionsStore.ui.nextCursor).toBe(2);

    const entities =
      transactionsStore.entitiesByPeriod[awardPeriodTest.awardPeriodId];

    expect(entities).toBeDefined();

    if (entities) {
      const expectedEntitiesId = expectedTrxDayOne.concat(expectedTrxDayTwo);

      expect(entities.foundPivot).toBe(false);

      expect(Object.keys(entities.byId).length).toBe(expectedEntitiesId.length);

      expectedEntitiesId.map(x => {
        expect(entities.byId[x]).toBeDefined();
        expect(entities.byId[x]?.idTrx.toString()).toBe(x);
      });
    }
  });
});

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

// const pageTwo: WinningTransactionsOfTheDayResource = {
//   date: new Date("2021-01-01"),
//   transactions: [
//     { ...transactionTemplate, idTrx: "4" },
//     { ...transactionTemplate, idTrx: "5" }
//   ]
// };

describe("Test BpdTransactionsV2State store", () => {
  it("When the action bpdTransactionsLoadPage.request is dispatched, the store should have the right shape", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTest));

    const transactionsStore = store.getState().bonus.bpd.details.transactionsV2;

    expect(transactionsStore.ui.sectionItems).toStrictEqual(pot.noneLoading);

    expect(transactionsStore.ui.period).toStrictEqual(
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
        transactionsStore.ui.sectionItems.value[dateId]?.list
      ).toStrictEqual(expectedTrxId);
    }
    expect(transactionsStore.ui.period).toStrictEqual(
      awardPeriodTest.awardPeriodId
    );

    const entities =
      transactionsStore.entitiesByPeriod[awardPeriodTest.awardPeriodId];

    expect(entities).toBeDefined();

    if (entities) {
      expect(entities.nextCursor).toBeNull();
      expect(entities.foundPivot).toBe(false);

      expect(Object.keys(entities.byId).length).toBe(expectedTrxId.length);

      expectedTrxId.map(x => {
        expect(entities.byId[x]).toBeDefined();
        expect(entities.byId[x]?.idTrx.toString()).toBe(x);
      });
    }
  });
});

import * as pot from "italia-ts-commons/lib/pot";
import { createStore } from "redux";
import { WinningTransactionsOfTheDayResource } from "../../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionsOfTheDayResource";
import { applicationChangeState } from "../../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../../store/reducers";
import {
  BpdTransactionId,
  bpdTransactionsLoadMilestone,
  bpdTransactionsLoadPage,
  TrxMilestonePayload
} from "../../../../actions/transactions";
import {
  awardPeriodTemplate,
  transactionTemplate
} from "../__mock__/transactions";
import { BpdTransactionsEntityState } from "../entities";

const pageOne: WinningTransactionsOfTheDayResource = {
  date: new Date("2021-01-01"),
  transactions: [
    transactionTemplate,
    { ...transactionTemplate, idTrx: "2", cashback: 0 },
    { ...transactionTemplate, idTrx: "3" }
  ]
};

const pageTwo: WinningTransactionsOfTheDayResource = {
  date: new Date("2021-01-01"),
  transactions: [
    { ...transactionTemplate, idTrx: "A" },
    { ...transactionTemplate, idTrx: "B", cashback: 0 },
    { ...transactionTemplate, idTrx: "C" }
  ]
};

const pageThree: WinningTransactionsOfTheDayResource = {
  date: new Date("2021-01-02"),
  transactions: [
    { ...transactionTemplate, idTrx: "D" },
    { ...transactionTemplate, idTrx: "E", cashback: 15 }
  ]
};

const templateMilestone: TrxMilestonePayload = {
  ...awardPeriodTemplate,
  result: { amount: 0.5, idTrx: "A" as BpdTransactionId }
};

type TransactionTestCheck = {
  idTrx: string;
  cashback: number;
  validForCashback: boolean;
};

describe("Test the paginated transaction normalization", () => {
  it("When no pivot is present, the cashback amount should not be normalized", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTemplate));
    store.dispatch(
      bpdTransactionsLoadPage.success({
        ...awardPeriodTemplate,
        results: {
          transactions: [pageOne]
        }
      })
    );

    const transactionsEntities =
      store.getState().bonus.bpd.details.transactionsV2.entitiesByPeriod[
        awardPeriodTemplate.awardPeriodId
      ];

    const expectedResults = [
      {
        idTrx: "1",
        cashback: transactionTemplate.cashback,
        validForCashback: true
      },
      {
        idTrx: "2",
        cashback: 0,
        validForCashback: true
      },
      {
        idTrx: "3",
        cashback: transactionTemplate.cashback,
        validForCashback: true
      }
    ];

    expect(transactionsEntities).toBeDefined();
    expect(transactionsEntities?.pivot).toBe(pot.none);
    if (transactionsEntities) {
      verifyTransactions(expectedResults, transactionsEntities);
    }
  });
  it(
    "When a pivot is present and the pivot transaction has not yet been found," +
      " the cashback amount should be normalized to zero for all the transactions",
    () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);

      store.dispatch(
        bpdTransactionsLoadMilestone.request(awardPeriodTemplate.awardPeriodId)
      );
      store.dispatch(bpdTransactionsLoadMilestone.success(templateMilestone));

      store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTemplate));
      store.dispatch(
        bpdTransactionsLoadPage.success({
          ...awardPeriodTemplate,
          results: {
            transactions: [pageOne]
          }
        })
      );

      const transactionsEntities =
        store.getState().bonus.bpd.details.transactionsV2.entitiesByPeriod[
          awardPeriodTemplate.awardPeriodId
        ];

      const expectedResults: ReadonlyArray<TransactionTestCheck> = [
        {
          idTrx: "1",
          cashback: 0,
          validForCashback: false
        },
        {
          idTrx: "2",
          cashback: 0,
          validForCashback: false
        },
        {
          idTrx: "3",
          cashback: 0,
          validForCashback: false
        }
      ];

      expect(transactionsEntities).toBeDefined();
      expect(transactionsEntities?.pivot).toStrictEqual(
        pot.some(templateMilestone.result)
      );
      if (transactionsEntities) {
        verifyTransactions(expectedResults, transactionsEntities);
      }
    }
  );

  it(
    "When a pivot is present and the pivot transaction has been found," +
      " the cashback amount should be must be normalized appropriately (same day transactions in multiple pages)",
    () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);

      store.dispatch(
        bpdTransactionsLoadMilestone.request(awardPeriodTemplate.awardPeriodId)
      );
      store.dispatch(bpdTransactionsLoadMilestone.success(templateMilestone));

      store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTemplate));
      store.dispatch(
        bpdTransactionsLoadPage.success({
          ...awardPeriodTemplate,
          results: {
            transactions: [pageOne]
          }
        })
      );
      store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTemplate));
      store.dispatch(
        bpdTransactionsLoadPage.success({
          ...awardPeriodTemplate,
          results: {
            transactions: [pageTwo]
          }
        })
      );
      store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTemplate));
      store.dispatch(
        bpdTransactionsLoadPage.success({
          ...awardPeriodTemplate,
          results: {
            transactions: [pageThree]
          }
        })
      );

      const transactionsEntities =
        store.getState().bonus.bpd.details.transactionsV2.entitiesByPeriod[
          awardPeriodTemplate.awardPeriodId
        ];

      const expectedResults: ReadonlyArray<TransactionTestCheck> = [
        {
          idTrx: "1",
          cashback: 0,
          validForCashback: false
        },
        {
          idTrx: "2",
          cashback: 0,
          validForCashback: false
        },
        {
          idTrx: "3",
          cashback: 0,
          validForCashback: false
        },
        {
          idTrx: "A",
          cashback: templateMilestone.result?.amount ?? 0,
          validForCashback: true
        },
        {
          idTrx: "B",
          cashback: 0,
          validForCashback: true
        },
        {
          idTrx: "C",
          cashback: transactionTemplate.cashback,
          validForCashback: true
        },
        {
          idTrx: "D",
          cashback: transactionTemplate.cashback,
          validForCashback: true
        },
        {
          idTrx: "E",
          cashback: 15,
          validForCashback: true
        }
      ];

      expect(transactionsEntities).toBeDefined();
      expect(transactionsEntities?.pivot).toStrictEqual(
        pot.some(templateMilestone.result)
      );
      if (transactionsEntities) {
        verifyTransactions(expectedResults, transactionsEntities);
      }
    }
  );
  it(
    "When a pivot is present and the pivot transaction has been found," +
      " the cashback amount should be must be normalized appropriately (pivot with multiple days in same page)",
    () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);

      store.dispatch(
        bpdTransactionsLoadMilestone.request(awardPeriodTemplate.awardPeriodId)
      );
      store.dispatch(bpdTransactionsLoadMilestone.success(templateMilestone));

      store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTemplate));
      store.dispatch(
        bpdTransactionsLoadPage.success({
          ...awardPeriodTemplate,
          results: {
            transactions: [pageOne]
          }
        })
      );
      store.dispatch(bpdTransactionsLoadPage.request(awardPeriodTemplate));
      store.dispatch(
        bpdTransactionsLoadPage.success({
          ...awardPeriodTemplate,
          results: {
            transactions: [pageTwo, pageThree]
          }
        })
      );

      const transactionsEntities =
        store.getState().bonus.bpd.details.transactionsV2.entitiesByPeriod[
          awardPeriodTemplate.awardPeriodId
        ];

      const expectedResults: ReadonlyArray<TransactionTestCheck> = [
        {
          idTrx: "1",
          cashback: 0,
          validForCashback: false
        },
        {
          idTrx: "2",
          cashback: 0,
          validForCashback: false
        },
        {
          idTrx: "3",
          cashback: 0,
          validForCashback: false
        },
        {
          idTrx: "A",
          cashback: templateMilestone.result?.amount ?? 0,
          validForCashback: true
        },
        {
          idTrx: "B",
          cashback: 0,
          validForCashback: true
        },
        {
          idTrx: "C",
          cashback: transactionTemplate.cashback,
          validForCashback: true
        },
        {
          idTrx: "D",
          cashback: transactionTemplate.cashback,
          validForCashback: true
        },
        {
          idTrx: "E",
          cashback: 15,
          validForCashback: true
        }
      ];

      expect(transactionsEntities).toBeDefined();
      expect(transactionsEntities?.pivot).toStrictEqual(
        pot.some(templateMilestone.result)
      );
      if (transactionsEntities) {
        verifyTransactions(expectedResults, transactionsEntities);
      }
    }
  );
});

expect.extend({
  toBeAsd(received, validator) {
    if (validator(received)) {
      return {
        message: () => `Email ${received} should NOT be valid`,
        pass: true
      };
    } else {
      return {
        message: () => `Email ${received} should be valid`,
        pass: false
      };
    }
  }
});

const verifyTransactions = (
  trxCheckList: ReadonlyArray<TransactionTestCheck>,
  state: BpdTransactionsEntityState
) => {
  trxCheckList.map(x => {
    expect(state.byId[x.idTrx]).toBeDefined();
    expect(state.byId[x.idTrx]?.idTrx.toString()).toBe(x.idTrx);
    expect(state.byId[x.idTrx]?.cashback).toBe(x.cashback);
    expect(state.byId[x.idTrx]?.validForCashback).toBe(x.validForCashback);
  });
};

import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";

import { createStore, Store } from "redux";
import { applicationChangeState } from "../../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../../../utils/testWrapper";
import BPD_ROUTES from "../../../../../navigation/routes";
import {
  BpdTransactionId,
  bpdTransactionsLoadCountByDay,
  bpdTransactionsLoadMilestone,
  bpdTransactionsLoadPage,
  bpdTransactionsLoadRequiredData
} from "../../../../../store/actions/transactions";
import { transactionTemplate } from "../../../../../store/reducers/details/transactionsv2/__mock__/transactions";
import { eligibleAmount } from "../../../../../store/reducers/__mock__/amount";
import { activePeriod } from "../../../../../store/reducers/__mock__/periods";
import { readyRanking } from "../../../../../store/reducers/__mock__/ranking";
import TransactionsSectionList from "../TransactionsSectionList";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("Test TransactionsSectionList behaviour and states", () => {
  jest.useFakeTimers();
  it("When the transactions list length is zero, should render BpdEmptyTransactionsList (wallet is pot.none)", () => {
    const store = getStateWithBpdInitialized();
    store.dispatch(
      bpdTransactionsLoadRequiredData.request(activePeriod.awardPeriodId)
    );
    store.dispatch(
      bpdTransactionsLoadMilestone.request(activePeriod.awardPeriodId)
    );
    store.dispatch(
      bpdTransactionsLoadMilestone.success({
        awardPeriodId: activePeriod.awardPeriodId,
        result: undefined
      })
    );
    store.dispatch(
      bpdTransactionsLoadCountByDay.request(activePeriod.awardPeriodId)
    );
    store.dispatch(
      bpdTransactionsLoadCountByDay.success({
        awardPeriodId: activePeriod.awardPeriodId,
        results: []
      })
    );
    store.dispatch(
      bpdTransactionsLoadPage.request({
        awardPeriodId: activePeriod.awardPeriodId
      })
    );
    store.dispatch(
      bpdTransactionsLoadPage.success({
        awardPeriodId: activePeriod.awardPeriodId,
        results: { transactions: [] }
      })
    );
    store.dispatch(
      bpdTransactionsLoadRequiredData.success(activePeriod.awardPeriodId)
    );
    const testComponent = renderComponent(store);
    expect(
      testComponent.queryByTestId("BpdEmptyTransactionsList")
    ).not.toBeNull();
  });
});

it("When the transactions list length is > 0, should render the transactions list", () => {
  const store = getStateWithBpdInitialized();
  const trxDate = new Date("2021-01-01");

  store.dispatch(
    bpdTransactionsLoadRequiredData.request(activePeriod.awardPeriodId)
  );
  store.dispatch(
    bpdTransactionsLoadMilestone.request(activePeriod.awardPeriodId)
  );
  store.dispatch(
    bpdTransactionsLoadMilestone.success({
      awardPeriodId: activePeriod.awardPeriodId,
      result: {
        idTrx: "trxPivot" as BpdTransactionId,
        amount: 9.99
      }
    })
  );
  store.dispatch(
    bpdTransactionsLoadCountByDay.request(activePeriod.awardPeriodId)
  );
  store.dispatch(
    bpdTransactionsLoadCountByDay.success({
      awardPeriodId: activePeriod.awardPeriodId,
      results: [{ trxDate, count: 2 }]
    })
  );
  store.dispatch(
    bpdTransactionsLoadPage.request({
      awardPeriodId: activePeriod.awardPeriodId
    })
  );
  store.dispatch(
    bpdTransactionsLoadPage.success({
      awardPeriodId: activePeriod.awardPeriodId,
      results: {
        transactions: [
          {
            date: trxDate,
            transactions: [
              { ...transactionTemplate },
              { ...transactionTemplate, idTrx: "2" }
            ]
          }
        ]
      }
    })
  );
  store.dispatch(
    bpdTransactionsLoadRequiredData.success(activePeriod.awardPeriodId)
  );
  const testComponent = renderComponent(store);
  // Shouldn't render the ListEmptyComponent
  expect(testComponent.queryByTestId("ListEmptyComponent")).toBeNull();
  expect(
    testComponent.queryAllByTestId("BaseDailyTransactionHeader").length
  ).toBe(1);
  expect(testComponent.queryAllByTestId("BaseBpdTransactionItem").length).toBe(
    2
  );
});

const getStateWithBpdInitialized = (): Store => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const finalState: GlobalState = {
    ...globalState,
    bonus: {
      ...globalState.bonus,
      bpd: {
        ...globalState.bonus.bpd,
        details: {
          ...globalState.bonus.bpd.details,
          selectedPeriod: {
            ...activePeriod,
            ranking: readyRanking,
            amount: eligibleAmount
          },
          lastUpdate: pot.noneUpdating({} as Date)
        }
      }
    }
  };
  return createStore(appReducer, finalState as any);
};

const renderComponent = (store: Store) =>
  renderScreenFakeNavRedux<GlobalState>(
    () => <TransactionsSectionList />,
    BPD_ROUTES.TRANSACTIONS,
    {},
    store
  );

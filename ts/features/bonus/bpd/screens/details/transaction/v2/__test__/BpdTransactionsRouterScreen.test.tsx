import * as pot from "italia-ts-commons/lib/pot";
import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import * as React from "react";
import { applicationChangeState } from "../../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../../../utils/testWrapper";
import BPD_ROUTES from "../../../../../navigation/routes";
import { AwardPeriodId } from "../../../../../store/actions/periods";
import { bpdTransactionsLoadRequiredData } from "../../../../../store/actions/transactions";
import { eligibleAmount } from "../../../../../store/reducers/__mock__/amount";
import { activePeriod } from "../../../../../store/reducers/__mock__/periods";
import BpdTransactionsRouterScreen from "../BpdTransactionsRouterScreen";
import { readyRanking } from "../../../../../store/reducers/__mock__/ranking";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("Test BpdTransactionsRouterScreen behaviour and states", () => {
  jest.useFakeTimers();
  it("With unexpected state should render the fallback error screen", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const testComponent = renderComponent(store);
    expect(
      testComponent.queryByTestId("WorkunitGenericFailure")
    ).not.toBeNull();
  });
  it("With initial cashback information should render loading screen", () => {
    const store = getStateWithBpdInitialized();
    const testComponent = renderComponent(store);
    expect(testComponent.queryByTestId("LoadTransactions")).not.toBeNull();
  });
  it("With a failure should render the TransactionsUnavailableV2Base screen", () => {
    const store = getStateWithBpdInitialized();
    const testComponent = renderComponent(store);
    expect(testComponent.queryByTestId("LoadTransactions")).not.toBeNull();
    store.dispatch(
      bpdTransactionsLoadRequiredData.failure({
        awardPeriodId: 1 as AwardPeriodId,
        error: new Error("An error")
      })
    );
    expect(
      testComponent.queryByTestId("TransactionUnavailableV2")
    ).not.toBeNull();
  });
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
  renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <BpdTransactionsRouterScreen />,
    BPD_ROUTES.TRANSACTIONS,
    {},
    store
  );

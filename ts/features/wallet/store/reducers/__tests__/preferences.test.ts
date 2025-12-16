import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { walletSetCategoryFilter } from "../../actions/preferences";

describe("Wallet preferences reducer", () => {
  it("should start with initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.preferences).toStrictEqual({});
  });

  it("should set the category filter", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletSetCategoryFilter("itw"));

    expect(store.getState().features.wallet.preferences).toStrictEqual({
      categoryFilter: "itw"
    });
  });

  it("should set the category filter to undefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletSetCategoryFilter(undefined));

    expect(store.getState().features.wallet.preferences).toStrictEqual({
      categoryFilter: undefined
    });
  });
});

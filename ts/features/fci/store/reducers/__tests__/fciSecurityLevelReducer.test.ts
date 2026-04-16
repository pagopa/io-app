import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciL3LocalFlag } from "../../actions";

describe("FciSecurityLevelReducer", () => {
  it("it should have an initialState with localFeatureFlag equal to false", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(false);
  });
  it("it should have localFeatureFlag equal to true if the fciL3LocalFlag is dispatched with true as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciL3LocalFlag(true));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(true);
  });
  it("it should have localFeatureFlag equal to false if the fciL3LocalFlag is dispatched with false as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciL3LocalFlag(false));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(false);
  });
  it("it should change localFeatureFlag from false to true if the initialState is false and fciL3LocalFlag is dispatched with true as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(false);
    store.dispatch(fciL3LocalFlag(true));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(true);
  });
  it("it should change localFeatureFlag from true to false if the initialState is true and fciL3LocalFlag is dispatched with false as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciL3LocalFlag(true));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(true);
    store.dispatch(fciL3LocalFlag(false));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(false);
  });
});

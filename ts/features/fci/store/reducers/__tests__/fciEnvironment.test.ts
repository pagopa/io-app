import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciEnvironmentSet } from "../../actions";
import { EnvironmentEnum } from "../../../../../../definitions/fci/Environment";
import { EnvironmentEnumUnknown } from "./../fciEnvironment";

describe("FciEnvironmentSet", () => {
  it("it should have an initialState equal to unknown", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.environment).toStrictEqual(
      EnvironmentEnumUnknown.unknown
    );
  });
  it("it should be test if the fciEnvironmentSet is dispatched with EnvironmentEnum.test as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciEnvironmentSet(EnvironmentEnum.test));
    expect(store.getState().features.fci.environment).toStrictEqual(
      EnvironmentEnum.test
    );
    expect(store.getState().features.fci.environment).not.toStrictEqual(
      EnvironmentEnum.prod
    );
  });
  it("it should be prod if the initialState is test and fciEnvironmentSet is dispatched with EnvironmentEnum.prod as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciEnvironmentSet(EnvironmentEnum.test));
    expect(store.getState().features.fci.environment).toStrictEqual(
      EnvironmentEnum.test
    );
    store.dispatch(fciEnvironmentSet(EnvironmentEnum.prod));
    expect(store.getState().features.fci.environment).toStrictEqual(
      EnvironmentEnum.prod
    );
  });
});

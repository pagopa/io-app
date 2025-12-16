import { createStore } from "redux";
import * as O from "fp-ts/lib/Option";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciEnvironmentSet } from "../../actions";
import { EnvironmentEnum } from "../../../../../../definitions/fci/Environment";

describe("FciEnvironmentSet", () => {
  it("it should have an initialState equal to a none Option", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.environment).toStrictEqual(O.none);
  });
  it("it should be an Option containing test if the fciEnvironmentSet is dispatched with EnvironmentEnum.test as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciEnvironmentSet(O.some(EnvironmentEnum.test)));
    expect(store.getState().features.fci.environment).toStrictEqual(
      O.some(EnvironmentEnum.test)
    );
    expect(store.getState().features.fci.environment).not.toStrictEqual(
      O.some(EnvironmentEnum.prod)
    );
  });
  it("it should be an Option containing prod if the initialState is test and fciEnvironmentSet is dispatched with EnvironmentEnum.prod as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciEnvironmentSet(O.some(EnvironmentEnum.test)));
    expect(store.getState().features.fci.environment).toStrictEqual(
      O.some(EnvironmentEnum.test)
    );
    store.dispatch(fciEnvironmentSet(O.some(EnvironmentEnum.prod)));
    expect(store.getState().features.fci.environment).toStrictEqual(
      O.some(EnvironmentEnum.prod)
    );
  });
});

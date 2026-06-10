import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getTimeoutError } from "../../../../../utils/errors";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciLoadQtspClauses, fciClearStateRequest } from "../../actions";
import { mockQtspClausesMetadata } from "../../../types/__mocks__/QtspClausesMetadata.mock";

const genericError = getTimeoutError();

describe("FciQtspClausesReducer", () => {
  it("The initial state should be a pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.qtspClauses).toStrictEqual(pot.none);
  });
  it("The qtsp should be pot.noneLoading if the fciLoadQtspClauses.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciLoadQtspClauses.request());
    expect(store.getState().features.fci.qtspClauses).toStrictEqual(
      pot.noneLoading
    );
  });
  it("The qtsp should be pot.some with payload as value if the fciLoadQtspClauses.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    expect(store.getState().features.fci.qtspClauses).toStrictEqual(
      pot.some(mockQtspClausesMetadata)
    );
  });
  it("The qtsp should be pot.noneError if the fciLoadQtspClauses.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciLoadQtspClauses.failure(genericError));
    expect(store.getState().features.fci.qtspClauses).toEqual(
      pot.noneError(genericError)
    );
  });
  it("The qtsp should be pot.none if the fciAbortingRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciClearStateRequest());
    expect(store.getState().features.fci.qtspClauses).toStrictEqual(pot.none);
  });
});

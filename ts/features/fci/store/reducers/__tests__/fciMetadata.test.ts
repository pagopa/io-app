import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getTimeoutError } from "../../../../../utils/errors";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciClearStateRequest, fciMetadataRequest } from "../../actions";
import { mockFciMetadata } from "../../../types/__mocks__/Metadata.mock";

const genericError = getTimeoutError();

describe("FciMetadataRequestReducer", () => {
  it("it should have an initialState equal to remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.metadata).toStrictEqual(pot.none);
  });
  it("it should be remoteLoading if the fciMetadataRequest.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciMetadataRequest.request());
    expect(store.getState().features.fci.metadata).toStrictEqual(
      pot.noneLoading
    );
  });
  it("it should be remoteReady with action payload as value if the fciMetadataRequest.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciMetadataRequest.success(mockFciMetadata));
    expect(store.getState().features.fci.metadata).toStrictEqual(
      pot.some(mockFciMetadata)
    );
  });
  it("it should be pot.noneError if the fciMetadataRequest.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciMetadataRequest.failure(genericError));
    expect(store.getState().features.fci.metadata).toStrictEqual(
      pot.noneError(genericError)
    );
  });
  it("it should be pot.none if the fciClearStateRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciClearStateRequest());
    expect(store.getState().features.fci.metadata).toStrictEqual(pot.none);
  });
});

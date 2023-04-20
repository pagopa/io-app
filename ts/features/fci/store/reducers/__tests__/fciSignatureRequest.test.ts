import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getTimeoutError } from "../../../../../utils/errors";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciSignatureRequestFromId, fciClearStateRequest } from "../../actions";
import { mockSignatureRequestDetailView } from "../../../types/__mocks__/SignatureRequestDetailView.mock";

const genericError = getTimeoutError();

describe("FciSignatureRequestReducer", () => {
  it("The initial state should be a remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.signatureRequest).toStrictEqual(pot.none);
  });
  it("The signatureRequest should be remoteLoading if the fciSignatureRequestFromId.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciSignatureRequestFromId.request("mockId"));
    expect(store.getState().features.fci.signatureRequest).toStrictEqual(
      pot.noneLoading
    );
  });
  it("The signatureRequest should be remoteReady with action payload as value if the fciSignatureRequestFromId.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      fciSignatureRequestFromId.success(mockSignatureRequestDetailView)
    );
    expect(store.getState().features.fci.signatureRequest).toStrictEqual(
      pot.some(mockSignatureRequestDetailView)
    );
  });
  it("The signatureRequest should be pot.noneError if the fciSignatureRequestFromId.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciSignatureRequestFromId.failure(genericError));
    expect(store.getState().features.fci.signatureRequest).toStrictEqual(
      pot.noneError(genericError)
    );
  });
  it("The signatureRequest should be pot.none if the fciAbortingRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciClearStateRequest());
    expect(store.getState().features.fci.signatureRequest).toStrictEqual(
      pot.none
    );
  });
});

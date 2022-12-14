import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getTimeoutError } from "../../../../../utils/errors";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciSigningRequest, fciClearStateRequest } from "../../actions";
import { mockCreateSignatureBody } from "../../../types/__mocks__/CreateSignatureBody.mock";
import { mockSignatureDetailView } from "../../../types/__mocks__/SignatureDetailView.mock";

const genericError = getTimeoutError();

describe("FciSignatureReducer", () => {
  it("The initial state should be a pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.signature).toStrictEqual(pot.none);
  });
  it("The signature should be pot.noneLoading if the fciSigningRequest.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciSigningRequest.request(mockCreateSignatureBody));
    expect(store.getState().features.fci.signature).toStrictEqual(
      pot.noneLoading
    );
  });
  it("The signature should be pot.some if fciSigningRequest.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciSigningRequest.success(mockSignatureDetailView));
    expect(store.getState().features.fci.signature).toStrictEqual(
      pot.some(mockSignatureDetailView)
    );
  });
  it("The signature should be pot.noneError if the fciSigningRequest.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciSigningRequest.failure(genericError));
    expect(store.getState().features.fci.signature).toStrictEqual(
      pot.noneError(genericError)
    );
  });
  it("The signature should be pot.none if the fciAbortingRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciClearStateRequest());
    expect(store.getState().features.fci.signature).toStrictEqual(pot.none);
  });
});

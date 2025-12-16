import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getTimeoutError } from "../../../../../utils/errors";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciClearStateRequest, fciSignaturesListRequest } from "../../actions";
import { mockedRandomSignatureRequestList } from "../../../types/__mocks__/SignaturesList.mock";

const genericError = getTimeoutError();

describe("FciSignaturesListRequestReducer", () => {
  it("The initial state should be a pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.signaturesList).toStrictEqual(pot.none);
  });
  it("The signaturesList should be noneLoading if the fciSignatureRequestFromId.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciSignaturesListRequest.request());
    expect(store.getState().features.fci.signaturesList).toStrictEqual(
      pot.noneLoading
    );
  });
  it("The signaturesList should be remoteReady if the fciSignaturesListRequest.success is dispatched", () => {
    const mockedSignaturesList = mockedRandomSignatureRequestList;
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciSignaturesListRequest.success(mockedSignaturesList));
    expect(store.getState().features.fci.signaturesList).toStrictEqual(
      pot.some(mockedSignaturesList)
    );
  });
  it("The signaturesList should be pot.noneError if the fciSignaturesListRequest.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciSignaturesListRequest.failure(genericError));
    expect(store.getState().features.fci.signaturesList).toStrictEqual(
      pot.noneError(genericError)
    );
  });
  it("The signaturesList should be pot.none if the fciClearStateRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciClearStateRequest());
    expect(store.getState().features.fci.signaturesList).toStrictEqual(
      pot.none
    );
  });
});

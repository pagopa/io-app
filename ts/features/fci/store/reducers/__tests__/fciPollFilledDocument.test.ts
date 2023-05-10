import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getNetworkError } from "../../../../../utils/errors";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import {
  fciClearStateRequest,
  fciPollFilledDocumentFailure,
  fciPollFilledDocumentRequest,
  fciPollFilledDocumentSuccess
} from "../../actions";

const genericError = getNetworkError("Generic Error");

describe("FciPollFilledDocumentReducer", () => {
  it("The initial state should be a pot.some with initial value", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.pollFilledDocument).toStrictEqual(
      pot.some({
        isReady: false
      })
    );
  });
  it("The pollFilledDocument should be pot.noneLoading if the fciPollFilledDocument.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciPollFilledDocumentRequest());
    expect(store.getState().features.fci.pollFilledDocument).toStrictEqual(
      pot.someLoading({
        isReady: false
      })
    );
  });
  it("The pollFilledDocument should be pot.some with payload as value if the fciPollFilledDocument.success is dispatched", () => {
    const payload = { isReady: true };
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciPollFilledDocumentSuccess(payload));
    expect(store.getState().features.fci.pollFilledDocument).toStrictEqual(
      pot.some(payload)
    );
  });
  it("The pollFilledDocument should be pot.noneError if the fciPollFilledDocument.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciPollFilledDocumentFailure(genericError));
    expect(store.getState().features.fci.pollFilledDocument).toEqual(
      pot.someError(
        {
          isReady: false
        },
        genericError
      )
    );
  });
  it("The pollFilledDocument should be pot.none if the fciClearStateRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciClearStateRequest());
    expect(store.getState().features.fci.pollFilledDocument).toStrictEqual(
      pot.some({
        isReady: false
      })
    );
  });
});

import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getTimeoutError } from "../../../../../utils/errors";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciLoadQtspFilledDocument, fciClearStateRequest } from "../../actions";
import {
  createFilledDocumentBody,
  qtspFilledDocument
} from "../../../types/__mocks__/CreateFilledDocumentBody.mock";

const genericError = getTimeoutError();

describe("FciQtspFilledDocumentReducer", () => {
  it("The initial state should be a pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.qstpFilledDocument).toStrictEqual(pot.none);
  });
  it("The filled_document should be pot.noneLoading if the fciLoadQtspFilledDocument.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciLoadQtspFilledDocument.request(createFilledDocumentBody));
    expect(store.getState().features.fci.qstpFilledDocument).toStrictEqual(
      pot.noneLoading
    );
  });
  it("The filled_document should be pot.some with payload as value if the fciLoadQtspFilledDocument.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciLoadQtspFilledDocument.success(qtspFilledDocument));
    expect(store.getState().features.fci.qstpFilledDocument).toStrictEqual(
      pot.some(qtspFilledDocument)
    );
  });
  it("The filled_document should be pot.noneError if the fciLoadQtspFilledDocument.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciLoadQtspFilledDocument.failure(genericError));
    expect(store.getState().features.fci.qstpFilledDocument).toEqual(
      pot.noneError(genericError)
    );
  });
  it("The filled_document should be pot.none if the fciAbortingRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciClearStateRequest());
    expect(store.getState().features.fci.qstpFilledDocument).toStrictEqual(
      pot.none
    );
  });
});

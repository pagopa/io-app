import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getTimeoutError } from "../../../../../utils/errors";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciDownloadPreview } from "../../actions";

const genericError = getTimeoutError();

describe("FciDownloadPreviewReducer", () => {
  it("The initial state should be a pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.documentPreview).toStrictEqual(pot.none);
  });
  it("The documentPreview should be pot.noneLoading if the fciDownloadPreview.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciDownloadPreview.request({ url: "fakeUrl" }));
    expect(store.getState().features.fci.documentPreview).toStrictEqual(
      pot.noneLoading
    );
  });
  it("The documentPreview should be pot.some with payload as value if the fciDownloadPreview.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciDownloadPreview.success({ path: "fakePath" }));
    expect(store.getState().features.fci.documentPreview).toStrictEqual(
      pot.some({ path: "fakePath" })
    );
  });
  it("The documentPreview should be pot.noneError if the fciLoadQtspClauses.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciDownloadPreview.failure(genericError));
    expect(store.getState().features.fci.documentPreview).toEqual(
      pot.noneError(genericError)
    );
  });
});

import * as React from "react";
import { createStore, Store } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { FCI_ROUTES } from "../../navigation/routes";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { fciLoadQtspClauses, fciPollFilledDocument } from "../../store/actions";
import FciQtspClausesScreen from "../valid/FciQtspClausesScreen";
import { mockQtspClausesMetadata } from "../../types/__mocks__/QtspClausesMetadata.mock";
import { getNetworkError } from "../../../../utils/errors";
import { MAX_POLLING_RETRY } from "../../saga";

const networkError = getNetworkError(new Error("network error"));

describe("Test FciQtspClauses screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render the FciQtspClauses screen", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
  });
  it("should render the FciQtspClauses screen and container", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    store.dispatch(
      fciPollFilledDocument.success({ isReady: true, retryTimes: 0 })
    );
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciQtspClausesTestID")).toBeTruthy();
  });
  it("should render the FciQtspClauses screen and a list of clauses", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    store.dispatch(
      fciPollFilledDocument.success({ isReady: true, retryTimes: 0 })
    );
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciQtspClausesListTestID")).toBeTruthy();
  });
  it("should render the FciQtspClauses screen and the privacy text", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    store.dispatch(
      fciPollFilledDocument.success({ isReady: true, retryTimes: 0 })
    );
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(
      component.queryAllByText(mockQtspClausesMetadata.privacy_text)
    ).toBeTruthy();
  });
  it("should render the LoadingComponent when filled_document is not ready", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    store.dispatch(
      fciPollFilledDocument.success({ isReady: false, retryTimes: 0 })
    );
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciLoadingScreenTestID")).toBeTruthy();
  });
  it("should render the GenericErrorComponent when filled_document is not ready and max attempts reached", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    store.dispatch(
      fciPollFilledDocument.success({
        isReady: false,
        retryTimes: MAX_POLLING_RETRY
      })
    );
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciLoadingScreenTestID")).toBeFalsy();
    expect(component.queryByTestId("GenericErrorComponentTestID")).toBeTruthy();
  });
  it("should render the GenericErrorComponent when network error problem occurs", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    store.dispatch(fciPollFilledDocument.failure(networkError));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciLoadingScreenTestID")).toBeFalsy();
    expect(component.queryByTestId("GenericErrorComponentTestID")).toBeTruthy();
  });
});

const renderComponent = (store: Store) =>
  renderScreenFakeNavRedux<GlobalState>(
    () => <FciQtspClausesScreen />,
    FCI_ROUTES.QTSP_TOS,
    {},
    store
  );

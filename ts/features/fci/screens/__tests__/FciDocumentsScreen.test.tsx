import * as React from "react";
import { createStore, Store } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import FciDocumentsScreen from "../valid/FciDocumentsScreen";
import { FCI_ROUTES } from "../../navigation/routes";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { fciSignatureRequestFromId } from "../../store/actions/fciSignatureRequest";

describe("Test FciDocuments screen", () => {
  jest.useFakeTimers();
  it("should render the FciDocuments screen", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(
      fciSignatureRequestFromId.success(mockSignatureRequestDetailView)
    );
    const component = renderComponent(store);
    expect(component).toBeTruthy();
  });
  it("should render the content and footer with at least one document", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(
      fciSignatureRequestFromId.success(mockSignatureRequestDetailView)
    );
    const testComponent = renderComponent(store);
    expect(testComponent).toBeTruthy();
    expect(
      testComponent.getByTestId("FciDocumentsScreenTestID")
    ).not.toBeNull();
  });
  it("should render the content without footer if no documents", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const mockWithNoDocuments = {
      ...mockSignatureRequestDetailView,
      documents: []
    };
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    store.dispatch(fciSignatureRequestFromId.success(mockWithNoDocuments));
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciDocumentsScreenTestID")).toBeNull();
  });
});

const renderComponent = (store: Store) =>
  renderScreenFakeNavRedux<GlobalState>(
    () => <FciDocumentsScreen />,
    FCI_ROUTES.DOCUMENTS,
    {},
    store
  );

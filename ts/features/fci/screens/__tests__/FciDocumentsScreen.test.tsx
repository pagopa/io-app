import { createStore, Store } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import {
  fciDownloadPreview,
  fciSignatureRequestFromId
} from "../../store/actions";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import FciDocumentsScreen from "../valid/FciDocumentsScreen";

describe("Test FciDocuments screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("it should render the FciDocuments screen", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(
      fciSignatureRequestFromId.success({
        ...mockSignatureRequestDetailView
      })
    );
    const component = renderComponent(store);
    expect(component).toBeTruthy();
  });
  it("it should render the content and footer", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(
      fciSignatureRequestFromId.success({
        ...mockSignatureRequestDetailView
      })
    );
    store.dispatch(
      fciDownloadPreview.success({
        path: mockSignatureRequestDetailView.documents[0].url
      })
    );
    const testComponent = renderComponent(store);
    expect(testComponent).toBeTruthy();
    expect(
      testComponent.getByTestId("FciDocumentsScreenTestID")
    ).not.toBeNull();
  });
});

const renderComponent = (store: Store) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <FciDocumentsScreen />,
    FCI_ROUTES.DOCUMENTS,
    {},
    store
  );

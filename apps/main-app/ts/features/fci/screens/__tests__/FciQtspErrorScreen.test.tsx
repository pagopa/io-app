import { fireEvent } from "@testing-library/react-native";
import { createStore, Store } from "redux";

import * as mixpanelModule from "../../../../mixpanel";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { getNetworkError } from "../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import {
  fciPollFilledDocument,
  fciSignatureRequestFromId
} from "../../store/actions";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import FciQtspErrorScreen from "../failure/FciQtspErrorScreen";

const createTestStore = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return createStore(appReducer, globalState as any) as Store<GlobalState>;
};

describe("FciQtspErrorScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the screen", () => {
    const store = createTestStore();
    const component = renderComponent(store);
    expect(component.getByTestId("FciQtspErrorTestID")).not.toBeNull();
  });

  describe("failure screen-view tracking", () => {
    const mixpanelTrackSpy = jest
      .spyOn(mixpanelModule, "mixpanelTrack")
      .mockImplementation();

    it("should not track the screen view when there is no document-preparation error", () => {
      const store = createTestStore();
      renderComponent(store);
      expect(mixpanelTrackSpy).not.toHaveBeenCalled();
    });

    it("should track the screen view with the failing step when there is a document-preparation error", () => {
      const store = createTestStore();
      store.dispatch(
        fciPollFilledDocument.failure(getNetworkError(new Error()))
      );
      renderComponent(store);
      expect(mixpanelTrackSpy).toHaveBeenCalledWith(
        "FCI_POLLING_FAILURE",
        expect.objectContaining({
          fci_backend_error: "FCI_POLL_FILLED_DOCUMENT_FAILURE"
        })
      );
    });
  });

  describe("without signatureRequestId", () => {
    it("should show only the close button", () => {
      const store = createTestStore();
      const component = renderComponent(store);
      expect(
        component.queryByTestId("FciQtspErrorTestIDCloseButton")
      ).not.toBeNull();
      expect(
        component.queryByTestId("FciQtspErrorTestIDRetryButton")
      ).toBeNull();
    });

    it("should dispatch fciEndRequest on close button press", () => {
      const store = createTestStore();
      const dispatchSpy = jest.spyOn(store, "dispatch");
      const component = renderComponent(store);
      fireEvent.press(component.getByTestId("FciQtspErrorTestIDCloseButton"));
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: "FCI_END_REQUEST" })
      );
    });
  });

  describe("with signatureRequestId", () => {
    it("should show retry and close buttons", () => {
      const store = createTestStore();
      store.dispatch(
        fciSignatureRequestFromId.success({ ...mockSignatureRequestDetailView })
      );
      const component = renderComponent(store);
      expect(
        component.queryByTestId("FciQtspErrorTestIDRetryButton")
      ).not.toBeNull();
      expect(
        component.queryByTestId("FciQtspErrorTestIDCloseButton")
      ).not.toBeNull();
    });

    it("should dispatch fciSignatureRequestRetryFromId on retry button press", () => {
      const store = createTestStore();
      store.dispatch(
        fciSignatureRequestFromId.success({ ...mockSignatureRequestDetailView })
      );
      const dispatchSpy = jest.spyOn(store, "dispatch");
      const component = renderComponent(store);
      fireEvent.press(component.getByTestId("FciQtspErrorTestIDRetryButton"));
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: "FCI_SIGNATURE_DETAIL_RETRY_REQUEST" })
      );
    });
  });
});

const renderComponent = (store: Store) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <FciQtspErrorScreen />,
    "FCI_QTSP_ERROR_TEST",
    {},
    store
  );

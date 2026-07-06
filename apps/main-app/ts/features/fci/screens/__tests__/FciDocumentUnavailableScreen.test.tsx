import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import FciDocumentUnavailableScreen from "../failure/FciDocumentUnavailableScreen";
import { FCI_ROUTES } from "../../navigation/routes";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import { fciSignatureRequestFromId } from "../../store/actions";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { FciDocumentUnavailableScreenNavigationParams } from "../../navigation/params";

const createTestStore = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return createStore(appReducer, globalState as any) as Store<GlobalState>;
};

describe("FciDocumentUnavailableScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the screen", () => {
    const store = createTestStore();
    const component = renderComponent(store);
    expect(component.getByTestId("FciDocUnavailableTestID")).not.toBeNull();
  });

  describe("without signatureRequestId", () => {
    it("should show only the close button", () => {
      const store = createTestStore();
      const component = renderComponent(store);
      expect(component.queryByTestId("FciCloseButtonTestID")).not.toBeNull();
      expect(component.queryByTestId("FciRetryButtonTestID")).toBeNull();
    });

    it("should dispatch fciEndRequest on close button press", () => {
      const store = createTestStore();
      const dispatchSpy = jest.spyOn(store, "dispatch");
      const component = renderComponent(store);
      fireEvent.press(component.getByTestId("FciCloseButtonTestID"));
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: "FCI_END_REQUEST" })
      );
    });
  });

  describe("with signatureRequestId", () => {
    it("should show retry and close buttons", () => {
      const store = createTestStore();
      store.dispatch(
        fciSignatureRequestFromId.success({
          ...mockSignatureRequestDetailView
        })
      );
      const component = renderComponent(store);
      expect(component.queryByTestId("FciRetryButtonTestID")).not.toBeNull();
      expect(component.queryByTestId("FciCloseButtonTestID")).not.toBeNull();
    });

    it("should dispatch fciSignatureRequestRetryFromId on retry button press", () => {
      const store = createTestStore();
      store.dispatch(
        fciSignatureRequestFromId.success({
          ...mockSignatureRequestDetailView
        })
      );
      const dispatchSpy = jest.spyOn(store, "dispatch");
      const component = renderComponent(store);
      fireEvent.press(component.getByTestId("FciRetryButtonTestID"));
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: "FCI_SIGNATURE_DETAIL_RETRY_REQUEST" })
      );
    });
  });

  describe("errorKind param", () => {
    type ErrorKindScenario = {
      name: string;
      params: FciDocumentUnavailableScreenNavigationParams;
    };

    const scenarios: ReadonlyArray<ErrorKindScenario> = [
      { name: "expired", params: { errorKind: "expired" } },
      { name: "generic", params: { errorKind: "generic" } }
    ];

    test.each(scenarios)(
      "should render the screen with $name errorKind",
      ({ params }) => {
        const store = createTestStore();
        const component = renderComponent(store, params);
        expect(component.getByTestId("FciDocUnavailableTestID")).not.toBeNull();
      }
    );
  });
});

const renderComponent = (
  store: Store,
  params: FciDocumentUnavailableScreenNavigationParams = {}
) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <FciDocumentUnavailableScreen />,
    FCI_ROUTES.DOCUMENT_UNAVAILABLE,
    params,
    store
  );

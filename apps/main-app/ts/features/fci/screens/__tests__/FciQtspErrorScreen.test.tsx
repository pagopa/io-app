import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import FciQtspErrorScreen from "../failure/FciQtspErrorScreen";
import { FCI_ROUTES } from "../../navigation/routes";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import { fciSignatureRequestFromId } from "../../store/actions";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import {
  FciQtspErrorKind,
  FciQtspErrorScreenNavigationParams
} from "../../navigation/params";

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
    const component = renderComponent(store, { errorKind: "qtsp_clauses" });
    expect(component.getByTestId("FciQtspErrorTestID")).not.toBeNull();
  });

  describe("without signatureRequestId", () => {
    it("should show only the close button", () => {
      const store = createTestStore();
      const component = renderComponent(store, { errorKind: "qtsp_clauses" });
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
      const component = renderComponent(store, {
        errorKind: "filled_document"
      });
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
      const component = renderComponent(store, {
        errorKind: "poll_filled_document"
      });
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
      const component = renderComponent(store, { errorKind: "qtsp_clauses" });
      fireEvent.press(component.getByTestId("FciQtspErrorTestIDRetryButton"));
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: "FCI_SIGNATURE_DETAIL_RETRY_REQUEST" })
      );
    });
  });

  describe("errorKind param", () => {
    type ErrorKindScenario = {
      name: string;
      params: FciQtspErrorScreenNavigationParams;
    };

    const scenarios: ReadonlyArray<ErrorKindScenario> = (
      [
        "qtsp_clauses",
        "filled_document",
        "poll_filled_document"
      ] as ReadonlyArray<FciQtspErrorKind>
    ).map(errorKind => ({ name: errorKind, params: { errorKind } }));

    test.each(scenarios)(
      "should render the screen with $name errorKind",
      ({ params }) => {
        const store = createTestStore();
        const component = renderComponent(store, params);
        expect(component.getByTestId("FciQtspErrorTestID")).not.toBeNull();
      }
    );
  });
});

const renderComponent = (
  store: Store,
  params: FciQtspErrorScreenNavigationParams
) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <FciQtspErrorScreen />,
    FCI_ROUTES.QTSP_ERROR,
    params,
    store
  );

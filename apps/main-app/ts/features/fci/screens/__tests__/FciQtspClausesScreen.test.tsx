import { StackActions } from "@react-navigation/native";
import { act } from "@testing-library/react-native";
import { createStore, Store } from "redux";

import * as mixpanelModule from "../../../../mixpanel";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { getNetworkError } from "../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciLoadQtspClauses, fciPollFilledDocument } from "../../store/actions";
import { mockQtspClausesMetadata } from "../../types/__mocks__/QtspClausesMetadata.mock";
import FciQtspClausesScreen from "../valid/FciQtspClausesScreen";

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate,
    dispatch: mockDispatch,
    setOptions: jest.fn()
  })
}));

describe("Test FciQtspClauses screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
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
    store.dispatch(fciPollFilledDocument.success({ isReady: true }));
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
    store.dispatch(fciPollFilledDocument.success({ isReady: true }));
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
    store.dispatch(fciPollFilledDocument.success({ isReady: true }));
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
    store.dispatch(fciPollFilledDocument.success({ isReady: false }));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciLoadingScreenTestID")).toBeTruthy();
  });
  it("should navigate to the QTSP_ERROR route when polling fails", () => {
    const networkError = getNetworkError(new Error("network error"));
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    store.dispatch(fciPollFilledDocument.failure(networkError));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(mockDispatch).toHaveBeenCalledWith(
      StackActions.replace(FCI_ROUTES.QTSP_ERROR)
    );
    expect(component.queryByTestId("FciLoadingScreenTestID")).toBeTruthy();
  });

  it("should navigate to the QTSP_ERROR route when loading qtsp clauses fails", () => {
    const networkError = getNetworkError(new Error("network error"));
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.failure(networkError));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(mockDispatch).toHaveBeenCalledWith(
      StackActions.replace(FCI_ROUTES.QTSP_ERROR)
    );
  });

  it("should not track the QTSP ToS screen view when mounting straight into an error state", () => {
    const mixpanelTrackSpy = jest
      .spyOn(mixpanelModule, "mixpanelTrack")
      .mockImplementation();
    const networkError = getNetworkError(new Error("network error"));
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.failure(networkError));
    renderComponent(store);
    expect(mixpanelTrackSpy).not.toHaveBeenCalledWith(
      "FCI_QTSP_TOS",
      expect.anything()
    );
  });

  it("should not track the QTSP ToS screen view while the filled document is still loading", () => {
    const mixpanelTrackSpy = jest
      .spyOn(mixpanelModule, "mixpanelTrack")
      .mockImplementation();
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    renderComponent(store);
    expect(mixpanelTrackSpy).not.toHaveBeenCalledWith(
      "FCI_QTSP_TOS",
      expect.anything()
    );
  });

  it("should track the QTSP ToS screen view once the filled document becomes ready", () => {
    const mixpanelTrackSpy = jest
      .spyOn(mixpanelModule, "mixpanelTrack")
      .mockImplementation();
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciLoadQtspClauses.success(mockQtspClausesMetadata));
    renderComponent(store);
    expect(mixpanelTrackSpy).not.toHaveBeenCalledWith(
      "FCI_QTSP_TOS",
      expect.anything()
    );

    act(() => {
      store.dispatch(fciPollFilledDocument.success({ isReady: true }));
    });

    expect(mixpanelTrackSpy).toHaveBeenCalledWith(
      "FCI_QTSP_TOS",
      expect.anything()
    );
  });
});

const renderComponent = (store: Store) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <FciQtspClausesScreen />,
    FCI_ROUTES.QTSP_TOS,
    {},
    store
  );

import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { FCI_ROUTES } from "../../navigation/routes";
import { getNetworkError } from "../../../../utils/errors";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { fciSigningRequest } from "../../store/actions";
import { mockCreateSignatureBody } from "../../types/__mocks__/CreateSignatureBody.mock";
import FciThankyouScreen from "../valid/FciThankyouScreen";
import { mockSignatureDetailView } from "../../types/__mocks__/SignatureDetailView.mock";

const mockedNavigation = jest.fn();
const networkError = getNetworkError(new Error("network error"));

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: actualNav,
      dispatch: mockedNavigation,
      addListener: () => jest.fn()
    })
  };
});

describe("Test FciThankyouScreen screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render the screen", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciSigningRequest.request(mockCreateSignatureBody));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
  });
  it("should render the screen and LoadingError component", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciSigningRequest.request(mockCreateSignatureBody));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciTypLoadingScreenTestID")).toBeTruthy();
  });
  it("should render the screen and Success component", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciSigningRequest.success(mockSignatureDetailView));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciTypSuccessTestID")).toBeTruthy();
  });
  it("should render the screen and Success component with close button clickable", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciSigningRequest.success(mockSignatureDetailView));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciTypSuccessTestID")).toBeTruthy();
    const closeButton = component.getByTestId("FciTypSuccessFooterButton");
    expect(closeButton).toBeTruthy();
    expect(closeButton).toBeEnabled();
    fireEvent.press(closeButton, "onPress");
    expect(store.getState().features.fci.signature).toStrictEqual(
      pot.some(mockSignatureDetailView)
    );
  });
  it("should render the GenericErrorScreen component if error occurs during the signing request", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(fciSigningRequest.failure(networkError));
    const component = renderComponent(store);
    expect(component).toBeTruthy();
    expect(component.queryByTestId("FciTypErrorScreenTestID")).toBeTruthy();
  });
});

const renderComponent = (store: Store) =>
  renderScreenFakeNavRedux<GlobalState>(
    () => <FciThankyouScreen />,
    FCI_ROUTES.TYP,
    {},
    store
  );

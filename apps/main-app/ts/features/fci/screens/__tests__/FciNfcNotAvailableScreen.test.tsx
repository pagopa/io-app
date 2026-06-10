import { act, fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import { FciNfcNotAvailableScreen } from "../loginL3/FciNfcNotAvailableScreen";
import {
  trackFciNfcNotSupported,
  trackFciNfcNotSupportedClose
} from "../../analytics";
import { fciEndRequest } from "../../store/actions";

jest.mock("../../analytics");

describe("FciNfcNotAvailableScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the screen correctly", () => {
    const { component } = renderComponent();
    expect(component).toBeDefined();
  });

  it("should call trackFciNfcNotSupported on first render", () => {
    renderComponent();
    expect(trackFciNfcNotSupported).toHaveBeenCalledTimes(1);
  });

  it("should call trackFciNfcNotSupportedClose when CTA is pressed", () => {
    const { component } = renderComponent();

    act(() => {
      fireEvent.press(component.getByTestId("help-center-cta"));
    });

    expect(trackFciNfcNotSupportedClose).toHaveBeenCalledTimes(1);
  });

  it("should dispatch fciEndRequest when CTA is pressed", () => {
    const { component, store } = renderComponent();

    act(() => {
      fireEvent.press(component.getByTestId("help-center-cta"));
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(fciEndRequest());
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const configureMockStore = require("redux-mock-store")
    .default as typeof import("redux-mock-store").default;
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      FciNfcNotAvailableScreen,
      FCI_ROUTES.NFC_NOT_AVAILABLE,
      {},
      store
    ),
    store
  };
};

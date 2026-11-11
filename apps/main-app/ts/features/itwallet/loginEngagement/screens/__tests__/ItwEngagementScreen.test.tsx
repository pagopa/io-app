import { StackActions } from "@react-navigation/native";
import { act, fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";

import * as Mixpanel from "../../../../../mixpanel";
import { navigationRef } from "../../../../../navigation/NavigationService";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { setSecurityAdviceReadyToShow } from "../../../../authentication/fastLogin/store/actions/securityAdviceActions";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwEngagementScreen } from "../ItwEngagementScreen";

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());
const mockTrack = jest.spyOn(Mixpanel, "mixpanelTrack").mockImplementation();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    addListener: mockAddListener,
    navigate: mockNavigate,
    goBack: mockGoBack
  })
}));

describe("ItwEngagementScreen", () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.useRealTimers());
  afterAll(() => mockTrack.mockRestore());

  const renderScreen = () => {
    const store = configureMockStore<GlobalState>()(
      appReducer(undefined, applicationChangeState("active"))
    );
    return {
      store,
      ...renderScreenWithNavigationStoreContext(
        ItwEngagementScreen,
        ITW_ROUTES.ENGAGEMENT,
        {},
        store
      )
    };
  };

  const removeWith = (type: string) => {
    const calls = mockAddListener.mock.calls as unknown as Array<
      [string, (e: unknown) => void]
    >;
    calls
      .filter(([event]) => event === "beforeRemove")
      .forEach(([, listener]) => listener({ data: { action: { type } } }));
  };

  it("tracks the engagement screen when shown", () => {
    renderScreen();

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith("ITW_ACTIVATION_MODAL_DIALOG", {
      event_category: "UX",
      event_type: "screen_view",
      flow: undefined
    });
  });

  it("tracks the screen again when it regains focus", () => {
    jest.useFakeTimers();
    renderScreen();

    act(() =>
      navigationRef.current?.dispatch(StackActions.push(ITW_ROUTES.ENGAGEMENT))
    );
    act(() => jest.runAllTimers());
    expect(mockTrack).toHaveBeenCalledTimes(2);
    act(() => navigationRef.current?.dispatch(StackActions.pop()));
    act(() => jest.runAllTimers());
    expect(mockTrack).toHaveBeenCalledTimes(3);
    expect(mockTrack).toHaveBeenLastCalledWith("ITW_ACTIVATION_MODAL_DIALOG", {
      event_category: "UX",
      event_type: "screen_view",
      flow: undefined
    });
  });

  it("opens the L3 activation introduction", () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId("itwEngagementAction"));

    expect(mockTrack).toHaveBeenCalledTimes(2);
    expect(mockTrack).toHaveBeenLastCalledWith(
      "ITW_ACTIVATION_MODAL_DIALOG_ACTIVATION_START",
      { event_category: "UX", event_type: "action", flow: undefined }
    );
    expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      state: {
        routes: [{ name: ITW_ROUTES.DISCOVERY.INFO, params: { level: "l3" } }]
      }
    });
  });

  it("goes back when declined", () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId("itwEngagementSecondaryAction"));

    expect(mockTrack).toHaveBeenCalledTimes(2);
    expect(mockTrack).toHaveBeenLastCalledWith(
      "ITW_ACTIVATION_MODAL_DIALOG_DISMISSED",
      { event_category: "UX", event_type: "action", flow: undefined }
    );
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it("enables the security advice when dismissed, not when activating", () => {
    const { store } = renderScreen();
    removeWith("NAVIGATE");
    expect(store.getActions()).not.toContainEqual(
      setSecurityAdviceReadyToShow(true)
    );
    removeWith("GO_BACK");
    expect(store.getActions()).toContainEqual(
      setSecurityAdviceReadyToShow(true)
    );
    expect(mockTrack).toHaveBeenCalledTimes(1);
  });
});

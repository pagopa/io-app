import React from "react";
import { createStore } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { MessagesHomeScreen } from "../MessagesHomeScreen";
import * as engamentHook from "../../../pushNotifications/hooks/useEngagementScreen";

jest.mock("../../components/Home/PagerViewContainer");
jest.mock("../../components/Home/Preconditions");
jest.mock("../../components/Home/SecuritySuggestions");
jest.mock("../../components/Home/TabNavigationContainer");
jest.mock("../../components/Home/Toasts");

describe("MessagesHomeScreen", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should match snapshot (with mocked components", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should call 'useEngagementScreen' hook", () => {
    const mockUseEngagementeScreen = jest.fn();
    jest
      .spyOn(engamentHook, "useEngagementScreen")
      .mockImplementation(mockUseEngagementeScreen);

    renderScreen();

    expect(mockUseEngagementeScreen.mock.calls.length).toBe(1);
    expect(mockUseEngagementeScreen.mock.calls[0].length).toBe(0);
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => <MessagesHomeScreen />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};

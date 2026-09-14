import { createStore } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { mockAccessibilityInfo } from "../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as engagementHook from "../../../pushNotifications/hooks/useEngagementScreen";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { MessagesHomeScreen } from "../MessagesHomeScreen";

jest.mock("../../components/Home/PagerViewContainer");
jest.mock("../../components/Home/Preconditions");
jest.mock("../../components/Home/SecuritySuggestions");
jest.mock("../../components/Home/TabNavigationContainer");
jest.mock("../../components/Home/Toasts");

describe("MessagesHomeScreen", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    mockAccessibilityInfo();
  });
  it("should match snapshot (with mocked components", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should call 'useEngagementScreen' hook", () => {
    const mockUseEngagementScreen = jest.fn();
    jest
      .spyOn(engagementHook, "useEngagementScreen")
      .mockImplementation(mockUseEngagementScreen);

    renderScreen();

    expect(mockUseEngagementScreen.mock.calls.length).toBe(1);
    expect(mockUseEngagementScreen.mock.calls[0].length).toBe(0);
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <MessagesHomeScreen />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};

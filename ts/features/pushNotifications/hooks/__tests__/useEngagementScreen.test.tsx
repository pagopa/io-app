import { createStore } from "redux";
import * as selector from "../../store/reducers";
import { useEngagementScreen } from "../useEngagementScreen";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { NOTIFICATIONS_ROUTES } from "../../navigation/routes";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

describe("useEngagementScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should call 'navigate' with 'NOTIFICATIONS_ROUTES.SYSTEM_NOTIFICATION_PERMISSIONS' parameter when 'shouldShowEngagementScreenSelector' return 'true'", () => {
    jest
      .spyOn(selector, "shouldShowEngagementScreenSelector")
      .mockImplementation(_state => true);
    renderScreen();
    expect(mockNavigate.mock.calls.length).toBe(1);
    expect(mockNavigate.mock.calls[0].length).toBe(1);
    expect(mockNavigate.mock.calls[0][0]).toBe(
      NOTIFICATIONS_ROUTES.SYSTEM_NOTIFICATION_PERMISSIONS
    );
  });
  it("should not call 'navigate' when 'shouldShowEngagementScreenSelector' return 'false'", () => {
    jest
      .spyOn(selector, "shouldShowEngagementScreenSelector")
      .mockImplementation(_state => false);
    renderScreen();
    expect(mockNavigate.mock.calls.length).toBe(0);
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    HookWrapper,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};

const HookWrapper = () => {
  useEngagementScreen();
  return undefined;
};

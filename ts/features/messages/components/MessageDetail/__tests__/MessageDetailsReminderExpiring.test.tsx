import { createStore } from "redux";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { MessageDetailsReminderExpiring } from "../MessageDetailsReminderExpiring";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as accessibility from "../../../../../utils/accessibility";
import { renderComponentWithStoreAndNavigationContextForFocus } from "../../../utils/__tests__/testUtils.test";

const messageId = "01HSG6GR1JT2E23AJ5RBTAMZZP";

jest.mock("rn-qr-generator", () => ({}));
jest.mock("react-native-capture-protection", () => ({}));
jest.mock("react-native-calendar-events", () => ({
  checkPermissions: () => new Promise(resolve => resolve("authorized"))
}));

const mockNavigation = jest.fn();
jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigation
  })
}));

describe("MessageDetailsReminderExpiring", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it("should match snapshot", () => {
    const component = renderScreen();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should set accessibility focus upon the alert after having shown the calendar modal", async () => {
    const spiedOnMockedSetAccessibilityFocus = jest
      .spyOn(accessibility, "setAccessibilityFocus")
      .mockImplementation();

    const component = renderComponentWithStoreAndNavigationContextForFocus(
      componentToRender,
      true
    );

    expect(spiedOnMockedSetAccessibilityFocus.mock.calls.length).toBe(0);

    const alert = component.getByTestId("due-date-alert");
    fireEvent.press(alert);

    await waitFor(
      () => {
        expect(mockNavigation.mock.calls.length).toBe(1);
        expect(mockNavigation.mock.calls[0].length).toBe(2);
        expect(mockNavigation.mock.calls[0][0]).toBe("MESSAGES_NAVIGATOR");
        expect(mockNavigation.mock.calls[0][1]).toEqual({
          screen: "MESSAGE_DETAIL_CALENDAR",
          params: {
            messageId
          }
        });
      },
      { timeout: 500 }
    );

    component.rerender(componentToRender);

    expect(spiedOnMockedSetAccessibilityFocus.mock.calls.length).toBe(1);
    expect(spiedOnMockedSetAccessibilityFocus.mock.calls[0].length).toBe(2);
    // At the moment, there is not way to check for the first parameter
    expect(spiedOnMockedSetAccessibilityFocus.mock.calls[0][1]).toBe(1000);
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    () => componentToRender,
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};

const componentToRender = (
  <MessageDetailsReminderExpiring
    dueDate={new Date(2024, 2, 21, 10, 33, 42)}
    messageId={messageId}
    title="The title"
  />
);

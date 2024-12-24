import { createStore } from "redux";
import { MessageDetailsReminder } from "../MessageDetailsReminder";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { UIMessageId } from "../../../types";
import * as payments from "../../../store/reducers/payments";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";

const dueDate = new Date(2024, 2, 21, 18, 44, 31);

describe("MessageDetailsReminder", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockAccessibilityInfo(false);
  });
  it("should match snapshot when the reminder is hidden", () => {
    jest
      .spyOn(payments, "paymentExpirationBannerStateSelector")
      .mockImplementation((_state, _messageId) => "hidden");
    const component = renderScreen(dueDate);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when the due date is missing", () => {
    jest
      .spyOn(payments, "paymentExpirationBannerStateSelector")
      .mockImplementation((_state, _messageId) => "visibleExpired");
    const component = renderScreen();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when the reminder is loading", () => {
    jest
      .spyOn(payments, "paymentExpirationBannerStateSelector")
      .mockImplementation((_state, _messageId) => "loading");
    const component = renderScreen(dueDate);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when the reminder is visible an expiring", () => {
    jest
      .spyOn(payments, "paymentExpirationBannerStateSelector")
      .mockImplementation((_state, _messageId) => "visibleExpiring");
    const component = renderScreen(dueDate);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when the reminder is visible and expired", () => {
    jest
      .spyOn(payments, "paymentExpirationBannerStateSelector")
      .mockImplementation((_state, _messageId) => "visibleExpired");
    const component = renderScreen(dueDate);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (dueDateOrUndefined?: Date) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsReminder
        dueDate={dueDateOrUndefined}
        messageId={"01HSG6H6M4KK36CV6QWP2VJW3S" as UIMessageId}
        title="The title"
      />
    ),
    "DUMMY",
    {},
    store
  );
};

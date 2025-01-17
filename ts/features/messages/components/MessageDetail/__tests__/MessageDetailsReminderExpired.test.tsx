import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessageDetailsReminderExpired } from "../MessageDetailsReminderExpired";

describe("MessageDetailsReminderExpired", () => {
  it("should match snapshot when loading", () => {
    const component = renderScreen(true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not loading", () => {
    const component = renderScreen();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (isLoading: boolean = false) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsReminderExpired
        dueDate={new Date(2024, 2, 21, 10, 33, 42)}
        isLoading={isLoading}
      />
    ),
    "DUMMY",
    {},
    store
  );
};

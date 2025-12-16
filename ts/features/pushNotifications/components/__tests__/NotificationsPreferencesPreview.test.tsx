import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { NotificationsPreferencesPreview } from "../NotificationsPreferencesPreview";
import ROUTES from "../../../../navigation/routes";

describe("NotificationsPreferencesPreview", () => {
  it("should match snapshot, preview on, reminder on", () => {
    const component = renderComponent(true, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, preview on, reminder off", () => {
    const component = renderComponent(true, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, preview off, reminder on", () => {
    const component = renderComponent(false, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, preview off, reminder off", () => {
    const component = renderComponent(false, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (previewOn: boolean, reminderOn: boolean) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <NotificationsPreferencesPreview
        previewEnabled={previewOn}
        remindersEnabled={reminderOn}
      />
    ),
    ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
    {},
    store
  );
};

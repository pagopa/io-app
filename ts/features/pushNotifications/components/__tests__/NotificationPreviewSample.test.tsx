import { createStore } from "redux";
import { render } from "@testing-library/react-native";
import I18n from "i18next";
import { NotificationPreviewSample } from "../NotificationPreviewSample";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";

describe("NotificationPreviewSample", () => {
  it("Given enabled previews and enabled reminders then title should match 'onboarding.notifications.preview.reminderOnPreviewOnTitle' key and message should match 'onboarding.notifications.preview.reminderOnPreviewOnMessage' key", () => {
    const screen = renderNotificationPreviewSample(true, true);
    expect(screen).not.toBeNull();

    const h4Title = screen.queryByText(
      I18n.t("onboarding.notifications.preview.reminderOnPreviewOnTitle")
    );
    expect(h4Title).not.toBeNull();

    const h5Message = screen.queryByText(
      I18n.t("onboarding.notifications.preview.reminderOnPreviewOnMessage")
    );
    expect(h5Message).not.toBeNull();
  });

  it("Given disabled previews and enabled reminders then title should match 'onboarding.notifications.preview.reminderOnPreviewOffTitle' key and message should match 'onboarding.notifications.preview.reminderOnPreviewOffMessage' key", () => {
    const screen = renderNotificationPreviewSample(false, true);
    expect(screen).not.toBeNull();

    const h4Title = screen.queryByText(
      I18n.t("onboarding.notifications.preview.reminderOnPreviewOffTitle")
    );
    expect(h4Title).not.toBeNull();

    const h5Message = screen.queryByText(
      I18n.t("onboarding.notifications.preview.reminderOnPreviewOffMessage")
    );
    expect(h5Message).not.toBeNull();
  });

  it("Given enabled previews and disabled reminders then title should match 'onboarding.notifications.preview.reminderOffPreviewOnTitle' key and message should match 'onboarding.notifications.preview.reminderOffPreviewOnMessage' key", () => {
    const screen = renderNotificationPreviewSample(true, false);
    expect(screen).not.toBeNull();

    const h4Title = screen.queryByText(
      I18n.t("onboarding.notifications.preview.reminderOffPreviewOnTitle")
    );
    expect(h4Title).not.toBeNull();

    const h5Message = screen.queryByText(
      I18n.t("onboarding.notifications.preview.reminderOffPreviewOnMessage")
    );
    expect(h5Message).not.toBeNull();
  });

  it("Given disabled previews and disabled reminders then title should match 'onboarding.notifications.preview.reminderOffPreviewOffTitle' key and message should match 'onboarding.notifications.preview.reminderOnPreviewOffMessage' key", () => {
    const screen = renderNotificationPreviewSample(false, false);
    expect(screen).not.toBeNull();

    const h4Title = screen.queryByText(
      I18n.t("onboarding.notifications.preview.reminderOffPreviewOffTitle")
    );
    expect(h4Title).not.toBeNull();

    const h5Message = screen.queryByText(
      I18n.t("onboarding.notifications.preview.reminderOffPreviewOffMessage")
    );
    expect(h5Message).not.toBeNull();
  });

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

const renderNotificationPreviewSample = (
  previewEnabled: boolean,
  remindersEnabled: boolean
) => {
  const component = (
    <NotificationPreviewSample
      previewEnabled={previewEnabled}
      remindersEnabled={remindersEnabled}
    />
  );
  return render(component);
};

const renderComponent = (previewOn: boolean, reminderOn: boolean) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <NotificationPreviewSample
        previewEnabled={previewOn}
        remindersEnabled={reminderOn}
      />
    ),
    ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
    {},
    store
  );
};

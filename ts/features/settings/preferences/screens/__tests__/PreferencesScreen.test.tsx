import { fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { createStore } from "redux";
import I18n from "i18next";
import PreferencesScreen from "../PreferencesScreen";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { checkAndRequestPermission } from "../../../../../utils/calendar";
import { openAppSettings } from "../../../../../utils/appSettings";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn()
}));

jest.mock("../../../../../utils/calendar", () => ({
  checkAndRequestPermission: jest.fn()
}));

jest.mock("../../../../../utils/appSettings", () => ({
  openAppSettings: jest.fn()
}));

describe("PreferencesScreen", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useIONavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate
    });
  });

  it("should match snapshot", () => {
    const tree = renderComponent().toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("should render the preferences screen correctly", () => {
    const { getByText, getAllByText } = renderComponent();
    expect(
      getAllByText(I18n.t("profile.preferences.title")).length
    ).toBeGreaterThanOrEqual(1);
    expect(getByText(I18n.t("profile.preferences.subtitle"))).toBeTruthy();
  });

  it("should navigate to notification preferences screen", () => {
    const { getByText } = renderComponent();
    fireEvent.press(
      getByText(I18n.t("profile.preferences.list.notifications.title"))
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      expect.objectContaining({
        screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS
      })
    );
  });
  it("should navigate to email forwarding preferences screen", () => {
    const { getByText } = renderComponent();
    fireEvent.press(
      getByText(I18n.t("profile.preferences.list.send_email_messages.title"))
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      expect.objectContaining({
        screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING
      })
    );
  });
  it("should navigate to services preferences screen", () => {
    const { getByText } = renderComponent();
    fireEvent.press(
      getByText(I18n.t("profile.preferences.list.service_contact.title"))
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      expect.objectContaining({
        screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_SERVICES
      })
    );
  });

  it("should navigate to appearance preferences screen", () => {
    const { getByText } = renderComponent();
    fireEvent.press(
      getByText(I18n.t("profile.preferences.list.appearance.title"))
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      expect.objectContaining({
        screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_APPEARANCE
      })
    );
  });

  it("should navigate to language preferences screen", () => {
    const { getByText } = renderComponent();
    fireEvent.press(
      getByText(I18n.t("profile.preferences.list.language.title"))
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      expect.objectContaining({
        screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_LANGUAGE
      })
    );
  });

  it("should navigate to calendar preferences if permission is granted", async () => {
    (checkAndRequestPermission as jest.Mock).mockResolvedValue({
      authorized: true,
      asked: true
    });

    const { getByText } = renderComponent();

    fireEvent.press(
      getByText(I18n.t("profile.preferences.list.preferred_calendar.title"))
    );

    // Aspetta che la navigazione sia stata chiamata
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        SETTINGS_ROUTES.PROFILE_NAVIGATOR,
        expect.objectContaining({
          screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_CALENDAR
        })
      );
    });
  });

  it("should show alert and open settings if permission is denied", async () => {
    (checkAndRequestPermission as jest.Mock).mockResolvedValue({
      authorized: false,
      asked: false
    });

    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText } = renderComponent();

    fireEvent.press(
      getByText(I18n.t("profile.preferences.list.preferred_calendar.title"))
    );

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    const alertButtons = alertSpy.mock.calls[0][2];
    if (alertButtons?.[1]?.onPress) {
      alertButtons[1].onPress();
    }

    expect(openAppSettings).toHaveBeenCalled();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    PreferencesScreen,
    SETTINGS_ROUTES.PROFILE_MAIN,
    {},
    store
  );
};

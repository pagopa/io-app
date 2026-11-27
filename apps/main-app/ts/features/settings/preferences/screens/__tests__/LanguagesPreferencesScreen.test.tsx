import * as pot from "@pagopa/ts-commons/lib/pot";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Alert } from "react-native";
import { createStore } from "redux";

import { setLocale } from "../../../../../i18n";
import { applicationChangeState } from "../../../../../store/actions/application";
import { useIOSelector } from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { preferredLanguageSelector } from "../../../../../store/reducers/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import * as preferencesAnalytics from "../../analytics";
import LanguagesPreferencesScreen from "../LanguagesPreferencesScreen";

// Mock the useIOSelector hook
jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: () => jest.fn(),
  useIOStore: jest.fn()
}));

// Mock the useIOAlertVisible hook
jest.mock(
  "../../../../../components/StatusMessages/IOAlertVisibleContext",
  () => ({
    ...jest.requireActual(
      "../../../../../components/StatusMessages/IOAlertVisibleContext"
    ),
    useIOAlertVisible: () => ({
      isAlertVisible: false,
      setAlertVisible: jest.fn()
    })
  })
);

describe("LanguagesPreferencesScreen", () => {
  beforeAll(() => {
    jest.spyOn(Alert, "alert");
    jest
      .spyOn(preferencesAnalytics, "trackUILanguageUpdate")
      .mockImplementation(() => undefined);
    jest
      .spyOn(preferencesAnalytics, "trackMessageLanguageUpdate")
      .mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useIOSelector as jest.Mock).mockImplementation((selector: unknown) =>
      selector === preferredLanguageSelector ? O.some("it") : pot.none
    );
    setLocale("it");
  });

  describe("UI Rendering", () => {
    test("renders the screen with, title, subtitle and radio buttons", () => {
      const { getByText, getByTestId, queryAllByText, toJSON } =
        renderComponent();
      expect(
        // With the new navbar we have two titles.
        // The second one is the larger one.
        // The first one is the smaller one that is shown when scrolling.
        queryAllByText(
          I18n.t("profile.preferences.list.preferred_language.title")
        )[1]
      ).not.toBeNull();
      expect(
        getByText(
          I18n.t("profile.preferences.list.preferred_language.subtitle")
        )
      ).toBeTruthy();
      // App locale radio buttons
      const appLocaleIt = getByTestId("RadioItemTestID_app-locale-it");
      const appLocaleEn = getByTestId("RadioItemTestID_app-locale-en");
      const appLocaleDe = getByTestId("RadioItemTestID_app-locale-de");
      expect(appLocaleIt).toBeTruthy();
      expect(appLocaleEn).toBeTruthy();
      expect(appLocaleDe).toBeTruthy();

      // Message language radio buttons
      const radioItemIt = getByTestId("RadioItemTestID_it");
      const radioItemEn = getByTestId("RadioItemTestID_en");
      const radioItemDe = getByTestId("RadioItemTestID_de");
      expect(radioItemIt).toBeTruthy();
      expect(radioItemEn).toBeTruthy();
      expect(radioItemDe).toBeTruthy();

      // Pressing an app locale radio button shows an Alert
      fireEvent.press(appLocaleEn);
      expect(Alert.alert).toHaveBeenCalled();

      expect(toJSON()).toMatchSnapshot();
    });

    test("tracks the UI language only after confirmation", async () => {
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId("RadioItemTestID_app-locale-de"));

      const buttons = jest.mocked(Alert.alert).mock.calls[0][2];
      await act(async () => {
        buttons?.[1].onPress?.();
      });

      await waitFor(() =>
        expect(preferencesAnalytics.trackUILanguageUpdate).toHaveBeenCalledWith(
          "it",
          "de"
        )
      );
    });

    test("does not track a cancelled UI language selection", () => {
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId("RadioItemTestID_app-locale-de"));
      const buttons = jest.mocked(Alert.alert).mock.calls[0][2];
      buttons?.[0].onPress?.();

      expect(preferencesAnalytics.trackUILanguageUpdate).not.toHaveBeenCalled();
    });

    test("does not show confirmation or track when selecting the current UI language", () => {
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId("RadioItemTestID_app-locale-it"));

      expect(Alert.alert).not.toHaveBeenCalled();
      expect(preferencesAnalytics.trackUILanguageUpdate).not.toHaveBeenCalled();
    });

    test("does not track changes to the message language", () => {
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId("RadioItemTestID_en"));

      expect(preferencesAnalytics.trackUILanguageUpdate).not.toHaveBeenCalled();
      expect(
        preferencesAnalytics.trackMessageLanguageUpdate
      ).not.toHaveBeenCalled();
    });
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    LanguagesPreferencesScreen,
    SETTINGS_ROUTES.PROFILE_PREFERENCES_LANGUAGE,
    {},
    store
  );
};

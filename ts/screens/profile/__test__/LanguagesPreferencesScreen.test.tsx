import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { Alert } from "react-native";
import I18n from "../../../i18n";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import ROUTES from "../../../navigation/routes";
import { useIOSelector } from "../../../store/hooks";
import LanguagesPreferencesScreen from "../LanguagesPreferencesScreen";
import { preferredLanguageSelector } from "../../../store/reducers/persistedPreferences";

// Mock the useIOSelector hook
jest.mock("../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: jest.fn()
}));

describe("ActivateNfcScreen", () => {
  beforeAll(() => {
    jest.spyOn(Alert, "alert");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("UI Rendering", () => {
    test("renders the screen with, title, subtitle and radio buttons", () => {
      (useIOSelector as jest.Mock).mockReturnValue((selector: any) => {
        if (selector === preferredLanguageSelector) {
          return "it";
        }
        return null;
      });

      const { getByText, getByTestId, toJSON } = renderComponent();

      expect(
        getByText(I18n.t("profile.preferences.list.preferred_language.title"))
      ).toBeTruthy();
      expect(
        getByText(
          I18n.t("profile.preferences.list.preferred_language.subtitle")
        )
      ).toBeTruthy();
      const radioItemIt = getByTestId("RadioItemTestID_it");
      const radioItemEn = getByTestId("RadioItemTestID_en");
      const radioItemDe = getByTestId("RadioItemTestID_de");
      expect(radioItemIt).toBeTruthy();
      expect(radioItemEn).toBeTruthy();
      expect(radioItemDe).toBeTruthy();
      fireEvent.press(radioItemIt);
      expect(Alert.alert).toHaveBeenCalled();

      expect(toJSON()).toMatchSnapshot();
    });
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    LanguagesPreferencesScreen,
    ROUTES.PROFILE_PREFERENCES_LANGUAGE,
    {},
    store
  );
};

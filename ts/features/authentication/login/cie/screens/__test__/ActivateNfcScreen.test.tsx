import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Alert } from "react-native";
import I18n from "i18next";
import { openNFCSettings } from "../../utils/cie";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { useIOSelector } from "../../../../../../store/hooks";
import ActivateNfcScreen from "../ActivateNfcScreen";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";

// Mock the openNFCSettings function
jest.mock("../../utils/cie", () => ({
  openNFCSettings: jest.fn()
}));

// Mock the useIOSelector hook
jest.mock("../../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../../store/hooks"),
  useIOSelector: jest.fn(),
  useIODispatch: jest.fn(),
  useIOStore: jest.fn()
}));

// Mock the useIOAlertVisible hook
jest.mock(
  "../../../../../../components/StatusMessages/IOAlertVisibleContext",
  () => ({
    ...jest.requireActual(
      "../../../../../../components/StatusMessages/IOAlertVisibleContext"
    ),
    useIOAlertVisible: () => ({
      isAlertVisible: false,
      setAlertVisible: jest.fn()
    })
  })
);

const mockNavigateToCieCardReaderScreen = jest.fn();

jest.mock(
  "../../../../activeSessionLogin/utils/useActiveSessionLoginNavigation",
  () => () => ({
    ...jest.requireActual(
      "../../../../activeSessionLogin/utils/useActiveSessionLoginNavigation"
    ),
    navigateToCieCardReaderScreen: mockNavigateToCieCardReaderScreen
  })
);

jest.mock("../../../../../../hooks/useStatusAlertProps", () => ({
  useStatusAlertProps: jest.fn()
}));

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      replace: mockReplace
    }),
    useRoute: () => ({
      params: {
        ciePin: "123456",
        authorizationUri: "https://example.com"
      }
    })
  };
});

describe("ActivateNfcScreen", () => {
  beforeAll(() => {
    jest.spyOn(Alert, "alert");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("UI Rendering", () => {
    test("renders the screen with header, title, subtitle, and list items", () => {
      (useIOSelector as jest.Mock).mockReturnValue(pot.some(true));

      const { getByText, toJSON } = renderComponent();

      expect(getByText(I18n.t("authentication.cie.nfc.title"))).toBeTruthy();
      expect(getByText(I18n.t("authentication.cie.nfc.subtitle"))).toBeTruthy();
      expect(
        getByText(I18n.t("authentication.cie.nfc.listItemTitle"))
      ).toBeTruthy();
      expect(
        getByText(I18n.t("authentication.cie.nfc.listItemLabel1"))
      ).toBeTruthy();
      expect(
        getByText(I18n.t("authentication.cie.nfc.listItemValue1"))
      ).toBeTruthy();
      expect(
        getByText(I18n.t("authentication.cie.nfc.listItemLabel2"))
      ).toBeTruthy();
      expect(
        getByText(I18n.t("authentication.cie.nfc.listItemValue2"))
      ).toBeTruthy();
      expect(
        getByText(I18n.t("authentication.cie.nfc.listItemLabel3"))
      ).toBeTruthy();
      expect(
        getByText(I18n.t("authentication.cie.nfc.listItemValue3"))
      ).toBeTruthy();

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe("Button Actions", () => {
    test("calls openNFCSettings when primary action button is pressed", () => {
      (useIOSelector as jest.Mock).mockReturnValue(pot.some(true));

      const { getByText } = renderComponent();

      const actionButton = getByText(I18n.t("authentication.cie.nfc.action"));
      expect(actionButton).toBeTruthy();

      fireEvent.press(actionButton);

      expect(openNFCSettings).toHaveBeenCalled();
    });

    test("navigates to CIE_CARD_READER_SCREEN when NFC is enabled and secondary action button is pressed", () => {
      (useIOSelector as jest.Mock).mockReturnValue(pot.some(true));

      const { getByText } = renderComponent();

      const secondaryActionButton = getByText(
        I18n.t("global.buttons.continue")
      );
      expect(secondaryActionButton).toBeTruthy();

      fireEvent.press(secondaryActionButton);

      expect(mockNavigateToCieCardReaderScreen).toHaveBeenCalledWith({
        ciePin: "123456",
        authorizationUri: "https://example.com"
      });
    });

    test("shows alert when NFC is disabled and secondary action button is pressed", () => {
      (useIOSelector as jest.Mock).mockReturnValue(pot.some(false));

      const { getByText } = renderComponent();

      const secondaryActionButton = getByText(
        I18n.t("global.buttons.continue")
      );
      expect(secondaryActionButton).toBeTruthy();

      fireEvent.press(secondaryActionButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        I18n.t("authentication.cie.nfc.activeNfcAlert"),
        "",
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("authentication.cie.nfc.activeNFCAlertButton"),
            onPress: expect.any(Function)
          }
        ]
      );
    });
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    ActivateNfcScreen,
    AUTHENTICATION_ROUTES.CIE_ACTIVATE_NFC_SCREEN,
    {},
    store
  );
};

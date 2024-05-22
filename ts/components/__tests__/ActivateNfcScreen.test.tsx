import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "../../i18n";
import { openNFCSettings } from "../../utils/cie";
import ActivateNfcScreen from "../cie/ActivateNfcScreen";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../utils/testWrapper";
import ROUTES from "../../navigation/routes";

// Mock the openNFCSettings function
jest.mock("../../utils/cie", () => ({
  openNFCSettings: jest.fn()
}));

describe("ActivateNfcScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the screen with header, title, subtitle, and list items", () => {
    const { getByText, toJSON } = renderComponent();

    // Check if header is visible
    expect(getByText(I18n.t("authentication.cie.nfc.title"))).toBeTruthy();

    // Check if subtitle is visible
    expect(getByText(I18n.t("authentication.cie.nfc.subtitle"))).toBeTruthy();

    // Check if list item headers are visible
    expect(
      getByText(I18n.t("authentication.cie.nfc.listItemTitle"))
    ).toBeTruthy();

    // Check if list items are rendered
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

    // Create snapshot
    expect(toJSON()).toMatchSnapshot();
  });

  test("calls openNFCSettings when action button is pressed", () => {
    const { getByText } = renderComponent();

    // Check if the action button is rendered
    const actionButton = getByText(I18n.t("authentication.cie.nfc.action"));
    expect(actionButton).toBeTruthy();

    // Simulate button press
    fireEvent.press(actionButton);

    // Check if openNFCSettings was called
    expect(openNFCSettings).toHaveBeenCalled();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    ActivateNfcScreen,
    ROUTES.CIE_ACTIVATE_NFC_SCREEN,
    {},
    store
  );
};

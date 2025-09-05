import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import CieExtendedApduNotSupportedScreen from "../CieExtendedApduNotSupportedScreen";

const mockReset = jest.fn();

jest.mock("../../../../../../navigation/params/AppParamsList", () => {
  const actual = jest.requireActual(
    "../../../../../../navigation/params/AppParamsList"
  );
  return {
    ...actual,
    useIONavigation: () => ({
      reset: mockReset
    })
  };
});

describe("CieExtendedApduNotSupportedScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match the snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should display correct texts from i18n", () => {
    const { getByText } = renderComponent();

    expect(
      getByText(I18n.t("authentication.cie.card.error.genericErrorTitle"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("authentication.cie.nfc.apduNotSupported"))
    ).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.close"))).toBeTruthy();
  });

  it("should call navigation.reset when pressing close", () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText(I18n.t("global.buttons.close")));

    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
    });
  });
});

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <CieExtendedApduNotSupportedScreen />,
    AUTHENTICATION_ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN,
    {},
    store
  );
}

import { fireEvent } from "@testing-library/react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";

import { createStore } from "redux";
import I18n from "i18next";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CiePinScreen from "../../screens/CiePinScreen";
import * as hooks from "../../../../../../store/hooks";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as cieAnalytics from "../../../../common/analytics/cieAnalytics";
import * as accessibilityUtils from "../../../../../../utils/accessibility";

jest.mock("../../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: jest.fn(),
  useIOStore: jest.fn()
}));
const mockPresent = jest.fn();
jest.mock("../../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(() => ({
    present: mockPresent,
    bottomSheet: <></>
  }))
}));

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("typesafe-actions", () => {
  const original = jest.requireActual("typesafe-actions");
  return {
    ...original,
    getType: (actionCreator: any) => {
      if (typeof actionCreator === "object" && actionCreator.type) {
        return actionCreator.type;
      }
      return actionCreator?.().type || "UNKNOWN_TYPE";
    }
  };
});

jest.mock("../../store/actions", () => {
  const actual = jest.requireActual("../../store/actions");
  return {
    ...actual,
    nfcIsEnabled: {
      request: () => jest.fn(() => ({ type: "NFC_CHECK_REQUEST" }))
    }
  };
});

describe("CiePinScreen", () => {
  const mockDispatch = jest.fn();
  jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useIODispatch as jest.Mock).mockReturnValue(mockDispatch);
    (hooks.useIOSelector as jest.Mock).mockImplementation(selector => {
      if (selector.name === "isFastLoginEnabledSelector") {
        return false;
      }
      if (selector.name === "isCieLoginUatEnabledSelector") {
        return false;
      }
      if (selector.name === "isNfcEnabledSelector") {
        return pot.some(true);
      }
      return undefined;
    });
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render OTPInput and Banner", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("authentication.cie.pin.pinCardTitle"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("authentication.cie.pin.subtitleCTA"))
    ).toBeTruthy();
  });

  it("should open bottom sheet when subtitleCTA is pressed", () => {
    const { getByText } = renderComponent();
    const subtitle = getByText(I18n.t("authentication.cie.pin.subtitleCTA"));
    fireEvent.press(subtitle);
  });

  it("should track the screen on first render", () => {
    const spy = jest.spyOn(cieAnalytics, "trackLoginCiePinScreen");
    renderComponent();
    expect(spy).toHaveBeenCalled();
  });

  it("should render title with emoji if UAT is enabled", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("authentication.cie.pin.pinCardTitle"))
    ).toBeTruthy();
  });

  it("should show banner content", () => {
    const { getByText } = renderComponent();
    expect(getByText(I18n.t("login.help_banner_title"))).toBeTruthy();
    expect(getByText(I18n.t("login.help_banner_content"))).toBeTruthy();
    expect(getByText(I18n.t("login.help_banner_action"))).toBeTruthy();
  });

  it("should focus pinPadViewRef on focus", () => {
    const focusSpy = jest.spyOn(accessibilityUtils, "setAccessibilityFocus");
    renderComponent();
    expect(focusSpy).toHaveBeenCalled();
  });

  it("should call present() when pressing subtitleCTA", () => {
    const { getByText } = renderComponent();
    const cta = getByText(I18n.t("authentication.cie.pin.subtitleCTA"));
    fireEvent.press(cta);
    expect(mockPresent).toHaveBeenCalled();
  });
});

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <CiePinScreen />,
    AUTHENTICATION_ROUTES.CIE_PIN_SCREEN,
    {},
    store
  );
}

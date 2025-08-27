import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import CieExpiredOrInvalidScreen from "../CieExpiredOrInvalidScreen";

const mockNavigate = jest.fn();

jest.mock("../../../../../../navigation/params/AppParamsList", () => {
  const actual = jest.requireActual(
    "../../../../../../navigation/params/AppParamsList"
  );
  return {
    ...actual,
    useIONavigation: () => ({
      navigate: mockNavigate
    })
  };
});

describe("CieExpiredOrInvalidScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly and match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render OperationResultScreenContent with localized text", () => {
    const { getByText } = renderComponent();

    expect(
      getByText(I18n.t("authentication.landing.expiredCardTitle"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("authentication.landing.expiredCardContent"))
    ).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.close"))).toBeTruthy();
  });

  it("should navigate to LANDING screen when pressing close", () => {
    const { getByText } = renderComponent();
    fireEvent.press(getByText(I18n.t("global.buttons.close")));

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  });
});

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <CieExpiredOrInvalidScreen />,
    AUTHENTICATION_ROUTES.CIE_EXPIRED_SCREEN,
    {},
    store
  );
}

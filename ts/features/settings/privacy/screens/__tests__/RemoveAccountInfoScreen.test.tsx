import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import RemoveAccountInfo from "../RemoveAccountInfoScreen";
import { loadBonusBeforeRemoveAccount } from "../../../common/store/actions";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIODispatch: () => mockDispatch
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate
  })
}));

describe("RemoveAccountInfoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render the screen with title and body", () => {
    const { getByText, getAllByText } = renderComponent();
    expect(
      getAllByText(I18n.t("profile.main.privacy.removeAccount.info.title"))
        .length
    ).toBeGreaterThanOrEqual(1);
    expect(
      getByText(I18n.t("profile.main.privacy.removeAccount.info.body.p1"))
    ).toBeTruthy();
  });

  it("should dispatch and navigate when CTA is pressed", () => {
    const { getByText } = renderComponent();

    const ctaButton = getByText(
      I18n.t("profile.main.privacy.removeAccount.info.cta")
    );
    fireEvent.press(ctaButton);

    expect(mockDispatch).toHaveBeenCalledWith(loadBonusBeforeRemoveAccount());
    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      { screen: SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS }
    );
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    RemoveAccountInfo,
    SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_INFO,
    {},
    store
  );
};

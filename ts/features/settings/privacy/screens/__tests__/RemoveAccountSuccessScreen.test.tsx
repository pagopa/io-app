import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import RemoveAccountSuccess from "../RemoveAccountSuccessScreen";
import { logoutRequest } from "../../../../authentication/common/store/actions";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

const mockDispatch = jest.fn();

jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIODispatch: () => mockDispatch
}));

describe("RemoveAccountSuccessScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render title and subtitle correctly", () => {
    const { getByText } = renderComponent();

    expect(
      getByText(I18n.t("profile.main.privacy.removeAccount.success.title"))
    ).toBeTruthy();

    expect(
      getByText(I18n.t("profile.main.privacy.removeAccount.success.body"))
    ).toBeTruthy();
  });

  it("should dispatch logoutRequest when CTA is pressed", () => {
    const { getByText } = renderComponent();

    const cta = getByText(
      I18n.t("profile.main.privacy.removeAccount.success.cta")
    );
    fireEvent.press(cta);

    expect(mockDispatch).toHaveBeenCalledWith(
      logoutRequest({ withApiCall: true })
    );
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    RemoveAccountSuccess,
    SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_SUCCESS,
    {},
    store
  );
};

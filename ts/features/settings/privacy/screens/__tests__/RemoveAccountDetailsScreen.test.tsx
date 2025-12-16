import { fireEvent, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import { Alert } from "react-native";
import I18n from "i18next";
import * as selectors from "../../../../../store/hooks";
import * as privacySelectors from "../../../common/store/selectors/userDataProcessing";
import * as cgnSelectors from "../../../../bonus/cgn/store/reducers/details";
import RemoveAccountDetails from "../RemoveAccountDetailsScreen";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import { resetDeleteUserDataProcessing } from "../../../common/store/actions/userDataProcessing";

const mockDispatch = jest.fn();
const mockToast = { error: jest.fn(), success: jest.fn(), hideAll: jest.fn() };

jest.mock("@pagopa/io-app-design-system", () => {
  const actual = jest.requireActual("@pagopa/io-app-design-system");
  return {
    ...actual,
    useIOToast: () => mockToast
  };
});

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: () => mockDispatch,
  useIOSelector: jest.fn(),
  useIOStore: jest.fn()
}));

describe("RemoveAccountDetailsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (selectors.useIOSelector as jest.Mock).mockImplementation(selector => {
      switch (selector) {
        case privacySelectors.isUserDataProcessingDeleteLoadingSelector:
          return false;
        case privacySelectors.isUserDataProcessingDeleteErrorSelector:
          return false;
        case cgnSelectors.isCgnEnrolledSelector:
          return false;
        default:
          return undefined;
      }
    });
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render correctly", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("profile.main.privacy.removeAccount.details.question"))
    ).toBeTruthy();
  });

  it("should render motivation options", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("profile.main.privacy.removeAccount.details.answer_1"))
    ).toBeTruthy();
  });

  it("should show input field when selecting 'OTHERS' motivation", async () => {
    const { getByText, getByLabelText } = renderComponent();
    fireEvent.press(
      getByText(I18n.t("profile.main.privacy.removeAccount.details.answer_4"))
    );

    await waitFor(() => {
      expect(
        getByLabelText(
          I18n.t("profile.main.privacy.removeAccount.details.labelOpenAnswer")
        )
      ).toBeTruthy();
    });
  });

  it("should show loading spinner on button if isLoading is true", () => {
    (selectors.useIOSelector as jest.Mock).mockImplementation(selector => {
      if (
        selector === privacySelectors.isUserDataProcessingDeleteLoadingSelector
      ) {
        return true;
      }
      return false;
    });

    const { getByTestId } = renderComponent();
    const button = getByTestId("remove-account-button");
    expect(button).toBeTruthy();
  });

  it("should show error toast if delete processing is in error state", () => {
    (selectors.useIOSelector as jest.Mock).mockImplementation(selector => {
      if (
        selector === privacySelectors.isUserDataProcessingDeleteErrorSelector
      ) {
        return true;
      }
      return false;
    });

    renderComponent();
    expect(mockToast.error).toHaveBeenCalledWith(
      I18n.t("wallet.errors.GENERIC_ERROR")
    );
    const { unmount } = renderComponent();
    unmount();

    expect(mockDispatch).toHaveBeenCalledWith(resetDeleteUserDataProcessing());
  });

  it("should deselect a selected motivation if clicked again", () => {
    const { getByText, queryByLabelText } = renderComponent();

    const otherOption = getByText(
      I18n.t("profile.main.privacy.removeAccount.details.answer_4")
    );

    // First tap (select)
    fireEvent.press(otherOption);
    expect(
      queryByLabelText(
        I18n.t("profile.main.privacy.removeAccount.details.labelOpenAnswer")
      )
    ).toBeTruthy();

    // Second tap (deselect)
    fireEvent.press(otherOption);
    expect(
      queryByLabelText(
        I18n.t("profile.main.privacy.removeAccount.details.labelOpenAnswer")
      )
    ).toBeNull();
  });
  it("should show alert if user has active bonus", () => {
    jest.spyOn(Alert, "alert");

    (selectors.useIOSelector as jest.Mock).mockImplementation(selector => {
      if (selector === cgnSelectors.isCgnEnrolledSelector) {
        return true;
      }
      return false;
    });

    const { getByTestId } = renderComponent();
    const button = getByTestId("remove-account-button");
    fireEvent.press(button);

    expect(Alert.alert).toHaveBeenCalled();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    RemoveAccountDetails,
    SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS,
    {},
    store
  );
};

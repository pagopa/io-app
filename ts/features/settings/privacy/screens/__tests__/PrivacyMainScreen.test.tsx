import * as pot from "@pagopa/ts-commons/lib/pot";
import { within, fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { Alert } from "react-native";
import I18n from "i18next";
import { UserDataProcessingChoiceEnum } from "../../../../../../definitions/backend/UserDataProcessingChoice";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PrivacyMainScreen from "../PrivacyMainScreen";
import { UserDataProcessingStatusEnum } from "../../../../../../definitions/backend/UserDataProcessingStatus";
import * as hooks from "../../../../../utils/hooks/usePrevious";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

jest.spyOn(Alert, "alert");

const mockNavigate = jest.fn();

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({ navigate: mockNavigate })
}));

describe("PrivacyMainScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render ListItemComponent with titleBadge if export data is pending", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { getByTestId } = renderComponentMockStore({
      ...globalState,
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.none,
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.some({
          status: UserDataProcessingStatusEnum.PENDING,
          choice: UserDataProcessingChoiceEnum.DOWNLOAD,
          version: 1
        })
      }
    });
    const item = getByTestId("profile-export-data");

    expect(
      within(item).queryByText(I18n.t("profile.preferences.list.wip"))
    ).not.toBeNull();
  });

  it("should render ListItemComponent with titleBadge if delete profile is pending", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { getByTestId } = renderComponentMockStore({
      ...globalState,
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.some({
          status: UserDataProcessingStatusEnum.PENDING,
          choice: UserDataProcessingChoiceEnum.DELETE,
          version: 1
        }),
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none
      }
    });

    const item = getByTestId("profile-delete");
    expect(
      within(item).queryByText(I18n.t("profile.preferences.list.wip"))
    ).not.toBeNull();
  });

  it("should show alert after click on ListItemComponent if export data is pending", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    jest.spyOn(hooks, "usePrevious").mockImplementation(() => ({
      [UserDataProcessingChoiceEnum.DELETE]: pot.none,
      [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.toLoading({
        kind: "PotNoneLoading"
      })
    }));
    const { getByTestId } = renderComponentMockStore({
      ...globalState,
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.some(undefined),
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.some({
          status: UserDataProcessingStatusEnum.PENDING,
          choice: UserDataProcessingChoiceEnum.DOWNLOAD,
          version: 1
        })
      }
    });

    const item = getByTestId("profile-export-data");

    fireEvent.press(item);
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });

  it("should show alert after click on ListItemComponent if delete profile is pending", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    jest.spyOn(hooks, "usePrevious").mockImplementation(() => ({
      [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none,
      [UserDataProcessingChoiceEnum.DELETE]: pot.toLoading({
        kind: "PotNoneLoading"
      })
    }));
    const { getByTestId } = renderComponentMockStore({
      ...globalState,
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.some({
          status: UserDataProcessingStatusEnum.PENDING,
          choice: UserDataProcessingChoiceEnum.DELETE,
          version: 1
        }),
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.some(undefined)
      }
    });

    const item = getByTestId("profile-delete");

    fireEvent.press(item);
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });

  it("should show error toast if download fails after loading", () => {
    jest.spyOn(hooks, "usePrevious").mockReturnValue({
      [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.toLoading(pot.none),
      [UserDataProcessingChoiceEnum.DELETE]: pot.none
    });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IOToast = require("@pagopa/io-app-design-system").IOToast;
    const toastSpy = jest.spyOn(IOToast, "error").mockImplementation(jest.fn());

    renderComponentMockStore({
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.toError(
          pot.none,
          new Error("fail")
        ),
        [UserDataProcessingChoiceEnum.DELETE]: pot.none
      }
    });

    expect(toastSpy).toHaveBeenCalledWith(
      I18n.t("profile.main.privacy.errorMessage")
    );
  });
});

const renderComponentMockStore = (stateOverride: Partial<GlobalState> = {}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore({
    ...globalState,
    ...stateOverride
  });

  return renderScreenWithNavigationStoreContext(
    PrivacyMainScreen,
    SETTINGS_ROUTES.PROFILE_PRIVACY_MAIN,
    {},
    store
  );
};

import * as pot from "@pagopa/ts-commons/lib/pot";
import { within, fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { Alert } from "react-native";
import { UserDataProcessingChoiceEnum } from "../../../../definitions/backend/UserDataProcessingChoice";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import PrivacyMainScreen from "../PrivacyMainScreen";
import I18n from "../../../i18n";
import { UserDataProcessingStatusEnum } from "../../../../definitions/backend/UserDataProcessingStatus";
import * as hooks from "../../../utils/hooks/usePrevious";

jest.spyOn(Alert, "alert");

describe("PrivacyMainScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render ListItemComponent with titleBadge if export data is pending", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const screen = renderComponentMockStore({
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
    const item = screen.component.getByTestId("profile-export-data");

    expect(
      within(item).queryByText(I18n.t("profile.preferences.list.wip"))
    ).not.toBeNull();
  });

  it("should render ListItemComponent with titleBadge if delete profile is pending", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const screen = renderComponentMockStore({
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

    const item = screen.component.getByTestId("profile-delete");
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
    const screen = renderComponentMockStore({
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

    const item = screen.component.getByTestId("profile-export-data");

    fireEvent.press(item);
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });

  it("should show alert after click on ListItemComponent if delete profile is pending", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const screen = renderComponentMockStore({
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

    const item = screen.component.getByTestId("profile-delete");

    fireEvent.press(item);
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });
});

const renderComponentMockStore = (state: GlobalState) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...state
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext(
      PrivacyMainScreen,
      ROUTES.PROFILE_PRIVACY_MAIN,
      {},
      store
    ),
    store
  };
};

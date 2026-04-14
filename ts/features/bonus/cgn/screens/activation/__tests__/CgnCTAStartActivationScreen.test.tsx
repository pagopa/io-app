import I18n from "i18next";
import { Alert } from "react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../../../store/actions/backendStatus";
import { appReducer } from "../../../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import CgnCTAStartOnboardingScreen from "../CgnCTAStartActivationScreen";

jest.spyOn(Alert, "alert");

const renderComponent = (state: GlobalState) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    CgnCTAStartOnboardingScreen,
    CGN_ROUTES.ACTIVATION.CTA_START_CGN,
    {},
    createStore(appReducer, state as any)
  );

const buildState = (cgnEnabled: boolean) => {
  // eslint-disable-next-line functional/no-let
  let state = appReducer(undefined, applicationChangeState("active"));
  state = appReducer(
    state,
    backendStatusLoadSuccess({
      ...baseRawBackendStatus,
      config: {
        ...baseRawBackendStatus.config,
        cgn: { ...baseRawBackendStatus.config.cgn, enabled: cgnEnabled }
      }
    })
  );
  return state;
};

describe("CgnCTAStartOnboardingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the loading screen when CGN is enabled", () => {
    const { getByText } = renderComponent(buildState(true));
    expect(getByText(I18n.t("global.remoteStates.loading"))).toBeTruthy();
  });

  it("should show alert when CGN is not enabled", () => {
    renderComponent(buildState(false));
    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("bonus.cgn.name"),
      I18n.t("bonus.state.completed.description")
    );
  });

  it("should not render the loading screen when CGN is not enabled", () => {
    const { queryByText } = renderComponent(buildState(false));
    expect(queryByText(I18n.t("global.remoteStates.loading"))).toBeNull();
  });
});

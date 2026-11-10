import { Text } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { appReducer } from "../../../../store/reducers";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { LandingScreenBannerTransition } from "../LandingScreenBannerTransition";

describe("LandingScreenBannerTransition", () => {
  it("should render its content once the startup is completed", () => {
    const component = renderComponent(StartupStatusEnum.AUTHENTICATED);

    expect(component.getByText("content")).toBeTruthy();
  });

  it("should not render its content below the startup loading overlay", () => {
    const component = renderComponent(StartupStatusEnum.ONBOARDING);

    expect(component.queryByText("content")).toBeNull();
  });
});

const renderComponent = (startupStatus: StartupStatusEnum) => {
  const globalState = appReducer(
    appReducer(undefined, applicationChangeState("active")),
    startupLoadSuccess(startupStatus)
  );
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <LandingScreenBannerTransition contentKey="test">
        <Text>content</Text>
      </LandingScreenBannerTransition>
    ),
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
};

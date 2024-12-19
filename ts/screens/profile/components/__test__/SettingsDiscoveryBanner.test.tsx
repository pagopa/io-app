import { ReactElement } from "react";
import { createStore } from "redux";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { SettingsDiscoveryBanner } from "../SettingsDiscoveryBanner";

describe("settingsDiscoveryBanner", () => {
  it("should match snapshot", () => {
    const component = renderComponent(
      <SettingsDiscoveryBanner handleOnClose={() => null} />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (component: ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => component,
    ROUTES.SETTINGS_MAIN,
    {},
    createStore(appReducer, globalState as any)
  );
};

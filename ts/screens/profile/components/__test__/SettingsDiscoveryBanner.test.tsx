import * as React from "react";
import { createStore } from "redux";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { SettingsDiscoveryBanner } from "../discoveryBanner/SettingsDiscoveryBanner";
import { SettingsDiscoveryBannerStandalone } from "../discoveryBanner/SettingsDiscoveryBannerStandalone";

describe("settingsDiscoveryBannerStandalone", () => {
  it("should match snapshot", () => {
    const component = renderComponent(<SettingsDiscoveryBannerStandalone />);
    expect(component.toJSON()).toMatchSnapshot("standalone");
  });
});
describe("settingsDiscoveryBanner", () => {
  it("should match snapshot", () => {
    const component = renderComponent(
      <SettingsDiscoveryBanner handleOnClose={() => null} />
    );
    expect(component.toJSON()).toMatchSnapshot("non-standalone");
  });
});

const renderComponent = (component: React.ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => component,
    ROUTES.PROFILE_MAIN,
    {},
    createStore(appReducer, globalState as any)
  );
};

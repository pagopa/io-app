import * as React from "react";
import { createStore } from "redux";
import { constUndefined } from "fp-ts/lib/function";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { SettingsDiscoveryBanner } from "../SettingsDiscoveryBanner";
import * as analytics from "../../analytics";
import { fireEvent } from "@testing-library/react-native";
import I18n from "../../../../i18n";

describe("settingsDiscoveryBanner", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should match snapshot", () => {
    const component = renderComponent(
      <SettingsDiscoveryBanner handleOnClose={() => null} />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should have called 'trackSettingsDiscoverBannerVisualized' on first rendering", () => {
    const spyOnMockedTrackSettingsDiscoverBannerVisualized = jest
      .spyOn(analytics, "trackSettingsDiscoverBannerVisualized")
      .mockImplementation(constUndefined);
    renderComponent(<SettingsDiscoveryBanner handleOnClose={() => null} />);
    expect(
      spyOnMockedTrackSettingsDiscoverBannerVisualized
    ).toHaveBeenCalledTimes(1);
  });
  it("should have called 'trackSettingsDiscoverBannerTap' on first rendering", () => {
    const spyOnMockedTrackSettingsDiscoverBannerTap = jest
      .spyOn(analytics, "trackSettingsDiscoverBannerTap")
      .mockImplementation(constUndefined);
    const component = renderComponent(
      <SettingsDiscoveryBanner handleOnClose={() => null} />
    );
    const cta = component.getByTestId("settingsDiscoveryBannerCTA");
    fireEvent(cta, "press");
    expect(spyOnMockedTrackSettingsDiscoverBannerTap).toHaveBeenCalledTimes(1);
  });
  it("should have called 'trackSettingsDiscoverBannerClosure' on first rendering", () => {
    const spyOnMockedTrackSettingsDiscoverBannerClosure = jest
      .spyOn(analytics, "trackSettingsDiscoverBannerClosure")
      .mockImplementation(constUndefined);
    const component = renderComponent(
      <SettingsDiscoveryBanner handleOnClose={() => null} />
    );
    const closeButton = component.getByA11yLabel(
      I18n.t("global.buttons.close")
    );
    fireEvent(closeButton, "press");
    expect(spyOnMockedTrackSettingsDiscoverBannerClosure).toHaveBeenCalledTimes(
      1
    );
  });
});

const renderComponent = (component: React.ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => component,
    ROUTES.SETTINGS_MAIN,
    {},
    createStore(appReducer, globalState as any)
  );
};

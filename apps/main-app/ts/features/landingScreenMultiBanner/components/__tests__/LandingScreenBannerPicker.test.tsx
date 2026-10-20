import { fireEvent } from "@testing-library/react-native";
import { Button } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import * as useIO from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import * as hooks from "../../../pushNotifications/hooks/usePushNotificationsBannerTracking";
import { updateLandingScreenBannerVisibility } from "../../store/actions";
import * as SELECTORS from "../../store/selectors";
import { LandingScreenBannerId } from "../../utils/landingScreenBannerMap";
import { LandingScreenBannerPicker } from "../LandingScreenBannerPicker";

jest.mock("../../utils/landingScreenBannerMap", () => ({
  get landingScreenBannerMap() {
    return {
      TESTING: {
        component: (something: () => void) => (
          <MyComponent callback={something} />
        ),
        isRenderableSelector: jest.fn()
      },
      FILLER: {
        component: (something: () => void) => (
          <MyComponent callback={something} />
        ),
        isRenderableSelector: jest.fn()
      },
      DO_NOT_RENDER: {
        component: (something: () => void) => (
          <MyComponent callback={something} />
        ),
        isRenderableSelector: jest.fn()
      }
    };
  }
}));
jest.mock("../../store/reducer.ts", () => ({
  landingScreenBannersReducer: (state: object) => ({ ...state })
}));

const MyComponent = ({ callback }: { callback: () => void }) => (
  <Button onPress={callback} testID="button-test" title="TEST" />
);

const bannerId = "TESTING" as LandingScreenBannerId;
describe("LandingBannerPicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it("should correctly render a banner if passed a valid id", () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => ({ type: "banner", id: bannerId }));
    jest.spyOn(useIO, "useIODispatch").mockImplementation(() => jest.fn());

    const component = renderComponent();
    expect(component).toBeDefined();
    expect(component.toJSON()).toMatchSnapshot("withBanner");
  });

  it("should not render a banner if no id is passed", () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => ({ type: "none" }));

    const component = renderComponent();
    expect(component).toBeDefined();

    expect(component.toJSON()).toMatchSnapshot("noBanner");
  });
  it("should render the skeleton while a higher priority banner is loading", () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => ({ type: "loading" }));

    const component = renderComponent();

    expect(component.getByTestId("landingScreenBannerSkeleton")).toBeTruthy();
    expect(component.queryByTestId("button-test")).toBeNull();
  });
  it("should not render a banner below the startup loading overlay", () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => ({ type: "banner", id: bannerId }));

    const component = renderComponent(StartupStatusEnum.ONBOARDING);

    expect(component.queryByTestId("button-test")).toBeNull();
  });
  it("should correctly dispatch updateLandingScreenBannerVisibility on press", async () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => ({ type: "banner", id: bannerId }));
    const testDispatch = jest.fn();
    jest.spyOn(useIO, "useIODispatch").mockImplementation(() => testDispatch);

    const component = renderComponent();
    expect(component).toBeDefined();

    const button = await component.findByTestId("button-test");
    fireEvent.press(button);

    expect(testDispatch).toHaveBeenCalledWith(
      updateLandingScreenBannerVisibility({ id: bannerId, enabled: false })
    );
  });
  it("should include 'usePushNotificationsBannerTracking'", () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => ({ type: "none" }));
    const spyUsePushNotificationsBannerTracking = jest.spyOn(
      hooks,
      "usePushNotificationsBannerTracking"
    );

    renderComponent();

    expect(spyUsePushNotificationsBannerTracking.mock.calls.length).toBe(1);
  });
});

const renderComponent = (
  startupStatus: StartupStatusEnum = StartupStatusEnum.AUTHENTICATED
) => {
  const globalState = appReducer(
    appReducer(undefined, applicationChangeState("active")),
    startupLoadSuccess(startupStatus)
  );
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <LandingScreenBannerPicker />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
};

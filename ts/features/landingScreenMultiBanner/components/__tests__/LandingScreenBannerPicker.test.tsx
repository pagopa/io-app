import { fireEvent } from "@testing-library/react-native";
import { Button } from "react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import * as useIO from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { updateLandingScreenBannerVisibility } from "../../store/actions";
import * as SELECTORS from "../../store/selectors";
import { LandingScreenBannerId } from "../../utils/landingScreenBannerMap";
import { LandingScreenBannerPicker } from "../LandingScreenBannerPicker";
import * as hooks from "../../../pushNotifications/hooks/usePushNotificationsBannerTracking";

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
  <Button title="TEST" testID="button-test" onPress={callback} />
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
      .mockImplementation(_ => bannerId);
    jest.spyOn(useIO, "useIODispatch").mockImplementation(() => jest.fn());

    const component = renderComponent();
    expect(component).toBeDefined();
    expect(component.toJSON()).toMatchSnapshot("withBanner");
  });

  it("should not render a banner if no id is passed", () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => undefined);

    const component = renderComponent();
    expect(component).toBeDefined();

    expect(component.toJSON()).toMatchSnapshot("noBanner");
  });
  it("should correctly dispatch updateLandingScreenBannerVisibility on press", async () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => bannerId);
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
    const spyUsePushNotificationsBannerTracking = jest.spyOn(
      hooks,
      "usePushNotificationsBannerTracking"
    );

    renderComponent();

    expect(spyUsePushNotificationsBannerTracking.mock.calls.length).toBe(1);
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <LandingScreenBannerPicker />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
};

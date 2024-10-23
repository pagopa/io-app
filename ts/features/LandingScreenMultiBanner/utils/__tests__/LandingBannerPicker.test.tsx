import { fireEvent } from "@testing-library/react-native";
import * as React from "react";
import { Button } from "react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import * as useIO from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { LandingScreenBannerPicker } from "../../LandingScreenBannerPicker";
import { updateLandingScreenBannerVisibility } from "../../store/actions";
import { LandingScreenBannerId } from "../../store/reducer";
import * as SELECTORS from "../../store/selectors";

const MyComponent = ({ callback }: { callback: () => void }) => (
  <Button title="TEST" testID="button-test" onPress={callback} />
);

jest.mock("../landingScreenBannerMap", () => ({
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
const bannerId = "TESTING" as unknown as LandingScreenBannerId;

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

    expect(component.toJSON()).toMatchSnapshot("withBanner");
  });

  it("should not render a banner if no id is passed", () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => undefined);

    const component = renderComponent();

    expect(component.toJSON()).toMatchSnapshot("noBanner");
  });
  it("should correctly dispatch updateLandingScreenBannerVisibility on press", async () => {
    jest
      .spyOn(SELECTORS, "landingScreenBannerToRenderSelector")
      .mockImplementation(_ => bannerId);
    const testDispatch = jest.fn();
    jest.spyOn(useIO, "useIODispatch").mockImplementation(() => testDispatch);

    const component = renderComponent();
    const button = await component.findByTestId("button-test");
    fireEvent.press(button);

    expect(testDispatch).toHaveBeenCalledWith(
      updateLandingScreenBannerVisibility({ id: bannerId, enabled: false })
    );
  });
});

function renderComponent(
  component: React.ReactElement | null = <LandingScreenBannerPicker />
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => component,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}

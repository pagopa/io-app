import { IOColors } from "@io-app/design-system";
import React from "react";
import { processColor } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  findAllNodes,
  withDarkTheme
} from "../../../../../../utils/testColors";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import CieCardReadingAnimation, {
  ReadingState,
  testableCieCardReadingAnimation
} from "../CieCardReadingAnimation";

/**
 * In order to test all other behaviors and side effects there is a need for the
 * screen to be refactored. https://pagopa.atlassian.net/browse/IOPID-1857
 */

if (!testableCieCardReadingAnimation) {
  throw new Error(
    "handleApplicationInitialized is not available in test environment"
  );
}
type CieCardReadingAnimationProps = NonNullable<
  typeof testableCieCardReadingAnimation
>["types"]["CieCardReadingAnimationProps"];

const defaultProps: CieCardReadingAnimationProps = {
  readingState: ReadingState.waiting_card,
  pictogramName: "accessDenied",
  circleColor: "#000000"
};

jest.useFakeTimers();

describe("CieCardReadingAnimation", () => {
  it("Should match the snapshot", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("renders correctly with default props", () => {
    const { getByTestId } = renderComponent({
      readingState: ReadingState.waiting_card
    });
    const circularProgressElement = getByTestId(/^circular-progress-/);
    expect(circularProgressElement).toBeTruthy();
  });

  it("starts animation when readingState is 'reading' on initial render", () => {
    const { getByTestId } = renderComponent({
      readingState: ReadingState.reading
    });

    jest.advanceTimersByTime(1000);

    // extract number from testID
    const progressMatch = getByTestId("circular-progress-0");
    expect(progressMatch).toBeTruthy();
  });

  it("renders 100% progress when readingState is completed", () => {
    const { getByTestId } = renderComponent({
      readingState: ReadingState.completed
    });

    const wrapper = getByTestId("circular-progress-100");
    expect(wrapper).toBeTruthy();
  });

  it.each([
    { name: "waiting", readingState: ReadingState.waiting_card },
    { name: "error", readingState: ReadingState.error }
  ])(
    "draws the $name track with the dark stroke token in dark mode",
    ({ readingState }) => {
      const { toJSON } = renderComponent({ readingState }, "dark");
      const [track] = findAllNodes(
        toJSON(),
        node => node.type === "RNSVGCircle"
      );
      expect(track.props.stroke).toEqual({
        type: 0,
        payload: processColor(IOColors.dark.stroke.default)
      });
    }
  );
});

const renderComponent = (
  propsOverride?: Partial<React.ComponentProps<typeof CieCardReadingAnimation>>,
  theme: "dark" | "light" = "light"
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  const props = {
    ...defaultProps,
    ...propsOverride
  };

  const Component = () => <CieCardReadingAnimation {...props} />;

  return renderScreenWithNavigationStoreContext(
    theme === "dark" ? withDarkTheme(Component) : Component,
    AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN,
    {},
    store
  );
};

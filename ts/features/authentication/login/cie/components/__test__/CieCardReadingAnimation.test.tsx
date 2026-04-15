import React from "react";
import { createStore } from "redux";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import CieCardReadingAnimation, {
  ReadingState,
  testableCieCardReadingAnimation
} from "../CieCardReadingAnimation";

/**
 * in order to test all other behaviors and side effects
 * there is a need for the screen to be refactored.
 * https://pagopa.atlassian.net/browse/IOPID-1857
 */

if (!testableCieCardReadingAnimation) {
  throw new Error(
    "handleApplicationInitialized is not available in test environment"
  );
}
const CieCardReadingAnimationProps =
  testableCieCardReadingAnimation.types.CieCardReadingAnimationProps;

const defaultProps: typeof CieCardReadingAnimationProps = {
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
});

const renderComponent = (
  propsOverride?: Partial<React.ComponentProps<typeof CieCardReadingAnimation>>
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  const props = {
    ...defaultProps,
    ...propsOverride
  };

  return renderScreenWithNavigationStoreContext(
    () => <CieCardReadingAnimation {...props} />,
    AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN,
    {},
    store
  );
};

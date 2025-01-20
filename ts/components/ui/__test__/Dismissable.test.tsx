import { render } from "@testing-library/react-native";
import { PanGesture, State } from "react-native-gesture-handler";
import {
  fireGestureHandler,
  getByGestureTestId
} from "react-native-gesture-handler/jest-utils";
import { Body } from "@pagopa/io-app-design-system";
import { Dismissable } from "../Dismissable";

const tContent = "Dismissable content";

describe("Test Dismissable component", () => {
  it("should render the content", () => {
    const component = render(
      <Dismissable>
        <Body>{tContent}</Body>
      </Dismissable>
    );
    expect(component.queryByText(tContent)).not.toBeNull();
  });
  it("should call the onDismiss callback when the threshold is reached swiping right", async () => {
    const onDismiss = jest.fn();
    const dismissThreshold = 50;

    render(
      <Dismissable
        onDismiss={onDismiss}
        dismissThreshold={dismissThreshold}
        testID="dismissableGestureHandlerTestID"
      >
        <Body>{tContent}</Body>
      </Dismissable>
    );

    const gestureHandler = getByGestureTestId(
      "dismissableGestureHandlerTestID"
    );

    fireGestureHandler<PanGesture>(gestureHandler, [
      { state: State.BEGAN, translationX: 0 },
      {
        state: State.ACTIVE,
        translationX: dismissThreshold / 2
      },
      {
        state: State.END,
        translationX: dismissThreshold + 1
      }
    ]);

    expect(onDismiss).toHaveBeenCalled();
  });

  it("should call the onDismiss callback when the threshold is reached swiping left", async () => {
    const onDismiss = jest.fn();
    const dismissThreshold = 50;

    render(
      <Dismissable
        onDismiss={onDismiss}
        dismissThreshold={dismissThreshold}
        testID="dismissableGestureHandlerTestID"
      >
        <Body>{tContent}</Body>
      </Dismissable>
    );

    const gestureHandler = getByGestureTestId(
      "dismissableGestureHandlerTestID"
    );

    fireGestureHandler<PanGesture>(gestureHandler, [
      { state: State.BEGAN, translationX: 0 },
      {
        state: State.ACTIVE,
        translationX: -dismissThreshold / 2
      },
      {
        state: State.END,
        translationX: -dismissThreshold - 1
      }
    ]);

    expect(onDismiss).toHaveBeenCalled();
  });

  it("should not call the onDismiss callback if the threshold is not reached", async () => {
    const onDismiss = jest.fn();
    const dismissThreshold = 50;

    render(
      <Dismissable
        onDismiss={onDismiss}
        dismissThreshold={dismissThreshold}
        testID="dismissableGestureHandlerTestID"
      >
        <Body>{tContent}</Body>
      </Dismissable>
    );

    const gestureHandler = getByGestureTestId(
      "dismissableGestureHandlerTestID"
    );

    fireGestureHandler<PanGesture>(gestureHandler, [
      { state: State.BEGAN, translationX: 0 },
      {
        state: State.ACTIVE,
        translationX: dismissThreshold / 2
      },
      {
        state: State.END,
        translationX: dismissThreshold - 1
      }
    ]);

    expect(onDismiss).not.toHaveBeenCalled();
  });
});

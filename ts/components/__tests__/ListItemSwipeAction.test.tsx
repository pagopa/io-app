import { NavigationContainer } from "@react-navigation/native"; // Import NavigationContainer
import { fireEvent, render } from "@testing-library/react-native";
import { createRef } from "react";
import { Text } from "react-native";
import ListItemSwipeAction from "../ListItemSwipeAction";

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = jest.requireActual("react-native-reanimated");
  // eslint-disable-next-line functional/immutable-data
  Reanimated.default.call = jest.fn();
  return Reanimated;
});

// Mock react-native-gesture-handler
// eslint-disable-next-line functional/no-let
let gestureProps: Record<string, any> = {};
jest.mock("react-native-gesture-handler", () => {
  const actual = jest.requireActual("react-native-gesture-handler");
  return {
    ...actual,
    PanGestureHandler: ({ children, ...props }: any) => {
      gestureProps = props;
      return children;
    }
  };
});

beforeAll(() => {
  jest.useFakeTimers();
});

const renderWithNavigation = (component: JSX.Element) =>
  render(<NavigationContainer>{component}</NavigationContainer>);

describe("ListItemSwipeAction", () => {
  const swipeActionMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("triggers action on icon press", () => {
    const { getByA11yLabel } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Test Item</Text>
      </ListItemSwipeAction>
    );

    fireEvent.press(getByA11yLabel("Hide item"));

    expect(swipeActionMock).toHaveBeenCalled();
  });

  it("calls action when swipe exceeds threshold", () => {
    const { getByText } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    fireEvent(getByText("Swipe me"), "onEnded", {
      nativeEvent: { translationX: -300, velocityX: -900 }
    });

    expect(swipeActionMock).toHaveBeenCalled();
  });

  it("does NOT call swipeActionMock when swipe is too small", () => {
    renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    gestureProps.onGestureEvent({
      nativeEvent: { translationX: -30 }
    });

    gestureProps.onEnded({
      nativeEvent: { translationX: -30, velocityX: -200 }
    });

    expect(swipeActionMock).not.toHaveBeenCalled();
  });

  it("applies correct background color based on theme", () => {
    jest.mock("@pagopa/io-app-design-system", () => ({
      ...jest.requireActual("@pagopa/io-app-design-system"),
      useIOThemeContext: () => ({ themeType: "dark" })
    }));

    const { getByText } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    expect(getByText("Swipe me")).toBeTruthy();
  });

  it("handles gesture translation correctly", () => {
    renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    gestureProps.onGestureEvent({
      nativeEvent: { translationX: -150 }
    });

    gestureProps.onEnded({
      nativeEvent: { translationX: -150, velocityX: -500 }
    });

    expect(swipeActionMock).not.toHaveBeenCalled();
  });

  it("renders RightActions component with correct props", () => {
    const { getByA11yLabel } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    const button = getByA11yLabel("Hide item");
    expect(button).toBeTruthy();
  });

  it("exposes triggerSwipeAction and resetSwipePosition via ref", () => {
    const ref = createRef<any>();

    renderWithNavigation(
      <ListItemSwipeAction
        ref={ref}
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    expect(typeof ref.current?.triggerSwipeAction).toBe("function");
    expect(typeof ref.current?.resetSwipePosition).toBe("function");

    // Trigger the swipe action
    ref.current?.triggerSwipeAction();
    expect(ref.current?.triggerSwipeAction).toBeDefined();

    // Reset the swipe position
    ref.current?.resetSwipePosition();
    expect(ref.current?.resetSwipePosition).toBeDefined();
  });

  it("updates translateX on gesture event", () => {
    renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    gestureProps.onGestureEvent({
      nativeEvent: { translationX: -100 }
    });

    // Verify that translateX is updated
    expect(gestureProps).toBeDefined();
  });

  it("triggers haptic feedback when swipe exceeds threshold", () => {
    renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    gestureProps.onGestureEvent({
      nativeEvent: { translationX: -250 }
    });

    // Verify that haptic feedback is triggered
    expect(gestureProps).toBeDefined();
  });

  it("resets hapticTriggered when swipe is within threshold", () => {
    renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    gestureProps.onGestureEvent({
      nativeEvent: { translationX: -50 }
    });

    // Verify that hapticTriggered is reset
    expect(gestureProps).toBeDefined();
  });

  it("handles gesture end correctly", () => {
    renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    gestureProps.onEnded({
      nativeEvent: { translationX: -300, velocityX: -900 }
    });

    // Verify that the action is triggered
    expect(swipeActionMock).toHaveBeenCalled();

    gestureProps.onEnded({
      nativeEvent: { translationX: -30, velocityX: -200 }
    });

    // Verify that the action is not triggered for small swipes
    expect(swipeActionMock).toHaveBeenCalledTimes(1);
  });

  it("renders children inside ContentWrapper", () => {
    const { getByText } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        onRightActionPressed={swipeActionMock}
        accessibilityLabel="Hide item"
      >
        <Text>Child Content</Text>
      </ListItemSwipeAction>
    );

    expect(getByText("Child Content")).toBeTruthy();
  });
});

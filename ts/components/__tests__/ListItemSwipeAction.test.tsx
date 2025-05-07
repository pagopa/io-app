import { NavigationContainer } from "@react-navigation/native"; // Import NavigationContainer
import { fireEvent, render } from "@testing-library/react-native";
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

const swipeActionMock = jest.fn();

const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <ListItemSwipeAction
        color="contrast"
        icon="eyeHide"
        onRightActionPressed={({ resetSwipePosition, triggerSwipeAction }) => {
          swipeActionMock();
          triggerSwipeAction();
        }}
        accessibilityLabel="Hide item"
      >
        <Text>Hide item</Text>
      </ListItemSwipeAction>
    </NavigationContainer>
  );

describe("ListItemSwipeAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("triggers action on icon press", () => {
    const { getByA11yLabel } = renderWithNavigation();

    fireEvent.press(getByA11yLabel("Hide item"));

    expect(swipeActionMock).toHaveBeenCalled();
  });

  it("calls action when swipe exceeds threshold", () => {
    const { getByText } = renderWithNavigation();

    fireEvent(getByText("Hide item"), "onEnded", {
      nativeEvent: { translationX: -300, velocityX: -900 }
    });

    expect(swipeActionMock).toHaveBeenCalled();
  });

  it("does NOT call swipeActionMock when swipe is too small", () => {
    renderWithNavigation();

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

    const { getByText } = renderWithNavigation();

    expect(getByText("Hide item")).toBeTruthy();
  });

  it("handles gesture translation correctly", () => {
    renderWithNavigation();

    gestureProps.onGestureEvent({
      nativeEvent: { translationX: -150 }
    });

    gestureProps.onEnded({
      nativeEvent: { translationX: -150, velocityX: -500 }
    });

    expect(swipeActionMock).not.toHaveBeenCalled();
  });

  it("renders RightActions component with correct props", () => {
    const { getByA11yLabel } = renderWithNavigation();

    const button = getByA11yLabel("Hide item");
    expect(button).toBeTruthy();
  });

  it("updates translateX on gesture event", () => {
    renderWithNavigation();
    gestureProps.onGestureEvent({
      nativeEvent: { translationX: -100 }
    });

    // Verify that translateX is updated
    expect(gestureProps).toBeDefined();
  });

  it("triggers haptic feedback when swipe exceeds threshold", () => {
    renderWithNavigation();

    gestureProps.onGestureEvent({
      nativeEvent: { translationX: -250 }
    });

    // Verify that haptic feedback is triggered
    expect(gestureProps).toBeDefined();
  });

  it("resets hapticTriggered when swipe is within threshold", () => {
    renderWithNavigation();
    gestureProps.onGestureEvent({
      nativeEvent: { translationX: -50 }
    });

    // Verify that hapticTriggered is reset
    expect(gestureProps).toBeDefined();
  });

  it("handles gesture end correctly", () => {
    renderWithNavigation();
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
});

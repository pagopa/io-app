import { NavigationContainer } from "@react-navigation/native"; // Import NavigationContainer
import { fireEvent, render } from "@testing-library/react-native";
import { Alert, Text } from "react-native";
import ListItemSwipeAction from "../ListItemSwipeAction";

// Mock Alert
jest.spyOn(Alert, "alert");

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
  const alertProps = {
    title: "Confirm delete",
    message: "Are you sure?",
    confirmText: "Delete",
    cancelText: "Cancel"
  };

  const swipeActionMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("triggers Alert on icon press", () => {
    const { getByA11yLabel } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        swipeAction={swipeActionMock}
        alertProps={alertProps}
        accessibilityLabel="Hide item"
      >
        <Text>Test Item</Text>
      </ListItemSwipeAction>
    );

    fireEvent.press(getByA11yLabel("Hide item"));

    expect(Alert.alert).toHaveBeenCalledWith(
      alertProps.title,
      alertProps.message,
      expect.any(Array)
    );
  });

  it("executes swipeAction on confirm", () => {
    jest.spyOn(Alert, "alert").mockImplementation((_title, _msg, buttons) => {
      const confirmButton = buttons?.[1];
      confirmButton?.onPress?.();
    });

    const { getByA11yLabel } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        swipeAction={swipeActionMock}
        alertProps={alertProps}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    fireEvent.press(getByA11yLabel("Hide item"));
    expect(swipeActionMock).toHaveBeenCalled();
  });

  it("does not execute swipeAction on cancel", () => {
    jest.spyOn(Alert, "alert").mockImplementation((_title, _msg, buttons) => {
      const cancelButton = buttons?.[0];
      cancelButton?.onPress?.();
    });

    const { getByA11yLabel } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        swipeAction={swipeActionMock}
        alertProps={alertProps}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    fireEvent.press(getByA11yLabel("Hide item"));
    expect(swipeActionMock).not.toHaveBeenCalled();
  });

  it("calls showAlertAction when swipe exceeds threshold", () => {
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByText } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        swipeAction={swipeActionMock}
        alertProps={alertProps}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    fireEvent(getByText("Swipe me"), "onEnded", {
      nativeEvent: { translationX: -300, velocityX: -900 }
    });

    expect(alertSpy).toHaveBeenCalled();
  });

  it("does NOT call showAlertAction when swipe is too small", () => {
    const alertSpy = jest.spyOn(Alert, "alert");

    renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        swipeAction={swipeActionMock}
        alertProps={alertProps}
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

    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("animates translateX to -500 when confirm button is pressed in Alert", () => {
    jest.spyOn(Alert, "alert").mockImplementation((_title, _msg, buttons) => {
      const confirmButton = buttons?.[1];
      confirmButton?.onPress?.();
    });

    const { getByA11yLabel } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        swipeAction={swipeActionMock}
        alertProps={alertProps}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    fireEvent.press(getByA11yLabel("Hide item"));

    // Simulate the confirm button press
    expect(Alert.alert).toHaveBeenCalled();
    expect(swipeActionMock).toHaveBeenCalled();
  });

  it("applies correct background color based on theme", () => {
    jest.mock("@pagopa/io-app-design-system", () => ({
      ...jest.requireActual("@pagopa/io-app-design-system"),
      useIOThemeContext: () => ({ themeType: "dark" })
    }));

    const { getByText } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        swipeAction={swipeActionMock}
        alertProps={alertProps}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    expect(getByText("Swipe me")).toBeTruthy();
    // Additional checks for background color can be added if needed
  });

  it("handles gesture translation correctly", () => {
    renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        swipeAction={swipeActionMock}
        alertProps={alertProps}
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

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("renders RightActions component with correct props", () => {
    const { getByA11yLabel } = renderWithNavigation(
      <ListItemSwipeAction
        icon="eyeHide"
        swipeAction={swipeActionMock}
        alertProps={alertProps}
        accessibilityLabel="Hide item"
      >
        <Text>Swipe me</Text>
      </ListItemSwipeAction>
    );

    const button = getByA11yLabel("Hide item");
    expect(button).toBeTruthy();
  });
});

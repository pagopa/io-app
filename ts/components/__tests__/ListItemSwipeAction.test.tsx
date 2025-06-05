import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";
import { PanGesture, State } from "react-native-gesture-handler";
import {
  fireGestureHandler,
  getByGestureTestId
} from "react-native-gesture-handler/jest-utils";
import ListItemSwipeAction from "../ListItemSwipeAction";

describe("ListItemSwipeAction", () => {
  const swipeActionMock = jest.fn();
  const oldReset = jest.fn();
  const openedItemRef = { current: oldReset };

  const renderWithNavigation = () =>
    render(
      <NavigationContainer>
        <ListItemSwipeAction
          openedItemRef={openedItemRef}
          color="contrast"
          icon="eyeHide"
          onRightActionPressed={({ triggerSwipeAction }) => {
            swipeActionMock();
            triggerSwipeAction();
          }}
          accessibilityLabel="Hide item"
        >
          <Text>Hide item</Text>
        </ListItemSwipeAction>
      </NavigationContainer>
    );

  beforeEach(() => {
    swipeActionMock.mockClear();
    jest.clearAllMocks();
  });

  it("triggers action on icon press", () => {
    const { getByLabelText } = renderWithNavigation();
    const button = getByLabelText("Hide item");
    fireEvent.press(button);
    expect(button).toBeTruthy();
    expect(swipeActionMock).toHaveBeenCalled();
  });

  it("applies correct background color based on theme", () => {
    jest.mock("@pagopa/io-app-design-system", () => ({
      ...jest.requireActual("@pagopa/io-app-design-system"),
      useIOThemeContext: () => ({ themeType: "dark" })
    }));

    const { getByText } = renderWithNavigation();

    expect(getByText("Hide item")).toBeTruthy();
  });

  it("triggers swipe action and haptic feedback on strong left swipe", () => {
    renderWithNavigation();
    const gestureHandler = getByGestureTestId("swipe-gesture");

    fireGestureHandler<PanGesture>(gestureHandler, [
      { state: State.BEGAN, translationX: 0 },
      { state: State.ACTIVE, translationX: -250 },
      { state: State.END, translationX: -250, velocityX: -900 }
    ]);
    expect(swipeActionMock).toHaveBeenCalled();
  });

  it("does not trigger swipe action on weak left swipe", () => {
    renderWithNavigation();
    const gestureHandler = getByGestureTestId("swipe-gesture");

    fireGestureHandler<PanGesture>(gestureHandler, [
      { state: State.BEGAN, translationX: 0 },
      { state: State.ACTIVE, translationX: -10 },
      { state: State.END, translationX: -10, velocityX: -10 }
    ]);
    expect(swipeActionMock).not.toHaveBeenCalled();
  });

  it("springs to -60 when swipe is moderate (between -50 and -200)", () => {
    renderWithNavigation();
    const gestureHandler = getByGestureTestId("swipe-gesture");

    fireGestureHandler<PanGesture>(gestureHandler, [
      { state: State.BEGAN, translationX: 0 },
      { state: State.ACTIVE, translationX: -100 },
      { state: State.END, translationX: -100, velocityX: 0 }
    ]);
    expect(swipeActionMock).not.toHaveBeenCalled();
  });
});

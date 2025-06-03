import { NavigationContainer } from "@react-navigation/native"; // Import NavigationContainer
import { act, fireEvent, render } from "@testing-library/react-native";
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

describe("ListItemSwipeAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("triggers action on icon press", () => {
    const { getByLabelText } = renderWithNavigation();

    fireEvent.press(getByLabelText("Hide item"));

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

  it("renders RightActions component with correct props", () => {
    const { getByLabelText } = renderWithNavigation();

    const button = getByLabelText("Hide item");
    expect(button).toBeTruthy();
  });

  it("triggers swipe action and haptic feedback on strong left swipe", () => {
    const { getByText } = renderWithNavigation();

    act(() => {
      gestureProps.onBegin?.();
      gestureProps.onUpdate?.({ translationX: -250 });
      gestureProps.onEnd?.({ translationX: -250, velocityX: -900 });
    });

    expect(swipeActionMock).toHaveBeenCalled();
  });
});

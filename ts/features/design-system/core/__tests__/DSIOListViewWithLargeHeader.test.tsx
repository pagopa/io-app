import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import DESIGN_SYSTEM_ROUTES from "../../navigation/routes";
import { DSIOListViewWithLargeHeader } from "../DSIOListViewWithLargeHeader";

jest.mock("react-native", () => ({
  AccessibilityInfo: {
    setAccessibilityFocus: jest.fn()
  }
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => <>{children}</>,
    Screen: () => null
  })
}));

jest.mock("@react-navigation/stack", () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: any) => <>{children}</>,
    Screen: () => null
  })
}));

jest.mock("@react-navigation/bottom-tabs", () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: any) => <>{children}</>,
    Screen: () => null
  })
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    setOptions: jest.fn
  }),
  useRoute: jest.fn,
  useFocusEffect: jest.fn,
  useIsFocused: jest.fn,
  NavigationContainer: ({ children }: any) => <>{children}</>,
  DarkTheme: {
    dark: true,
    colors: {
      primary: "#000",
      background: "#000",
      card: "#111",
      text: "#fff",
      border: "#222",
      notification: "#333"
    }
  },
  DefaultTheme: {
    dark: false,
    colors: {
      primary: "#fff",
      background: "#fff",
      card: "#eee",
      text: "#000",
      border: "#ccc",
      notification: "#ddd"
    }
  }
}));

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <DSIOListViewWithLargeHeader />,
    DESIGN_SYSTEM_ROUTES.SCREENS.IOLISTVIEW_LARGE_HEADER.route,
    {},
    createStore(appReducer, globalState as any)
  );
};

describe("DSIOListViewWithLargeHeader", () => {
  it("should render list items correctly", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });
});

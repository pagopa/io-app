import { IOThemeContextProvider } from "@io-app/design-system";
import { CommonActions, NavigationAction } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { act, render } from "@testing-library/react-native";
import I18n from "i18next";
import { Linking, View } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { TestInnerNavigationContainer } from "../../../../navigation/AppStackNavigator";
import * as linkingSubscription from "../../../../navigation/linkingSubscription";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { navigateToMessageRouterAction } from "../../../pushNotifications/utils/navigation";
import { MessagesStackNavigator } from "../MessagesNavigator";
import { MESSAGES_ROUTES } from "../routes";

const mockDefaultHeader = jest.fn();

jest.mock("@react-navigation/elements", () => {
  const actual = jest.requireActual("@react-navigation/elements");
  return {
    ...actual,
    Header: (props: { title: string }) => {
      mockDefaultHeader(props.title);
      return actual.Header(props);
    }
  };
});

const MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJK";

const MockMainScreen = () => <View />;

const renderMessagesNavigator = () => {
  jest
    .spyOn(linkingSubscription, "linkingSubscription")
    .mockImplementation(jest.fn());
  jest.spyOn(Linking, "getInitialURL").mockReturnValue(Promise.resolve(null));
  const store = createStore(
    appReducer,
    appReducer(undefined, applicationChangeState("active")) as any
  );
  const Stack = createStackNavigator();
  return render(
    <Provider store={store}>
      <IOThemeContextProvider theme={"light"}>
        <TestInnerNavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen component={MockMainScreen} name={ROUTES.MAIN} />
            <Stack.Screen
              component={MessagesStackNavigator}
              name={MESSAGES_ROUTES.MESSAGES_NAVIGATOR}
            />
          </Stack.Navigator>
        </TestInnerNavigationContainer>
      </IOThemeContextProvider>
    </Provider>
  );
};

type Scenario = {
  action: NavigationAction;
  name: string;
};

const scenarios: ReadonlyArray<Scenario> = [
  {
    name: "from the inbox",
    action: CommonActions.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
      params: { messageId: MESSAGE_ID, fromNotification: false }
    })
  },
  {
    name: "from a push notification",
    action: navigateToMessageRouterAction({
      messageId: MESSAGE_ID,
      fromNotification: true
    })
  }
];

describe("MessagesStackNavigator", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockDefaultHeader.mockClear();
  });

  it.each(scenarios)(
    "should show the message router header since its first render, when opened $name",
    ({ action }) => {
      const { getByLabelText } = renderMessagesNavigator();

      act(() => {
        NavigationService.dispatchNavigationAction(action);
      });

      expect(NavigationService.getCurrentRouteName()).toBe(
        MESSAGES_ROUTES.MESSAGE_ROUTER
      );
      expect(mockDefaultHeader).not.toHaveBeenCalled();
      expect(
        getByLabelText(I18n.t("global.accessibility.contextualHelp.open.label"))
      ).toBeTruthy();
      expect(getByLabelText(I18n.t("global.buttons.back"))).toBeTruthy();
    }
  );
});

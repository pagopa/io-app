import { IOThemeContextProvider } from "@io-app/design-system";
import { NavigationState } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { act, render } from "@testing-library/react-native";
import { Linking, View } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { TestInnerNavigationContainer } from "../../../../navigation/AppStackNavigator";
import * as linkingSubscription from "../../../../navigation/linkingSubscription";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { successGetMessageDataFor } from "../../../messages/__mocks__/messageData";
import { MessagesStackNavigator } from "../../../messages/navigation/MessagesNavigator";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { getMessageDataAction } from "../../../messages/store/actions";
import { navigateToMessageRouterAction } from "../navigation";

jest.mock("../../../messages/screens/MessageDetailsScreen", () => ({
  MessageDetailsScreen: () => {
    const { View } = jest.requireActual("react-native");
    return <View />;
  }
}));

const MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJK";
const OTHER_MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJZ";

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
  render(
    <Provider store={store}>
      <IOThemeContextProvider theme={"light"}>
        <TestInnerNavigationContainer>
          <Stack.Navigator>
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

  const openMessage = (messageId: string, fromNotification: boolean) => {
    act(() => {
      NavigationService.dispatchNavigationAction(
        navigateToMessageRouterAction({ messageId, fromNotification })
      );
    });
    act(() => {
      store.dispatch(
        getMessageDataAction.success(successGetMessageDataFor(messageId))
      );
    });
  };

  return { openMessage };
};

const messagesNavigatorRouteNames = () => {
  const rootState = NavigationService.getCurrentState() as NavigationState;
  const messagesNavigatorState = rootState.routes[rootState.index]
    .state as NavigationState;
  return messagesNavigatorState.routes.map(({ name }) => name);
};

type Scenario = {
  name: string;
  nextMessageId: string;
};

const scenarios: ReadonlyArray<Scenario> = [
  { name: "another message", nextMessageId: OTHER_MESSAGE_ID },
  { name: "the same message", nextMessageId: MESSAGE_ID }
];

describe("navigateToMessageRouterAction", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should show the message from the push notification", () => {
    const { openMessage } = renderMessagesNavigator();

    openMessage(MESSAGE_ID, true);

    expect(NavigationService.getCurrentRoute()).toMatchObject({
      name: MESSAGES_ROUTES.MESSAGE_DETAIL,
      params: { messageId: MESSAGE_ID }
    });
    expect(messagesNavigatorRouteNames()).toEqual([
      MESSAGES_ROUTES.MESSAGE_ROUTER
    ]);
  });

  it.each(scenarios)(
    "should show $name from the push notification in place of the open one",
    ({ nextMessageId }) => {
      const { openMessage } = renderMessagesNavigator();
      openMessage(MESSAGE_ID, false);

      openMessage(nextMessageId, true);

      expect(NavigationService.getCurrentRoute()).toMatchObject({
        name: MESSAGES_ROUTES.MESSAGE_DETAIL,
        params: { messageId: nextMessageId }
      });
      expect(messagesNavigatorRouteNames()).toEqual([
        MESSAGES_ROUTES.MESSAGE_ROUTER
      ]);
    }
  );
});

import { createStore } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../../pn/navigation/routes";
import { successGetMessageDataFor } from "../../__mocks__/messageData";
import { SuccessGetMessageDataActionType } from "../../store/actions";
import { MessageContentNavigator } from "../MessageContentNavigator";
import { MESSAGES_ROUTES } from "../routes";

const mockRenderedRoute = jest.fn();
const mockStackNavigatorProps = jest.fn();

type MockScreenProps = { route: { name: string; params: unknown } };

jest.mock("@react-navigation/stack", () => {
  const actual = jest.requireActual("@react-navigation/stack");
  return {
    ...actual,
    createStackNavigator: () => {
      const stack = actual.createStackNavigator();
      return {
        ...stack,
        Navigator: (props: Record<string, unknown>) => {
          mockStackNavigatorProps(props);
          return <stack.Navigator {...props} />;
        }
      };
    }
  };
});

jest.mock("../../screens/MessageDetailsScreen", () => ({
  MessageDetailsScreen: ({ route }: MockScreenProps) => {
    const { View } = jest.requireActual("react-native");
    mockRenderedRoute(route.name, route.params);
    return <View testID="mock-message-details-screen" />;
  }
}));
jest.mock("../../screens/MessageGreenPassScreen", () => ({
  MessageGreenPassScreen: ({ route }: MockScreenProps) => {
    const { View } = jest.requireActual("react-native");
    mockRenderedRoute(route.name, route.params);
    return <View testID="mock-message-green-pass-screen" />;
  }
}));
jest.mock("../../../pn/screens/MessageDetailsScreen", () => ({
  MessageDetailsScreen: ({ route }: MockScreenProps) => {
    const { View } = jest.requireActual("react-native");
    mockRenderedRoute(route.name, route.params);
    return <View testID="mock-send-message-details-screen" />;
  }
}));

const MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJK";

const message = successGetMessageDataFor(MESSAGE_ID);
const SERVICE_ID = message.serviceId;

type Scenario = {
  expectedParams: Record<string, unknown> | undefined;
  expectedRoute: string;
  expectedTestID: string;
  message: SuccessGetMessageDataActionType;
  name: string;
};

const scenarios: ReadonlyArray<Scenario> = [
  {
    name: "should show a standard message",
    message,
    expectedRoute: MESSAGES_ROUTES.MESSAGE_DETAIL,
    expectedTestID: "mock-message-details-screen",
    expectedParams: {
      messageId: MESSAGE_ID,
      serviceId: SERVICE_ID
    }
  },
  {
    name: "should show a legacy green pass message",
    message: { ...message, isLegacyGreenPass: true },
    expectedRoute: MESSAGES_ROUTES.MESSAGE_GREEN_PASS,
    expectedTestID: "mock-message-green-pass-screen",
    expectedParams: undefined
  },
  {
    name: "should show a legacy green pass message even if it is a SEND one",
    message: { ...message, isLegacyGreenPass: true, isPNMessage: true },
    expectedRoute: MESSAGES_ROUTES.MESSAGE_GREEN_PASS,
    expectedTestID: "mock-message-green-pass-screen",
    expectedParams: undefined
  },
  ...[false, true].map(firstTimeOpening => ({
    name: `should show a SEND message (firstTimeOpening ${firstTimeOpening})`,
    message: { ...message, isPNMessage: true, firstTimeOpening },
    expectedRoute: PN_ROUTES.MESSAGE_DETAILS,
    expectedTestID: "mock-send-message-details-screen",
    expectedParams: {
      firstTimeOpening,
      messageId: MESSAGE_ID,
      sendOpeningSource: "message",
      sendUserType: "not_set",
      serviceId: SERVICE_ID
    }
  }))
];

describe("MessageContentNavigator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(scenarios)(
    "$name",
    ({
      expectedParams,
      expectedRoute,
      expectedTestID,
      message: loadedMessage
    }) => {
      const { getByTestId } = renderNavigator(loadedMessage);

      expect(getByTestId(expectedTestID)).toBeTruthy();
      expect(mockRenderedRoute).toHaveBeenCalledTimes(1);
      expect(mockRenderedRoute).toHaveBeenCalledWith(
        expectedRoute,
        expectedParams
      );
    }
  );

  it("should replace the loading placeholder without transitions", () => {
    renderNavigator(message);

    const contentNavigatorProps = mockStackNavigatorProps.mock.calls
      .map(([props]) => props)
      .find(props => props.initialRouteName === MESSAGES_ROUTES.MESSAGE_DETAIL);
    expect(contentNavigatorProps?.screenOptions).toMatchObject({
      animationEnabled: false
    });
  });
});

const renderNavigator = (loadedMessage: SuccessGetMessageDataActionType) => {
  const store = createStore(
    appReducer,
    appReducer(undefined, applicationChangeState("active")) as any
  );
  return renderScreenWithNavigationStoreContext(
    () => <MessageContentNavigator message={loadedMessage} />,
    MESSAGES_ROUTES.MESSAGE_ROUTER,
    {},
    store
  );
};

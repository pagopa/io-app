import { AnyAction, Dispatch, createStore } from "redux";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { MessageRouterScreen } from "../MessageRouterScreen";
import { getMessageDataAction } from "../../../features/messages/store/actions";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import * as ASD from "../../../store/hooks";
import { MessageGetStatus } from "../../../store/reducers/entities/messages/messageGetStatus";
import { MESSAGES_ROUTES } from "../../../features/messages/navigation/routes";

describe("MessageRouterScreen", () => {
  it("should match snapshot before starting to retrieve message data", () => {
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK" as UIMessageId;
    const fromPushNotification = false;
    const { renderedMessageRouterScreen, mockedDispatch } = renderScreen(
      messageId,
      fromPushNotification,
      "idle"
    );
    expect(renderedMessageRouterScreen.toJSON()).toMatchSnapshot();
    expect(mockedDispatch).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId,
        fromPushNotification
      })
    );
  });
  it("should match snapshot while retrieving message data", () => {
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK" as UIMessageId;
    const fromPushNotification = false;
    const { renderedMessageRouterScreen, mockedDispatch } = renderScreen(
      messageId,
      fromPushNotification,
      "loading"
    );
    expect(renderedMessageRouterScreen.toJSON()).toMatchSnapshot();
    expect(mockedDispatch).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId,
        fromPushNotification
      })
    );
  });
  it("should match snapshot if message data retrieval was blocked", () => {
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK" as UIMessageId;
    const fromPushNotification = true;
    const { renderedMessageRouterScreen, mockedDispatch } = renderScreen(
      messageId,
      fromPushNotification,
      "blocked"
    );
    expect(renderedMessageRouterScreen.toJSON()).toMatchSnapshot();
    expect(mockedDispatch).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId,
        fromPushNotification
      })
    );
  });
  it("should match snapshot on message data retrieval failure", () => {
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK" as UIMessageId;
    const fromPushNotification = false;
    const { renderedMessageRouterScreen, mockedDispatch } = renderScreen(
      messageId,
      fromPushNotification,
      "error"
    );
    expect(renderedMessageRouterScreen.toJSON()).toMatchSnapshot();
    expect(mockedDispatch).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId,
        fromPushNotification
      })
    );
  });
  it("should match snapshot on message data retrieval success", () => {
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK" as UIMessageId;
    const fromPushNotification = false;
    const { renderedMessageRouterScreen, mockedDispatch } = renderScreen(
      messageId,
      fromPushNotification,
      "success"
    );
    expect(renderedMessageRouterScreen.toJSON()).toMatchSnapshot();
    expect(mockedDispatch).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId,
        fromPushNotification
      })
    );
  });
});

const renderScreen = (
  messageId: UIMessageId,
  fromPushNotification: boolean,
  status: MessageGetStatus["status"]
) => {
  const globalState = globalStateFromStatus(
    status,
    messageId,
    fromPushNotification
  );
  const store = createStore(appReducer, globalState as any);

  const mockedDispatch = jest.fn();
  jest
    .spyOn(ASD, "useIODispatch")
    .mockImplementation(() => mockedDispatch as Dispatch<AnyAction>);

  const renderedMessageRouterScreen = renderScreenWithNavigationStoreContext(
    MessageRouterScreen,
    MESSAGES_ROUTES.MESSAGE_ROUTER,
    { messageId, fromNotification: fromPushNotification },
    store
  );
  return { renderedMessageRouterScreen, mockedDispatch };
};

const globalStateFromStatus = (
  status: MessageGetStatus["status"],
  messageId: UIMessageId,
  fromPushNotification: boolean
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  switch (status) {
    case "loading":
      return appReducer(
        globalState,
        getMessageDataAction.request({ messageId, fromPushNotification })
      );
    case "blocked":
      return appReducer(
        globalState,
        getMessageDataAction.failure({
          blockedFromPushNotificationOpt: true,
          phase: "preconditions"
        })
      );
    case "error":
      return appReducer(
        globalState,
        getMessageDataAction.failure({ phase: "messageDetails" })
      );
    case "success":
      return appReducer(
        globalState,
        getMessageDataAction.success({
          messageId,
          serviceId: "s1" as ServiceId,
          serviceName: "serName",
          organizationName: "orgName",
          firstTimeOpening: true,
          isPNMessage: false,
          containsAttachments: false,
          containsPayment: undefined,
          hasRemoteContent: false,
          euCovidCerficateAuthCode: undefined
        })
      );
  }
  return globalState;
};

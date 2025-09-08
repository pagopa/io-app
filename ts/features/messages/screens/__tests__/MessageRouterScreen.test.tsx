import { AnyAction, Dispatch, createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MessageRouterScreen } from "../MessageRouterScreen";
import { getMessageDataAction } from "../../store/actions";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import * as IOHooks from "../../../../store/hooks";
import { MessageGetStatus } from "../../store/reducers/messageGetStatus";
import { MESSAGES_ROUTES } from "../../navigation/routes";

describe("MessageRouterScreen", () => {
  it("should match snapshot before starting to retrieve message data", () => {
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK";
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
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK";
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
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK";
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
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK";
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
    const messageId = "01HGRNT85KP8TC5APFQWAA3HJK";
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
  messageId: string,
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
    .spyOn(IOHooks, "useIODispatch")
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
  messageId: string,
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
          organizationFiscalCode: "orgFisCod",
          firstTimeOpening: true,
          isLegacyGreenPass: false,
          isPNMessage: false,
          containsAttachments: false,
          containsPayment: undefined,
          hasRemoteContent: false,
          hasFIMSCTA: false,
          createdAt: new Date()
        })
      );
  }
  return globalState;
};

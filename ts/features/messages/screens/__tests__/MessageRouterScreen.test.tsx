import { act } from "@testing-library/react-native";
import { AnyAction, Dispatch, createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MessageRouterScreen } from "../MessageRouterScreen";
import {
  cancelGetMessageDataAction,
  getMessageDataAction,
  resetGetMessageDataAction
} from "../../store/actions";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import * as IOHooks from "../../../../store/hooks";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import ROUTES from "../../../../navigation/routes";
import PN_ROUTES from "../../../pn/navigation/routes";

const mockReplace = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockErrorComponent = jest.fn(_props => null);

jest.mock("../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    replace: mockReplace,
    navigate: mockNavigate,
    goBack: mockGoBack
  })
}));

jest.mock(
  "../../components/MessageRouter/MessageRouterScreenErrorComponent",
  () => ({
    MessageRouterScreenErrorComponent: (props: { onCancel: () => void }) =>
      mockErrorComponent(props)
  })
);

const MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJK";

const successBase = {
  messageId: MESSAGE_ID,
  serviceId: "s1" as ServiceId,
  serviceName: "serName",
  organizationName: "orgName",
  organizationFiscalCode: "orgFisCod",
  firstTimeOpening: true,
  containsAttachments: false,
  containsPayment: undefined,
  hasRemoteContent: false,
  hasFIMSCTA: false,
  createdAt: new Date(),
  fciMessageType: "not_set" as const,
  fciResult: "not_set" as const
};

describe("MessageRouterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loading component when isLoading is true", () => {
    const { getByTestId } = renderScreen(MESSAGE_ID, false, "loading");
    expect(getByTestId("routerScreen-loading")).toBeTruthy();
    expect(mockErrorComponent).not.toHaveBeenCalled();
  });

  it("renders the error component when not loading", () => {
    renderScreen(MESSAGE_ID, false, "error");
    expect(mockErrorComponent).toHaveBeenCalled();
  });

  it("dispatches getMessageDataAction.request on first render", () => {
    const { mockedDispatch } = renderScreen(MESSAGE_ID, false, "idle");
    expect(mockedDispatch).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId: MESSAGE_ID,
        fromPushNotification: false
      })
    );
  });

  [true, false].forEach(fromPushNotification => {
    describe(`on second render when messageSuccessDataOrUndefined is non-null and fromPushNotification is ${fromPushNotification}`, () => {
      it("navigates to message detail for a regular message", () => {
        const { store } = renderScreen(
          MESSAGE_ID,
          fromPushNotification,
          "idle"
        );
        act(() => {
          store.dispatch(
            getMessageDataAction.success({
              ...successBase,
              isLegacyGreenPass: false,
              isPNMessage: false
            })
          );
        });
        expect(mockReplace).toHaveBeenCalledWith(
          MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
          {
            screen: MESSAGES_ROUTES.MESSAGE_DETAIL,
            params: { messageId: MESSAGE_ID, serviceId: "s1" }
          }
        );
      });

      it("navigates to green pass screen for a legacy green pass message", () => {
        const { store } = renderScreen(
          MESSAGE_ID,
          fromPushNotification,
          "idle"
        );
        act(() => {
          store.dispatch(
            getMessageDataAction.success({
              ...successBase,
              isLegacyGreenPass: true,
              isPNMessage: false
            })
          );
        });
        expect(mockReplace).toHaveBeenCalledWith(
          MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
          { screen: MESSAGES_ROUTES.MESSAGE_GREEN_PASS }
        );
      });

      [true, false].forEach(isfirstTimeOpening => {
        it(`navigates to PN message details for a PN message when firstTimeOpening is ${isfirstTimeOpening}`, () => {
          const { store } = renderScreen(
            MESSAGE_ID,
            fromPushNotification,
            "idle"
          );
          act(() => {
            store.dispatch(
              getMessageDataAction.success({
                ...successBase,
                isLegacyGreenPass: false,
                isPNMessage: true,
                firstTimeOpening: isfirstTimeOpening
              })
            );
          });
          expect(mockReplace).toHaveBeenCalledWith(
            MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
            {
              screen: PN_ROUTES.MAIN,
              params: {
                screen: PN_ROUTES.MESSAGE_DETAILS,
                params: {
                  messageId: MESSAGE_ID,
                  serviceId: "s1",
                  firstTimeOpening: isfirstTimeOpening,
                  sendOpeningSource: "message",
                  sendUserType: "not_set"
                }
              }
            }
          );
        });
      });
    });
  });
  it("navigates to messages home on second render when shouldNavigateBackAfterPushNotificationInteraction is truthy", () => {
    const { store } = renderScreen(MESSAGE_ID, true, "idle");
    act(() => {
      store.dispatch(
        getMessageDataAction.failure({
          blockedFromPushNotificationOpt: true,
          phase: "preconditions"
        })
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  });

  it("does nothing on second render when both messageSuccessDataOrUndefined and shouldNavigateBackAfterPushNotificationInteraction are falsy", () => {
    // Start with success data so that resetting it triggers a re-render
    // (messageSuccessDataOrUndefined changes from truthy to undefined),
    // exercising the "do nothing" branch while keeping both conditions falsy.
    const { store } = renderScreen(MESSAGE_ID, false, "success");
    act(() => {
      store.dispatch(resetGetMessageDataAction());
    });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("dispatches cancel action and navigates back when cancel is triggered", () => {
    const { mockedDispatch } = renderScreen(MESSAGE_ID, false, "error");
    act(() => {
      mockErrorComponent.mock.calls[0][0].onCancel();
    });
    expect(mockedDispatch).toHaveBeenCalledWith(cancelGetMessageDataAction());
    expect(mockGoBack).toHaveBeenCalled();
  });
  it("dispatches the getMessageData action when retry is triggered", () => {
    const { mockedDispatch } = renderScreen(MESSAGE_ID, false, "error");
    act(() => {
      mockErrorComponent.mock.calls[0][0].onRetry();
    });
    expect(mockedDispatch).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId: MESSAGE_ID,
        fromPushNotification: false
      })
    );
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});

type TestStatus = "idle" | "loading" | "blocked" | "error" | "success";

const renderScreen = (
  messageId: string,
  fromPushNotification: boolean,
  status: TestStatus
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

  const renderResult = renderScreenWithNavigationStoreContext(
    MessageRouterScreen,
    MESSAGES_ROUTES.MESSAGE_ROUTER,
    { messageId, fromNotification: fromPushNotification },
    store
  );
  return { ...renderResult, mockedDispatch, store };
};

const globalStateFromStatus = (
  status: TestStatus,
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
          ...successBase,
          messageId,
          isLegacyGreenPass: false,
          isPNMessage: false
        })
      );
    default:
      return globalState;
  }
};

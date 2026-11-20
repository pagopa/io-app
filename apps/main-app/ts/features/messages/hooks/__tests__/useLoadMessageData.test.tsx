import { act, renderHook } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { Action, createStore, Store } from "redux";

import {
  applicationChangeState,
  startApplicationInitialization
} from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { successGetMessageDataFor } from "../../__mocks__/messageData";
import {
  cancelGetMessageDataAction,
  getMessageDataAction
} from "../../store/actions";
import {
  INITIAL_STATE,
  MessageGetStatus
} from "../../store/reducers/messageGetStatus";
import { useLoadMessageData } from "../useLoadMessageData";

const MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJK";
const OTHER_MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJZ";

type HookProps = {
  fromPushNotification: boolean;
  messageId: string;
};

const renderUseLoadMessageData = (
  initialProps: HookProps,
  ...initialActions: ReadonlyArray<Action>
) => {
  const initialState = initialActions.reduce(
    appReducer,
    appReducer(undefined, applicationChangeState("active"))
  );
  const store: Store<GlobalState> = createStore(
    appReducer,
    initialState as any
  );
  const dispatchSpy = jest.spyOn(store, "dispatch");
  const onRender = jest.fn<void, [MessageGetStatus]>();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(
    ({ messageId, fromPushNotification }: HookProps) => {
      const result = useLoadMessageData(messageId, fromPushNotification);
      onRender(result.status);
      return result;
    },
    { initialProps, wrapper }
  );
  const renderedStatuses = () => onRender.mock.calls.map(([status]) => status);
  return { ...hook, dispatchSpy, renderedStatuses, store };
};

describe("useLoadMessageData", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([false, true])(
    "should request the message data on mount (fromPushNotification %s)",
    fromPushNotification => {
      const { dispatchSpy, result } = renderUseLoadMessageData({
        messageId: MESSAGE_ID,
        fromPushNotification
      });

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        getMessageDataAction.request({
          messageId: MESSAGE_ID,
          fromPushNotification
        })
      );
      expect(result.current.status).toStrictEqual({
        status: "loading",
        data: { messageId: MESSAGE_ID, fromPushNotification }
      });
    }
  );

  type StaleOutcomeScenario = {
    name: string;
    staleOutcome: Action;
  };
  const staleOutcomeScenarios: ReadonlyArray<StaleOutcomeScenario> = [
    {
      name: "the data of the same message",
      staleOutcome: getMessageDataAction.success(
        successGetMessageDataFor(MESSAGE_ID)
      )
    },
    {
      name: "the data of another message",
      staleOutcome: getMessageDataAction.success(
        successGetMessageDataFor(OTHER_MESSAGE_ID)
      )
    },
    {
      name: "a failure",
      staleOutcome: getMessageDataAction.failure({ phase: "messageDetails" })
    },
    {
      name: "a blocked failure",
      staleOutcome: getMessageDataAction.failure({
        phase: "preconditions",
        blockedFromPushNotificationOpt: true
      })
    }
  ];

  it.each(staleOutcomeScenarios)(
    "should not expose a previous outcome holding $name before requesting the message",
    ({ staleOutcome }) => {
      const { renderedStatuses } = renderUseLoadMessageData(
        { messageId: MESSAGE_ID, fromPushNotification: false },
        staleOutcome
      );

      expect(renderedStatuses()[0]).toStrictEqual(INITIAL_STATE);
      expect(renderedStatuses().slice(-1)[0].status).toBe("loading");
    }
  );

  it("should expose the outcome of the request", () => {
    const { result, store } = renderUseLoadMessageData({
      messageId: MESSAGE_ID,
      fromPushNotification: false
    });
    const successData = successGetMessageDataFor(MESSAGE_ID);

    act(() => {
      store.dispatch(getMessageDataAction.success(successData));
    });

    expect(result.current.status).toStrictEqual({
      status: "success",
      successData
    });
  });

  it("should request the message data again on retry", () => {
    const { dispatchSpy, result, store } = renderUseLoadMessageData({
      messageId: MESSAGE_ID,
      fromPushNotification: true
    });
    act(() => {
      store.dispatch(getMessageDataAction.failure({ phase: "messageDetails" }));
    });
    expect(result.current.status.status).toBe("error");
    dispatchSpy.mockClear();

    act(() => {
      result.current.retry();
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId: MESSAGE_ID,
        fromPushNotification: true
      })
    );
    expect(result.current.status.status).toBe("loading");
  });

  type UnmountScenario = {
    expectCancel: boolean;
    name: string;
    outcome?: Action;
  };
  const unmountScenarios: ReadonlyArray<UnmountScenario> = [
    {
      name: "should cancel the request when unmounted while loading",
      expectCancel: true
    },
    {
      name: "should cancel the request when unmounted while waiting for a retry",
      outcome: startApplicationInitialization({
        handleSessionExpiration: true
      }),
      expectCancel: true
    },
    {
      name: "should not cancel anything when unmounted after the message has been loaded",
      outcome: getMessageDataAction.success(
        successGetMessageDataFor(MESSAGE_ID)
      ),
      expectCancel: false
    },
    {
      name: "should not cancel anything when unmounted after a failure",
      outcome: getMessageDataAction.failure({ phase: "messageDetails" }),
      expectCancel: false
    },
    {
      name: "should not cancel the loading of another message",
      outcome: getMessageDataAction.request({
        messageId: OTHER_MESSAGE_ID,
        fromPushNotification: false
      }),
      expectCancel: false
    }
  ];

  it.each(unmountScenarios)("$name", ({ outcome, expectCancel }) => {
    const { dispatchSpy, store, unmount } = renderUseLoadMessageData({
      messageId: MESSAGE_ID,
      fromPushNotification: false
    });
    if (outcome) {
      act(() => {
        store.dispatch(outcome);
      });
    }
    dispatchSpy.mockClear();

    unmount();

    if (expectCancel) {
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(cancelGetMessageDataAction());
    } else {
      expect(dispatchSpy).not.toHaveBeenCalled();
    }
  });

  it("should cancel a pending request and load the new message when the message changes", () => {
    const { dispatchSpy, renderedStatuses, rerender, result } =
      renderUseLoadMessageData({
        messageId: MESSAGE_ID,
        fromPushNotification: false
      });
    dispatchSpy.mockClear();
    const renderCount = renderedStatuses().length;

    rerender({ messageId: OTHER_MESSAGE_ID, fromPushNotification: true });

    expect(dispatchSpy.mock.calls).toEqual([
      [cancelGetMessageDataAction()],
      [
        getMessageDataAction.request({
          messageId: OTHER_MESSAGE_ID,
          fromPushNotification: true
        })
      ]
    ]);
    expect(renderedStatuses()[renderCount]).toStrictEqual(INITIAL_STATE);
    expect(result.current.status).toStrictEqual({
      status: "loading",
      data: { messageId: OTHER_MESSAGE_ID, fromPushNotification: true }
    });
  });

  it("should load the message again when it is opened in another way", () => {
    const { dispatchSpy, renderedStatuses, rerender, store } =
      renderUseLoadMessageData({
        messageId: MESSAGE_ID,
        fromPushNotification: false
      });
    act(() => {
      store.dispatch(
        getMessageDataAction.success(successGetMessageDataFor(MESSAGE_ID))
      );
    });
    dispatchSpy.mockClear();
    const renderCount = renderedStatuses().length;

    rerender({ messageId: MESSAGE_ID, fromPushNotification: true });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId: MESSAGE_ID,
        fromPushNotification: true
      })
    );
    expect(renderedStatuses()[renderCount]).toStrictEqual(INITIAL_STATE);
  });
});

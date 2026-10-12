import {
  applicationChangeState,
  startApplicationInitialization
} from "../../../../../store/actions/application";
import { Action } from "../../../../../store/actions/types";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { successGetMessageDataFor } from "../../../__mocks__/messageData";
import {
  cancelGetMessageDataAction,
  getMessageDataAction,
  loadMessageById,
  LoadMessageByIdFailureKind,
  reloadAllMessages,
  resetGetMessageDataAction,
  SuccessGetMessageDataActionType
} from "../../actions";
import {
  INITIAL_STATE,
  isLoadingMessageDataSelector,
  loadedMessageDataSelector,
  messageGetStatusErrorPhaseSelector,
  MessageGetStatusFailurePhaseType,
  messageGetStatusReducer,
  messageGetStatusSelector,
  messageRouterScreenErrorVariantSelector
} from "../messageGetStatus";

describe("messageGetStatusReducer", () => {
  it("INITIAL_STATE should match expected one", () => {
    const expectedInitialState = {
      status: "idle"
    };
    expect(INITIAL_STATE).toStrictEqual(expectedInitialState);
  });
  it("should match expected initial state", () => {
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    expect(initialState).toStrictEqual(INITIAL_STATE);
  });
  it("should match loading state after getMessageDataAction.request action", () => {
    const messageId = "m1";
    const fromPushNotification = false;
    const expectedLoadingState = {
      status: "loading",
      data: {
        messageId,
        fromPushNotification
      }
    };
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    const loadingState = messageGetStatusReducer(
      initialState,
      getMessageDataAction.request({
        messageId,
        fromPushNotification
      })
    );
    expect(loadingState).toStrictEqual(expectedLoadingState);
  });
  it("should match successful state after getMessageDataAction.success action", () => {
    const successData = successGetMessageDataFor("m1");
    const expectedSuccessState = {
      status: "success",
      successData
    };
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    const successState = messageGetStatusReducer(
      initialState,
      getMessageDataAction.success(successData)
    );
    expect(successState).toStrictEqual(expectedSuccessState);
  });
  it("should match failure state after getMessageDataAction.failure action", () => {
    const failurePhase = "paginatedMessage";
    const expectedFailureState = {
      status: "error",
      failurePhase
    };
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    const failureState = messageGetStatusReducer(
      initialState,
      getMessageDataAction.failure({ phase: failurePhase })
    );
    expect(failureState).toStrictEqual(expectedFailureState);
  });
  it("should match blocked failure state after getMessageDataAction.failure action for a blocked operation", () => {
    const failurePhase = "preconditions";
    const expectedBlockedFailureState = {
      status: "blocked",
      failurePhase
    };
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    const blockedFailureState = messageGetStatusReducer(
      initialState,
      getMessageDataAction.failure({
        phase: failurePhase,
        blockedFromPushNotificationOpt: true
      })
    );
    expect(blockedFailureState).toStrictEqual(expectedBlockedFailureState);
  });
  it("should match initial state after resetGetMessageDataAction action", () => {
    const failureState = messageGetStatusReducer(
      undefined,
      getMessageDataAction.failure({ phase: "paginatedMessage" })
    );
    expect(failureState).not.toStrictEqual(INITIAL_STATE);
    const resetState = messageGetStatusReducer(
      failureState,
      resetGetMessageDataAction()
    );
    expect(resetState).toStrictEqual(INITIAL_STATE);
  });
  it("should match initial state after cancelGetMessageDataAction action", () => {
    const loadingState = messageGetStatusReducer(
      undefined,
      getMessageDataAction.request({
        messageId: "m1",
        fromPushNotification: false
      })
    );
    expect(loadingState).not.toStrictEqual(INITIAL_STATE);
    const cancelledState = messageGetStatusReducer(
      loadingState,
      cancelGetMessageDataAction()
    );
    expect(cancelledState).toStrictEqual(INITIAL_STATE);
  });
  it("should keep its state after reloadAllMessages.request action", () => {
    // The inbox can be reloaded while a message is being opened, and the
    // outcome of its loading must not be lost
    const successState = messageGetStatusReducer(
      undefined,
      getMessageDataAction.success(successGetMessageDataFor("m1"))
    );
    const reloadState = messageGetStatusReducer(
      successState,
      reloadAllMessages.request({
        filter: {},
        pageSize: 20,
        fromUserAction: false
      })
    );
    expect(reloadState).toBe(successState);
  });
  it("should switch to retry state after a session expiration while loading", () => {
    const data = { messageId: "m1", fromPushNotification: true };
    const loadingState = messageGetStatusReducer(
      undefined,
      getMessageDataAction.request(data)
    );
    const retryState = messageGetStatusReducer(
      loadingState,
      startApplicationInitialization({ handleSessionExpiration: true })
    );
    expect(retryState).toStrictEqual({ status: "retry", data });
  });
});

describe("messageGetStatusSelector", () => {
  it("should return the whole message get status", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.request({
        messageId: "m1",
        fromPushNotification: true
      })
    );
    expect(messageGetStatusSelector(globalState)).toBe(
      globalState.entities.messages.messageGetStatus
    );
  });
});

describe("isLoadingMessageDataSelector", () => {
  const MESSAGE_ID = "m1";
  const OTHER_MESSAGE_ID = "m2";

  const loadingState = (messageId: string) =>
    appReducer(
      undefined,
      getMessageDataAction.request({ messageId, fromPushNotification: false })
    );

  type Scenario = {
    expected: boolean;
    name: string;
    state: () => GlobalState;
  };

  const scenarios: ReadonlyArray<Scenario> = [
    {
      name: "returns false for the initial state",
      state: () => appReducer(undefined, applicationChangeState("active")),
      expected: false
    },
    {
      name: "returns true while the message is loading",
      state: () => loadingState(MESSAGE_ID),
      expected: true
    },
    {
      name: "returns false while another message is loading",
      state: () => loadingState(OTHER_MESSAGE_ID),
      expected: false
    },
    {
      name: "returns true while the message is waiting to be retried",
      state: () =>
        appReducer(
          loadingState(MESSAGE_ID),
          startApplicationInitialization({ handleSessionExpiration: true })
        ),
      expected: true
    },
    {
      name: "returns false while another message is waiting to be retried",
      state: () =>
        appReducer(
          loadingState(OTHER_MESSAGE_ID),
          startApplicationInitialization({ handleSessionExpiration: true })
        ),
      expected: false
    },
    {
      name: "returns false once the message is loaded",
      state: () =>
        appReducer(
          loadingState(MESSAGE_ID),
          getMessageDataAction.success(successGetMessageDataFor(MESSAGE_ID))
        ),
      expected: false
    },
    {
      name: "returns false once the loading has failed",
      state: () =>
        appReducer(
          loadingState(MESSAGE_ID),
          getMessageDataAction.failure({ phase: "messageDetails" })
        ),
      expected: false
    },
    {
      name: "returns false once the message has been blocked",
      state: () =>
        appReducer(
          loadingState(MESSAGE_ID),
          getMessageDataAction.failure({
            phase: "preconditions",
            blockedFromPushNotificationOpt: true
          })
        ),
      expected: false
    }
  ];

  it.each(scenarios)("$name", ({ state, expected }) => {
    expect(isLoadingMessageDataSelector(state(), MESSAGE_ID)).toBe(expected);
  });
});

describe("loadedMessageDataSelector", () => {
  const MESSAGE_ID = "m1";
  const successData = successGetMessageDataFor(MESSAGE_ID);

  type Scenario = {
    expected: SuccessGetMessageDataActionType | undefined;
    name: string;
    state: () => GlobalState;
  };

  const scenarios: ReadonlyArray<Scenario> = [
    {
      name: "returns undefined for the initial state",
      state: () => appReducer(undefined, applicationChangeState("active")),
      expected: undefined
    },
    {
      name: "returns undefined while the message is loading",
      state: () =>
        appReducer(
          undefined,
          getMessageDataAction.request({
            messageId: MESSAGE_ID,
            fromPushNotification: false
          })
        ),
      expected: undefined
    },
    {
      name: "returns undefined for a blocked failure",
      state: () =>
        appReducer(
          undefined,
          getMessageDataAction.failure({
            phase: "preconditions",
            blockedFromPushNotificationOpt: true
          })
        ),
      expected: undefined
    },
    {
      name: "returns undefined for a failure",
      state: () =>
        appReducer(
          undefined,
          getMessageDataAction.failure({ phase: "messageDetails" })
        ),
      expected: undefined
    },
    {
      name: "returns undefined when another message has been loaded",
      state: () =>
        appReducer(
          undefined,
          getMessageDataAction.success(successGetMessageDataFor("m2"))
        ),
      expected: undefined
    },
    {
      name: "returns the loaded data of the message",
      state: () =>
        appReducer(undefined, getMessageDataAction.success(successData)),
      expected: successData
    }
  ];

  it.each(scenarios)("$name", ({ state, expected }) => {
    expect(loadedMessageDataSelector(state(), MESSAGE_ID)).toStrictEqual(
      expected
    );
  });
});

describe("messageRouterScreenErrorVariantSelector", () => {
  const TEST_MESSAGE_ID = "test-message-id";

  type Scenario = {
    byIdFailureKind: LoadMessageByIdFailureKind | undefined;
    expectedVariant: "genericError" | "messageNotFound" | "thirdPartyError";
    failurePhase: MessageGetStatusFailurePhaseType;
    name: string;
  };

  const scenarios: Array<Scenario> = [
    {
      name: "returns messageNotFound when failure phase is paginatedMessage and error kind is messageNotFound",
      failurePhase: "paginatedMessage",
      byIdFailureKind: "messageNotFound",
      expectedVariant: "messageNotFound"
    },
    {
      name: "returns genericError when failure phase is paginatedMessage and error kind is not messageNotFound",
      failurePhase: "paginatedMessage",
      byIdFailureKind: "generic",
      expectedVariant: "genericError"
    },
    {
      name: "returns thirdPartyError when failure phase is thirdPartyMessageDetails",
      failurePhase: "thirdPartyMessageDetails",
      byIdFailureKind: undefined,
      expectedVariant: "thirdPartyError"
    },
    {
      name: "returns genericError for other failure phases",
      failurePhase: "messageDetails",
      byIdFailureKind: undefined,
      expectedVariant: "genericError"
    },
    {
      name: "returns thirdPartyError when failure phase is thirdPartyMessageDetails, no matter the byId error kind",
      failurePhase: "thirdPartyMessageDetails",
      byIdFailureKind: "messageNotFound",
      expectedVariant: "thirdPartyError"
    },
    {
      name: "returns genericError for other failure phases, no matter the byId error kind",
      failurePhase: "messageDetails",
      byIdFailureKind: "messageNotFound",
      expectedVariant: "genericError"
    }
  ];

  it.each(scenarios)(
    "$name",
    ({ failurePhase, byIdFailureKind, expectedVariant }) => {
      const stateAfterFailure = appReducer(
        undefined,
        getMessageDataAction.failure({ phase: failurePhase })
      );
      const globalState =
        byIdFailureKind !== undefined
          ? appReducer(
              stateAfterFailure,
              loadMessageById.failure({
                id: TEST_MESSAGE_ID,
                error: new Error(),
                kind: byIdFailureKind
              })
            )
          : stateAfterFailure;
      expect(
        messageRouterScreenErrorVariantSelector(globalState, TEST_MESSAGE_ID)
      ).toBe(expectedVariant);
    }
  );
});

describe("messageGetStatusErrorPhaseSelector", () => {
  ["idle", "loading", "blocked", "success", "error", "retry"].forEach(
    status => {
      const isError = status === "error";
      const mockErrorPhase =
        `phase-for-${status}` as MessageGetStatusFailurePhaseType;
      it(`should return ${isError ? "failurePhase" : "undefined"} for status ${status}`, () => {
        const globalState = appReducer(
          undefined,
          isError
            ? getMessageDataAction.failure({ phase: mockErrorPhase })
            : getMessageDataAction.request({
                messageId: "m1",
                fromPushNotification: false
              })
        );
        const errorPhase = messageGetStatusErrorPhaseSelector(globalState);
        if (isError) {
          expect(errorPhase).toBe(mockErrorPhase);
        } else {
          expect(errorPhase).toBeUndefined();
        }
      });
    }
  );
});

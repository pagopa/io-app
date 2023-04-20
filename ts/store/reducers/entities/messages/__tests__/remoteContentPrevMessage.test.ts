import { createStore } from "redux";
import {
  remoteContentPrevMessage,
  clearRemoteContentPrevMessage
} from "../../../../actions/messages";
import { appReducer } from "../../..";
import { RemoteContentPrev } from "../../../../../../definitions/backend/RemoteContentPrev";
import { applicationChangeState } from "../../../../actions/application";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../../features/bonus/bpd/model/RemoteValue";
import { message_1 } from "../../../../../__mocks__/message";
import { toUIMessage } from "../transformers";
import { GlobalState } from "../../../types";

const mockRemoteContentPrevMessage: RemoteContentPrev = {};

describe("remoteContentPrevMessage", () => {
  it("The initial state should have the message undefined and the content as remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.entities.messages.remoteContentPrevMessage
    ).toStrictEqual({
      message: undefined,
      content: remoteUndefined
    });
  });

  it("The message should be present and the content should be remoteLoading if the remoteContentPrevMessage.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const action = store.dispatch(
      remoteContentPrevMessage.request(toUIMessage(message_1))
    );
    expect(
      store.getState().entities.messages.remoteContentPrevMessage
    ).toStrictEqual({
      message: action.payload,
      content: remoteLoading
    });
  });

  it("The message should be present and the content should be remoteReady with action payload as value if the remoteContentPrevMessage.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      entities: {
        ...globalState.entities,
        messages: {
          ...globalState.entities.messages,
          remoteContentPrevMessage: {
            message: toUIMessage(message_1),
            content: remoteLoading
          }
        }
      }
    };

    const store = createStore(appReducer, finalState as any);
    const action = store.dispatch(
      remoteContentPrevMessage.success(mockRemoteContentPrevMessage)
    );
    expect(
      store.getState().entities.messages.remoteContentPrevMessage
    ).toStrictEqual({
      message: toUIMessage(message_1),
      content: remoteReady(action.payload)
    });
  });

  it("The message should be present and the content should be remoteError with action payload as value if the remoteContentPrevMessage.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      entities: {
        ...globalState.entities,
        messages: {
          ...globalState.entities.messages,
          remoteContentPrevMessage: {
            message: toUIMessage(message_1),
            content: remoteLoading
          }
        }
      }
    };

    const store = createStore(appReducer, finalState as any);
    const action = store.dispatch(
      remoteContentPrevMessage.failure(new Error("Error load remote content"))
    );
    expect(
      store.getState().entities.messages.remoteContentPrevMessage
    ).toStrictEqual({
      message: toUIMessage(message_1),
      content: remoteError(action.payload)
    });
  });

  it("The message should be undefined and the content should be remoteUndefined if the clearRemoteContentPrevMessage is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      entities: {
        ...globalState.entities,
        messages: {
          ...globalState.entities.messages,
          remoteContentPrevMessage: {
            message: toUIMessage(message_1),
            content: remoteReady(mockRemoteContentPrevMessage)
          }
        }
      }
    };

    const store = createStore(appReducer, finalState as any);
    store.dispatch(clearRemoteContentPrevMessage());
    expect(
      store.getState().entities.messages.remoteContentPrevMessage
    ).toStrictEqual({
      message: undefined,
      content: remoteUndefined
    });
  });
});

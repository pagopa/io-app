import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import {
  getMessagePrecondition,
  clearMessagePrecondition
} from "../../../../actions/messages";
import { appReducer } from "../../..";
import { ThirdPartyMessagePrecondition } from "../../../../../../definitions/backend/ThirdPartyMessagePrecondition";
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

const mockThirdPartyMessagePrecondition: ThirdPartyMessagePrecondition = {
  title: "placeholder_title",
  markdown: "placeholder_markdown"
};

const message = toUIMessage(message_1);

describe("messagePrecondition", () => {
  it("The initial state should have the messageId undefined and the content as remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.entities.messages.messagePrecondition).toStrictEqual({
      messageId: O.none,
      content: remoteUndefined
    });
  });

  it("The messageId should be defined and the content should be remoteLoading if the getMessagePrecondition.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const action = store.dispatch(getMessagePrecondition.request(message.id));
    expect(
      store.getState().entities.messages.messagePrecondition
    ).toStrictEqual({
      messageId: O.some(action.payload),
      content: remoteLoading
    });
  });

  it("The messageId should be defined and the content should be remoteReady with action payload as value if the getMessagePrecondition.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      entities: {
        ...globalState.entities,
        messages: {
          ...globalState.entities.messages,
          messagePrecondition: {
            messageId: O.some(message.id),
            content: remoteLoading
          }
        }
      }
    };

    const store = createStore(appReducer, finalState as any);
    const action = store.dispatch(
      getMessagePrecondition.success(mockThirdPartyMessagePrecondition)
    );
    expect(
      store.getState().entities.messages.messagePrecondition
    ).toStrictEqual({
      messageId: O.some(message.id),
      content: remoteReady(action.payload)
    });
  });

  it("The messageId should be defined and the content should be remoteError with action payload as value if the getMessagePrecondition.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      entities: {
        ...globalState.entities,
        messages: {
          ...globalState.entities.messages,
          messagePrecondition: {
            messageId: O.some(message.id),
            content: remoteLoading
          }
        }
      }
    };

    const store = createStore(appReducer, finalState as any);
    const action = store.dispatch(
      getMessagePrecondition.failure(new Error("Error load remote content"))
    );
    expect(
      store.getState().entities.messages.messagePrecondition
    ).toStrictEqual({
      messageId: O.some(message.id),
      content: remoteError(action.payload)
    });
  });

  it("The messageId should be undefined and the content should be remoteUndefined if the clearMessagePrecondition is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      entities: {
        ...globalState.entities,
        messages: {
          ...globalState.entities.messages,
          messagePrecondition: {
            messageId: O.some(message.id),
            content: remoteReady(mockThirdPartyMessagePrecondition)
          }
        }
      }
    };

    const store = createStore(appReducer, finalState as any);
    store.dispatch(clearMessagePrecondition());
    expect(
      store.getState().entities.messages.messagePrecondition
    ).toStrictEqual({
      messageId: O.none,
      content: remoteUndefined
    });
  });
});

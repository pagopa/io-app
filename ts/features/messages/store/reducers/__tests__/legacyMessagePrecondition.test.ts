import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { ThirdPartyMessagePrecondition } from "../../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { TagEnum as TagEnumPN } from "../../../../../../definitions/backend/MessageCategoryPN";
import { applicationChangeState } from "../../../../../store/actions/application";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../../common/model/RemoteValue";
import { message_1 } from "../../../__mocks__/message";
import { toUIMessage } from "../transformers";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  clearLegacyMessagePrecondition,
  getLegacyMessagePrecondition
} from "../../actions/preconditions";

const mockThirdPartyMessagePrecondition: ThirdPartyMessagePrecondition = {
  title: "placeholder_title",
  markdown: "placeholder_markdown"
};

const message = toUIMessage(message_1);

describe("legacyMessagePrecondition", () => {
  it("The initial state should have the messageId undefined and the content as remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.entities.messages.legacyMessagePrecondition
    ).toStrictEqual({
      messageId: O.none,
      content: remoteUndefined
    });
  });

  it("The messageId should be defined and the content should be remoteLoading if the getMessagePrecondition.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const action = store.dispatch(
      getLegacyMessagePrecondition.request({
        id: message.id,
        categoryTag: TagEnumPN.PN
      })
    );
    expect(
      store.getState().entities.messages.legacyMessagePrecondition
    ).toStrictEqual({
      messageId: O.some(action.payload.id),
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
          legacyMessagePrecondition: {
            messageId: O.some(message.id),
            content: remoteLoading
          }
        }
      }
    };

    const store = createStore(appReducer, finalState as any);
    const action = store.dispatch(
      getLegacyMessagePrecondition.success(mockThirdPartyMessagePrecondition)
    );
    expect(
      store.getState().entities.messages.legacyMessagePrecondition
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
          legacyMessagePrecondition: {
            messageId: O.some(message.id),
            content: remoteLoading
          }
        }
      }
    };

    const store = createStore(appReducer, finalState as any);
    const action = store.dispatch(
      getLegacyMessagePrecondition.failure(
        new Error("Error load remote content")
      )
    );
    expect(
      store.getState().entities.messages.legacyMessagePrecondition
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
          legacyMessagePrecondition: {
            messageId: O.some(message.id),
            content: remoteReady(mockThirdPartyMessagePrecondition)
          }
        }
      }
    };

    const store = createStore(appReducer, finalState as any);
    store.dispatch(clearLegacyMessagePrecondition());
    expect(
      store.getState().entities.messages.legacyMessagePrecondition
    ).toStrictEqual({
      messageId: O.none,
      content: remoteUndefined
    });
  });
});

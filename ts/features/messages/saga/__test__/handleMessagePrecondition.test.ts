import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { UIMessageId } from "../../types";
import {
  getMessageIdAndCategoryTag,
  testMessagePreconditionWorker
} from "../handleMessagePrecondition";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { TagEnum as TagEnumPN } from "../../../../../definitions/backend/MessageCategoryPN";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { BackendClient } from "../../../../api/__mocks__/backend";
import {
  errorPreconditionStatusAction,
  getLegacyMessagePrecondition,
  loadingContentPreconditionStatusAction,
  toErrorPayload,
  toLoadingContentPayload
} from "../../store/actions/preconditions";

const messagePreconditionWorker = testMessagePreconditionWorker!;

const action = {
  id: "MSG001" as UIMessageId,
  categoryTag: TagEnumPN.PN
};
const mockResponseSuccess: ThirdPartyMessagePrecondition = {
  title: "-",
  markdown: "-"
};

describe("messagePreconditionWorker", () => {
  it(`should put ${getType(
    getLegacyMessagePrecondition.success
  )} when the response is successful`, () => {
    testSaga(
      messagePreconditionWorker,
      BackendClient.getThirdPartyMessagePrecondition,
      getLegacyMessagePrecondition.request(action)
    )
      .next()
      .call(
        getMessageIdAndCategoryTag,
        getLegacyMessagePrecondition.request(action)
      )
      .next({ messageId: action.id, categoryTag: action.categoryTag })
      .call(
        withRefreshApiCall,
        BackendClient.getThirdPartyMessagePrecondition(action),
        getLegacyMessagePrecondition.request(action)
      )
      .next(E.right({ status: 200, value: mockResponseSuccess }))
      .put(getLegacyMessagePrecondition.success(mockResponseSuccess))
      .next()
      .put(
        loadingContentPreconditionStatusAction(
          toLoadingContentPayload(mockResponseSuccess)
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getLegacyMessagePrecondition.failure
  )} when the response is an error`, () => {
    testSaga(
      messagePreconditionWorker,
      BackendClient.getThirdPartyMessagePrecondition,
      getLegacyMessagePrecondition.request(action)
    )
      .next()
      .call(
        getMessageIdAndCategoryTag,
        getLegacyMessagePrecondition.request(action)
      )
      .next({ messageId: action.id, categoryTag: action.categoryTag })
      .call(
        withRefreshApiCall,
        BackendClient.getThirdPartyMessagePrecondition(action),
        getLegacyMessagePrecondition.request(action)
      )
      .next(E.right({ status: 500, value: `response status ${500}` }))
      .put(
        getLegacyMessagePrecondition.failure(
          new Error(`response status ${500}`)
        )
      )
      .next()
      .put(
        errorPreconditionStatusAction(
          toErrorPayload(`Error: response status ${500}`)
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getLegacyMessagePrecondition.failure
  )} when the handler throws an exception`, () => {
    testSaga(
      messagePreconditionWorker,
      BackendClient.getThirdPartyMessagePrecondition,
      getLegacyMessagePrecondition.request(action)
    )
      .next()
      .call(
        getMessageIdAndCategoryTag,
        getLegacyMessagePrecondition.request(action)
      )
      .next({ messageId: action.id, categoryTag: action.categoryTag })
      .next(E.left([]))
      .put(getLegacyMessagePrecondition.failure(new Error()))
      .next()
      .put(errorPreconditionStatusAction(toErrorPayload(`Error`)))
      .next()
      .isDone();
  });
});

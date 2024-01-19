import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { getMessagePrecondition } from "../../store/actions";
import { UIMessageId } from "../../types";
import { testMessagePreconditionWorker } from "../handleMessagePrecondition";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { TagEnum as TagEnumPN } from "../../../../../definitions/backend/MessageCategoryPN";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { BackendClient } from "../../../../api/__mocks__/backend";

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
    getMessagePrecondition.success
  )} when the response is successful`, () => {
    testSaga(
      messagePreconditionWorker,
      BackendClient.getThirdPartyMessagePrecondition,
      getMessagePrecondition.request(action)
    )
      .next()
      .call(
        withRefreshApiCall,
        BackendClient.getThirdPartyMessagePrecondition(action),
        getMessagePrecondition.request(action)
      )
      .next(E.right({ status: 200, value: mockResponseSuccess }))
      .put(getMessagePrecondition.success(mockResponseSuccess))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getMessagePrecondition.failure
  )} when the response is an error`, () => {
    testSaga(
      messagePreconditionWorker,
      BackendClient.getThirdPartyMessagePrecondition,
      getMessagePrecondition.request(action)
    )
      .next()
      .call(
        withRefreshApiCall,
        BackendClient.getThirdPartyMessagePrecondition(action),
        getMessagePrecondition.request(action)
      )
      .next(E.right({ status: 500, value: `response status ${500}` }))
      .put(getMessagePrecondition.failure(new Error(`response status ${500}`)))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getMessagePrecondition.failure
  )} when the handler throws an exception`, () => {
    testSaga(
      messagePreconditionWorker,
      BackendClient.getThirdPartyMessagePrecondition,
      getMessagePrecondition.request(action)
    )
      .next()
      .next(E.left([]))
      .put(getMessagePrecondition.failure(new Error()))
      .next()
      .isDone();
  });
});

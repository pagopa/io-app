import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";

import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import {
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  toLoadingContentPayload
} from "../../store/actions/preconditions";
import {
  getMessageIdAndCategoryTag,
  testMessagePreconditionWorker
} from "../handleMessagePrecondition";

describe("handleMessagePrecondition", () => {
  describe("messagePreconditionWorker", () => {
    it("should follow the happy path correctly", () => {
      const getThirdPartyMessagePreconditionMock = jest.fn();
      const inputAction = retrievingDataPreconditionStatusAction({
        nextStatus: "retrievingData"
      });
      const messageIdAndCategoryTag = {
        messageId: "01JNKNK00XT8Y1DGNXSG6JD237",
        categoryTag: "GENERIC"
      };
      const remoteContentData = {
        title: "The title",
        markdown: "The markdown"
      };
      const saga = testMessagePreconditionWorker!.messagePreconditionWorker;
      testSaga(saga, getThirdPartyMessagePreconditionMock, inputAction)
        .next()
        .call(getMessageIdAndCategoryTag)
        .next(messageIdAndCategoryTag)
        .call(
          withRefreshApiCall,
          getThirdPartyMessagePreconditionMock({
            id: messageIdAndCategoryTag.messageId
          }),
          inputAction
        )
        .next(
          E.right({
            status: 200,
            value: remoteContentData
          })
        )
        .put(
          loadingContentPreconditionStatusAction(
            toLoadingContentPayload(remoteContentData)
          )
        )
        .next()
        .isDone();
    });
  });
});

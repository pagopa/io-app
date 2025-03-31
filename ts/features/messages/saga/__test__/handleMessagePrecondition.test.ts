import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import {
  getMessageIdAndCategoryTag,
  testMessagePreconditionWorker
} from "../handleMessagePrecondition";
import {
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  toLoadingContentPayload
} from "../../store/actions/preconditions";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { isIOMarkdownEnabledForMessagesAndServicesSelector } from "../../../../store/reducers/backendStatus/remoteConfig";

describe("handleMessagePrecondition", () => {
  describe("messagePreconditionWorker", () => {
    [false, true].forEach(ioMarkdownEnabled =>
      it(`should follow the happy path and include the return value of 'isIOMarkdownEnabledForMessagesAndServicesSelector' (${ioMarkdownEnabled}) in the final 'loadingContentPreconditionStatusAction' action`, () => {
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
          .select(isIOMarkdownEnabledForMessagesAndServicesSelector)
          .next(ioMarkdownEnabled)
          .put(
            loadingContentPreconditionStatusAction(
              toLoadingContentPayload(remoteContentData, ioMarkdownEnabled)
            )
          )
          .next()
          .isDone();
      })
    );
  });
});

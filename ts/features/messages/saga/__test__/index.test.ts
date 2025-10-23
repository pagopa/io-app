import { testSaga } from "redux-saga-test-plan";
import { clearCache } from "../../../settings/common/store/actions";
import { logoutSuccess } from "../../../authentication/common/store/actions";
import {
  downloadAttachment,
  getMessageDataAction,
  loadMessageById,
  loadMessageDetails,
  loadNextPageMessages,
  loadPreviousPageMessages,
  loadThirdPartyMessage,
  reloadAllMessages,
  removeCachedAttachment,
  startPaymentStatusTracking,
  upsertMessageStatusAttributes
} from "../../store/actions";
import { retryDataAfterFastLoginSessionExpirationSelector } from "../../store/reducers/messageGetStatus";
import { retrievingDataPreconditionStatusAction } from "../../store/actions/preconditions";
import { startProcessingMessageArchivingAction } from "../../store/actions/archiving";
import { handleDownloadAttachment } from "../handleDownloadAttachment";
import {
  handleClearAllAttachments,
  handleClearAttachment
} from "../handleClearAttachments";
import { handleLoadMessageData } from "../handleLoadMessageData";
import { handleLoadNextPageMessages } from "../handleLoadNextPageMessages";
import { handleLoadPreviousPageMessages } from "../handleLoadPreviousPageMessages";
import { handleReloadAllMessages } from "../handleReloadAllMessages";
import { handleLoadMessageById } from "../handleLoadMessageById";
import { handleLoadMessageDetails } from "../handleLoadMessageDetails";
import {
  handleMessageArchivingRestoring,
  raceUpsertMessageStatusAttributes
} from "../handleUpsertMessageStatusAttributes";
import { handleMessagePrecondition } from "../handleMessagePrecondition";
import { handleThirdPartyMessage } from "../handleThirdPartyMessage";
import { handlePaymentStatusForAnalyticsTracking } from "../handlePaymentStatusForAnalyticsTracking";
import { handlePaymentUpdateRequests } from "../handlePaymentUpdateRequests";
import { watchMessagesSaga } from "..";

describe("watchMessagesSaga", () => {

  it("should setup watchers and not retry if no retry data is present", () => {
    testSaga(watchMessagesSaga)
      .next()
      .takeLatest(loadNextPageMessages.request, handleLoadNextPageMessages)
      .next()
      .takeLatest(
        loadPreviousPageMessages.request,
        handleLoadPreviousPageMessages
      )
      .next()
      .takeLatest(reloadAllMessages.request, handleReloadAllMessages)
      .next()
      .takeEvery(loadMessageById.request, handleLoadMessageById)
      .next()
      .takeLatest(loadMessageDetails.request, handleLoadMessageDetails)
      .next()
      .takeLatest(
        retrievingDataPreconditionStatusAction,
        handleMessagePrecondition
      )
      .next()
      .takeLatest(loadThirdPartyMessage.request, handleThirdPartyMessage)
      .next()
      .takeEvery(
        upsertMessageStatusAttributes.request,
        raceUpsertMessageStatusAttributes
      )
      .next()
      .takeLatest(
        startProcessingMessageArchivingAction,
        handleMessageArchivingRestoring
      )
      .next()
      .takeLatest(downloadAttachment.request, handleDownloadAttachment)
      .next()
      .fork(handlePaymentUpdateRequests)
      .next()
      .takeEvery(removeCachedAttachment, handleClearAttachment)
      .next()
      .takeEvery(clearCache, handleClearAllAttachments)
      .next()
      .takeEvery(logoutSuccess, handleClearAllAttachments)
      .next()
      .takeLatest(
        startPaymentStatusTracking,
        handlePaymentStatusForAnalyticsTracking
      )
      .next()
      .takeLatest(getMessageDataAction.request, handleLoadMessageData)
      .next()
      .select(retryDataAfterFastLoginSessionExpirationSelector)
      .next(undefined) // Simulate no retry data
      .isDone();
  });

  it("should setup watchers and retry if retry data is present", () => {
    const retryData = {
      messageId: "test-message-id",
      fromPushNotification: false
    };

    testSaga(watchMessagesSaga)
      .next()
      .takeLatest(loadNextPageMessages.request, handleLoadNextPageMessages)
      .next()
      .takeLatest(
        loadPreviousPageMessages.request,
        handleLoadPreviousPageMessages
      )
      .next()
      .takeLatest(reloadAllMessages.request, handleReloadAllMessages)
      .next()
      .takeEvery(loadMessageById.request, handleLoadMessageById)
      .next()
      .takeLatest(loadMessageDetails.request, handleLoadMessageDetails)
      .next()
      .takeLatest(
        retrievingDataPreconditionStatusAction,
        handleMessagePrecondition
      )
      .next()
      .takeLatest(loadThirdPartyMessage.request, handleThirdPartyMessage)
      .next()
      .takeEvery(
        upsertMessageStatusAttributes.request,
        raceUpsertMessageStatusAttributes
      )
      .next()
      .takeLatest(
        startProcessingMessageArchivingAction,
        handleMessageArchivingRestoring
      )
      .next()
      .takeLatest(downloadAttachment.request, handleDownloadAttachment)
      .next()
      .fork(handlePaymentUpdateRequests)
      .next()
      .takeEvery(removeCachedAttachment, handleClearAttachment)
      .next()
      .takeEvery(clearCache, handleClearAllAttachments)
      .next()
      .takeEvery(logoutSuccess, handleClearAllAttachments)
      .next()
      .takeLatest(
        startPaymentStatusTracking,
        handlePaymentStatusForAnalyticsTracking
      )
      .next()
      .takeLatest(getMessageDataAction.request, handleLoadMessageData)
      .next()
      .select(retryDataAfterFastLoginSessionExpirationSelector)
      .next(retryData) // Simulate retry data is present
      .put(getMessageDataAction.request(retryData))
      .next()
      .isDone();
  });
});

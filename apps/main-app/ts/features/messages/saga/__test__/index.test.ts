import { testSaga } from "redux-saga-test-plan";

import { watchMessagesSaga } from "..";
import { logoutSuccess } from "../../../authentication/common/store/actions";
import { clearCache } from "../../../settings/common/store/actions";
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
  setMessageSagasRegisteredAction,
  startPaymentStatusTracking,
  upsertMessageStatusAttributes
} from "../../store/actions";
import { startProcessingMessageArchivingAction } from "../../store/actions/archiving";
import { retrievingDataPreconditionStatusAction } from "../../store/actions/preconditions";
import { retryDataAfterFastLoginSessionExpirationSelector } from "../../store/reducers/messageGetStatus";
import {
  handleClearAllAttachments,
  handleClearAttachment
} from "../handleClearAttachments";
import { handleDownloadAttachment } from "../handleDownloadAttachment";
import { handleLoadMessageById } from "../handleLoadMessageById";
import { handleLoadMessageData } from "../handleLoadMessageData";
import { handleLoadMessageDetails } from "../handleLoadMessageDetails";
import { handleLoadNextPageMessages } from "../handleLoadNextPageMessages";
import { handleLoadPreviousPageMessages } from "../handleLoadPreviousPageMessages";
import { handleMessagePrecondition } from "../handleMessagePrecondition";
import { handlePaymentStatusForAnalyticsTracking } from "../handlePaymentStatusForAnalyticsTracking";
import { handlePaymentUpdateRequests } from "../handlePaymentUpdateRequests";
import { handleReloadAllMessages } from "../handleReloadAllMessages";
import { handleThirdPartyMessage } from "../handleThirdPartyMessage";
import {
  handleMessageArchivingRestoring,
  raceUpsertMessageStatusAttributes
} from "../handleUpsertMessageStatusAttributes";

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
      .put(setMessageSagasRegisteredAction())
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
      .put(setMessageSagasRegisteredAction())
      .next()
      .select(retryDataAfterFastLoginSessionExpirationSelector)
      .next(retryData) // Simulate retry data is present
      .put(getMessageDataAction.request(retryData))
      .next()
      .isDone();
  });
});

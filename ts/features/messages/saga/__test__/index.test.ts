import { testSaga } from "redux-saga-test-plan";
import { SessionToken } from "../../../../types/SessionToken";
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
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { retryDataAfterFastLoginSessionExpirationSelector } from "../../store/reducers/messageGetStatus";
import { BackendClient } from "../../../../api/backend";
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
  const backendClient = {
    getMessages: jest.fn(),
    getMessage: jest.fn(),
    getThirdPartyMessagePrecondition: jest.fn(),
    getThirdPartyMessage: jest.fn(),
    upsertMessageStatusAttributes: jest.fn(),
    getPaymentInfoV2: jest.fn()
  } as unknown as BackendClient;

  const bearerToken = "test-token" as SessionToken;
  const keyInfo = {} as KeyInfo;

  it("should setup watchers and not retry if no retry data is present", () => {
    testSaga(watchMessagesSaga, backendClient, bearerToken, keyInfo)
      .next()
      .takeLatest(
        loadNextPageMessages.request,
        handleLoadNextPageMessages,
        backendClient.getMessages
      )
      .next()
      .takeLatest(
        loadPreviousPageMessages.request,
        handleLoadPreviousPageMessages,
        backendClient.getMessages
      )
      .next()
      .takeLatest(
        reloadAllMessages.request,
        handleReloadAllMessages,
        backendClient.getMessages
      )
      .next()
      .takeEvery(
        loadMessageById.request,
        handleLoadMessageById,
        backendClient.getMessage
      )
      .next()
      .takeLatest(
        loadMessageDetails.request,
        handleLoadMessageDetails,
        backendClient.getMessage
      )
      .next()
      .takeLatest(
        retrievingDataPreconditionStatusAction,
        handleMessagePrecondition,
        backendClient.getThirdPartyMessagePrecondition
      )
      .next()
      .takeLatest(
        loadThirdPartyMessage.request,
        handleThirdPartyMessage,
        backendClient.getThirdPartyMessage
      )
      .next()
      .takeEvery(
        upsertMessageStatusAttributes.request,
        raceUpsertMessageStatusAttributes,
        backendClient.upsertMessageStatusAttributes
      )
      .next()
      .takeLatest(
        startProcessingMessageArchivingAction,
        handleMessageArchivingRestoring
      )
      .next()
      .takeLatest(
        downloadAttachment.request,
        handleDownloadAttachment,
        bearerToken,
        keyInfo
      )
      .next()
      .fork(handlePaymentUpdateRequests, backendClient.getPaymentInfoV2)
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

    testSaga(watchMessagesSaga, backendClient, bearerToken, keyInfo)
      .next()
      .takeLatest(
        loadNextPageMessages.request,
        handleLoadNextPageMessages,
        backendClient.getMessages
      )
      .next()
      .takeLatest(
        loadPreviousPageMessages.request,
        handleLoadPreviousPageMessages,
        backendClient.getMessages
      )
      .next()
      .takeLatest(
        reloadAllMessages.request,
        handleReloadAllMessages,
        backendClient.getMessages
      )
      .next()
      .takeEvery(
        loadMessageById.request,
        handleLoadMessageById,
        backendClient.getMessage
      )
      .next()
      .takeLatest(
        loadMessageDetails.request,
        handleLoadMessageDetails,
        backendClient.getMessage
      )
      .next()
      .takeLatest(
        retrievingDataPreconditionStatusAction,
        handleMessagePrecondition,
        backendClient.getThirdPartyMessagePrecondition
      )
      .next()
      .takeLatest(
        loadThirdPartyMessage.request,
        handleThirdPartyMessage,
        backendClient.getThirdPartyMessage
      )
      .next()
      .takeEvery(
        upsertMessageStatusAttributes.request,
        raceUpsertMessageStatusAttributes,
        backendClient.upsertMessageStatusAttributes
      )
      .next()
      .takeLatest(
        startProcessingMessageArchivingAction,
        handleMessageArchivingRestoring
      )
      .next()
      .takeLatest(
        downloadAttachment.request,
        handleDownloadAttachment,
        bearerToken,
        keyInfo
      )
      .next()
      .fork(handlePaymentUpdateRequests, backendClient.getPaymentInfoV2)
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

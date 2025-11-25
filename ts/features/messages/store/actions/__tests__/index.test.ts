import {
  addUserSelectedPaymentRptId,
  cancelGetMessageDataAction,
  cancelPaymentStatusTracking,
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  clearRequestedAttachmentDownload,
  downloadAttachment,
  getMessageDataAction,
  loadMessageById,
  loadMessageDetails,
  loadNextPageMessages,
  loadPreviousPageMessages,
  loadThirdPartyMessage,
  reloadAllMessages,
  removeCachedAttachment,
  requestAutomaticMessagesRefresh,
  resetGetMessageDataAction,
  setShownMessageCategoryAction,
  startPaymentStatusTracking,
  updatePaymentForMessage,
  upsertMessageStatusAttributes
} from "..";
import { PaymentInfoResponse } from "../../../../../../definitions/backend/PaymentInfoResponse";
import { Detail_v2Enum } from "../../../../../../definitions/backend/PaymentProblemJson";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { UIMessage, UIMessageDetails } from "../../../types";
import {
  MessagePaymentError,
  toGenericMessagePaymentError,
  toSpecificMessagePaymentError,
  toTimeoutMessagePaymentError
} from "../../../types/paymentErrors";
import {
  thirdPartyKind,
  ThirdPartyMessageUnion
} from "../../../types/thirdPartyById";

describe("index", () => {
  const messageId = "01JKAGGZTSQDR1GB5TYJ9PHXM6";
  const serviceId = "01JKAGWVQRFE1P8QAHZS743M90" as ServiceId;
  const tag = "A tag";
  const message = { title: "The title" } as UIMessage;
  const attachment = {
    id: "1",
    url: "https://an.url"
  } as ThirdPartyAttachment;
  const genericError: MessagePaymentError =
    toGenericMessagePaymentError("An error occurred");
  const specificError: MessagePaymentError = toSpecificMessagePaymentError(
    Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
  );
  const timeoutError: MessagePaymentError = toTimeoutMessagePaymentError();
  const paymentId = "00123456789001122334455667788";

  describe("getMessageDataAction.request", () =>
    [false, true].forEach(fromPushNotification =>
      it(`should construt the action with proper type and payload (fromPushNotification ${fromPushNotification})`, () => {
        const requestAction = getMessageDataAction.request({
          messageId,
          fromPushNotification
        });
        expect(requestAction.type).toBe("GET_MESSAGE_DATA_REQUEST");
        expect(requestAction.payload).toEqual({
          messageId,
          fromPushNotification
        });
      })
    ));

  describe("getMessageDataAction.success", () =>
    [false, true].forEach(containsAttachments =>
      [undefined, false, true].forEach(containsPayment =>
        [false, true].forEach(firstTimeOpening =>
          [false, true].forEach(hasFIMSCTA =>
            [false, true].forEach(hasRemoteContent =>
              [undefined, false, true].forEach(isLegacyGreenPass =>
                [false, true].forEach(isPNMessage =>
                  it(`should construt the action with proper type and payload (containsAttachments ${containsAttachments}) (containsPayment ${containsPayment}) (firstTimeOpening ${firstTimeOpening}) (hasFIMSCTA ${hasFIMSCTA}) (hasRemoteContent ${hasRemoteContent}) (isLegacyGreenPass ${isLegacyGreenPass}) (isPNMessage ${isPNMessage})`, () => {
                    const organizationName = "The organization name";
                    const organizationFiscalCode = "12345678901";
                    const serviceName = "The service name";
                    const createdAt = new Date(2025, 0, 1, 10, 30, 26);
                    const requestAction = getMessageDataAction.success({
                      containsAttachments,
                      containsPayment,
                      createdAt,
                      firstTimeOpening,
                      hasFIMSCTA,
                      hasRemoteContent,
                      isLegacyGreenPass,
                      isPNMessage,
                      messageId,
                      organizationFiscalCode,
                      organizationName,
                      serviceId,
                      serviceName
                    });
                    expect(requestAction.type).toBe("GET_MESSAGE_DATA_SUCCESS");
                    expect(requestAction.payload).toEqual({
                      containsAttachments,
                      containsPayment,
                      createdAt,
                      firstTimeOpening,
                      hasFIMSCTA,
                      hasRemoteContent,
                      isLegacyGreenPass,
                      isPNMessage,
                      messageId,
                      organizationFiscalCode,
                      organizationName,
                      serviceId,
                      serviceName
                    });
                  })
                )
              )
            )
          )
        )
      )
    ));

  describe("getMessageDataAction.failure", () =>
    (
      [
        "none",
        "paginatedMessage",
        "serviceDetails",
        "messageDetails",
        "preconditions",
        "thirdPartyMessageDetails",
        "readStatusUpdate"
      ] as const
    ).forEach(phase =>
      [undefined, false, true].forEach(blockedFromPushNotification =>
        it(`should construt the action with proper type and payload (phase ${phase}) (fromPushNotification ${blockedFromPushNotification})`, () => {
          const requestAction = getMessageDataAction.failure({
            blockedFromPushNotificationOpt: blockedFromPushNotification,
            phase
          });
          expect(requestAction.type).toBe("GET_MESSAGE_DATA_FAILURE");
          expect(requestAction.payload).toEqual({
            blockedFromPushNotificationOpt: blockedFromPushNotification,
            phase
          });
        })
      )
    ));

  describe("loadThirdPartyMessage.request", () => {
    it("should match expected type and payload", () => {
      const action = loadThirdPartyMessage.request({
        id: messageId,
        serviceId,
        tag
      });
      expect(action.type).toBe("THIRD_PARTY_MESSAGE_LOAD_REQUEST");
      expect(action.payload).toEqual({ id: messageId, serviceId, tag });
    });
  });
  describe("loadThirdPartyMessage.success", () => {
    const thirdPartyKindsMock = Object.values(thirdPartyKind);
    thirdPartyKindsMock.forEach(kind =>
      it(`should match expected type and payload and kind='${kind}'`, () => {
        const content = {
          kind,
          id: messageId as string
        } as ThirdPartyMessageUnion;
        const action = loadThirdPartyMessage.success({
          id: messageId,
          content
        });
        expect(action.type).toBe("THIRD_PARTY_MESSAGE_LOAD_SUCCESS");
        expect(action.payload).toEqual({ id: messageId, content });
      })
    );
  });
  describe("loadThirdPartyMessage.failure", () => {
    it("should match expected type and payload", () => {
      const error = Error("An error occurred");
      const action = loadThirdPartyMessage.failure({
        id: messageId,
        error
      });
      expect(action.type).toBe("THIRD_PARTY_MESSAGE_LOAD_FAILURE");
      expect(action.payload).toEqual({ id: messageId, error });
    });
  });

  describe("resetGetMessageDataAction", () => {
    it("should match expected type and payload", () => {
      const action = resetGetMessageDataAction();
      expect(action.type).toBe("GET_MESSAGE_DATA_RESET_REQUEST");
    });
  });

  describe("cancelGetMessageDataAction", () => {
    it("should match expected type and payload", () => {
      const action = cancelGetMessageDataAction();
      expect(action.type).toBe("GET_MESSAGE_DATA_CANCEL_REQUEST");
    });
  });

  describe("loadMessageById.request", () => {
    it("should match expected type and payload", () => {
      const action = loadMessageById.request({
        id: messageId
      });
      expect(action.type).toBe("MESSAGE_BY_ID_LOAD_REQUEST");
      expect(action.payload).toEqual({ id: messageId });
    });
  });
  describe("loadMessageById.success", () => {
    it("should match expected type and payload", () => {
      const action = loadMessageById.success(message);
      expect(action.type).toBe("MESSAGE_BY_ID_LOAD_SUCCESS");
      expect(action.payload).toEqual(message);
    });
  });
  describe("loadMessageById.failure", () => {
    it("should match expected type and payload", () => {
      const error = Error("An error occurred");
      const action = loadMessageById.failure({
        id: messageId,
        error
      });
      expect(action.type).toBe("MESSAGE_BY_ID_LOAD_FAILURE");
      expect(action.payload).toEqual({ id: messageId, error });
    });
  });

  describe("loadMessageDetails.request", () => {
    it("should match expected type and payload", () => {
      const action = loadMessageDetails.request({
        id: messageId
      });
      expect(action.type).toBe("MESSAGE_DETAILS_LOAD_REQUEST");
      expect(action.payload).toEqual({ id: messageId });
    });
  });
  describe("loadMessageDetails.success", () => {
    it("should match expected type and payload", () => {
      const messageDetails = {
        subject: "This is a message subject"
      } as UIMessageDetails;
      const action = loadMessageDetails.success(messageDetails);
      expect(action.type).toBe("MESSAGE_DETAILS_LOAD_SUCCESS");
      expect(action.payload).toEqual(messageDetails);
    });
  });
  describe("loadMessageDetails.failure", () => {
    it("should match expected type and payload", () => {
      const error = Error("An error occurred");
      const action = loadMessageDetails.failure({
        id: messageId,
        error
      });
      expect(action.type).toBe("MESSAGE_DETAILS_LOAD_FAILURE");
      expect(action.payload).toEqual({ id: messageId, error });
    });
  });

  describe("loadNextPageMessages.request", () => {
    [undefined, false, true].forEach(archived => {
      [false, true].forEach(fromUserAction => {
        it(`should match expected type and payload (archived ${archived}) (fromUserAction ${fromUserAction})`, () => {
          const pageSize = 12;
          const action = loadNextPageMessages.request({
            pageSize,
            cursor: messageId as string,
            filter: { getArchived: archived },
            fromUserAction
          });
          expect(action.type).toBe("MESSAGES_LOAD_NEXT_PAGE_REQUEST");
          expect(action.payload).toEqual({
            pageSize,
            cursor: messageId,
            filter: { getArchived: archived },
            fromUserAction
          });
        });
      });
    });
  });
  describe("loadNextPageMessages.success", () => {
    [undefined, false, true].forEach(archived => {
      [false, true].forEach(fromUserAction => {
        [undefined, messageId].forEach(next => {
          it(`should match expected type and payload (archived ${archived}) (fromUserAction ${fromUserAction}) (next ${next})`, () => {
            const action = loadNextPageMessages.success({
              messages: [],
              filter: { getArchived: archived },
              fromUserAction,
              pagination: { next }
            });
            expect(action.type).toBe("MESSAGES_LOAD_NEXT_PAGE_SUCCESS");
            expect(action.payload).toEqual({
              messages: [],
              filter: { getArchived: archived },
              fromUserAction,
              pagination: { next }
            });
          });
        });
      });
    });
  });
  describe("loadNextPageMessages.failure", () => {
    [undefined, false, true].forEach(archived => {
      it(`should match expected type and payload (archived ${archived})`, () => {
        const error = Error("An error occurred");
        const action = loadNextPageMessages.failure({
          error,
          filter: { getArchived: archived }
        });
        expect(action.type).toBe("MESSAGES_LOAD_NEXT_PAGE_FAILURE");
        expect(action.payload).toEqual({
          error,
          filter: { getArchived: archived }
        });
      });
    });
  });

  describe("loadPreviousPageMessages.request", () => {
    [undefined, false, true].forEach(archived => {
      [false, true].forEach(fromUserAction => {
        it(`should match expected type and payload (archived ${archived}) (fromUserAction ${fromUserAction})`, () => {
          const pageSize = 12;
          const action = loadPreviousPageMessages.request({
            pageSize,
            cursor: messageId as string,
            filter: { getArchived: archived },
            fromUserAction
          });
          expect(action.type).toBe("MESSAGES_LOAD_PREVIOUS_PAGE_REQUEST");
          expect(action.payload).toEqual({
            pageSize,
            cursor: messageId,
            filter: { getArchived: archived },
            fromUserAction
          });
        });
      });
    });
  });
  describe("loadPreviousPageMessages.success", () => {
    [undefined, false, true].forEach(archived => {
      [false, true].forEach(fromUserAction => {
        [undefined, messageId].forEach(previous => {
          it(`should match expected type and payload (archived ${archived}) (fromUserAction ${fromUserAction}) (previous ${previous})`, () => {
            const action = loadPreviousPageMessages.success({
              messages: [],
              filter: { getArchived: archived },
              fromUserAction,
              pagination: { previous }
            });
            expect(action.type).toBe("MESSAGES_LOAD_PREVIOUS_PAGE_SUCCESS");
            expect(action.payload).toEqual({
              messages: [],
              filter: { getArchived: archived },
              fromUserAction,
              pagination: { previous }
            });
          });
        });
      });
    });
  });
  describe("loadPreviousPageMessages.failure", () => {
    [undefined, false, true].forEach(archived => {
      it(`should match expected type and payload (archived ${archived})`, () => {
        const error = Error("An error occurred");
        const action = loadPreviousPageMessages.failure({
          error,
          filter: { getArchived: archived }
        });
        expect(action.type).toBe("MESSAGES_LOAD_PREVIOUS_PAGE_FAILURE");
        expect(action.payload).toEqual({
          error,
          filter: { getArchived: archived }
        });
      });
    });
  });

  describe("reloadAllMessages.request", () => {
    [undefined, false, true].forEach(archived => {
      [false, true].forEach(fromUserAction => {
        it(`should match expected type and payload (archived ${archived}) (fromUserAction ${fromUserAction})`, () => {
          const pageSize = 12;
          const action = reloadAllMessages.request({
            pageSize,
            filter: { getArchived: archived },
            fromUserAction
          });
          expect(action.type).toBe("MESSAGES_RELOAD_REQUEST");
          expect(action.payload).toEqual({
            pageSize,
            filter: { getArchived: archived },
            fromUserAction
          });
        });
      });
    });
  });
  describe("reloadAllMessages.success", () => {
    [undefined, false, true].forEach(archived => {
      [false, true].forEach(fromUserAction => {
        [undefined, messageId].forEach(previous => {
          [undefined, "01JWV8Q1WQ9AA7GFEMCF1311CC"].forEach(next => {
            it(`should match expected type and payload (archived ${archived}) (fromUserAction ${fromUserAction}) (previous ${previous}) (next ${next})`, () => {
              const action = reloadAllMessages.success({
                messages: [],
                filter: { getArchived: archived },
                fromUserAction,
                pagination: { previous, next }
              });
              expect(action.type).toBe("MESSAGES_RELOAD_SUCCESS");
              expect(action.payload).toEqual({
                messages: [],
                filter: { getArchived: archived },
                fromUserAction,
                pagination: { previous, next }
              });
            });
          });
        });
      });
    });
  });
  describe("reloadAllMessages.failure", () => {
    [undefined, false, true].forEach(archived => {
      it(`should match expected type and payload (archived ${archived})`, () => {
        const error = Error("An error occurred");
        const action = reloadAllMessages.failure({
          error,
          filter: { getArchived: archived }
        });
        expect(action.type).toBe("MESSAGES_RELOAD_FAILURE");
        expect(action.payload).toEqual({
          error,
          filter: { getArchived: archived }
        });
      });
    });
  });
  const updates = [
    { tag: "archiving" as const, isArchived: false },
    { tag: "archiving" as const, isArchived: true },
    { tag: "reading" as const },
    { tag: "bulk" as const, isArchived: false },
    { tag: "bulk" as const, isArchived: true }
  ];
  describe("upsertMessageStatusAttributes.request", () => {
    updates.forEach(update => {
      it(`should match expected type and payload (update ${JSON.stringify(
        update
      )})`, () => {
        const action = upsertMessageStatusAttributes.request({
          message,
          update
        });
        expect(action.type).toBe("UPSERT_MESSAGE_STATUS_ATTRIBUTES_REQUEST");
        expect(action.payload).toEqual({
          message,
          update
        });
      });
    });
  });
  describe("upsertMessageStatusAttributes.success", () => {
    updates.forEach(update => {
      it(`should match expected type and payload (update ${JSON.stringify(
        update
      )})`, () => {
        const action = upsertMessageStatusAttributes.success({
          message,
          update
        });
        expect(action.type).toBe("UPSERT_MESSAGE_STATUS_ATTRIBUTES_SUCCESS");
        expect(action.payload).toEqual({
          message,
          update
        });
      });
    });
  });
  describe("upsertMessageStatusAttributes.failure", () => {
    updates.forEach(update => {
      it(`should match expected type and payload (payload ${JSON.stringify(
        update
      )})`, () => {
        const error = Error("An error occurred");
        const action = upsertMessageStatusAttributes.failure({
          error,
          payload: { message, update }
        });
        expect(action.type).toBe("UPSERT_MESSAGE_STATUS_ATTRIBUTES_FAILURE");
        expect(action.payload).toEqual({
          error,
          payload: { message, update }
        });
      });
    });
  });

  describe("downloadAttachment.request", () => {
    [false, true].forEach(skipTracking => {
      it(`should match expected type and payload (skipTracking ${JSON.stringify(
        skipTracking
      )})`, () => {
        const action = downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: skipTracking,
          serviceId
        });
        expect(action.type).toBe("DOWNLOAD_ATTACHMENT_REQUEST");
        expect(action.payload).toEqual({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: skipTracking,
          serviceId
        });
      });
    });
  });
  describe("downloadAttachment.success", () => {
    it(`should match expected type and payload`, () => {
      const action = downloadAttachment.success({
        attachment,
        messageId,
        path: "/path"
      });
      expect(action.type).toBe("DOWNLOAD_ATTACHMENT_SUCCESS");
      expect(action.payload).toEqual({
        attachment,
        messageId,
        path: "/path"
      });
    });
  });
  describe("downloadAttachment.failure", () => {
    it(`should match expected type and payload`, () => {
      const error = Error("An error occurred");
      const action = downloadAttachment.failure({
        attachment,
        error,
        messageId
      });
      expect(action.type).toBe("DOWNLOAD_ATTACHMENT_FAILURE");
      expect(action.payload).toEqual({
        attachment,
        error,
        messageId
      });
    });
  });
  describe("downloadAttachment.cancel", () => {
    it(`should match expected type and payload`, () => {
      const action = downloadAttachment.cancel({
        attachment,
        messageId
      });
      expect(action.type).toBe("DOWNLOAD_ATTACHMENT_CANCEL");
      expect(action.payload).toEqual({
        attachment,
        messageId
      });
    });
  });

  describe("cancelPreviousAttachmentDownload", () => {
    it("should match expected type and payload", () => {
      const action = cancelPreviousAttachmentDownload();
      expect(action.type).toBe("CANCEL_PREVIOUS_ATTACHMENT_DOWNLOAD");
    });
  });

  describe("clearRequestedAttachmentDownload", () => {
    it("should match expected type and payload", () => {
      const action = clearRequestedAttachmentDownload();
      expect(action.type).toBe("CLEAR_REQUESTED_ATTACHMNET_DOWNLOAD");
    });
  });

  describe("removeCachedAttachment", () => {
    it("should match expected type and payload", () => {
      const action = removeCachedAttachment({
        attachment,
        messageId,
        path: "/path/attachment"
      });
      expect(action.type).toBe("REMOVE_CACHED_ATTACHMENT");
      expect(action.payload).toEqual({
        attachment,
        messageId,
        path: "/path/attachment"
      });
    });
  });

  describe("updatePaymentForMessage.request", () => {
    it(`should match expected type and payload`, () => {
      const action = updatePaymentForMessage.request({
        messageId,
        paymentId,
        serviceId
      });
      expect(action.type).toBe("UPDATE_PAYMENT_FOR_MESSAGE_REQUEST");
      expect(action.payload).toEqual({
        messageId,
        paymentId,
        serviceId
      });
    });
  });
  describe("updatePaymentForMessage.success", () => {
    it(`should match expected type and payload`, () => {
      const action = updatePaymentForMessage.success({
        messageId,
        paymentId,
        paymentData: {
          amount: 100
        } as PaymentInfoResponse,
        serviceId
      });
      expect(action.type).toBe("UPDATE_PAYMENT_FOR_MESSAGE_SUCCESS");
      expect(action.payload).toEqual({
        messageId,
        paymentId,
        paymentData: {
          amount: 100
        },
        serviceId
      });
    });
  });
  describe("updatePaymentForMessage.failure", () => {
    [genericError, specificError, timeoutError].forEach(reason => {
      it(`should match expected type and payload (reason ${JSON.stringify(
        reason
      )})`, () => {
        const action = updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason,
          serviceId
        });
        expect(action.type).toBe("UPDATE_PAYMENT_FOR_MESSAGE_FAILURE");
        expect(action.payload).toEqual({
          messageId,
          paymentId,
          reason,
          serviceId
        });
      });
    });
  });

  describe("cancelQueuedPaymentUpdates", () => {
    it("should match expected type and payload", () => {
      const action = cancelQueuedPaymentUpdates({ messageId });
      expect(action.type).toBe("CANCEL_QUEUED_PAYMENT_UPDATES");
      expect(action.payload).toEqual({ messageId });
    });
  });

  describe("startPaymentStatusTracking", () => {
    it("should match expected type and payload", () => {
      const action = startPaymentStatusTracking();
      expect(action.type).toBe("MESSAGES_START_TRACKING_PAYMENT_STATUS");
    });
  });

  describe("cancelPaymentStatusTracking", () => {
    it("should match expected type and payload", () => {
      const action = cancelPaymentStatusTracking();
      expect(action.type).toBe("MESSAGES_CANCEL_PAYMENT_STATUS_TRACKING");
    });
  });

  describe("addUserSelectedPaymentRptId", () => {
    it("should match expected type and payload", () => {
      const action = addUserSelectedPaymentRptId(paymentId);
      expect(action.type).toBe("MESSAGES_ADD_USER_SELECTED_PAYMENT_RPTID");
      expect(action.payload).toBe(paymentId);
    });
  });

  describe("setShownMessageCategoryAction", () => {
    (["INBOX", "ARCHIVE"] as const).forEach(category => {
      it(`should match expected type and payload (category ${category})`, () => {
        const action = setShownMessageCategoryAction(category);
        expect(action.type).toBe("SET_SHOWN_MESSAGE_CATEGORY");
        expect(action.payload).toBe(category);
      });
    });
  });

  describe("requestAutomaticMessagesRefresh", () => {
    (["INBOX", "ARCHIVE"] as const).forEach(category => {
      it(`should match expected type and payload (category ${category})`, () => {
        const action = requestAutomaticMessagesRefresh(category);
        expect(action.type).toBe("REQUEST_AUTOMATIC_MESSAGE_REFRESH");
        expect(action.payload).toBe(category);
      });
    });
  });
});

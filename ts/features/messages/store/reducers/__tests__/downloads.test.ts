import * as pot from "@pagopa/ts-commons/lib/pot";
import { mockPdfAttachment } from "../../../__mocks__/attachment";
import {
  DownloadAttachmentCancel,
  DownloadAttachmentError,
  DownloadAttachmentRequest,
  DownloadAttachmentSuccess,
  clearRequestedAttachmentDownload,
  downloadAttachment,
  removeCachedAttachment
} from "../../actions";
import {
  Downloads,
  INITIAL_STATE,
  downloadedMessageAttachmentSelector,
  downloadsReducer,
  requestedDownloadErrorSelector,
  isDownloadingMessageAttachmentSelector,
  isRequestedAttachmentDownloadSelector
} from "../downloads";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";

const path = "/path/attachment.pdf";

describe("downloadedMessageAttachmentSelector", () => {
  it("Should return undefined for an unmatching messageId", () => {
    const attachmentId = "1";
    const successDownload = {
      attachment: {
        id: attachmentId
      } as ThirdPartyAttachment,
      messageId: "01HMXFQ803Q8JGQECKQF0EX6KX",
      path: "randomPath"
    } as DownloadAttachmentSuccess;
    const downloadSuccessAction = downloadAttachment.success(successDownload);
    const downloadsState = downloadsReducer(
      INITIAL_STATE,
      downloadSuccessAction
    );
    const globalState = {
      entities: {
        messages: {
          downloads: downloadsState
        }
      }
    } as GlobalState;
    const messageId = "01HMXFE7192J01KNK02BJAPMBR";
    const downloadedAttachment = downloadedMessageAttachmentSelector(
      globalState,
      messageId,
      attachmentId
    );
    expect(downloadedAttachment).toBeUndefined();
  });
  it("Should return undefined for a matching messageId with an unmatching attachmentId", () => {
    const messageId = "01HMXFE7192J01KNK02BJAPMBR";
    const unrelatedAttachmentId = "2";
    const successDownload = {
      attachment: {
        id: unrelatedAttachmentId
      } as ThirdPartyAttachment,
      messageId,
      path: "randomPath"
    } as DownloadAttachmentSuccess;
    const downloadSuccessAction = downloadAttachment.success(successDownload);
    const downloadsState = downloadsReducer(
      INITIAL_STATE,
      downloadSuccessAction
    );
    const globalState = {
      entities: {
        messages: {
          downloads: downloadsState
        }
      }
    } as GlobalState;
    const attachmentId = "1";
    const downloadedAttachment = downloadedMessageAttachmentSelector(
      globalState,
      messageId,
      attachmentId
    );
    expect(downloadedAttachment).toBeUndefined();
  });
  it("Should return undefined for an attachment that is loading", () => {
    const messageId = "01HMXFE7192J01KNK02BJAPMBR";
    const attachmentId = "1";
    const uiAttachmentRequest = {
      messageId,
      attachment: { id: attachmentId } as ThirdPartyAttachment,
      skipMixpanelTrackingOnFailure: true
    } as DownloadAttachmentRequest;
    const downloadRequestAction =
      downloadAttachment.request(uiAttachmentRequest);
    const downloadsState = downloadsReducer(
      INITIAL_STATE,
      downloadRequestAction
    );
    const globalState = {
      entities: {
        messages: {
          downloads: downloadsState
        }
      }
    } as GlobalState;
    const downloadedAttachment = downloadedMessageAttachmentSelector(
      globalState,
      messageId,
      attachmentId
    );
    expect(downloadedAttachment).toBeUndefined();
  });
  it("Should return undefined for an attachment that got an error", () => {
    const messageId = "01HMXFE7192J01KNK02BJAPMBR";
    const attachmentId = "1";
    const failedDownload = {
      attachment: {
        id: attachmentId
      } as ThirdPartyAttachment,
      messageId,
      error: new Error("An error")
    } as DownloadAttachmentError;
    const downloadFailureAction = downloadAttachment.failure(failedDownload);
    const downloadsState = downloadsReducer(
      INITIAL_STATE,
      downloadFailureAction
    );
    const globalState = {
      entities: {
        messages: {
          downloads: downloadsState
        }
      }
    } as GlobalState;
    const downloadedAttachment = downloadedMessageAttachmentSelector(
      globalState,
      messageId,
      attachmentId
    );
    expect(downloadedAttachment).toBeUndefined();
  });
  it("Should return undefined for an attachment that was cancelled before finishing the download", () => {
    const messageId = "01HMXFE7192J01KNK02BJAPMBR";
    const attachmentId = "1";
    const uiAttachmentCancelled = {
      messageId,
      attachment: { id: attachmentId } as ThirdPartyAttachment
    } as DownloadAttachmentCancel;
    const downloadCancelAction = downloadAttachment.cancel(
      uiAttachmentCancelled
    );
    const downloadsState = downloadsReducer(
      INITIAL_STATE,
      downloadCancelAction
    );
    const globalState = {
      entities: {
        messages: {
          downloads: downloadsState
        }
      }
    } as GlobalState;
    const downloadedAttachment = downloadedMessageAttachmentSelector(
      globalState,
      messageId,
      attachmentId
    );
    expect(downloadedAttachment).toBeUndefined();
  });
  it("Should return undefined for an attachment that was removed by a removeCachedAttachment action", () => {
    const messageId = "01HMXFE7192J01KNK02BJAPMBR";
    const attachmentId = "1";
    const successDownload = {
      attachment: {
        id: attachmentId
      } as ThirdPartyAttachment,
      messageId,
      path: "randomPath"
    } as DownloadAttachmentSuccess;
    const removedCachedAttachmentAction =
      removeCachedAttachment(successDownload);
    const downloadsState = downloadsReducer(
      INITIAL_STATE,
      removedCachedAttachmentAction
    );
    const globalState = {
      entities: {
        messages: {
          downloads: downloadsState
        }
      }
    } as GlobalState;
    const downloadedAttachment = downloadedMessageAttachmentSelector(
      globalState,
      messageId,
      attachmentId
    );
    expect(downloadedAttachment).toBeUndefined();
  });
  it("Should return data for a matching downloaded attachment", () => {
    const messageId = "01HMXFE7192J01KNK02BJAPMBR";
    const attachmentId = "1";
    const downloadPath = "randomPath";
    const successDownload = {
      attachment: {
        id: attachmentId
      } as ThirdPartyAttachment,
      messageId,
      path: downloadPath
    } as DownloadAttachmentSuccess;
    const downloadSuccessAction = downloadAttachment.success(successDownload);
    const downloadsState = downloadsReducer(
      INITIAL_STATE,
      downloadSuccessAction
    );
    const globalState = {
      entities: {
        messages: {
          downloads: downloadsState
        }
      }
    } as GlobalState;
    const downloadedAttachment = downloadedMessageAttachmentSelector(
      globalState,
      messageId,
      attachmentId
    );
    expect(downloadedAttachment).toBeDefined();
    expect(downloadedAttachment?.attachment).toBeDefined();
    expect(downloadedAttachment?.attachment.id).toBe(attachmentId);
    expect(downloadedAttachment?.path).toBe(downloadPath);
  });
});

describe("downloadsReducer", () => {
  const messageId = "01HP08KKPY65CBF4TRPHGJJ1GT";
  const serviceId = "service0000001" as ServiceId;

  describe("given no download", () => {
    const initialState: Downloads = {
      statusById: {}
    };

    describe("when requesting an attachment", () => {
      const attachment = mockPdfAttachment;

      const afterRequestState = downloadsReducer(
        initialState,
        downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );

      it("then it returns pot.loading", () => {
        expect(
          pot.isLoading(
            afterRequestState.statusById[messageId]?.[attachment.id] ?? pot.none
          )
        ).toBeTruthy();
        expect(afterRequestState.requestedDownload).toBeDefined();
        expect(afterRequestState.requestedDownload?.messageId).toBe(messageId);
        expect(afterRequestState.requestedDownload?.attachmentId).toBe(
          attachment.id
        );
      });

      describe("and the request succeeds", () => {
        it("then it returns pot.some", () => {
          expect(
            pot.isSome(
              downloadsReducer(
                afterRequestState,
                downloadAttachment.success({
                  attachment,
                  messageId,
                  path
                })
              ).statusById[messageId]?.[attachment.id] ?? pot.none
            )
          ).toBeTruthy();
          expect(afterRequestState.requestedDownload).toBeDefined();
          expect(afterRequestState.requestedDownload?.messageId).toBe(
            messageId
          );
          expect(afterRequestState.requestedDownload?.attachmentId).toBe(
            attachment.id
          );
        });
      });

      describe("and the request fails", () => {
        it("then it returns pot.error", () => {
          expect(
            pot.isError(
              downloadsReducer(
                afterRequestState,
                downloadAttachment.failure({
                  attachment,
                  messageId,
                  error: new Error()
                })
              ).statusById[messageId]?.[attachment.id] ?? pot.none
            )
          ).toBeTruthy();
          expect(afterRequestState.requestedDownload).toBeDefined();
          expect(afterRequestState.requestedDownload?.messageId).toBe(
            messageId
          );
          expect(afterRequestState.requestedDownload?.attachmentId).toBe(
            attachment.id
          );
        });
      });
    });
  });

  describe("given a downloaded attachment", () => {
    const attachment = mockPdfAttachment;
    const initialState: Downloads = {
      statusById: {
        [messageId]: {
          [attachment.id]: pot.some({ attachment, path })
        }
      }
    };

    describe("when clearing the attachment", () => {
      it("then it returns pot.none", () => {
        expect(
          pot.isNone(
            downloadsReducer(
              initialState,
              removeCachedAttachment({ attachment, messageId, path })
            ).statusById[messageId]?.[attachment.id] ?? pot.none
          )
        ).toBeTruthy();
        expect(initialState.requestedDownload).toBeUndefined();
      });
    });
  });

  describe("given a downloading attachment", () => {
    const attachment = mockPdfAttachment;
    const initialState = downloadsReducer(
      undefined,
      downloadAttachment.request({
        attachment,
        messageId,
        skipMixpanelTrackingOnFailure: false,
        serviceId
      })
    );

    expect(initialState.requestedDownload).toBeDefined();
    expect(initialState.requestedDownload?.messageId).toBe(messageId);
    expect(initialState.requestedDownload?.attachmentId).toBe(attachment.id);

    it("Should return pot.none and clear the requestedDownload after a downloadAttachment.cancel action", () => {
      const cancelState = downloadsReducer(
        initialState,
        downloadAttachment.cancel({
          attachment,
          messageId
        })
      );
      const potNone = cancelState.statusById[messageId]?.[attachment.id];
      expect(potNone).toBeDefined();
      expect(pot.isNone(potNone!)).toBeTruthy();
      expect(cancelState.requestedDownload).toBeUndefined();
    });
    it("Should clear the requestedDownload after a clearRequestedAttachmentDownload action", () => {
      const cancelState = downloadsReducer(
        initialState,
        clearRequestedAttachmentDownload()
      );
      expect(cancelState.requestedDownload).toBeUndefined();
    });
  });

  describe("isDownloadingMessageAttachmentSelector", () => {
    it("should return false on initial state", () => {
      const initialState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        initialState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return true on a matching download", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        initialState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeTruthy();
    });
    it("should return false on a messageId-unmatching download", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        initialState,
        "01HNWPGF3TY9WQYGX5JYAW816W",
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return false on an attachmentId-unmatching download", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        initialState,
        messageId,
        "potato"
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return false on a successful downloaded attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const successState = appReducer(
        initialState,
        downloadAttachment.success({
          attachment: mockPdfAttachment,
          messageId,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        successState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return false on a failed downloaded attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          messageId,
          error: new Error("")
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        failureState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return false on a cancelled downloaded attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const cancelledState = appReducer(
        initialState,
        downloadAttachment.cancel({
          attachment: mockPdfAttachment,
          messageId
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        cancelledState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return true on a cleared stated", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const clearedState = appReducer(
        initialState,
        clearRequestedAttachmentDownload()
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        clearedState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeTruthy();
    });
  });

  describe("getRequestedDownloadErrorSelector", () => {
    it("should return undefined on initial state", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const error = requestedDownloadErrorSelector(
        initialState,
        messageId,
        mockPdfAttachment.id
      );
      expect(error).toBeUndefined();
    });
    it("should return undefined on a messageId-unmatching attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          messageId,
          error: new Error("download failed")
        })
      );
      const error = requestedDownloadErrorSelector(
        failureState,
        "01HNWQ5YDG02JFGFH9523AC04Z",
        mockPdfAttachment.id
      );
      expect(error).toBeUndefined();
    });
    it("should return undefined on an attachmentId-unmatching attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          messageId,
          error: new Error("download failed")
        })
      );
      const error = requestedDownloadErrorSelector(
        failureState,
        messageId,
        "potato"
      );
      expect(error).toBeUndefined();
    });
    it("should return the error on a failed attachment", () => {
      const downloadError = new Error("download failed");
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          messageId,
          error: downloadError
        })
      );
      const error = requestedDownloadErrorSelector(
        failureState,
        messageId,
        mockPdfAttachment.id
      );
      expect(error).toBeDefined();
      expect(error).toBe(downloadError);
    });
    it("should return undefined on a successful attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const successState = appReducer(
        initialState,
        downloadAttachment.success({
          attachment: mockPdfAttachment,
          messageId,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const error = requestedDownloadErrorSelector(
        successState,
        messageId,
        mockPdfAttachment.id
      );
      expect(error).toBeUndefined();
    });
    it("should return undefined on a cancelled attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const cancelledState = appReducer(
        initialState,
        downloadAttachment.cancel({
          attachment: mockPdfAttachment,
          messageId
        })
      );
      const error = requestedDownloadErrorSelector(
        cancelledState,
        messageId,
        mockPdfAttachment.id
      );
      expect(error).toBeUndefined();
    });
    it("should return undefined on a failed attachment after clear state", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          messageId,
          error: new Error("download failed")
        })
      );
      const clearState = appReducer(
        failureState,
        clearRequestedAttachmentDownload()
      );
      const error = requestedDownloadErrorSelector(
        clearState,
        messageId,
        mockPdfAttachment.id
      );
      expect(error).toBeUndefined();
    });
  });

  describe("isRequestedAttachmentDownloadSelector", () => {
    it("should return false on initial state", () => {
      const initialState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          initialState,
          messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeFalsy();
    });
    it("should return true on matching downloading attachment", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          downloadingAttachmentState,
          messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeTruthy();
    });
    it("should return false on an messageId-unmatching downloading attachment", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          downloadingAttachmentState,
          "01HNWNXS6G2Y86HEFQ3AYSQA1Q",
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeFalsy();
    });
    it("should return false on an attachmentId-unmatching downloading attachment", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          downloadingAttachmentState,
          messageId,
          "potato"
        );
      expect(isRequestedAttachmentDownload).toBeFalsy();
    });
    it("should return true on successful downloaded attachment", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const successfulDownloadState = appReducer(
        downloadingAttachmentState,
        downloadAttachment.success({
          attachment: mockPdfAttachment,
          messageId,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          successfulDownloadState,
          messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeTruthy();
    });
    it("should return true on failed downloaded attachment", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const failedDownloadState = appReducer(
        downloadingAttachmentState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          messageId,
          error: new Error("")
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          failedDownloadState,
          messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeTruthy();
    });
    it("should return false on matching cancelled attachment download", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const cancelledDownloadState = appReducer(
        downloadingAttachmentState,
        downloadAttachment.cancel({
          attachment: mockPdfAttachment,
          messageId
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          cancelledDownloadState,
          messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeFalsy();
    });
    it("should return false on clear requested download", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
        })
      );
      const clearRequestedDownloadState = appReducer(
        downloadingAttachmentState,
        clearRequestedAttachmentDownload()
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          clearRequestedDownloadState,
          messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeFalsy();
    });
  });
});

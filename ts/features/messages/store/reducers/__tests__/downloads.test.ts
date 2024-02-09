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
  downloadPotForMessageAttachmentSelector,
  downloadedMessageAttachmentSelector,
  downloadsReducer,
  hasErrorOccourredOnRequestedDownloadSelector,
  isDownloadingMessageAttachmentSelector,
  isRequestedAttachmentDownloadSelector
} from "../downloads";
import { UIMessageId } from "../../../types";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";

const path = "/path/attachment.pdf";

describe("downloadedMessageAttachmentSelector", () => {
  it("Should return undefined for an unmatching messageId", () => {
    const attachmentId = "1";
    const successDownload = {
      attachment: {
        id: attachmentId
      } as ThirdPartyAttachment,
      messageId: "01HMXFQ803Q8JGQECKQF0EX6KX" as UIMessageId,
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
    const messageId = "01HMXFE7192J01KNK02BJAPMBR" as UIMessageId;
    const downloadedAttachment = downloadedMessageAttachmentSelector(
      globalState,
      messageId,
      attachmentId
    );
    expect(downloadedAttachment).toBeUndefined();
  });
  it("Should return undefined for a matching messageId with an unmatching attachmentId", () => {
    const messageId = "01HMXFE7192J01KNK02BJAPMBR" as UIMessageId;
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
    const messageId = "01HMXFE7192J01KNK02BJAPMBR" as UIMessageId;
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
    const messageId = "01HMXFE7192J01KNK02BJAPMBR" as UIMessageId;
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
    const messageId = "01HMXFE7192J01KNK02BJAPMBR" as UIMessageId;
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
    const messageId = "01HMXFE7192J01KNK02BJAPMBR" as UIMessageId;
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
    const messageId = "01HMXFE7192J01KNK02BJAPMBR" as UIMessageId;
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
  const messageId = "01HP08KKPY65CBF4TRPHGJJ1GT" as UIMessageId;

  describe("given no download", () => {
    const initialState = {};

    describe("when requesting an attachment", () => {
      const attachment = mockPdfAttachment;

      const afterRequestState = downloadsReducer(
        initialState,
        downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );

      it("then it returns pot.loading", () => {
        expect(
          pot.isLoading(
            afterRequestState[messageId]?.[attachment.id] ?? pot.none
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
              )[messageId]?.[attachment.id] ?? pot.none
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
              )[messageId]?.[attachment.id] ?? pot.none
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
      [messageId]: {
        [attachment.id]: pot.some({ attachment, path })
      }
    };

    describe("when clearing the attachment", () => {
      it("then it returns pot.none", () => {
        expect(
          pot.isNone(
            downloadsReducer(
              initialState,
              removeCachedAttachment({ attachment, messageId, path })
            )[messageId]?.[attachment.id] ?? pot.none
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
        skipMixpanelTrackingOnFailure: false
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
      const potNone = cancelState[messageId]?.[attachment.id];
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        initialState,
        "01HNWPGF3TY9WQYGX5JYAW816W" as UIMessageId,
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
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

  describe("hasErrorOccourredOnMessageAttachmentDownloadSelector", () => {
    it("should return false on initial state", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        initialState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeFalsy();
    });
    it("should return false on a messageId-unmatching attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
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
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        failureState,
        "01HNWQ5YDG02JFGFH9523AC04Z" as UIMessageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeFalsy();
    });
    it("should return false on an attachmentId-unmatching attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
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
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        failureState,
        messageId,
        "potato"
      );
      expect(isError).toBeFalsy();
    });
    it("should return true on a failed attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
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
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        failureState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeTruthy();
    });
    it("should return false on a successful attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.success({
          attachment: mockPdfAttachment,
          messageId,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        failureState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeFalsy();
    });
    it("should return false on a cancelled attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.cancel({
          attachment: mockPdfAttachment,
          messageId
        })
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        failureState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeFalsy();
    });
    it("should return false on a failed attachment after clear state", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
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
      const clearState = appReducer(
        failureState,
        clearRequestedAttachmentDownload()
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        clearState,
        messageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeFalsy();
    });
  });

  describe("downloadPotForMessageAttachmentSelector", () => {
    it("should return pot.none on initial state", () => {
      const initialState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        initialState,
        messageId,
        mockPdfAttachment.id
      );
      expect(pot.isNone(downloadPot)).toBeTruthy();
    });
    it("should return pot.none on unmatching-messageId attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        initialState,
        "01HNWR6BGZ3M8FN9Y61XS37K8C" as UIMessageId,
        mockPdfAttachment.id
      );
      expect(pot.isNone(downloadPot)).toBeTruthy();
    });
    it("should return pot.none on unmatching-attachmentId attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        initialState,
        messageId,
        "potato"
      );
      expect(pot.isNone(downloadPot)).toBeTruthy();
    });
    it("should return pot.loading on a requested attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        initialState,
        messageId,
        mockPdfAttachment.id
      );
      expect(pot.isLoading(downloadPot)).toBeTruthy();
    });
    it("should return pot.some on a successful attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const successfulState = appReducer(
        initialState,
        downloadAttachment.success({
          attachment: mockPdfAttachment,
          messageId,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        successfulState,
        messageId,
        mockPdfAttachment.id
      );
      expect(pot.isSome(downloadPot)).toBeTruthy();
    });
    it("should return pot.error on a failed attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
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
      const downloadPot = downloadPotForMessageAttachmentSelector(
        failureState,
        messageId,
        mockPdfAttachment.id
      );
      expect(pot.isError(downloadPot)).toBeTruthy();
    });
    it("should return pot.error on a cancelled attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const cancelledState = appReducer(
        initialState,
        downloadAttachment.cancel({
          attachment: mockPdfAttachment,
          messageId
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        cancelledState,
        messageId,
        mockPdfAttachment.id
      );
      expect(pot.isNone(downloadPot)).toBeTruthy();
    });
    it("should return pot.error on a removed cached attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const cachedState = appReducer(
        initialState,
        removeCachedAttachment({
          attachment: mockPdfAttachment,
          messageId,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        cachedState,
        messageId,
        mockPdfAttachment.id
      );
      expect(pot.isNone(downloadPot)).toBeTruthy();
    });
    it("should return pot.some on a downloading attachment after clear requested download", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          attachment: mockPdfAttachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const clearRequestedState = appReducer(
        initialState,
        clearRequestedAttachmentDownload()
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        clearRequestedState,
        messageId,
        mockPdfAttachment.id
      );
      expect(pot.isLoading(downloadPot)).toBeTruthy();
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          downloadingAttachmentState,
          "01HNWNXS6G2Y86HEFQ3AYSQA1Q" as UIMessageId,
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
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
          skipMixpanelTrackingOnFailure: false
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

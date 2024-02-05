import * as pot from "@pagopa/ts-commons/lib/pot";
import { mockPdfAttachment } from "../../../__mocks__/attachment";
import {
  clearRequestedAttachmentDownload,
  downloadAttachment,
  removeCachedAttachment
} from "../../actions";
import {
  Download,
  DownloadError,
  Downloads,
  INITIAL_STATE,
  downloadPotForMessageAttachmentSelector,
  downloadedMessageAttachmentSelector,
  downloadsReducer,
  hasErrorOccourredOnRequestedDownloadSelector,
  isDownloadingMessageAttachmentSelector,
  isRequestedAttachmentDownloadSelector
} from "../downloads";
import {
  UIAttachment,
  UIAttachmentId,
  UIMessageId,
  WithSkipMixpanelTrackingOnFailure
} from "../../../types";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";

const path = "/path/attachment.pdf";

describe("downloadedMessageAttachmentSelector", () => {
  it("Should return undefined for an unmatching messageId", () => {
    const attachmentId = "1" as UIAttachmentId;
    const successDownload = {
      attachment: {
        messageId: "01HMXFQ803Q8JGQECKQF0EX6KX" as UIMessageId,
        id: attachmentId
      } as UIAttachment,
      path: "randomPath"
    } as Download;
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
        messageId,
        id: unrelatedAttachmentId
      } as UIAttachment,
      path: "randomPath"
    } as Download;
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
    const attachmentId = "1" as UIAttachmentId;
    const downloadedAttachment = downloadedMessageAttachmentSelector(
      globalState,
      messageId,
      attachmentId
    );
    expect(downloadedAttachment).toBeUndefined();
  });
  it("Should return undefined for an attachment that is loading", () => {
    const messageId = "01HMXFE7192J01KNK02BJAPMBR" as UIMessageId;
    const attachmentId = "1" as UIAttachmentId;
    const uiAttachmentRequest = {
      messageId,
      id: attachmentId,
      skipMixpanelTrackingOnFailure: true
    } as WithSkipMixpanelTrackingOnFailure<UIAttachment>;
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
    const attachmentId = "1" as UIAttachmentId;
    const failedDownload = {
      attachment: {
        messageId,
        id: attachmentId
      } as UIAttachment,
      error: new Error("An error")
    } as DownloadError<Error>;
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
    const attachmentId = "1" as UIAttachmentId;
    const uiAttachmentCancelled = {
      messageId,
      id: attachmentId
    } as UIAttachment;
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
    const attachmentId = "1" as UIAttachmentId;
    const successDownload = {
      attachment: {
        messageId,
        id: attachmentId
      } as UIAttachment,
      path: "randomPath"
    } as Download;
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
    const attachmentId = "1" as UIAttachmentId;
    const downloadPath = "randomPath";
    const successDownload = {
      attachment: {
        messageId,
        id: attachmentId
      } as UIAttachment,
      path: downloadPath
    } as Download;
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
    expect(downloadedAttachment?.attachment.messageId).toBe(messageId);
    expect(downloadedAttachment?.attachment.id).toBe(attachmentId);
    expect(downloadedAttachment?.path).toBe(downloadPath);
  });
});

describe("downloadsReducer", () => {
  describe("given no download", () => {
    const initialState = {};

    describe("when requesting an attachment", () => {
      const attachment = mockPdfAttachment;

      const afterRequestState = downloadsReducer(
        initialState,
        downloadAttachment.request({
          ...attachment,
          skipMixpanelTrackingOnFailure: false
        })
      );

      it("then it returns pot.loading", () => {
        expect(
          pot.isLoading(
            afterRequestState[attachment.messageId]?.[attachment.id] ?? pot.none
          )
        ).toBeTruthy();
        expect(afterRequestState.requestedDownload).toBeDefined();
        expect(afterRequestState.requestedDownload?.messageId).toBe(
          attachment.messageId
        );
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
                  path
                })
              )[attachment.messageId]?.[attachment.id] ?? pot.none
            )
          ).toBeTruthy();
          expect(afterRequestState.requestedDownload).toBeDefined();
          expect(afterRequestState.requestedDownload?.messageId).toBe(
            attachment.messageId
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
                  error: new Error()
                })
              )[attachment.messageId]?.[attachment.id] ?? pot.none
            )
          ).toBeTruthy();
          expect(afterRequestState.requestedDownload).toBeDefined();
          expect(afterRequestState.requestedDownload?.messageId).toBe(
            attachment.messageId
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
      [attachment.messageId]: {
        [attachment.id]: pot.some({ attachment, path })
      }
    };

    describe("when clearing the attachment", () => {
      it("then it returns pot.none", () => {
        expect(
          pot.isNone(
            downloadsReducer(
              initialState,
              removeCachedAttachment({ attachment, path })
            )[attachment.messageId]?.[attachment.id] ?? pot.none
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
        ...attachment,
        skipMixpanelTrackingOnFailure: false
      })
    );

    expect(initialState.requestedDownload).toBeDefined();
    expect(initialState.requestedDownload?.messageId).toBe(
      attachment.messageId
    );
    expect(initialState.requestedDownload?.attachmentId).toBe(attachment.id);

    it("Should return pot.none and clear the requestedDownload after a downloadAttachment.cancel action", () => {
      const cancelState = downloadsReducer(
        initialState,
        downloadAttachment.cancel({
          ...attachment
        })
      );
      const potNone = cancelState[attachment.messageId]?.[attachment.id];
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
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return true on a matching download", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        initialState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeTruthy();
    });
    it("should return false on a messageId-unmatching download", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
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
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        initialState,
        mockPdfAttachment.messageId,
        "potato"
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return false on a successful downloaded attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const successState = appReducer(
        initialState,
        downloadAttachment.success({
          attachment: mockPdfAttachment,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        successState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return false on a failed downloaded attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          error: new Error("")
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        failureState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return false on a cancelled downloaded attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const cancelledState = appReducer(
        initialState,
        downloadAttachment.cancel({
          ...mockPdfAttachment
        })
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        cancelledState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(isDownloadingMessage).toBeFalsy();
    });
    it("should return true on a cleared stated", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const clearedState = appReducer(
        initialState,
        clearRequestedAttachmentDownload()
      );
      const isDownloadingMessage = isDownloadingMessageAttachmentSelector(
        clearedState,
        mockPdfAttachment.messageId,
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
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        initialState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeFalsy();
    });
    it("should return false on a messageId-unmatching attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
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
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          error: new Error("")
        })
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        failureState,
        mockPdfAttachment.messageId,
        "potato"
      );
      expect(isError).toBeFalsy();
    });
    it("should return true on a failed attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          error: new Error("")
        })
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        failureState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeTruthy();
    });
    it("should return false on a successful attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.success({
          attachment: mockPdfAttachment,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        failureState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeFalsy();
    });
    it("should return false on a cancelled attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.cancel({
          ...mockPdfAttachment
        })
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        failureState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(isError).toBeFalsy();
    });
    it("should return false on a failed attachment after clear state", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          error: new Error("")
        })
      );
      const clearState = appReducer(
        failureState,
        clearRequestedAttachmentDownload()
      );
      const isError = hasErrorOccourredOnRequestedDownloadSelector(
        clearState,
        mockPdfAttachment.messageId,
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
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(pot.isNone(downloadPot)).toBeTruthy();
    });
    it("should return pot.none on unmatching-messageId attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
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
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        initialState,
        mockPdfAttachment.messageId,
        "potato" as UIAttachmentId
      );
      expect(pot.isNone(downloadPot)).toBeTruthy();
    });
    it("should return pot.loading on a requested attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        initialState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(pot.isLoading(downloadPot)).toBeTruthy();
    });
    it("should return pot.some on a successful attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const successfulState = appReducer(
        initialState,
        downloadAttachment.success({
          attachment: mockPdfAttachment,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        successfulState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(pot.isSome(downloadPot)).toBeTruthy();
    });
    it("should return pot.error on a failed attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failureState = appReducer(
        initialState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          error: new Error("")
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        failureState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(pot.isError(downloadPot)).toBeTruthy();
    });
    it("should return pot.error on a cancelled attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const cancelledState = appReducer(
        initialState,
        downloadAttachment.cancel({
          ...mockPdfAttachment
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        cancelledState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(pot.isNone(downloadPot)).toBeTruthy();
    });
    it("should return pot.error on a removed cached attachment", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const cachedState = appReducer(
        initialState,
        removeCachedAttachment({
          attachment: mockPdfAttachment,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        cachedState,
        mockPdfAttachment.messageId,
        mockPdfAttachment.id
      );
      expect(pot.isNone(downloadPot)).toBeTruthy();
    });
    it("should return pot.some on a downloading attachment after clear requested download", () => {
      const initialState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const clearRequestedState = appReducer(
        initialState,
        clearRequestedAttachmentDownload()
      );
      const downloadPot = downloadPotForMessageAttachmentSelector(
        clearRequestedState,
        mockPdfAttachment.messageId,
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
          mockPdfAttachment.messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeFalsy();
    });
    it("should return true on matching downloading attachment", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          downloadingAttachmentState,
          mockPdfAttachment.messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeTruthy();
    });
    it("should return false on an messageId-unmatching downloading attachment", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
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
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          downloadingAttachmentState,
          mockPdfAttachment.messageId,
          "potato"
        );
      expect(isRequestedAttachmentDownload).toBeFalsy();
    });
    it("should return true on successful downloaded attachment", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const successfulDownloadState = appReducer(
        downloadingAttachmentState,
        downloadAttachment.success({
          attachment: mockPdfAttachment,
          path: `file:///${mockPdfAttachment.id}.pdf`
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          successfulDownloadState,
          mockPdfAttachment.messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeTruthy();
    });
    it("should return true on failed downloaded attachment", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const failedDownloadState = appReducer(
        downloadingAttachmentState,
        downloadAttachment.failure({
          attachment: mockPdfAttachment,
          error: new Error("")
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          failedDownloadState,
          mockPdfAttachment.messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeTruthy();
    });
    it("should return false on matching cancelled attachment download", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
      const cancelledDownloadState = appReducer(
        downloadingAttachmentState,
        downloadAttachment.cancel({
          ...mockPdfAttachment
        })
      );
      const isRequestedAttachmentDownload =
        isRequestedAttachmentDownloadSelector(
          cancelledDownloadState,
          mockPdfAttachment.messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeFalsy();
    });
    it("should return false on clear requested download", () => {
      const downloadingAttachmentState = appReducer(
        undefined,
        downloadAttachment.request({
          ...mockPdfAttachment,
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
          mockPdfAttachment.messageId,
          mockPdfAttachment.id
        );
      expect(isRequestedAttachmentDownload).toBeFalsy();
    });
  });
});

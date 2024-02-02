import * as pot from "@pagopa/ts-commons/lib/pot";
import { mockPdfAttachment } from "../../../__mocks__/attachment";
import { downloadAttachment, removeCachedAttachment } from "../../actions";
import {
  Download,
  DownloadError,
  Downloads,
  INITIAL_STATE,
  downloadedMessageAttachmentSelector,
  downloadsReducer
} from "../downloads";
import {
  UIAttachment,
  UIAttachmentId,
  UIMessageId,
  WithSkipMixpanelTrackingOnFailure
} from "../../../types";
import { GlobalState } from "../../../../../store/reducers/types";

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
      });
    });
  });
});

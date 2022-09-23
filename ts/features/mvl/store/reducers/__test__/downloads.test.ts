import * as pot from "@pagopa/ts-commons/lib/pot";
import { MvlDownloads, mvlDownloadsReducer } from "../downloads";
import {
  mvlAttachmentDownload,
  mvlRemoveCachedAttachment
} from "../../actions/downloads";
import { mvlMockPdfAttachment } from "../../../types/__mock__/mvlMock";

const path = "/path/attachment.pdf";

describe("mvlDownloadsReducer", () => {
  describe("given no download", () => {
    const initialState = {};

    describe("when requesting an attachment", () => {
      const attachment = mvlMockPdfAttachment;

      const afterRequestState = mvlDownloadsReducer(
        initialState,
        mvlAttachmentDownload.request(attachment)
      );

      it("then it returns pot.loading", () => {
        expect(
          pot.isLoading(
            afterRequestState[attachment.messageId][attachment.id] ?? pot.none
          )
        ).toBeTruthy();
      });

      describe("and the request succeeds", () => {
        it("then it returns pot.some", () => {
          expect(
            pot.isSome(
              mvlDownloadsReducer(
                afterRequestState,
                mvlAttachmentDownload.success({
                  attachment,
                  path
                })
              )[attachment.messageId][attachment.id] ?? pot.none
            )
          ).toBeTruthy();
        });
      });

      describe("and the request fails", () => {
        it("then it returns pot.error", () => {
          expect(
            pot.isError(
              mvlDownloadsReducer(
                afterRequestState,
                mvlAttachmentDownload.failure({
                  attachment,
                  error: new Error()
                })
              )[attachment.messageId][attachment.id] ?? pot.none
            )
          ).toBeTruthy();
        });
      });

      describe("and the request gets cancelled", () => {
        it("then it returns pot.none", () => {
          expect(
            pot.isNone(
              mvlDownloadsReducer(
                afterRequestState,
                mvlAttachmentDownload.cancel(attachment)
              )[attachment.messageId][attachment.id] ?? pot.none
            )
          ).toBeTruthy();
        });
      });
    });
  });

  describe("given a downloaded attachment", () => {
    const attachment = mvlMockPdfAttachment;
    const initialState: MvlDownloads = {
      [attachment.messageId]: {
        [attachment.id]: pot.some({ attachment, path })
      }
    };

    describe("when clearing the attachment", () => {
      it("then it returns pot.none", () => {
        expect(
          pot.isNone(
            mvlDownloadsReducer(
              initialState,
              mvlRemoveCachedAttachment({ attachment, path })
            )[attachment.messageId][attachment.id] ?? pot.none
          )
        ).toBeTruthy();
      });
    });
  });
});

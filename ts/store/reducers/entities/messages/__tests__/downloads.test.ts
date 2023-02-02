import * as pot from "@pagopa/ts-commons/lib/pot";
import { mockPdfAttachment } from "../../../../../__mocks__/attachment";
import {
  downloadAttachment,
  removeCachedAttachment
} from "../../../../actions/messages";
import { Downloads, downloadsReducer } from "../downloads";

const path = "/path/attachment.pdf";

describe("downloadsReducer", () => {
  describe("given no download", () => {
    const initialState = {};

    describe("when requesting an attachment", () => {
      const attachment = mockPdfAttachment;

      const afterRequestState = downloadsReducer(
        initialState,
        downloadAttachment.request(attachment)
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
              downloadsReducer(
                afterRequestState,
                downloadAttachment.success({
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
              downloadsReducer(
                afterRequestState,
                downloadAttachment.failure({
                  attachment,
                  error: new Error()
                })
              )[attachment.messageId][attachment.id] ?? pot.none
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
            )[attachment.messageId][attachment.id] ?? pot.none
          )
        ).toBeTruthy();
      });
    });
  });
});

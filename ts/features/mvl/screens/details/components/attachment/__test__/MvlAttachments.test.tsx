import { render } from "@testing-library/react-native";
import React from "react";
import I18n from "../../../../../../../i18n";
import { formatByte } from "../../../../../../../types/digitalInformationUnit";
import {
  mvlMockOtherAttachment,
  mvlMockPdfAttachment
} from "../../../../../types/__mock__/mvlMock";
import { MvlAttachments } from "../MvlAttachments";

jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({
    present: jest.fn()
  })
}));

describe("MvlAttachments", () => {
  jest.useFakeTimers();

  describe("When there are no attachments", () => {
    it("Shouldn't be rendered", () => {
      const res = renderComponent({ attachments: [] });
      expect(res.toJSON()).toBeNull();
    });
  });

  describe("When there are at least one attachment", () => {
    describe("And there are a pdf and another file as attachments", () => {
      it("Should render the title", () => {
        const res = renderComponent({
          attachments: [mvlMockPdfAttachment, mvlMockOtherAttachment]
        });
        expect(
          res.queryByText(I18n.t("features.mvl.details.attachments.title"))
        ).not.toBeNull();
      });
      it("Should render two Items", () => {
        const res = renderComponent({
          attachments: [mvlMockPdfAttachment, mvlMockOtherAttachment]
        });
        expect(
          res.queryByText(mvlMockPdfAttachment.displayName)
        ).not.toBeNull();
        if (mvlMockPdfAttachment.size) {
          expect(
            res.queryByText(formatByte(mvlMockPdfAttachment.size))
          ).not.toBeNull();
        }
        expect(
          res.queryByText(mvlMockOtherAttachment.displayName)
        ).not.toBeNull();
        if (mvlMockOtherAttachment.size) {
          expect(
            res.queryByText(formatByte(mvlMockOtherAttachment.size))
          ).not.toBeNull();
        }
      });
    });
  });
});

const renderComponent = (props: React.ComponentProps<typeof MvlAttachments>) =>
  render(<MvlAttachments {...props} />);

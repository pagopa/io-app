import React from "react";
import { NavigationParams } from "react-navigation";
import { createStore } from "redux";
import I18n from "../../../../../../../i18n";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { formatByte } from "../../../../../../../types/digitalInformationUnit";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import MVL_ROUTES from "../../../../../navigation/routes";
import {
  mvlMockOtherAttachment,
  mvlMockPdfAttachment
} from "../../../../../types/__mock__/mvlMock";
import { MvlAttachments } from "../MvlAttachments";

describe("MvlAttachments", () => {
  jest.useFakeTimers();

  describe("When there are no attachments", () => {
    it("Shouldn't be rendered", () => {
      const res = renderComponent({ attachments: [] });

      expect(
        res.queryByText(I18n.t("features.mvl.details.attachments.title"))
      ).toBeNull();
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

const renderComponent = (
  props: React.ComponentProps<typeof MvlAttachments>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <MvlAttachments {...props} />,
    MVL_ROUTES.DETAILS,
    {},
    store
  );
};

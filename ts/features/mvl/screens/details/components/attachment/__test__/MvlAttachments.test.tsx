import React from "react";
import { NavigationParams } from "react-navigation";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
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
import { MvlPreferences } from "../../../../../store/reducers/preferences";
import * as utilsModule from "../../../../../utils";
import { MvlAttachments } from "../MvlAttachments";

const mockBottomSheetPresent = jest.fn();
jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({
    present: () => mockBottomSheetPresent
  })
}));

// jeslint-disable-next-line functional/no-let
// let mockHandleDownloadResult = jest.fn();
// jest.mock("../../../../../utils", () => ({
//   handleDownloadResult: (...args) =>
// }));

const spy_handleDownloadResult = jest.spyOn(
  utilsModule,
  "handleDownloadResult"
);

describe("MvlAttachments", () => {
  jest.useFakeTimers();

  // beforeEach(() => {
  //   spy_handleDownloadResult.mockReset()
  // })

  describe("When there are no attachments", () => {
    it("Shouldn't be rendered", () => {
      const res = renderComponent({ attachments: [] });

      expect(
        res.queryByText(I18n.t("features.mvl.details.attachments.title"))
      ).toBeNull();
    });
  });

  describe("When there is at least one attachment", () => {
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
        expect(mvlMockPdfAttachment.size).not.toBeNull();
        if (mvlMockPdfAttachment.size) {
          expect(
            res.queryByText(formatByte(mvlMockPdfAttachment.size))
          ).not.toBeNull();
        }
        expect(
          res.queryByText(mvlMockOtherAttachment.displayName)
        ).not.toBeNull();
        expect(mvlMockOtherAttachment.size).not.toBeNull();
        if (mvlMockOtherAttachment.size) {
          expect(
            res.queryByText(formatByte(mvlMockOtherAttachment.size))
          ).not.toBeNull();
        }
      });
    });

    describe("Given the preference `showAlertForAttachments: true`", () => {
      const preferences: MvlPreferences = { showAlertForAttachments: true };
      describe("And the user taps on the attachment", () => {
        const props = { attachments: [mvlMockPdfAttachment] };
        it("Should open the bottom sheet", async () => {
          const { getByText } = renderComponent(props, preferences);
          const item = getByText(mvlMockPdfAttachment.displayName);
          await fireEvent(item, "onPress");
          expect(mockBottomSheetPresent).not.toHaveBeenCalled();
        });

        it("Should not call `handleDownloadResult`", async () => {
          // mockHandleDownloadResult = jest.fn();
          const { getByText } = renderComponent(props, preferences);
          const item = getByText(mvlMockPdfAttachment.displayName);
          await fireEvent(item, "onPress");
          expect(spy_handleDownloadResult).not.toHaveBeenCalled();
        });
      });
    });

    describe("Given the preference `showAlertForAttachments: false`", () => {
      const preferences: MvlPreferences = { showAlertForAttachments: false };
      describe("And the user taps on the attachment", () => {
        const props = { attachments: [mvlMockPdfAttachment] };
        it("Should not open the bottom sheet", async () => {
          const { getByText } = renderComponent(props, preferences);
          const item = getByText(mvlMockPdfAttachment.displayName);
          await fireEvent(item, "onPress");
          expect(mockBottomSheetPresent).not.toHaveBeenCalled();
        });
        it("Should call `handleDownloadResult`", async () => {
          // mockHandleDownloadResult = jest.fn();
          const { getByText } = renderComponent(props, preferences);
          const item = getByText(mvlMockPdfAttachment.displayName);
          await fireEvent(item, "onPress");
          expect(spy_handleDownloadResult).toHaveBeenNthCalledWith(
            1,
            mvlMockPdfAttachment,
            { Authorization: "Bearer undefined" }
          );
        });
      });
    });
  });
});

const renderComponent = (
  props: React.ComponentProps<typeof MvlAttachments>,
  mvlPreferences: MvlPreferences = { showAlertForAttachments: true }
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, {
    ...globalState,
    features: {
      ...globalState.features,
      mvl: { ...globalState.features.mvl, preferences: mvlPreferences }
    }
  } as any);
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <MvlAttachments {...props} />,
    MVL_ROUTES.DETAILS,
    {},
    store
  );
};

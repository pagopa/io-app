import React from "react";

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
import { MvlAttachments } from "../MvlAttachments";
import { useDownloadAttachmentConfirmationBottomSheet } from "../DownloadAttachmentConfirmationBottomSheet";
import * as platform from "../../../../../../../utils/platform";
import { MvlAttachment } from "../../../../../types/mvlData";

jest.mock("../../../../../../../utils/platform");

const mockBsConfig = (_: MvlAttachment) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const react = require("react-native");

  return {
    present: jest.fn(),
    bottomSheet: react.View,
    dismiss: jest.fn()
  };
};

const mockBottomSheetPresent = jest.fn<
  ReturnType<typeof useDownloadAttachmentConfirmationBottomSheet>,
  Parameters<typeof useDownloadAttachmentConfirmationBottomSheet>
>(mockBsConfig);
jest.mock("../DownloadAttachmentConfirmationBottomSheet", () => ({
  useDownloadAttachmentConfirmationBottomSheet: (
    ...args: Parameters<typeof useDownloadAttachmentConfirmationBottomSheet>
  ) => mockBottomSheetPresent(...args)
}));

describe("MvlAttachments", () => {
  jest.useFakeTimers();

  beforeEach(() => {
    mockBottomSheetPresent.mockReset();
    mockBottomSheetPresent.mockImplementation(mockBsConfig);
  });

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

    [
      { showAlertForAttachments: true, isAndroid: false },
      { showAlertForAttachments: true, isAndroid: true },
      { showAlertForAttachments: false, isAndroid: false },
      { showAlertForAttachments: false, isAndroid: true }
    ].forEach(scenario => {
      describe.only(`Given the scenario ${JSON.stringify(scenario)}`, () => {
        const preferences = {
          showAlertForAttachments: scenario.showAlertForAttachments
        };
        const props = { attachments: [mvlMockPdfAttachment] };

        it("Should pass the correct options to `useDownloadAttachmentConfirmationBottomSheet`", () => {
          (platform as any).test_setPlatform(
            scenario.isAndroid ? "android" : "ios"
          );
          renderComponent(props, preferences);
          expect(mockBottomSheetPresent).toHaveBeenNthCalledWith(
            1,
            mvlMockPdfAttachment,
            { Authorization: "Bearer undefined" },
            {
              dontAskAgain: !scenario.showAlertForAttachments,
              showToastOnSuccess: scenario.isAndroid
            }
          );
        });

        describe("when the user taps on the attachment", () => {
          it("Should open the bottom sheet", async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const react = require("react-native");

            const mockPresent = jest.fn();
            const mockDismiss = jest.fn();
            mockBottomSheetPresent.mockImplementationOnce(_ => ({
              present: mockPresent,
              bottomSheet: react.View,
              dismiss: mockDismiss
            }));
            const { getByText } = renderComponent(props, preferences);
            const item = getByText(mvlMockPdfAttachment.displayName);
            await fireEvent(item, "onPress");
            expect(mockPresent).toHaveBeenCalled();
            expect(mockDismiss).not.toHaveBeenCalled();
          });
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
  return renderScreenFakeNavRedux<GlobalState>(
    () => <MvlAttachments {...props} />,
    MVL_ROUTES.DETAILS,
    {},
    store
  );
};

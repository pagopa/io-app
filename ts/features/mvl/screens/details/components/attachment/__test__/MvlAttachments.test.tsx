import React from "react";

import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import * as pot from "italia-ts-commons/lib/pot";
import I18n from "../../../../../../../i18n";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import MVL_ROUTES from "../../../../../navigation/routes";
import { mvlMockPdfAttachment } from "../../../../../types/__mock__/mvlMock";
import { MvlPreferences } from "../../../../../store/reducers/preferences";
import { MvlAttachments } from "../MvlAttachments";
import { MvlDownloads } from "../../../../../store/reducers/downloads";

const mockPresentBottomSheet = jest.fn();

jest.mock("../../../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: () => ({
    present: mockPresentBottomSheet,
    bottomSheet: <></>
  })
}));

describe("MvlAttachments", () => {
  beforeEach(() => {
    mockPresentBottomSheet.mockReset();
  });

  describe("given no attachments", () => {
    it("it should NOT be rendered", () => {
      const res = renderComponent({ attachments: [] });
      expect(
        res.queryByText(I18n.t("features.mvl.details.attachments.title"))
      ).toBeNull();
    });
  });

  describe("given an attachment", () => {
    it("it should be rendered", () => {
      const res = renderComponent({
        attachments: [mvlMockPdfAttachment]
      });
      expect(
        res.queryByText(I18n.t("features.mvl.details.attachments.title"))
      ).not.toBeNull();
    });

    describe("when tapping on it for the first time", () => {
      it("it should present the bottom sheet", async () => {
        const res = renderComponent({
          attachments: [mvlMockPdfAttachment]
        });
        const item = res.getByText(mvlMockPdfAttachment.displayName);
        await fireEvent(item, "onPress");

        expect(mockPresentBottomSheet).toHaveBeenCalled();
      });
    });

    describe("when tapping on it", () => {
      describe("and showAlertForAttachments is false", () => {
        it("it should NOT present the bottom sheet", async () => {
          const res = renderComponent(
            {
              attachments: [mvlMockPdfAttachment]
            },
            { showAlertForAttachments: false }
          );
          const item = res.getByText(mvlMockPdfAttachment.displayName);
          await fireEvent(item, "onPress");

          expect(mockPresentBottomSheet).not.toHaveBeenCalled();
        });
      });
    });

    describe("when the pot is loading", () => {
      it("it should show a loading indicator", async () => {
        [
          pot.noneLoading,
          pot.someLoading({ path: "path", attachment: mvlMockPdfAttachment })
        ].forEach(loadingPot => {
          const res = renderComponent(
            {
              attachments: [mvlMockPdfAttachment]
            },
            { showAlertForAttachments: false },
            { [mvlMockPdfAttachment.id]: loadingPot }
          );
          expect(
            res.queryByTestId("attachmentActivityIndicator")
          ).not.toBeNull();
        });
      });
    });

    describe("when the pot is NOT loading", () => {
      it("it should NOT show a loading indicator", async () => {
        [
          pot.none,
          pot.noneError(new Error()),
          pot.some({ path: "path", attachment: mvlMockPdfAttachment }),
          pot.someError(
            { path: "path", attachment: mvlMockPdfAttachment },
            new Error()
          )
        ].forEach(notLoadingPot => {
          const res = renderComponent(
            {
              attachments: [mvlMockPdfAttachment]
            },
            { showAlertForAttachments: false },
            { [mvlMockPdfAttachment.id]: notLoadingPot }
          );
          expect(res.queryByTestId("attachmentActivityIndicator")).toBeNull();
        });
      });
    });
  });
});

const renderComponent = (
  props: React.ComponentProps<typeof MvlAttachments>,
  mvlPreferences: MvlPreferences = { showAlertForAttachments: true },
  mvlDownloads: MvlDownloads = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, {
    ...globalState,
    features: {
      ...globalState.features,
      mvl: {
        ...globalState.features.mvl,
        preferences: mvlPreferences,
        downloads: mvlDownloads
      }
    }
  } as any);
  return renderScreenFakeNavRedux<GlobalState>(
    () => <MvlAttachments {...props} />,
    MVL_ROUTES.DETAILS,
    {},
    store
  );
};

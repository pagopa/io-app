import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import MVL_ROUTES from "../../../mvl/navigation/routes";
import { MvlPreferences } from "../../../mvl/store/reducers/preferences";
import { MessageAttachments } from "../MessageAttachments";
import { Downloads } from "../../../../store/reducers/entities/messages/downloads";
import { mockPdfAttachment } from "../../../../__mocks__/attachment";

const mockPresentBottomSheet = jest.fn();

jest.mock("../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: () => ({
    present: mockPresentBottomSheet,
    bottomSheet: <></>
  })
}));

describe("MessageAttachments", () => {
  beforeEach(() => {
    mockPresentBottomSheet.mockReset();
  });

  describe("given an attachment", () => {
    describe("when tapping on it for the first time", () => {
      it("it should present the bottom sheet", async () => {
        const res = renderComponent({
          attachments: [mockPdfAttachment],
          openPreview: jest.fn()
        });
        const item = res.getByText(mockPdfAttachment.displayName);
        await fireEvent(item, "onPress");
        expect(mockPresentBottomSheet).toHaveBeenCalled();
      });
    });

    describe("when tapping on it", () => {
      describe("and showAlertForAttachments is false", () => {
        it("it should NOT present the bottom sheet", async () => {
          const res = renderComponent(
            {
              attachments: [mockPdfAttachment],
              openPreview: jest.fn()
            },
            { showAlertForAttachments: false }
          );
          const item = res.getByText(mockPdfAttachment.displayName);
          await fireEvent(item, "onPress");
          expect(mockPresentBottomSheet).not.toHaveBeenCalled();
        });
      });
    });

    describe("when the pot is loading", () => {
      it("it should show a loading indicator", async () => {
        [
          pot.noneLoading,
          pot.someLoading({ path: "path", attachment: mockPdfAttachment })
        ].forEach(loadingPot => {
          const res = renderComponent(
            {
              attachments: [mockPdfAttachment],
              openPreview: jest.fn()
            },
            { showAlertForAttachments: false },
            {
              [mockPdfAttachment.messageId]: {
                [mockPdfAttachment.id]: loadingPot
              }
            }
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
          pot.some({ path: "path", attachment: mockPdfAttachment }),
          pot.someError(
            { path: "path", attachment: mockPdfAttachment },
            new Error()
          )
        ].forEach(notLoadingPot => {
          const res = renderComponent(
            {
              attachments: [mockPdfAttachment],
              openPreview: jest.fn()
            },
            { showAlertForAttachments: false },
            {
              [mockPdfAttachment.messageId]: {
                [mockPdfAttachment.id]: notLoadingPot
              }
            }
          );
          expect(res.queryByTestId("attachmentActivityIndicator")).toBeNull();
        });
      });
    });
  });
});

const renderComponent = (
  props: React.ComponentProps<typeof MessageAttachments>,
  mvlPreferences: MvlPreferences = { showAlertForAttachments: true },
  downloads: Downloads = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, {
    ...globalState,
    features: {
      ...globalState.features,
      mvl: {
        ...globalState.features.mvl,
        preferences: mvlPreferences
      }
    },
    entities: {
      ...globalState.entities,
      messages: {
        ...globalState.entities.messages,
        downloads
      }
    }
  } as any);
  return renderScreenFakeNavRedux<GlobalState>(
    () => <MessageAttachments {...props} />,
    MVL_ROUTES.DETAILS,
    {},
    store
  );
};

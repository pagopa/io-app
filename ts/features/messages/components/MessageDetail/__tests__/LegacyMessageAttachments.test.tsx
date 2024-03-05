import React from "react";
import { act } from "@testing-library/react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { LegacyMessageAttachments } from "../LegacyMessageAttachments";
import { Downloads } from "../../../store/reducers/downloads";
import { mockPdfAttachment } from "../../../__mocks__/attachment";
import { downloadAttachment } from "../../../store/actions";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { messageId_1 } from "../../../__mocks__/messages";
import { IOToast } from "../../../../../components/Toast";

const mockOpenPreview = jest.fn();

describe("LegacyMessageAttachments", () => {
  beforeEach(() => {
    mockOpenPreview.mockReset();
  });

  describe("given an attachment", () => {
    describe("when the pot is loading", () => {
      it("it should show a loading indicator", async () => {
        [
          pot.noneLoading,
          pot.someLoading({ path: "path", attachment: mockPdfAttachment })
        ].forEach(loadingPot => {
          const { component } = renderComponent(
            {
              attachments: [mockPdfAttachment],
              messageId: messageId_1,
              openPreview: jest.fn()
            },
            {
              [messageId_1]: {
                [mockPdfAttachment.id]: loadingPot
              }
            }
          );
          expect(
            component.queryByTestId("attachmentActivityIndicator")
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
          const { component } = renderComponent(
            {
              attachments: [mockPdfAttachment],
              messageId: messageId_1,
              openPreview: jest.fn()
            },
            {
              [messageId_1]: {
                [mockPdfAttachment.id]: notLoadingPot
              }
            }
          );
          expect(
            component.queryByTestId("attachmentActivityIndicator")
          ).toBeNull();
        });
      });
    });

    describe("when the pot is error", () => {
      it("it should show a toast", async () => {
        const { store } = renderComponent(
          {
            attachments: [mockPdfAttachment],
            messageId: messageId_1,
            openPreview: jest.fn()
          },
          {
            [messageId_1]: {
              [mockPdfAttachment.id]: pot.noneLoading
            }
          }
        );
        const showToastSpy = jest.spyOn(IOToast, "error");

        await act(async () =>
          store.dispatch(
            downloadAttachment.failure({
              attachment: mockPdfAttachment,
              messageId: messageId_1,
              error: new Error()
            })
          )
        );
        expect(showToastSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe("when the pot is some", () => {
      it("it should call openPreview", async () => {
        const { store } = renderComponent(
          {
            attachments: [mockPdfAttachment],
            messageId: messageId_1,
            openPreview: mockOpenPreview()
          },
          {
            [messageId_1]: {
              [mockPdfAttachment.id]: pot.noneLoading
            }
          }
        );

        await act(async () =>
          store.dispatch(
            downloadAttachment.success({
              path: "path",
              messageId: messageId_1,
              attachment: mockPdfAttachment
            })
          )
        );
        expect(mockOpenPreview).toHaveBeenCalledTimes(1);
      });
    });
  });
});

const renderComponent = (
  props: React.ComponentProps<typeof LegacyMessageAttachments>,
  downloads: Downloads = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, {
    ...globalState,
    entities: {
      ...globalState.entities,
      messages: {
        ...globalState.entities.messages,
        downloads
      }
    }
  } as any);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <LegacyMessageAttachments {...props} />,
      MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
      {},
      store
    ),
    store
  };
};

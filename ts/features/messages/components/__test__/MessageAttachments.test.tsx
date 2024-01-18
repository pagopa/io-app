import React from "react";
import { act } from "@testing-library/react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MessageAttachments } from "../MessageAttachments";
import { Downloads } from "../../store/reducers/downloads";
import { mockPdfAttachment } from "../../__mocks__/attachment";
import { downloadAttachment } from "../../store/actions";
import I18n from "../../../../i18n";

const mockOpenPreview = jest.fn();
const mockShowToast = jest.fn();

jest.mock("../../../../utils/showToast", () => ({
  showToast: () => mockShowToast()
}));

describe("MessageAttachments", () => {
  beforeEach(() => {
    mockShowToast.mockReset();
    mockOpenPreview.mockReset();
  });

  describe("given an attachment", () => {
    describe("when the pot is loading", () => {
      it("it should show a loading indicator", () => {
        [
          pot.noneLoading,
          pot.someLoading({ path: "path", attachment: mockPdfAttachment })
        ].forEach(loadingPot => {
          const { component } = renderComponent(
            {
              attachments: [mockPdfAttachment],
              openPreview: jest.fn()
            },
            {
              [mockPdfAttachment.messageId]: {
                [mockPdfAttachment.id]: loadingPot
              }
            }
          );
          expect(
            component.queryByHintText(
              I18n.t("global.accessibility.activityIndicator.hint")
            )
          ).not.toBeNull();
        });
      });
    });

    describe("when the pot is NOT loading", () => {
      it("it should NOT show a loading indicator", () => {
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
              openPreview: jest.fn()
            },
            {
              [mockPdfAttachment.messageId]: {
                [mockPdfAttachment.id]: notLoadingPot
              }
            }
          );
          expect(
            component.queryByHintText(
              I18n.t("global.accessibility.activityIndicator.hint")
            )
          ).toBeNull();
        });
      });
    });

    describe("when the pot is error", () => {
      it("it should show a toast", async () => {
        const { store } = renderComponent(
          {
            attachments: [mockPdfAttachment],
            openPreview: jest.fn()
          },
          {
            [mockPdfAttachment.messageId]: {
              [mockPdfAttachment.id]: pot.noneLoading
            }
          }
        );

        await act(() =>
          store.dispatch(
            downloadAttachment.failure({
              attachment: mockPdfAttachment,
              error: new Error()
            })
          )
        );
        expect(mockShowToast).toHaveBeenCalledTimes(1);
      });
    });

    describe("when the pot is some", () => {
      it("it should call openPreview", async () => {
        const { store } = renderComponent(
          {
            attachments: [mockPdfAttachment],
            openPreview: mockOpenPreview()
          },
          {
            [mockPdfAttachment.messageId]: {
              [mockPdfAttachment.id]: pot.noneLoading
            }
          }
        );

        await act(async () =>
          store.dispatch(
            downloadAttachment.success({
              path: "path",
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
  props: React.ComponentProps<typeof MessageAttachments>,
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
      () => <MessageAttachments {...props} />,
      "DUMMY",
      {},
      store
    ),
    store
  };
};

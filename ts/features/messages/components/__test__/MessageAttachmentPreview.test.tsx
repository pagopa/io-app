import React from "react";
import { View } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { Downloads } from "../../store/reducers/downloads";
import { mockPdfAttachment } from "../../__mocks__/attachment";
import I18n from "../../../../i18n";
import { LegacyMessageAttachmentPreview } from "../MessageAttachment/LegacyMessageAttachmentPreview";

const mockOpen = jest.fn();
const mockPdfViewer = <View testID="pdf-viewer" />;

jest.mock("../MessageAttachment/LegacyPdfViewer", () => () => mockPdfViewer);

describe("MessageAttachmentPreview", () => {
  describe("when enableDownloadAttachment is false", () => {
    it("should render the PDF preview", () => {
      const { component } = renderComponent(
        {
          enableDownloadAttachment: false,
          messageId: mockPdfAttachment.messageId,
          attachment: mockPdfAttachment,
          onOpen: mockOpen
        },
        {
          [mockPdfAttachment.messageId]: {
            [mockPdfAttachment.id]: pot.some({
              path: "path",
              attachment: mockPdfAttachment
            })
          }
        }
      );

      expect(component.queryByTestId("pdf-viewer")).toBeTruthy();
    });

    it("should NOT render the loading indicator", () => {
      const { component } = renderComponent(
        {
          enableDownloadAttachment: false,
          messageId: mockPdfAttachment.messageId,
          attachment: mockPdfAttachment,
          onOpen: mockOpen
        },
        {
          [mockPdfAttachment.messageId]: {
            [mockPdfAttachment.id]: pot.some({
              path: "path",
              attachment: mockPdfAttachment
            })
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

const renderComponent = (
  props: React.ComponentProps<typeof LegacyMessageAttachmentPreview>,
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
      () => <LegacyMessageAttachmentPreview {...props} />,
      "DUMMY",
      {},
      store
    ),
    store
  };
};

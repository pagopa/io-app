import { ThirdPartyAttachment } from "@io-app/api-types/generated/definitions/communication/ThirdPartyAttachment";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { IOToast } from "@io-app/design-system";
import { fireEvent, waitFor } from "@testing-library/react-native";
import * as Sharing from "expo-sharing";
import I18n from "i18next";
import { ComponentProps } from "react";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import * as platform from "../../../../../utils/platform";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  trackPNAttachmentOpeningSuccess,
  trackPNAttachmentSave,
  trackPNAttachmentSaveShare,
  trackPNAttachmentShare
} from "../../../../pn/analytics";
import {
  trackThirdPartyMessageAttachmentCorruptedFile,
  trackThirdPartyMessageAttachmentPreviewSuccess,
  trackThirdPartyMessageAttachmentUserAction
} from "../../../analytics";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { downloadAttachment } from "../../../store/actions";
import { MessageAttachment, testable } from "../MessageAttachment";

const mockPresentOptionsMenu = jest.fn();
const mockCopyToMediaStore = jest.fn();
jest.mock("react-native-blob-util", () => ({
  DocumentDir: () => jest.fn(),
  polyfill: () => jest.fn(),
  ios: {
    presentOptionsMenu: (...args: Array<unknown>) =>
      mockPresentOptionsMenu(...args)
  },
  MediaCollection: {
    copyToMediaStore: (...args: Array<unknown>) => mockCopyToMediaStore(...args)
  }
}));

jest.mock("../PdfViewer", () => ({
  PdfViewer: (props: Record<string, unknown>) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, { testID: "pdf-viewer", ...props });
  }
}));

jest.mock("../../../../pn/analytics", () => ({
  ...jest.requireActual("../../../../pn/analytics"),
  trackPNAttachmentOpeningSuccess: jest.fn(),
  trackPNAttachmentSave: jest.fn(),
  trackPNAttachmentSaveShare: jest.fn(),
  trackPNAttachmentShare: jest.fn()
}));

jest.mock("../../../analytics", () => ({
  ...jest.requireActual("../../../analytics"),
  trackThirdPartyMessageAttachmentCorruptedFile: jest.fn(),
  trackThirdPartyMessageAttachmentPreviewSuccess: jest.fn(),
  trackThirdPartyMessageAttachmentUserAction: jest.fn()
}));

const { MessageAttachmentFooter } = testable!;

const testIDs = {
  pdfViewer: "pdf-viewer",
  genericError: "message-attachment-generic-error",
  previewError: "message-attachment-preview-error",
  saveOrShareButton: "message-attachment-save-or-share-button",
  saveButton: "message-attachment-save-button",
  shareButton: "message-attachment-share-button"
};

const messageId = "01HMZWRG7549N76017YR8YBSG2";
const attachmentId = "1";
const serviceId = "01HMZXFS84T1Q1BN6GXRYT63VJ" as ServiceId;
const downloadPath = "/data/attachments/document.pdf";
const attachmentCategory = "F24";
const attachment = {
  id: attachmentId,
  url: "/attachments/1",
  name: "document.pdf",
  content_type: "application/pdf",
  category: attachmentCategory
} as ThirdPartyAttachment;

describe("MessageAttachment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(IOToast, "info").mockImplementation(jest.fn());
    jest.spyOn(IOToast, "error").mockImplementation(jest.fn());
    jest.replaceProperty(platform, "isIos", false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render the generic error when the attachment has not been downloaded", () => {
    const { getByTestId, queryByTestId } = renderComponent();

    expect(getByTestId(testIDs.genericError)).toBeTruthy();
    expect(queryByTestId(testIDs.pdfViewer)).toBeNull();
    expect(queryByTestId(testIDs.saveButton)).toBeNull();
    expect(queryByTestId(testIDs.shareButton)).toBeNull();
  });

  it("should render the PDF viewer with the downloaded path and the footer", () => {
    const { getByTestId, queryByTestId } = renderComponent({
      downloadedAttachment: attachment
    });

    expect(getByTestId(testIDs.pdfViewer).props.downloadPath).toBe(
      downloadPath
    );
    expect(getByTestId(testIDs.saveButton)).toBeTruthy();
    expect(getByTestId(testIDs.shareButton)).toBeTruthy();
    expect(queryByTestId(testIDs.genericError)).toBeNull();
    expect(queryByTestId(testIDs.previewError)).toBeNull();
  });

  test.each([
    {
      name: "the attachment name and content type",
      downloadedAttachment: attachment,
      expectedName: "document.pdf",
      expectedMimeType: "application/pdf"
    },
    {
      name: "the attachment id and the fallback content type",
      downloadedAttachment: {
        id: attachmentId,
        url: "/attachments/1"
      } as ThirdPartyAttachment,
      expectedName: attachmentId,
      expectedMimeType: "application/octet-stream"
    }
  ])(
    "should save the file using $name",
    ({ downloadedAttachment, expectedName, expectedMimeType }) => {
      mockCopyToMediaStore.mockResolvedValue("content://saved");
      const { getByTestId } = renderComponent({ downloadedAttachment });

      fireEvent.press(getByTestId(testIDs.saveButton));

      expect(mockCopyToMediaStore).toHaveBeenCalledWith(
        {
          name: expectedName,
          parentFolder: "",
          mimeType: expectedMimeType
        },
        "Download",
        downloadPath
      );
    }
  );

  describe("when the PDF loads", () => {
    it("should track the preview success for a third party message", () => {
      const { getByTestId } = renderComponent({
        downloadedAttachment: attachment
      });

      fireEvent(getByTestId(testIDs.pdfViewer), "loadComplete");

      expect(
        trackThirdPartyMessageAttachmentPreviewSuccess
      ).toHaveBeenCalledTimes(1);
      expect(trackPNAttachmentOpeningSuccess).not.toHaveBeenCalled();
    });

    it("should track the opening success for a SEND message", () => {
      const { getByTestId } = renderComponent({
        isPN: true,
        downloadedAttachment: attachment
      });

      fireEvent(getByTestId(testIDs.pdfViewer), "loadComplete");

      expect(trackPNAttachmentOpeningSuccess).toHaveBeenCalledWith(
        "displayer",
        attachmentCategory
      );
      expect(
        trackThirdPartyMessageAttachmentPreviewSuccess
      ).not.toHaveBeenCalled();
    });
  });

  describe("when the PDF fails to render", () => {
    it("should show the preview error, track the corrupted file and show a toast for a third party message", () => {
      const { getByTestId, queryByTestId } = renderComponent({
        downloadedAttachment: attachment
      });

      fireEvent(getByTestId(testIDs.pdfViewer), "error");

      expect(queryByTestId(testIDs.pdfViewer)).toBeNull();
      expect(getByTestId(testIDs.previewError)).toBeTruthy();
      expect(
        trackThirdPartyMessageAttachmentCorruptedFile
      ).toHaveBeenCalledWith(messageId, serviceId);
      expect(IOToast.error).toHaveBeenCalledWith(
        I18n.t("messageDetails.attachments.corruptedFile")
      );
      expect(trackPNAttachmentOpeningSuccess).not.toHaveBeenCalled();
    });

    it("should show the preview error and track the opening error without a toast for a SEND message", () => {
      const { getByTestId, queryByTestId } = renderComponent({
        isPN: true,
        downloadedAttachment: attachment
      });

      fireEvent(getByTestId(testIDs.pdfViewer), "error");

      expect(queryByTestId(testIDs.pdfViewer)).toBeNull();
      expect(getByTestId(testIDs.previewError)).toBeTruthy();
      expect(trackPNAttachmentOpeningSuccess).toHaveBeenCalledWith(
        "error",
        attachmentCategory
      );
      expect(
        trackThirdPartyMessageAttachmentCorruptedFile
      ).not.toHaveBeenCalled();
      expect(IOToast.error).not.toHaveBeenCalled();
    });

    it("should keep the footer actions available", () => {
      const { getByTestId } = renderComponent({
        downloadedAttachment: attachment
      });

      fireEvent(getByTestId(testIDs.pdfViewer), "error");

      expect(getByTestId(testIDs.saveButton)).toBeTruthy();
      expect(getByTestId(testIDs.shareButton)).toBeTruthy();
    });
  });
});

describe("MessageAttachmentFooter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(IOToast, "info").mockImplementation(jest.fn());
    jest.spyOn(IOToast, "error").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("on iOS", () => {
    beforeEach(() => {
      jest.replaceProperty(platform, "isIos", true);
    });

    it("should render only the save or share button", () => {
      const { getByTestId, queryByTestId } = renderFooter();

      expect(getByTestId(testIDs.saveOrShareButton)).toBeTruthy();
      expect(queryByTestId(testIDs.saveButton)).toBeNull();
      expect(queryByTestId(testIDs.shareButton)).toBeNull();
    });

    test.each([
      {
        name: "third party message",
        isPN: false,
        expectTracking: () => {
          expect(
            trackThirdPartyMessageAttachmentUserAction
          ).toHaveBeenCalledWith("share");
          expect(trackPNAttachmentSaveShare).not.toHaveBeenCalled();
        }
      },
      {
        name: "SEND message",
        isPN: true,
        expectTracking: () => {
          expect(trackPNAttachmentSaveShare).toHaveBeenCalledWith(
            attachmentCategory
          );
          expect(trackPNAttachmentShare).not.toHaveBeenCalled();
          expect(
            trackThirdPartyMessageAttachmentUserAction
          ).not.toHaveBeenCalled();
        }
      }
    ])(
      "should track and present the options menu for a $name",
      ({ isPN, expectTracking }) => {
        const { getByTestId } = renderFooter({ isPN });

        fireEvent.press(getByTestId(testIDs.saveOrShareButton));

        expect(mockPresentOptionsMenu).toHaveBeenCalledWith(downloadPath);
        expectTracking();
      }
    );
  });

  describe("on Android", () => {
    beforeEach(() => {
      jest.replaceProperty(platform, "isIos", false);
    });

    it("should render the save and share buttons", () => {
      const { getByTestId, queryByTestId } = renderFooter();

      expect(getByTestId(testIDs.saveButton)).toBeTruthy();
      expect(getByTestId(testIDs.shareButton)).toBeTruthy();
      expect(queryByTestId(testIDs.saveOrShareButton)).toBeNull();
    });

    test.each([
      {
        name: "third party message",
        isPN: false,
        expectTracking: () => {
          expect(
            trackThirdPartyMessageAttachmentUserAction
          ).toHaveBeenCalledWith("download");
          expect(trackPNAttachmentSave).not.toHaveBeenCalled();
        }
      },
      {
        name: "SEND message",
        isPN: true,
        expectTracking: () => {
          expect(trackPNAttachmentSave).toHaveBeenCalledWith(
            attachmentCategory
          );
          expect(
            trackThirdPartyMessageAttachmentUserAction
          ).not.toHaveBeenCalled();
        }
      }
    ])(
      "should track the save action for a $name",
      async ({ isPN, expectTracking }) => {
        mockCopyToMediaStore.mockResolvedValue("content://saved");
        const { getByTestId } = renderFooter({ isPN });

        fireEvent.press(getByTestId(testIDs.saveButton));

        expectTracking();
        await waitFor(() => expect(IOToast.info).toHaveBeenCalled());
      }
    );

    it("should save the file in the Download folder and show a confirmation toast", async () => {
      mockCopyToMediaStore.mockResolvedValue("content://saved");
      const { getByTestId } = renderFooter({
        mimeType: "application/octet-stream",
        name: "receipt"
      });

      fireEvent.press(getByTestId(testIDs.saveButton));

      expect(mockCopyToMediaStore).toHaveBeenCalledWith(
        {
          name: "receipt",
          parentFolder: "",
          mimeType: "application/octet-stream"
        },
        "Download",
        downloadPath
      );
      await waitFor(() =>
        expect(IOToast.info).toHaveBeenCalledWith(
          I18n.t("messagePDFPreview.savedAtLocation", { name: "receipt" })
        )
      );
      expect(IOToast.error).not.toHaveBeenCalled();
    });

    it("should show an error toast when saving fails", async () => {
      mockCopyToMediaStore.mockRejectedValue(new Error("saving failed"));
      const { getByTestId } = renderFooter();

      fireEvent.press(getByTestId(testIDs.saveButton));

      await waitFor(() =>
        expect(IOToast.error).toHaveBeenCalledWith(
          I18n.t("messagePDFPreview.errors.saving")
        )
      );
      expect(IOToast.info).not.toHaveBeenCalled();
    });

    test.each([
      {
        name: "third party message",
        isPN: false,
        expectTracking: () => {
          expect(
            trackThirdPartyMessageAttachmentUserAction
          ).toHaveBeenCalledWith("share");
          expect(trackPNAttachmentShare).not.toHaveBeenCalled();
        }
      },
      {
        name: "SEND message",
        isPN: true,
        expectTracking: () => {
          expect(trackPNAttachmentShare).toHaveBeenCalledWith(
            attachmentCategory
          );
          expect(trackPNAttachmentSaveShare).not.toHaveBeenCalled();
          expect(
            trackThirdPartyMessageAttachmentUserAction
          ).not.toHaveBeenCalled();
        }
      }
    ])(
      "should track and share the file URI for a $name",
      ({ isPN, expectTracking }) => {
        const { getByTestId } = renderFooter({ isPN });

        fireEvent.press(getByTestId(testIDs.shareButton));

        expect(Sharing.shareAsync).toHaveBeenCalledWith(
          `file://${downloadPath}`,
          undefined
        );
        expectTracking();
      }
    );
  });
});

const createTestStore = (downloadedAttachment?: ThirdPartyAttachment) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const state = downloadedAttachment
    ? appReducer(
        initialState,
        downloadAttachment.success({
          attachment: downloadedAttachment,
          messageId,
          path: downloadPath
        })
      )
    : initialState;
  return createStore(appReducer, state as any);
};

type RenderOptions = {
  downloadedAttachment?: ThirdPartyAttachment;
  isPN?: boolean;
};

const renderComponent = ({
  isPN = false,
  downloadedAttachment
}: RenderOptions = {}) =>
  renderScreenWithNavigationStoreContext(
    () => (
      <MessageAttachment
        attachmentId={attachmentId}
        isPN={isPN}
        messageId={messageId}
        serviceId={serviceId}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
    {},
    createTestStore(downloadedAttachment)
  );

const defaultFooterProps: ComponentProps<typeof MessageAttachmentFooter> = {
  attachmentCategory,
  downloadPath,
  isPN: false,
  mimeType: "application/pdf",
  name: "document.pdf"
};

const renderFooter = (
  props: Partial<ComponentProps<typeof MessageAttachmentFooter>> = {}
) =>
  renderScreenWithNavigationStoreContext(
    () => <MessageAttachmentFooter {...defaultFooterProps} {...props} />,
    MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
    {},
    createTestStore()
  );

import { act, renderHook, waitFor } from "@testing-library/react-native";
import RNFS from "react-native-fs";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { isAarAttachmentTtlError } from "../../../pn/aar/utils/aarErrorMappings";
import {
  trackPNAttachmentDownloadFailure,
  trackPNAttachmentOpening
} from "../../../pn/analytics";
import PN_ROUTES from "../../../pn/navigation/routes";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import { trackThirdPartyMessageAttachmentShowPreview } from "../../analytics";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import {
  cancelPreviousAttachmentDownload,
  clearRequestedAttachmentDownload,
  downloadAttachment
} from "../../store/actions";
import {
  Download,
  downloadedMessageAttachmentSelector,
  getRequestedDownloadErrorSelector,
  isDownloadingMessageAttachmentSelector,
  isRequestedAttachmentDownloadSelector
} from "../../store/reducers/downloads";
import { useAttachmentDownload } from "../useAttachmentDownload";

// ---- Mocks ----

const mockNavigate = jest.fn();
jest.mock("../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate
  })
}));

const mockDispatch = jest.fn();
const mockGetState = jest.fn(() => ({}));
jest.mock("../../../../store/hooks", () => ({
  useIODispatch: () => mockDispatch,
  useIOStore: () => ({ getState: mockGetState }),
  useIOSelector: (selector: (_: any) => any) => selector({})
}));

const mockErrorToast = jest.fn();
jest.mock("@pagopa/io-app-design-system", () => ({
  useIOToast: () => ({
    error: mockErrorToast
  })
}));

jest.mock("i18next", () => ({
  t: (key: string) => key
}));

jest.mock("react-native-fs", () => ({
  exists: jest.fn()
}));

jest.mock("../../store/reducers/downloads");

jest.mock("../../utils/attachments", () => ({
  attachmentDisplayName: jest.fn(() => "test.pdf")
}));

jest.mock("../../../pn/analytics", () => ({
  trackPNAttachmentDownloadFailure: jest.fn(),
  trackPNAttachmentOpening: jest.fn()
}));

jest.mock("../../analytics", () => ({
  trackThirdPartyMessageAttachmentShowPreview: jest.fn()
}));

jest.mock("../../../pn/aar/utils/aarErrorMappings", () => ({
  isAarAttachmentTtlError: jest.fn(() => false)
}));

// ---- Tests ----

describe("useAttachmentDownload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelectors();
  });

  it("should return displayName, isFetching and onModuleAttachmentPress", () => {
    const { result } = renderUseAttachmentDownload();
    expect(result.current.displayName).toBe("test.pdf");
    expect(result.current.isFetching).toBe(false);
    expect(typeof result.current.onModuleAttachmentPress).toBe("function");
  });

  it("should return isFetching as true when download is in progress", () => {
    setupSelectors({ isFetching: true });
    const { result } = renderUseAttachmentDownload();
    expect(result.current.isFetching).toBe(true);
  });

  describe("onModuleAttachmentPress", () => {
    it("should do nothing when isFetching is true", async () => {
      setupSelectors({ isFetching: true });
      const { result } = renderUseAttachmentDownload();

      await act(async () => {
        await result.current.onModuleAttachmentPress();
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("should dispatch cancelPreviousAttachmentDownload", async () => {
      const { result } = renderUseAttachmentDownload();

      await act(async () => {
        await result.current.onModuleAttachmentPress();
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        cancelPreviousAttachmentDownload()
      );
    });

    it.each<{
      sendOpeningSource: SendOpeningSource;
      sendUserType: SendUserType;
      shouldTrack: boolean;
    }>([
      {
        sendOpeningSource: "not_set",
        sendUserType: "not_set",
        shouldTrack: true
      },
      {
        sendOpeningSource: "message",
        sendUserType: "recipient",
        shouldTrack: false
      }
    ])(
      "should track third-party attachment preview? ($shouldTrack) when sendOpeningSource is $sendOpeningSource",
      async ({ sendOpeningSource, sendUserType, shouldTrack }) => {
        const { result } = renderUseAttachmentDownload(
          sendOpeningSource,
          sendUserType
        );

        await act(async () => {
          await result.current.onModuleAttachmentPress();
        });

        if (shouldTrack) {
          expect(
            trackThirdPartyMessageAttachmentShowPreview
          ).toHaveBeenCalled();
        } else {
          expect(
            trackThirdPartyMessageAttachmentShowPreview
          ).not.toHaveBeenCalled();
        }
      }
    );

    it("should navigate directly if download is defined and file exists on disk", async () => {
      const downloadPath = "/tmp/test.pdf";
      setupSelectors({ download: { path: downloadPath } });
      (RNFS.exists as jest.Mock).mockResolvedValue(true);

      const { result } = renderUseAttachmentDownload();

      await act(async () => {
        await result.current.onModuleAttachmentPress();
      });

      expect(RNFS.exists).toHaveBeenCalledWith(downloadPath);
      expect(mockDispatch).toHaveBeenCalledWith(
        clearRequestedAttachmentDownload()
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
        {
          screen: MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
          params: {
            messageId,
            serviceId,
            attachmentId
          }
        }
      );
    });

    it.each<{
      desc: string;
      download: { path: string } | undefined;
      sendOpeningSource: SendOpeningSource;
      sendUserType: SendUserType;
      expectedSkipMixpanel: boolean;
    }>([
      {
        desc: "download exists but file not on disk (non-send)",
        download: { path: "/tmp/gone.pdf" },
        sendOpeningSource: "not_set",
        sendUserType: "not_set",
        expectedSkipMixpanel: false
      },
      {
        desc: "no existing download (non-send)",
        download: undefined,
        sendOpeningSource: "not_set",
        sendUserType: "not_set",
        expectedSkipMixpanel: false
      },
      {
        desc: "no existing download (send attachment)",
        download: undefined,
        sendOpeningSource: "message",
        sendUserType: "recipient",
        expectedSkipMixpanel: true
      }
    ])(
      "should dispatch downloadAttachment.request when $desc",
      async ({
        download,
        sendOpeningSource,
        sendUserType,
        expectedSkipMixpanel
      }) => {
        setupSelectors({ download });
        if (download) {
          (RNFS.exists as jest.Mock).mockResolvedValue(false);
        }

        const { result } = renderUseAttachmentDownload(
          sendOpeningSource,
          sendUserType
        );

        await act(async () => {
          await result.current.onModuleAttachmentPress();
        });

        expect(mockDispatch).toHaveBeenCalledWith(
          downloadAttachment.request({
            attachment: baseAttachment,
            messageId,
            skipMixpanelTrackingOnFailure: expectedSkipMixpanel,
            serviceId
          })
        );
      }
    );

    it("should navigate to PN route when it is a send attachment", async () => {
      const downloadPath = "/tmp/test.pdf";
      setupSelectors({ download: { path: downloadPath } });
      (RNFS.exists as jest.Mock).mockResolvedValue(true);

      const { result } = renderUseAttachmentDownload("message", "recipient");

      await act(async () => {
        await result.current.onModuleAttachmentPress();
      });

      expect(trackPNAttachmentOpening).toHaveBeenCalledWith(
        "message",
        "recipient",
        "DOCUMENT"
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
        {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.MESSAGE_ATTACHMENT,
            params: {
              attachmentId,
              messageId
            }
          }
        }
      );
    });

    it("should call onPreNavigate before navigating", async () => {
      const downloadPath = "/tmp/test.pdf";
      setupSelectors({ download: { path: downloadPath } });
      (RNFS.exists as jest.Mock).mockResolvedValue(true);

      const onPreNavigate = jest.fn();
      const { result } = renderUseAttachmentDownload(
        "not_set",
        "not_set",
        onPreNavigate
      );

      await act(async () => {
        await result.current.onModuleAttachmentPress();
      });

      expect(onPreNavigate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe("useEffect - no-op cases", () => {
    it("should do nothing when download exists but isRequested is false", async () => {
      setupSelectors({
        download: { path: "/tmp/test.pdf" },
        isRequested: false
      });
      jest.mocked(isRequestedAttachmentDownloadSelector).mockReturnValue(false);

      renderUseAttachmentDownload();

      await waitFor(() => {
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockErrorToast).not.toHaveBeenCalled();
      });
    });

    it("should prioritize download success over error when both are present", async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(true);
      setupSelectors({
        download: { path: "/tmp/test.pdf" },
        downloadError: new Error("should be ignored"),
        isRequested: true
      });
      jest.mocked(isRequestedAttachmentDownloadSelector).mockReturnValue(true);

      renderUseAttachmentDownload();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
      expect(mockErrorToast).not.toHaveBeenCalled();
    });
  });

  describe("useEffect - download success", () => {
    it.each<{
      desc: string;
      fileExists: boolean;
      shouldNavigate: boolean;
    }>([
      {
        desc: "navigate when file exists",
        fileExists: true,
        shouldNavigate: true
      },
      {
        desc: "clear without navigating when file does not exist",
        fileExists: false,
        shouldNavigate: false
      }
    ])(
      "should $desc after download completes",
      async ({ fileExists, shouldNavigate }) => {
        (RNFS.exists as jest.Mock).mockResolvedValue(fileExists);
        setupSelectors({
          download: { path: "/tmp/test.pdf" },
          isRequested: true
        });
        mockGetState.mockReturnValue({});

        renderUseAttachmentDownload();

        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalledWith(
            clearRequestedAttachmentDownload()
          );
        });
        if (shouldNavigate) {
          expect(mockNavigate).toHaveBeenCalled();
        } else {
          expect(mockNavigate).not.toHaveBeenCalled();
        }
      }
    );
  });

  describe("useEffect - download failure", () => {
    it.each<{
      isTtlError: boolean;
      expectedToast: string;
    }>([
      {
        isTtlError: false,
        expectedToast: "messageDetails.attachments.failing.details"
      },
      {
        isTtlError: true,
        expectedToast: "messageDetails.attachments.failing.aarTtlError"
      }
    ])(
      "should show the expected toast when isTtlError=$isTtlError",
      ({ isTtlError, expectedToast }) => {
        const error = new Error("test error");
        setupSelectors({ downloadError: error });
        jest.mocked(isAarAttachmentTtlError).mockReturnValue(isTtlError);

        renderUseAttachmentDownload();

        expect(mockDispatch).toHaveBeenCalledWith(
          clearRequestedAttachmentDownload()
        );
        expect(mockErrorToast).toHaveBeenCalledWith(expectedToast);
      }
    );

    it.each<{
      sendOpeningSource: SendOpeningSource;
      sendUserType: SendUserType;
      shouldTrack: boolean;
    }>([
      {
        sendOpeningSource: "message",
        sendUserType: "recipient",
        shouldTrack: true
      },
      {
        sendOpeningSource: "not_set",
        sendUserType: "not_set",
        shouldTrack: false
      }
    ])(
      "should track PN failure ($shouldTrack) when sendOpeningSource=$sendOpeningSource",
      ({ sendOpeningSource, sendUserType, shouldTrack }) => {
        const error = new Error("download failed");
        setupSelectors({ downloadError: error });

        renderUseAttachmentDownload(sendOpeningSource, sendUserType);

        if (shouldTrack) {
          expect(trackPNAttachmentDownloadFailure).toHaveBeenCalledWith(
            "DOCUMENT"
          );
        } else {
          expect(trackPNAttachmentDownloadFailure).not.toHaveBeenCalled();
        }
      }
    );
  });
});

// ---- Helpers ----

const messageId = "msg-123";
const attachmentId = "att-456";
const serviceId = "svc-789" as ServiceId;

const baseAttachment: ThirdPartyAttachment = {
  id: attachmentId,
  url: "https://example.com/file.pdf",
  category: "DOCUMENT",
  name: "test.pdf"
} as unknown as ThirdPartyAttachment;

const setupSelectors = (overrides?: {
  download?: { path: string } | undefined;
  downloadError?: Error | undefined;
  isFetching?: boolean;
  isRequested?: boolean;
}) => {
  const {
    download = undefined,
    downloadError = undefined,
    isFetching = false,
    isRequested = false
  } = overrides ?? {};

  jest
    .mocked(downloadedMessageAttachmentSelector)
    .mockReturnValue(download as any as Download | undefined);
  jest.mocked(getRequestedDownloadErrorSelector).mockReturnValue(downloadError);
  jest
    .mocked(isDownloadingMessageAttachmentSelector)
    .mockReturnValue(isFetching);
  jest
    .mocked(isRequestedAttachmentDownloadSelector)
    .mockReturnValue(isRequested);
};

const renderUseAttachmentDownload = (
  sendOpeningSource: SendOpeningSource = "not_set",
  sendUserType: SendUserType = "not_set",
  onPreNavigate?: () => void
) =>
  renderHook(() =>
    useAttachmentDownload(
      messageId,
      baseAttachment,
      sendOpeningSource,
      sendUserType,
      serviceId,
      onPreNavigate
    )
  );

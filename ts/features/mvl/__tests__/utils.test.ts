import ReactNativeBlobUtil from "react-native-blob-util";

import * as platform from "../../../utils/platform";
import {
  mvlMockOtherAttachment,
  mvlMockPdfAttachment
} from "../types/__mock__/mvlMock";
import { handleDownloadResult } from "../utils";

jest.mock("../../../utils/platform");

// eslint-disable-next-line functional/no-let
let mockResponseStatus = 200;
const defaultPath = mvlMockPdfAttachment.resourceUrl;

// eslint-disable-next-line functional/immutable-data
(ReactNativeBlobUtil as any).config = jest.fn(() => ({
  fetch: jest.fn().mockReturnValue({
    info: jest.fn().mockReturnValue({ status: mockResponseStatus }),
    path: jest.fn().mockReturnValue(defaultPath)
  })
}));
const mockAndroidUtil = jest.fn();
// eslint-disable-next-line functional/immutable-data
(ReactNativeBlobUtil as any).android = {
  addCompleteDownload: mockAndroidUtil
};
const mockIosUtil = jest.fn();
// eslint-disable-next-line functional/immutable-data
(ReactNativeBlobUtil as any).ios = {
  openDocument: jest.fn(),
  presentOptionsMenu: mockIosUtil
};

const header = { auth: "It's me again!" };

const mockShowPreview = jest.fn();

describe("handleDownloadResult utility function", () => {
  beforeEach(() => {
    mockAndroidUtil.mockReset();
    mockIosUtil.mockReset();
    mockShowPreview.mockClear();
  });

  it("should resolve successfully with an empty Promise", async () => {
    await expect(
      handleDownloadResult(mvlMockPdfAttachment, header, mockShowPreview)
    ).resolves.toEqual(undefined);
  });

  describe("and there is an error", () => {
    afterAll(() => {
      mockResponseStatus = 200;
    });
    it("should reject with an Error instance", async () => {
      mockResponseStatus = 500;
      await expect(
        handleDownloadResult(mvlMockPdfAttachment, header, mockShowPreview)
      ).rejects.toEqual(
        new Error("error 500 fetching " + mvlMockPdfAttachment.resourceUrl.href)
      );
    });
  });

  describe("when is running on Android", () => {
    beforeAll(() => {
      (platform as any).test_setPlatform("android");
    });

    describe("and the attachment is not a PDF", () => {
      it("should only call the Android utils", async () => {
        await handleDownloadResult(
          mvlMockOtherAttachment,
          header,
          mockShowPreview
        );
        expect(mockIosUtil).not.toHaveBeenCalled();
        expect(mockAndroidUtil).toHaveBeenCalledTimes(1);
        expect(mockAndroidUtil).toHaveBeenCalledWith({
          mime: mvlMockOtherAttachment.contentType,
          title: mvlMockOtherAttachment.displayName,
          showNotification: true,
          description: mvlMockOtherAttachment.displayName,
          path: defaultPath
        });
        expect(mockShowPreview).not.toHaveBeenCalled();
      });
    });

    // TODO:  this test will be useful once we implement Android support via
    //        https://pagopa.atlassian.net/browse/IAMVL-67
    //
    // describe("and the attachment is a PDF", () => {
    //   it("should only call the Android utils", async () => {
    //     await handleDownloadResult(
    //       mvlMockPdfAttachment,
    //       header,
    //       mockShowPreview
    //     );
    //     expect(mockIosUtil).not.toHaveBeenCalled();
    //     expect(mockAndroidUtil).not.toHaveBeenCalled();
    //     expect(mockAndroidUtil).not.toHaveBeenCalled();
    //     expect(mockShowPreview).toHaveBeenCalledWith(defaultPath, {
    //       _tag: "android",
    //       open: expect.any(Function),
    //       share: expect.any(Function),
    //       save: expect.any(Function)
    //     });
    //   });
    // });
  });

  describe("when is running on iOS", () => {
    beforeAll(() => {
      (platform as any).test_setPlatform("ios");
    });

    describe("and the attachment is not a PDF", () => {
      it("should only call the iOS utils", async () => {
        await handleDownloadResult(
          mvlMockOtherAttachment,
          header,
          mockShowPreview
        );
        expect(mockAndroidUtil).not.toHaveBeenCalled();
        expect(mockIosUtil).toHaveBeenCalledTimes(1);
        expect(mockIosUtil).toHaveBeenCalledWith(defaultPath);
        expect(mockShowPreview).not.toHaveBeenCalled();
      });
    });

    describe("and the attachment is a PDF", () => {
      it("should only call the showPreview callback", async () => {
        await handleDownloadResult(
          mvlMockPdfAttachment,
          header,
          mockShowPreview
        );
        expect(mockAndroidUtil).not.toHaveBeenCalled();
        expect(mockIosUtil).not.toHaveBeenCalled();
        expect(mockIosUtil).not.toHaveBeenCalled();
        expect(mockShowPreview).toHaveBeenCalledWith(defaultPath, {
          _tag: "ios",
          action: expect.any(Function)
        });
      });
    });
  });
});

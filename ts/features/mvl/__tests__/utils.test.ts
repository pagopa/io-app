import ReactNativeBlobUtil from "react-native-blob-util";

import * as platform from "../../../utils/platform";
import { mvlMockPdfAttachment } from "../types/__mock__/mvlMock";
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
  openDocument: mockIosUtil,
  presentOptionsMenu: jest.fn()
};

const header = { auth: "It's me again!" };

describe("handleDownloadResult utility function", () => {
  beforeEach(() => {
    mockAndroidUtil.mockReset();
    mockIosUtil.mockReset();
  });

  it("should resolve successfully with an empty Promise", async () => {
    await expect(
      handleDownloadResult(mvlMockPdfAttachment, header)
    ).resolves.toEqual(undefined);
  });

  describe("and there is an error", () => {
    afterAll(() => {
      mockResponseStatus = 200;
    });
    it("should reject with an Error instance", async () => {
      mockResponseStatus = 500;
      await expect(
        handleDownloadResult(mvlMockPdfAttachment, header)
      ).rejects.toEqual(
        new Error("error 500 fetching " + mvlMockPdfAttachment.resourceUrl.href)
      );
    });
  });

  describe("when is running on Android", () => {
    beforeAll(() => {
      (platform as any).test_setPlatform("android");
    });

    it("should call the Android utils", async () => {
      await handleDownloadResult(mvlMockPdfAttachment, header);
      expect(mockIosUtil).not.toHaveBeenCalled();
      expect(mockAndroidUtil).toHaveBeenCalledTimes(1);
      expect(mockAndroidUtil).toHaveBeenCalledWith({
        mime: mvlMockPdfAttachment.contentType,
        title: mvlMockPdfAttachment.displayName,
        showNotification: true,
        description: mvlMockPdfAttachment.displayName,
        path: defaultPath
      });
    });
  });

  describe("when is running on iOS", () => {
    beforeAll(() => {
      (platform as any).test_setPlatform("ios");
    });

    it("should call the iOS utils", async () => {
      await handleDownloadResult(mvlMockPdfAttachment, header);
      expect(mockAndroidUtil).not.toHaveBeenCalled();
      expect(mockIosUtil).toHaveBeenCalledTimes(1);
      expect(mockIosUtil).toHaveBeenCalledWith(defaultPath);
    });
  });
});

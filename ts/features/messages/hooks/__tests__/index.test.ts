import { mockOtherAttachment } from "../../../../__mocks__/attachment";
import { testableFunctions } from "../../hooks/useAttachmentDownload";

const path = "/tmp/path.pdf";

jest.mock("../../../../utils/platform");

const mockShowToast = jest.fn();

jest.mock("../../../../utils/showToast", () => ({
  showToast: () => mockShowToast()
}));

const mockIosPresentOptionsMenu = jest.fn();
const mockAndroidAddCompleteDownload = jest.fn();
const mockMediaCollectionCopyToMediaStore = jest.fn();

jest.mock("react-native-blob-util", () => ({
  ios: {
    presentOptionsMenu: () => mockIosPresentOptionsMenu()
  },
  android: {
    addCompleteDownload: () => mockAndroidAddCompleteDownload()
  },
  MediaCollection: {
    copyToMediaStore: () => mockMediaCollectionCopyToMediaStore()
  }
}));

const {
  taskCopyToMediaStore,
  taskAddCompleteDownload,
  taskDownloadFileIntoAndroidPublicFolder
} = testableFunctions!;

describe("Open attachment", function () {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  it("Should create a new file in the collection", async () => {
    mockMediaCollectionCopyToMediaStore.mockImplementation(() =>
      Promise.resolve()
    );

    await taskCopyToMediaStore(mockOtherAttachment, path)();
    expect(mockMediaCollectionCopyToMediaStore).toBeCalledTimes(1);
  });

  it("Should add an existing file to Downloads app", async () => {
    mockAndroidAddCompleteDownload.mockImplementation(() => Promise.resolve());

    await taskAddCompleteDownload(mockOtherAttachment, path)();
    expect(mockAndroidAddCompleteDownload).toBeCalledTimes(1);
  });

  describe("When platform is iOS", () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../../../../utils/platform").test_setPlatform("ios");
    });

    it("Should display an options menu", async () => {
      await taskDownloadFileIntoAndroidPublicFolder(
        mockOtherAttachment,
        path
      )();
      expect(mockIosPresentOptionsMenu).toBeCalledTimes(1);
    });
  });

  describe("When platform is Android", () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../../../../utils/platform").test_setPlatform("android");
    });

    it("Should not display an alert when a new file is successfully created", async () => {
      mockMediaCollectionCopyToMediaStore.mockImplementation(() =>
        Promise.resolve()
      );
      mockAndroidAddCompleteDownload.mockImplementation(() =>
        Promise.resolve()
      );

      await taskDownloadFileIntoAndroidPublicFolder(
        mockOtherAttachment,
        path
      )();
      expect(mockMediaCollectionCopyToMediaStore).toBeCalledTimes(1);
      expect(mockAndroidAddCompleteDownload).toBeCalledTimes(1);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it("Should display an alert if the creation of a new file within the collection fails", async () => {
      mockMediaCollectionCopyToMediaStore.mockImplementation(() =>
        Promise.reject(new Error("Error on reject"))
      );

      await taskDownloadFileIntoAndroidPublicFolder(
        mockOtherAttachment,
        path
      )();
      expect(mockShowToast).toBeCalledTimes(1);
    });

    it("Should display an alert when adding an existing file to the Downloads app fails", async () => {
      mockMediaCollectionCopyToMediaStore.mockImplementation(() =>
        Promise.resolve()
      );
      mockAndroidAddCompleteDownload.mockImplementation(() =>
        Promise.reject(new Error("Error on reject"))
      );

      await taskDownloadFileIntoAndroidPublicFolder(
        mockOtherAttachment,
        path
      )();
      expect(mockShowToast).toBeCalledTimes(1);
    });
  });
});

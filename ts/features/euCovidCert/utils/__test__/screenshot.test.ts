import { right } from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";
import { captureScreenshot, screenshotOptions } from "../screenshot";
import { saveImageToGallery } from "../../../../utils/share";
import I18n from "../../../../i18n";

const temporaryDirectory = "/tmp";
const defaultScreenshotFilename = "screenshot";
const defaultScreenshotExtension = "png";

jest.mock("react-native-i18n", () => ({
  t: jest.fn(key => key)
}));

jest.mock("react-native-view-shot", () => ({
  captureRef: jest.fn(() =>
    Promise.resolve(
      `${defaultScreenshotFilename}.${defaultScreenshotExtension}`
    )
  )
}));

jest.mock("react-native-fs", () => ({
  TemporaryDirectoryPath: temporaryDirectory,
  exists: jest.fn(_ => Promise.resolve(true)),
  unlink: jest.fn(_ => Promise.resolve()),
  moveFile: jest.fn(_ => Promise.resolve())
}));

// the resolved value returned by saveImageToGallery doesn't matter for the testing purpose
const mockSave = right(T.of(() => Promise.resolve("")));
jest.mock("../../../../utils/share", () => ({
  saveImageToGallery: jest.fn(_ => mockSave)
}));

describe("EuCovidCertificate screenshot", () => {
  describe("given filename and album", () => {
    const givenFilename = "Covid 19 Green Pass";
    const givenAlbum = "IO";
    const options = {
      ...screenshotOptions,
      filename: givenFilename,
      album: givenAlbum
    };
    it("saves the certificate in the given album with the given filename", done => {
      captureScreenshot(1, options, {
        onSuccess: () => {
          expect(saveImageToGallery).toHaveBeenCalledWith(
            `${temporaryDirectory}/${givenFilename}.${defaultScreenshotExtension}`,
            givenAlbum
          );
          done();
        }
      });
    });
  });

  describe("given default screenshotOptions", () => {
    const options = screenshotOptions;
    it("filename is returned from locales", () => {
      expect(options.filename).toEqual(
        I18n.t("features.euCovidCertificate.common.title")
      );
    });
  });
});

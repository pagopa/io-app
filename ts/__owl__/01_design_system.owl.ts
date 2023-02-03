import * as reactNativeOwl from "react-native-owl";
import { RNOWL_JEST_TIMOUT } from "./utils";

describe("Design System", () => {
  beforeAll(() => jest.setTimeout(RNOWL_JEST_TIMOUT));
  describe("Home screen", () => {
    it("Check screen UI", async () => {
      await reactNativeOwl.toExist("profileTab");

      const homeScreen = await reactNativeOwl.takeScreenshot("home-screen");
      expect(homeScreen).toMatchBaseline();

      await reactNativeOwl.press("profileTab");
      await reactNativeOwl.press("versionSection");
      await reactNativeOwl.press("versionSection");
      await reactNativeOwl.press("versionSection");
      await reactNativeOwl.press("versionSection");
      await reactNativeOwl.press("versionSection");
      await reactNativeOwl.toExist("designSystemSection");
      await reactNativeOwl.press("designSystemSection");
    });
  });
});

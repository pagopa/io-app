import * as reactNativeOwl from "react-native-owl";
import {
  confirmPinButtonId,
  loginWithPosteID,
  pinConfirmationFieldId,
  pinFieldId,
  RNOWL_JEST_TIMOUT,
  waitForLoginScreen,
  waitForPinScreen,
  waitForSpidScreen
} from "./utils";

describe("00. Onboarding", () => {
  beforeAll(() => jest.setTimeout(RNOWL_JEST_TIMOUT));
  describe("Login screen", () => {
    it("Check screen UI", async () => {
      await waitForLoginScreen();

      const screen = await reactNativeOwl.takeScreenshot("login-screen");
      expect(screen).toMatchBaseline();
    });
  });

  describe("SPID screen", () => {
    it("Check screen UI", async () => {
      await waitForSpidScreen();

      const screen = await reactNativeOwl.takeScreenshot("spid-screen");
      expect(screen).toMatchBaseline();
    });
  });

  describe("Share data screen", () => {
    it("Check screen UI", async () => {
      await loginWithPosteID();

      const screen = await reactNativeOwl.takeScreenshot("share-data-screen");
      expect(screen).toMatchBaseline();
    });
  });

  describe("Pin screen", () => {
    it("Pin screen UI", async () => {
      await waitForPinScreen();

      const screen = await reactNativeOwl.takeScreenshot("pin-screen");
      expect(screen).toMatchBaseline();

      await reactNativeOwl.changeText(pinFieldId, "111111");
      await reactNativeOwl.changeText(pinConfirmationFieldId, "111111");

      const screenEnabled = await reactNativeOwl.takeScreenshot(
        "pin-screen-enabled"
      );
      expect(screenEnabled).toMatchBaseline();

      await reactNativeOwl.press(confirmPinButtonId);
    });
  });

  describe("Main Screen", () => {
    it("Main then Buttons", async () => {
      await reactNativeOwl.toExist("profileTab");

      const homeScreen = await reactNativeOwl.takeScreenshot("home-screen");
      expect(homeScreen).toMatchBaseline();

      await reactNativeOwl.press("profileTab");

      const profileScreen = await reactNativeOwl.takeScreenshot(
        "profile-screen"
      );
      expect(profileScreen).toMatchBaseline();

      await reactNativeOwl.toExist("versionSection");
      await reactNativeOwl.press("versionSection");
      await reactNativeOwl.press("versionSection");
      await reactNativeOwl.press("versionSection");
      await reactNativeOwl.press("versionSection");
      await reactNativeOwl.press("versionSection");

      await reactNativeOwl.toExist("designSystemSection");
      await reactNativeOwl.press("designSystemSection");

      await reactNativeOwl.toExist("ButtonsID");
      await reactNativeOwl.press("ButtonsID");

      const firstPartButtonsScreen = await reactNativeOwl.takeScreenshot(
        "first-part-button-screen"
      );
      expect(firstPartButtonsScreen).toMatchBaseline();
    });
  });
});

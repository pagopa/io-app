import { takeScreenshot } from "react-native-owl";
import {
  loginWithPosteID,
  RNOWL_JEST_TIMOUT,
  waitForLoginScreen,
  waitForPinScreen,
  waitForSpidScreen
} from "./utils";

describe("Onboarding", () => {
  beforeAll(() => jest.setTimeout(RNOWL_JEST_TIMOUT));
  describe("Login screen", () => {
    it("Check screen UI", async () => {
      await waitForLoginScreen();

      const screen = await takeScreenshot("login-screen");
      expect(screen).toMatchBaseline();
    });
  });

  describe("SPID screen", () => {
    it("Check screen UI", async () => {
      await waitForSpidScreen();

      const screen = await takeScreenshot("spid-screen");
      expect(screen).toMatchBaseline();
    });
  });

  describe("Share data screen", () => {
    it("Check screen UI", async () => {
      await loginWithPosteID();

      const screen = await takeScreenshot("share-data-screen");
      expect(screen).toMatchBaseline();
    });
  });

  describe("Pin screen", () => {
    it("Pin screen UI", async () => {
      await waitForPinScreen();

      const screen = await takeScreenshot("pin-screen");
      expect(screen).toMatchBaseline();
    });
  });
});

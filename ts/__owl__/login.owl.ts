import { takeScreenshot } from "react-native-owl";
import {
  loginWithPosteID,
  waitForLoginScreen,
  waitForSpidScreen
} from "./utils";

describe("Onboarding", () => {
  beforeAll(() => jest.setTimeout(10 * 1000));
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
});

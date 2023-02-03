import { reload, takeScreenshot, toExist } from "react-native-owl";
import {
  confirmPinButtonId,
  loginWithPosteID,
  RNOWL_JEST_TIMOUT,
  setPinAnGoAhead,
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
      await reload(); // same testID views seems to presists...
      await toExist(confirmPinButtonId);

      const screen = await takeScreenshot("pin-screen");
      expect(screen).toMatchBaseline();

      await setPinAnGoAhead();
    });
  });
});

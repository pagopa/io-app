import { takeScreenshot } from "react-native-owl";
import {
  loginWithPosteID,
  waitForLoginScreen,
  waitForSpidScreen
} from "./utils";

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

describe("SPID screen", () => {
  it("Check screen UI", async () => {
    await loginWithPosteID();
  });
});

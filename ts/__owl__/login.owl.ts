import { exec } from "child_process";
import { Platform } from "react-native";
import { takeScreenshot } from "react-native-owl";
import { waitForLoginScreen } from "./utils";

describe("Login screen", () => {
  it("Check screen UI", async () => {
    await waitForLoginScreen();
    // https://github.com/FormidableLabs/react-native-owl/issues/129
    if (Platform.OS === "android") {
      exec('adb shell input text "mock\\ text"');
    }
    const screen = await takeScreenshot("login-screen");
    expect(screen).toMatchBaseline();
  });
});

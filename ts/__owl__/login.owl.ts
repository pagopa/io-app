import { takeScreenshot } from "react-native-owl";
import { waitForLoginScreen } from "./utils";

describe("Login screen", () => {
  it("Check screen UI", async () => {
    await waitForLoginScreen();

    const screen = await takeScreenshot("login-screen");
    expect(screen).toMatchBaseline();
  });
});

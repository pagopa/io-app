const detox = require("detox");
const config = require("../package.json").detox;

// Set the default test timeout of 120s
jest.setTimeout(120000);

beforeAll(async () => {
  await detox.init(config, { launchApp: false });
});

afterAll(async () => {
  await detox.cleanup();
});

describe("app", () => {
  it("should display SPID login button", async () => {
    await device.launchApp({ permissions: { notifications: "YES" } });
    await device.reloadReactNative();

    const loginButtonId = "landing-button-login";
    await expect(element(by.id(loginButtonId))).toBeVisible();
    await element(by.id(loginButtonId)).tap();
    await expect(element(by.id("idps-grid"))).toBeVisible();
  });
});

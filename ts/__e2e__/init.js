const detox = require("detox");
const adapter = require("detox/runners/jest/adapter");
const { setLocale } = require("../i18n");
const config = require("../../package.json").detox;

// Set the default test timeout (in milliseconds)
jest.setTimeout(5 * 60 * 1000);
jasmine.getEnv().addReporter(adapter);

beforeAll(async () => {
  // custom setup
  console.log("Initializing Detox");
  await detox.init(config, { launchApp: false });
  await device.launchApp({ permissions: { notifications: "YES" } });
  // enforce IT locale because that's how the API are configured
  setLocale("it");
});

afterAll(async () => {
  // custom teardown
  await adapter.afterAll();
  await detox.cleanup();
});

const { setLocale } = require("../ts/i18n");
const { launchAppConfig } = require("../ts/__e2e__/config");

beforeAll(async () => {
  // custom setup
  console.log("Initializing Detox");
  await device.launchApp(launchAppConfig);
  // enforce IT locale because that's how the API are configured
  setLocale("it");
});

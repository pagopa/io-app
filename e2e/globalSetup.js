/* eslint-disable no-undef */
import { setLocale } from "../ts/i18n";
import { launchAppConfig } from "../ts/__e2e__/config";

beforeAll(async () => {
  // custom setup
  // eslint-disable-next-line no-console
  console.log("Initializing Detox");
  await device.launchApp(launchAppConfig);
  // enforce IT locale because that's how the API are configured
  setLocale("it");
});

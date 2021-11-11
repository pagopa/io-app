import adapter from "detox/runners/jest/adapter";
import { launchAppConfig } from "./config";
import { loginWithSPID } from "./utils";

describe("User Login using SPID", () => {
  beforeEach(async () => {
    await adapter.beforeEach();
  });

  beforeAll(async () => {
    await device.launchApp(launchAppConfig);
  });

  describe("when the user never logged in before", () => {
    it("should let the user log in with SPID", async () => {
      await loginWithSPID();
    });
  });
});

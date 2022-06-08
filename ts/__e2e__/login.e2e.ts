import { startDevServer, teardownDevServer } from "../utils/devServer";
import { loginWithSPID } from "./utils";

describe("User Login using SPID", () => {
  beforeEach(async () => {
    await startDevServer();
  });

  afterEach(() => {
    teardownDevServer();
  });

  describe("when the user never logged in before", () => {
    it("should let the user log in with SPID", async () => {
      await loginWithSPID();
    });
  });
});

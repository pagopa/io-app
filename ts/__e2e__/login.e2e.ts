import { loginWithSPID } from "./utils";

describe("User Login using SPID", () => {
  describe("when the user never logged in before", () => {
    it("should let the user log in with SPID", async () => {
      await loginWithSPID();
    });
  });
});

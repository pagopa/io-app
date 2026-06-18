import { createCredentialIssuanceActorsImplementation } from "../actors";
import { Env } from "../../../common/utils/environment";

describe("createCredentialIssuanceActorsImplementation", () => {
  it("includes the shared session refresh actor", () => {
    const env = {} as Env;
    const itwVersion = "1.3.3";
    const store = {
      getState: jest.fn(),
      subscribe: jest.fn(),
      dispatch: jest.fn()
    };

    const actors = createCredentialIssuanceActorsImplementation(
      env,
      itwVersion,
      store as never
    );

    expect(actors).toHaveProperty("waitForSessionRefresh");
  });
});

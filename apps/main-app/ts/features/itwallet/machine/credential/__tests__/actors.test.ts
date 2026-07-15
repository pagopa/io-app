import { Env } from "../../../common/utils/environment";
import { createCredentialIssuanceActorsImplementation } from "../actors";
import { itwCredentialIssuanceMachine } from "../machine";

describe("createCredentialIssuanceActorsImplementation", () => {
  /**
   * `machine.provide()` accepts partial implementations, so a missing actor is
   * not caught by the type-checker and only surfaces at runtime as a
   * `notImplemented` crash (e.g. `waitForSessionRefresh` when the session
   * expires). Non-regression: the factory must implement every actor declared
   * in the machine setup.
   */
  it("implements every actor declared in the machine setup", () => {
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

    const declaredActors = Object.keys(
      itwCredentialIssuanceMachine.implementations.actors
    );
    const implementedActors = Object.keys(actors);

    expect(declaredActors).not.toHaveLength(0);
    expect(implementedActors).toEqual(expect.arrayContaining(declaredActors));
    expect(implementedActors).toHaveLength(declaredActors.length);
  });
});

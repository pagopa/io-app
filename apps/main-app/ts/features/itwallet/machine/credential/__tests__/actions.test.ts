import { createCredentialIssuanceActionsImplementation } from "../actions";
import { itwCredentialIssuanceMachine, notImplemented } from "../machine";

describe("createCredentialIssuanceActionsImplementation", () => {
  it("implements every action the machine declares", () => {
    const implemented = Object.keys(
      createCredentialIssuanceActionsImplementation(
        {} as never,
        {} as never,
        {} as never
      )
    );
    const missing = Object.entries(
      itwCredentialIssuanceMachine.implementations.actions
    )
      .filter(([, impl]) => impl === notImplemented)
      .map(([name]) => name)
      .filter(name => !implemented.includes(name));

    expect(missing).toEqual([]);
  });
});

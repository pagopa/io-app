import { itwCredentialIssuanceMachine, notImplemented } from "../machine";

describe("credential issuance actions", () => {
  it("implements every action the machine declares", () => {
    const missing = Object.entries(
      itwCredentialIssuanceMachine.implementations.actions
    )
      .filter(([, implementation]) => implementation === notImplemented)
      .map(([name]) => name);

    expect(missing).toEqual([]);
  });
});

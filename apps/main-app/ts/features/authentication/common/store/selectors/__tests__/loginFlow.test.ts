import { GlobalState } from "../../../../../../store/reducers/types";
import { isOneIdentityLoginSelector } from "../loginFlow";

describe("isOneIdentityLoginSelector", () => {
  it.each([
    { name: "not logged in", isOneIdentityLogin: undefined },
    { name: "logged in with OneIdentity", isOneIdentityLogin: true },
    { name: "logged in with IO", isOneIdentityLogin: false }
  ])("returns $isOneIdentityLogin when $name", ({ isOneIdentityLogin }) => {
    expect(
      isOneIdentityLoginSelector({
        features: { loginFeatures: { loginFlow: { isOneIdentityLogin } } }
      } as unknown as GlobalState)
    ).toBe(isOneIdentityLogin);
  });
});

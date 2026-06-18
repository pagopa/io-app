import { ItWalletThemes } from "../theme";

describe("IT-Wallet themes", () => {
  it("should have the correct structure and values", () => {
    expect(ItWalletThemes).toMatchSnapshot();
  });
});

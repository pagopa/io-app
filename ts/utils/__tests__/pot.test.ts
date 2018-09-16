import { Pot, pot } from "../pot";

describe("Pot", () => {
  it("should map PotSuccess", () => {
    const aPot: Pot<string> = {
      kind: "PotSuccess",
      value: "hello"
    };

    const res = pot.map(aPot, _ => "world");
    expect(res).toEqual({
      kind: "PotSuccess",
      value: "world"
    });
  });
});

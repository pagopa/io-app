import * as pot from "../pot";

describe("toLoading", () => {
  it("should transition non-loading states to loading states", () => {
    expect(pot.isLoading(pot.toLoading(pot.none))).toBeTruthy();
    expect(pot.isLoading(pot.toLoading(pot.noneError(Error())))).toBeTruthy();
    expect(pot.isLoading(pot.toLoading(pot.some(1)))).toBeTruthy();
    expect(
      pot.isLoading(pot.toLoading(pot.someError(1, Error())))
    ).toBeTruthy();

    const p: pot.Pot<number> = pot.some(1);
    if (!pot.isLoading(p)) {
      expect(pot.toLoading(p)).toBeTruthy();
    }
  });
});

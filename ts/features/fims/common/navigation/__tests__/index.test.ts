import { FIMS_ROUTES } from "..";

describe("FIMS_ROUTES", () => {
  it("should match expected values", () => {
    expect(FIMS_ROUTES).toMatchSnapshot();
  });
});

import { compareSelectedBonusByYear } from "../bonusRequest";
import { Anno } from "../../../../../../definitions/cdc/Anno";

describe("compareSelectedBonusByYear", () => {
  it("Should return 1 if the year of the first bonus is greater than the second one", () => {
    expect(
      compareSelectedBonusByYear(
        { year: "2019" as Anno },
        { year: "2018" as Anno }
      )
    ).toEqual(1);
  });
  it("Should return -1 if the year of the first bonus is smaller than the second one", () => {
    expect(
      compareSelectedBonusByYear(
        { year: "2018" as Anno },
        { year: "2019" as Anno }
      )
    ).toEqual(-1);
  });
});

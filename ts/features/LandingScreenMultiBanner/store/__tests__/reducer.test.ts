import { applicationChangeState } from "../../../../store/actions/application";
import { landingScreenBannersReducer } from "../reducer";

describe("landingScreenBannersReducer", () => {
  it("should match snapshot", () => {
    expect(
      landingScreenBannersReducer(undefined, applicationChangeState("active"))
    ).toMatchSnapshot();
  });
});

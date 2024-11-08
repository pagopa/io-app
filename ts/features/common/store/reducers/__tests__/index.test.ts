import { featuresPersistor } from "..";
import { applicationChangeState } from "../../../../../store/actions/application";

describe("featuresPersistor", () => {
  it("should match snapshot", () => {
    expect(
      JSON.stringify(
        featuresPersistor(undefined, applicationChangeState("active"))
      )
    ).toMatchSnapshot();
  });
});

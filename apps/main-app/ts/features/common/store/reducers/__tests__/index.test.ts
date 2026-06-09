import { featuresPersistor } from "..";
import { applicationChangeState } from "../../../../../store/actions/application";

describe("featuresPersistor", () => {
  it("should match snapshot", () => {
    expect(
      featuresPersistor(undefined, applicationChangeState("active"))
    ).toMatchSnapshot();
  });
});

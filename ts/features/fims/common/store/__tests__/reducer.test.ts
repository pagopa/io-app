import { applicationChangeState } from "../../../../../store/actions/application";
import fimsReducer from "../reducer";

describe("fimsReducer", () => {
  it("should match snapshot", () => {
    const fimsState = fimsReducer(undefined, applicationChangeState("active"));
    expect(fimsState).toMatchSnapshot();
  });
});

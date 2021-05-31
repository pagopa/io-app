import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";

describe("Test byAuthCode reducer behaviour", () => {
  it("Initial state should be pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.euCovidCert.byAuthCode).toStrictEqual({});
  });
});

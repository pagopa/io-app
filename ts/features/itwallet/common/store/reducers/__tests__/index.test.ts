import { applicationChangeState } from "../../../../../../store/actions/application";
import itWalletReducer from "../index";

describe("itWalletReducer", () => {
  it("should match snapshot", () => {
    const itWalletState = itWalletReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(itWalletState).toMatchSnapshot();
  });
});

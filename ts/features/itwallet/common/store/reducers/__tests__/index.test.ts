import { applicationChangeState } from "../../../../../../store/actions/application";
import itWalletReducer from "../index";

describe("itWalletReducer", () => {
  it("should match snapshot [if this test fails, remember to add a migration to the store before updating the snapshot]", () => {
    const itWalletState = itWalletReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(itWalletState).toMatchSnapshot();
  });
});

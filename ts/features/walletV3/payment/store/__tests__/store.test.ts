import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { WalletPaymentState } from "../reducers";

const INITIAL_STATE: WalletPaymentState = {
  sessionToken: pot.none,
  paymentDetails: pot.none,
  userWallets: pot.none,
  allPaymentMethods: pot.none,
  pspList: pot.none,
  chosenPaymentMethod: O.none,
  chosenPsp: O.none,
  transaction: pot.none,
  authorizationUrl: pot.none
};

describe("Test Wallet reducer", () => {
  it("should have initial state at startup", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.payment).toStrictEqual(INITIAL_STATE);
  });
});

import { applicationChangeState } from "../../../../../../store/actions/application";
import { Action } from "../../../../../../store/actions/types";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";
import {
  itwRemoveIntegrityKeyTag,
  itwSetIntegrityServiceStatus,
  itwStoreIntegrityKeyTag
} from "../../actions";

const withActions = (actions: ReadonlyArray<Action>): GlobalState =>
  actions.reduce(
    appReducer,
    appReducer(undefined, applicationChangeState("active"))
  );

describe("ITW issuance reducer", () => {
  it("should add the integrity key tag", () => {
    const targetSate = withActions([
      itwStoreIntegrityKeyTag("7408c9b7-5f23-4ca6-8960-58305cff5b7e")
    ]);

    expect(targetSate.features.itWallet.issuance.integrityKeyTag).toEqual(
      "7408c9b7-5f23-4ca6-8960-58305cff5b7e"
    );
  });

  it("should remove the integrity key tag", () => {
    const targetSate = withActions([
      itwStoreIntegrityKeyTag("7408c9b7-5f23-4ca6-8960-58305cff5b7e"),
      itwRemoveIntegrityKeyTag()
    ]);

    expect(
      targetSate.features.itWallet.issuance.integrityKeyTag
    ).toBeUndefined();
  });

  it("should reset the state", () => {
    const targetSate = withActions([
      itwStoreIntegrityKeyTag("7408c9b7-5f23-4ca6-8960-58305cff5b7e"),
      itwLifecycleStoresReset()
    ]);

    expect(
      targetSate.features.itWallet.issuance.integrityKeyTag
    ).toBeUndefined();
    expect(
      targetSate.features.itWallet.issuance.integrityServiceStatus
    ).toEqual(undefined);
  });

  it("should set the integrity preparation flag", () => {
    const targetSate = withActions([itwSetIntegrityServiceStatus("ready")]);

    expect(
      targetSate.features.itWallet.issuance.integrityServiceStatus
    ).toEqual("ready");
  });
});

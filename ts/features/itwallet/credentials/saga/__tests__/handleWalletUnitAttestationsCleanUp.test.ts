/* eslint-disable arrow-body-style */
import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga-test-plan/matchers";
import { handleWalletUnitAttestationsCleanUp } from "../handleWalletUnitAttestationsCleanUp";
import { itwWalletUnitAttestationsRemoveById } from "../../../walletInstance/store/actions";
import { itwWalletUnitAttestations } from "../../../walletInstance/store/selectors";
import { itwCredentialsByTypeSelector } from "../../store/selectors";

describe("handleWalletUnitAttestationsCleanUp", () => {
  const credentialsByType = {
    PID: {
      "dc+sd-jwt": { walletUnitAttestationId: "wua1" }
    },
    MDL: {
      "dc+sd-jwt": { walletUnitAttestationId: "wua2" },
      mso_mdoc: { walletUnitAttestationId: "wua3" }
    }
  };

  it("should dispatch the remove action when there are unused WUAs", () => {
    return expectSaga(handleWalletUnitAttestationsCleanUp)
      .provide([
        [
          select(itwWalletUnitAttestations),
          {
            wua1: "a",
            wua2: "b",
            wua3: "c",
            wua4: "d",
            wua5: "e"
          }
        ],
        [select(itwCredentialsByTypeSelector), credentialsByType]
      ])
      .put(itwWalletUnitAttestationsRemoveById(["wua4", "wua5"]))
      .run();
  });

  it("should NOT dispatch the remove action when the WUAs are in use", () => {
    return expectSaga(handleWalletUnitAttestationsCleanUp)
      .provide([
        [
          select(itwWalletUnitAttestations),
          { wua1: "a", wua2: "b", wua3: "c" }
        ],
        [select(itwCredentialsByTypeSelector), credentialsByType]
      ])
      .not.put(itwWalletUnitAttestationsRemoveById([]))
      .run();
  });
});

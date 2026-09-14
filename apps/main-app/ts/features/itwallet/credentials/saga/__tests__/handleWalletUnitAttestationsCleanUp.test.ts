/* eslint-disable arrow-body-style */
import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga-test-plan/matchers";

import { itwKeyAttestationsRemoveById } from "../../../walletInstance/store/actions";
import { itwKeyAttestationsSelector } from "../../../walletInstance/store/selectors";
import { itwCredentialsByTypeSelector } from "../../store/selectors";
import { handleKeyAttestationsCleanUp } from "../handleKeyAttestationsCleanUp";

describe("handleKeyAttestationsCleanUp", () => {
  const credentialsByType = {
    PID: {
      "dc+sd-jwt": { keyAttestationId: "ka1" }
    },
    MDL: {
      "dc+sd-jwt": { keyAttestationId: "ka2" },
      mso_mdoc: { keyAttestationId: "ka3" }
    }
  };

  it("should dispatch the remove action when there are unused KAs", () => {
    return expectSaga(handleKeyAttestationsCleanUp)
      .provide([
        [
          select(itwKeyAttestationsSelector),
          {
            ka1: "a",
            ka2: "b",
            ka3: "c",
            ka4: "d",
            ka5: "e"
          }
        ],
        [select(itwCredentialsByTypeSelector), credentialsByType]
      ])
      .put(itwKeyAttestationsRemoveById(["ka4", "ka5"]))
      .run();
  });

  it("should NOT dispatch the remove action when the KAs are in use", () => {
    return expectSaga(handleKeyAttestationsCleanUp)
      .provide([
        [select(itwKeyAttestationsSelector), { ka1: "a", ka2: "b", ka3: "c" }],
        [select(itwCredentialsByTypeSelector), credentialsByType]
      ])
      .not.put(itwKeyAttestationsRemoveById([]))
      .run();
  });
});

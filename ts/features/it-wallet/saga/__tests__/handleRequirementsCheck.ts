import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { itwRequirementsRequest } from "../../store/actions";
import { handleRequirementsRequest } from "../handleRequirementsCheck";
import { idpSelector } from "../../../../store/reducers/authentication";
import { ItWalletErrorTypes } from "../../utils/errors/itwErrors";
import {
  hasApiLevelSupportSelector,
  hasNFCFeatureSelector
} from "../../store/reducers/cie";

describe("handleRequirementsCheck", () => {
  it("should return true if an user logged in with CIE", async () => {
    const mockedState = O.some({ name: "cie" });
    await expectSaga(handleRequirementsRequest)
      .provide([[matchers.select(idpSelector), mockedState]])
      .put(itwRequirementsRequest.success(true))
      .run();
  });

  it("should return true if an user logged in SPID but has NFC capabilities", async () => {
    const mockedState = O.some({ name: "Poste" });
    const mockNfcState = pot.some(true);
    await expectSaga(handleRequirementsRequest)
      .provide([
        [matchers.select(idpSelector), mockedState],
        [matchers.select(hasNFCFeatureSelector), mockNfcState],
        [matchers.select(hasApiLevelSupportSelector), mockNfcState]
      ])
      .put(itwRequirementsRequest.success(true))
      .run();
  });

  it("should return false if an user logged in SPID and hasn't NFC capabilities", async () => {
    const mockedState = O.some({ name: "Poste" });
    const mockNfcState = pot.some(false);
    await expectSaga(handleRequirementsRequest)
      .provide([
        [matchers.select(idpSelector), mockedState],
        [matchers.select(hasNFCFeatureSelector), mockNfcState],
        [matchers.select(hasApiLevelSupportSelector), mockNfcState]
      ])
      .put(
        itwRequirementsRequest.failure({
          code: ItWalletErrorTypes.NFC_NOT_SUPPORTED
        })
      )
      .run();
  });
});

import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import * as O from "fp-ts/lib/Option";
import { handleWiaRequest } from "../itwWiaSaga";
import { idpSelector } from "../../../../store/reducers/authentication";
import { ItWalletErrorTypes } from "../../utils/itwErrorsUtils";
import { getWia } from "../../utils/wia";
import { isCIEAuthenticationSupported } from "../../utils/cie";
import { itwWiaRequest } from "../../store/actions/itwWiaActions";

describe("handleWiaRequest", () => {
  const wiaMock = "wia";

  it("should set the pot to some state with a WIA if an user logged in SPID but has NFC capabilities", async () => {
    const mockedState = O.some({ name: "Poste" });
    await expectSaga(handleWiaRequest)
      .provide([
        [matchers.select(idpSelector), mockedState],
        [matchers.call.fn(isCIEAuthenticationSupported), true],
        [matchers.call.fn(getWia), wiaMock]
      ])
      .put(itwWiaRequest.success(wiaMock))
      .run();
  });

  it("should set the pot to an error state if an user logged in SPID and hasn't NFC capabilities", async () => {
    const mockedState = O.some({ name: "Poste" });
    await expectSaga(handleWiaRequest)
      .provide([
        [matchers.select(idpSelector), mockedState],
        [matchers.call.fn(isCIEAuthenticationSupported), false]
      ])
      .put(
        itwWiaRequest.failure({
          code: ItWalletErrorTypes.NFC_NOT_SUPPORTED
        })
      )
      .run();
  });
});

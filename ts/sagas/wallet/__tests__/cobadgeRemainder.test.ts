import { testSaga } from "redux-saga-test-plan";
import * as pot from "italia-ts-commons/lib/pot";
import { sendAddCobadgeMessageSaga } from "../cobadgeRemainder";
import {
  bancomatListVisibleInWalletSelector,
  cobadgeListVisibleInWalletSelector
} from "../../../store/reducers/wallet/wallets";
import { sendAddCobadgeMessage } from "../../../store/actions/wallet/wallets";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod
} from "../../../types/pagopa";
import { TypeEnum } from "../../../../definitions/pagopa/walletv2/CardInfo";
import { coBadgeAbiConfigurationSelector } from "../../../features/wallet/onboarding/cobadge/store/reducers/abiConfiguration";

const anAbiCode = "123";
const aBancomat = {
  walletType: "Bancomat",
  kind: "Bancomat",
  info: {
    issuerAbiCode: anAbiCode
  }
} as BancomatPaymentMethod;

const aCoBadge = {
  walletType: "Card",
  kind: "CreditCard",
  pagoPA: false,
  info: {
    issuerAbiCode: anAbiCode,
    type: TypeEnum.CRD
  }
} as CreditCardPaymentMethod;

describe("sendAddCobadgeMessageSaga", () => {
  it("should dispatch the sendAddCobadgeMessage action with payload false if there isn't at least one bancomat", () => {
    testSaga(sendAddCobadgeMessageSaga)
      .next()
      .select(bancomatListVisibleInWalletSelector)
      .next(pot.some([]))
      .put(sendAddCobadgeMessage(false));
  });
  it("should dispatch the sendAddCobadgeMessage action with payload true if there is at least one bancomat, the abi is in the abiConfig and is enabled and there isn't a co-badge with the same abi", () => {
    testSaga(sendAddCobadgeMessageSaga)
      .next()
      .select(bancomatListVisibleInWalletSelector)
      .next(pot.some([aBancomat]))
      .select(cobadgeListVisibleInWalletSelector)
      .next(pot.some([aCoBadge]))
      .select(coBadgeAbiConfigurationSelector);
  });
});

import { testSaga } from "redux-saga-test-plan";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { sendAddCobadgeMessageSaga } from "../cobadgeReminder";
import {
  bancomatListVisibleInWalletSelector,
  cobadgeListVisibleInWalletSelector
} from "../../../store/reducers/wallet/wallets";
import { sendAddCobadgeMessage } from "../../../store/actions/wallet/wallets";
import { StatusEnum } from "../../../../definitions/pagopa/cobadge/configuration/CoBadgeService";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod
} from "../../../types/pagopa";
import { TypeEnum } from "../../../../definitions/pagopa/walletv2/CardInfo";
import { coBadgeAbiConfigurationSelector } from "../../../features/wallet/onboarding/cobadge/store/reducers/abiConfiguration";
import { loadCoBadgeAbiConfiguration } from "../../../features/wallet/onboarding/cobadge/store/actions";

const anAbiCode = "123";
const anotherAbiCode = "456";
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
    issuerAbiCode: anotherAbiCode,
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
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.none)
      .put(loadCoBadgeAbiConfiguration.request())
      .next()
      .take([
        loadCoBadgeAbiConfiguration.success,
        loadCoBadgeAbiConfiguration.failure
      ])
      .next(getType(loadCoBadgeAbiConfiguration.success))
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.some({ "123": StatusEnum.enabled }))
      .select(cobadgeListVisibleInWalletSelector)
      .next(pot.some([aCoBadge]))
      .put(sendAddCobadgeMessage(true));
  });
  it("should dispatch the sendAddCobadgeMessage action with payload false if there is at least one bancomat, the abi is in the abiConfig and is not enabled", () => {
    testSaga(sendAddCobadgeMessageSaga)
      .next()
      .select(bancomatListVisibleInWalletSelector)
      .next(pot.some([aBancomat]))
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.some({ "123": StatusEnum.disabled }))
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.some({ "123": StatusEnum.disabled }))
      .select(cobadgeListVisibleInWalletSelector)
      .next(pot.some([aCoBadge]))
      .put(sendAddCobadgeMessage(false));
  });
  it("should dispatch the sendAddCobadgeMessage action with payload false if there is at least one bancomat, the abi is not in the abiConfig", () => {
    testSaga(sendAddCobadgeMessageSaga)
      .next()
      .select(bancomatListVisibleInWalletSelector)
      .next(pot.some([aBancomat]))
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.some({ "789": StatusEnum.disabled }))
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.some({ "789": StatusEnum.disabled }))
      .select(cobadgeListVisibleInWalletSelector)
      .next(pot.some([aCoBadge]))
      .put(sendAddCobadgeMessage(false));
  });
  it("should dispatch the sendAddCobadgeMessage action with payload false if there is at least one bancomat and there is a co-badge with the same abi", () => {
    testSaga(sendAddCobadgeMessageSaga)
      .next()
      .select(bancomatListVisibleInWalletSelector)
      .next(pot.some([aBancomat]))
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.some({ "123": StatusEnum.disabled }))
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.some({ "123": StatusEnum.disabled }))
      .select(cobadgeListVisibleInWalletSelector)
      .next(
        pot.some([
          { ...aCoBadge, info: { ...aCoBadge.info, issuerAbiCode: anAbiCode } }
        ])
      )
      .put(sendAddCobadgeMessage(false));
  });
  it("should dispatch the sendAddCobadgeMessage action with payload false if there is at least one bancomat but without the issuerAbiCode", () => {
    testSaga(sendAddCobadgeMessageSaga)
      .next()
      .select(bancomatListVisibleInWalletSelector)
      .next(pot.some([{ ...aBancomat, info: {} }]))
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.some({ "123": StatusEnum.disabled }))
      .select(coBadgeAbiConfigurationSelector)
      .next(pot.some({ "123": StatusEnum.disabled }))
      .select(cobadgeListVisibleInWalletSelector)
      .next(pot.some([aCoBadge]))
      .put(sendAddCobadgeMessage(false));
  });
});

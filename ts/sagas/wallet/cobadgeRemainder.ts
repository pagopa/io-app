import { put, select, take } from "redux-saga/effects";
import {
  bancomatListVisibleInWalletSelector,
  cobadgeListVisibleInWalletSelector
} from "../../store/reducers/wallet/wallets";
import * as pot from "italia-ts-commons/lib/pot";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod
} from "../../types/pagopa";
import {
  coBadgeAbiConfigurationSelector,
  getCoBadgeAbiConfigurationSelector
} from "../../features/wallet/onboarding/cobadge/store/reducers/abiConfiguration";
import { IndexedById } from "../../store/helpers/indexer";
import { StatusEnum } from "../../../definitions/pagopa/cobadge/configuration/CoBadgeService";
import { NetworkError } from "../../utils/errors";
import { loadCoBadgeAbiConfiguration } from "../../features/wallet/onboarding/cobadge/store/actions";
import { getType, isActionOf } from "typesafe-actions";
import { fromNullable } from "fp-ts/lib/Option";

/**
 * This saga aims to send an event to Mixpanel to get information about whether the user has a bancomat card with which
 * it is allowed to add a co-badge card and has not yet done or not.
 *
 * This saga is called only if the {@link bancomatListVisibleInWalletSelector} return some
 */
export function* runSendAddCobadgeMessageSaga() {
  // Check if there is at least a cobadge card in the wallet
  const cobadgeVisibleInWallet: pot.Pot<
    ReadonlyArray<CreditCardPaymentMethod>,
    Error
  > = yield select(cobadgeListVisibleInWalletSelector);

  // if yes send "don't send message" event and return
  if (
    pot.isSome(cobadgeVisibleInWallet) &&
    cobadgeVisibleInWallet.value.length > 0
  ) {
    return;
  }

  // Check if the abiConfiguration is Some
  const coBadgeAbiConfiguration: pot.Pot<
    IndexedById<StatusEnum>,
    NetworkError
  > = yield select(coBadgeAbiConfigurationSelector);

  // If is not some request the abiConfiguration
  if (!pot.isSome(coBadgeAbiConfiguration)) {
    yield put(loadCoBadgeAbiConfiguration.request());

    // Wait for the request results
    const loadCoBadgeAbiRes = yield take([
      getType(loadCoBadgeAbiConfiguration.success),
      getType(loadCoBadgeAbiConfiguration.failure)
    ]);

    // If the request result is failure return
    if (isActionOf(loadCoBadgeAbiConfiguration.failure, loadCoBadgeAbiRes)) {
      return;
    }
  }
  // Check if there is at least one bancomat for wich is allow add cobadge
  const maybeBancomatListVisibleInWallet: pot.Pot<
    ReadonlyArray<BancomatPaymentMethod>,
    Error
  > = yield select(bancomatListVisibleInWalletSelector);

  const bancomatListVisibleInWallet = pot.getOrElse(
    maybeBancomatListVisibleInWallet,
    []
  );

  const enalbedAbis = bancomatListVisibleInWallet.filter(b =>
    fromNullable(b.info.issuerAbiCode).mapNullable(function* (abi) {
      const maybeAbiConfiguration: pot.Pot<
        StatusEnum,
        NetworkError
      > = yield select(getCoBadgeAbiConfigurationSelector, abi);
      const abiConfiguration = pot.getOrElse(
        maybeAbiConfiguration,
        StatusEnum.disabled
      );
      return abiConfiguration === StatusEnum.enabled;
    })
  );

  if (enalbedAbis.length > 0) {
  } else {
    // dispatch "don't send message" and returns
  }
}

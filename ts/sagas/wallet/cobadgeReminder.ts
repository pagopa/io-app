import { put, select, take } from "typed-redux-saga/macro";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ActionType, isActionOf } from "typesafe-actions";
import {
  bancomatListVisibleInWalletSelector,
  cobadgeListVisibleInWalletSelector
} from "../../store/reducers/wallet/wallets";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod
} from "../../types/pagopa";
import { coBadgeAbiConfigurationSelector } from "../../features/wallet/onboarding/cobadge/store/reducers/abiConfiguration";
import { IndexedById } from "../../store/helpers/indexer";
import { StatusEnum } from "../../../definitions/pagopa/cobadge/configuration/CoBadgeService";
import { NetworkError } from "../../utils/errors";
import { loadCoBadgeAbiConfiguration } from "../../features/wallet/onboarding/cobadge/store/actions";
import { sendAddCobadgeMessage } from "../../store/actions/wallet/wallets";

/**
 * This saga aims to send an event to Mixpanel to get information about whether the user has a bancomat card with which
 * it is allowed to add a co-badge card and has not yet done or not.
 *
 * This saga is called only if the {@link bancomatListVisibleInWalletSelector} return some
 */
export function* sendAddCobadgeMessageSaga() {
  // Check if there is at least one bancomat
  const maybeBancomatListVisibleInWallet: pot.Pot<
    ReadonlyArray<BancomatPaymentMethod>,
    Error
  > = yield* select(bancomatListVisibleInWalletSelector);

  const bancomatListVisibleInWallet = pot.getOrElse(
    maybeBancomatListVisibleInWallet,
    []
  );

  if (bancomatListVisibleInWallet.length === 0) {
    yield* put(sendAddCobadgeMessage(false));
    return;
  }

  // Check if the abiConfiguration is Some
  // and if not request the abiConfiguration
  if (!pot.isSome(yield* select(coBadgeAbiConfigurationSelector))) {
    yield* put(loadCoBadgeAbiConfiguration.request());

    // Wait for the request results
    const loadCoBadgeAbiRes = yield* take<
      ActionType<
        | typeof loadCoBadgeAbiConfiguration.success
        | typeof loadCoBadgeAbiConfiguration.failure
      >
    >([
      loadCoBadgeAbiConfiguration.success,
      loadCoBadgeAbiConfiguration.failure
    ]);

    // If the request result is failure return
    if (isActionOf(loadCoBadgeAbiConfiguration.failure, loadCoBadgeAbiRes)) {
      return;
    }
  }
  const maybeCoBadgeAbiConfiguration: pot.Pot<
    IndexedById<StatusEnum>,
    NetworkError
  > = yield* select(coBadgeAbiConfigurationSelector);

  if (pot.isSome(maybeCoBadgeAbiConfiguration)) {
    const coBadgeAbiConfiguration = maybeCoBadgeAbiConfiguration.value;

    // Extract the cobadgeAbi if there is at least a cobadge card
    const maybeCobadgeVisibleInWallet: pot.Pot<
      ReadonlyArray<CreditCardPaymentMethod>,
      Error
    > = yield* select(cobadgeListVisibleInWalletSelector);

    const cobadgeVisibleInWallet = pot.getOrElse(
      maybeCobadgeVisibleInWallet,
      []
    );
    const cobadgeAbis = cobadgeVisibleInWallet.map(
      cWithAbi => cWithAbi.info.issuerAbiCode
    );
    // Extract a list of abi that satisfy the following conditions:
    // - is a bancomat in the wallet of the user
    // - the abi of the bancomat is in the abiConfiguration list
    // - the abi of the bancomant has the status enabled in the abiConfiguration list
    // - there isn't a cobadge card in the wallet of the user with the sami abi
    const enabledAbis = bancomatListVisibleInWallet.filter(
      b =>
        b.info.issuerAbiCode !== undefined &&
        coBadgeAbiConfiguration[b.info.issuerAbiCode] === StatusEnum.enabled &&
        !cobadgeAbis.some(abi => abi === b.info.issuerAbiCode)
    );

    yield* put(sendAddCobadgeMessage(enabledAbis.length > 0));
  }
}

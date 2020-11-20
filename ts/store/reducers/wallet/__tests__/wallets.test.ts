import * as pot from "italia-ts-commons/lib/pot";
import { remoteUndefined } from "../../../../features/bonus/bpd/model/RemoteValue";
import {
  isCreditCard,
  PatchedWalletV2ListResponse
} from "../../../../types/pagopa";
import { walletV2_2, walletsV2_1 } from "../__mocks__/wallets";
import { toIndexed } from "../../../helpers/indexer";
import {
  bancomatSelector,
  creditCardWalletV1Selector,
  getPaymentMethodHash,
  pagoPaCreditCardWalletV1Selector
} from "../wallets";
import { GlobalState } from "../../types";
import { convertWalletV2toWalletV1 } from "../../../../utils/walletv2";

describe("walletV2 selectors", () => {
  const maybeWalletsV2 = PatchedWalletV2ListResponse.decode(walletsV2_1);
  const indexedWallets = toIndexed(
    (maybeWalletsV2.value as PatchedWalletV2ListResponse).data!.map(
      convertWalletV2toWalletV1
    ),
    w => w.idWallet
  );
  const globalState = ({
    wallet: {
      wallets: {
        walletById: pot.some(indexedWallets)
      },
      abi: remoteUndefined
    }
  } as any) as GlobalState;
  it("should decode walletv2 list", () => {
    expect(maybeWalletsV2.isRight()).toBeTruthy();
  });

  it("should return credit cards", () => {
    const maybeCC = creditCardWalletV1Selector(globalState);
    expect(pot.isSome(maybeCC)).toBeTruthy();
    if (pot.isSome(maybeCC)) {
      expect(maybeCC.value.length).toEqual(1);
      const paymentMethod = maybeCC.value[0].paymentMethod;
      if (paymentMethod) {
        expect(isCreditCard(paymentMethod)).toBeTruthy();
        expect(getPaymentMethodHash(paymentMethod.info)).toEqual(
          "853afb770973eb48d5d275778bd124b28f60a684c20bcdf05dc8f0014c7ce871"
        );
      }
    }
  });

  it("should return bancomat", () => {
    const maybeBancomat = bancomatSelector(globalState);
    expect(pot.isSome(maybeBancomat)).toBeTruthy();
    const hpans = [
      "a591ab131bd9492e6df0357f1ac52785a96ddc8e772baddbb02e2169af9474f4",
      "e105a87731025d54181d8e4c4c04ff344ce82e57d6a3d6c6911e8eadb0348d7b"
    ];
    if (pot.isSome(maybeBancomat)) {
      expect(maybeBancomat.value.length).toEqual(2);
      maybeBancomat.value.forEach(w => {
        expect(
          hpans.find(h => h === getPaymentMethodHash(w.info))
        ).toBeDefined();
      });
    }
  });

  it("should return credit card supporting pagoPa payments", () => {
    const maybePagoPaCC = pagoPaCreditCardWalletV1Selector(globalState);
    expect(pot.isSome(maybePagoPaCC)).toBeTruthy();
    if (pot.isSome(maybePagoPaCC)) {
      expect(maybePagoPaCC.value.length).toEqual(1);
      const paymentMethod = maybePagoPaCC.value[0].paymentMethod;
      if (paymentMethod) {
        expect(isCreditCard(paymentMethod)).toBeTruthy();
        expect(getPaymentMethodHash(paymentMethod.info)).toEqual(
          "853afb770973eb48d5d275778bd124b28f60a684c20bcdf05dc8f0014c7ce871"
        );
      }
    }
  });

  it("should return empty list since there is no method compliant with pagoPa", () => {
    const maybeWallets = PatchedWalletV2ListResponse.decode(walletV2_2);
    const indexedWallets = toIndexed(
      (maybeWallets.value as PatchedWalletV2ListResponse).data!.map(
        convertWalletV2toWalletV1
      ),
      w => w.idWallet
    );
    const globalState = ({
      wallet: {
        wallets: {
          walletById: pot.some(indexedWallets)
        }
      }
    } as any) as GlobalState;
    const maybePagoPaCC = pagoPaCreditCardWalletV1Selector(globalState);
    expect(pot.isSome(maybePagoPaCC)).toBeTruthy();
    if (pot.isSome(maybePagoPaCC)) {
      expect(maybePagoPaCC.value.length).toEqual(0);
    }
  });
});

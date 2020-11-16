import * as pot from "italia-ts-commons/lib/pot";
import { remoteUndefined } from "../../../../features/bonus/bpd/model/RemoteValue";
import { PatchedWalletV2ListResponse } from "../../../../types/pagopa";
import {
  walletV2List1Bancomat1CCNotPagoPA,
  walletV2List2Bancomat1PagoPACC
} from "../__mocks__/wallets";
import { toIndexed } from "../../../helpers/indexer";
import {
  bancomatSelector,
  creditCardSelector,
  pagoPaCreditCardSelector
} from "../wallets";
import { GlobalState } from "../../types";
import { convertWalletV2toWalletV1 } from "../../../../utils/walletv2";

describe("walletV2 selectors", () => {
  const maybeWalletsV2 = PatchedWalletV2ListResponse.decode(
    walletV2List2Bancomat1PagoPACC
  );
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
    const maybeCC = creditCardSelector(globalState);
    expect(pot.isSome(maybeCC)).toBeTruthy();
    if (pot.isSome(maybeCC)) {
      expect(maybeCC.value.length).toEqual(1);
    }
  });

  it("should return bancomat", () => {
    const maybeBancomat = bancomatSelector(globalState);
    expect(pot.isSome(maybeBancomat)).toBeTruthy();
    if (pot.isSome(maybeBancomat)) {
      expect(maybeBancomat.value.length).toEqual(2);
    }
  });

  it("should return credit card supporting pagoPa payments", () => {
    const maybePagoPaCC = pagoPaCreditCardSelector(globalState);
    expect(pot.isSome(maybePagoPaCC)).toBeTruthy();
    if (pot.isSome(maybePagoPaCC)) {
      expect(maybePagoPaCC.value.length).toEqual(1);
    }
  });

  it("should return empty list since there is no method compliant with pagoPa", () => {
    const maybeWallets = PatchedWalletV2ListResponse.decode(
      walletV2List1Bancomat1CCNotPagoPA
    );
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
    const maybePagoPaCC = pagoPaCreditCardSelector(globalState);
    expect(pot.isSome(maybePagoPaCC)).toBeTruthy();
    if (pot.isSome(maybePagoPaCC)) {
      expect(maybePagoPaCC.value.length).toEqual(0);
    }
  });
});

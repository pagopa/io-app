import * as pot from "italia-ts-commons/lib/pot";
import { PatchedWalletV2ListResponse, Wallet } from "../../../../types/pagopa";
import { walletV2ListRaw } from "../__mocks__/wallets";
import { PotFromActions } from "../../../../types/utils";
import { IndexedById } from "../../../helpers/indexer";
import { fetchWalletsFailure } from "../../../actions/wallet/wallets";
import { creditCardSelector } from "../wallets";
import { GlobalState } from "../../types";

describe("walletV2 selectors", () => {
  const maybeWalletsV2 = PatchedWalletV2ListResponse.decode(walletV2ListRaw);
  const globalState = ({
    wallet: {
      wallets: {
        walletById: pot.some(
          maybeWalletsV2.value as PotFromActions<
            IndexedById<Wallet>,
            typeof fetchWalletsFailure
          >
        )
      }
    }
  } as any) as GlobalState;
  it("should decode walletv2 list", () => {
    expect(maybeWalletsV2.isRight()).toBeTruthy();
  });

  it("should return credit cards", () => {
    const maybeCC = creditCardSelector(globalState);
    expect(pot.isSome(maybeCC)).toBeTruthy();
    if (pot.isSome(maybeCC)) {
      expect(maybeCC.value.length > 0).toBeTruthy();
    }
  });
});

import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { getDateFromExpiryDate } from "../../../../utils/dates";
import { WalletCard } from "../../../newWallet/types";
import { UIWalletInfoDetails } from "../types/UIWalletInfoDetails";

export const mapWalletIdToCardKey = (walletId: string) => `method_${walletId}`;

export const mapWalletsToCards = (
  wallets: ReadonlyArray<WalletInfo>
): ReadonlyArray<WalletCard> =>
  wallets.map<WalletCard>(wallet => {
    const details = wallet.details as UIWalletInfoDetails;

    return {
      key: mapWalletIdToCardKey(wallet.walletId),
      type: "payment",
      category: "payment",
      walletId: wallet.walletId,
      hpan: details.lastFourDigits,
      abiCode: "", // TODO IOBP-622 refactor payment card
      brand: details.brand,
      expireDate: getDateFromExpiryDate(details.expiryDate),
      holderEmail: details.maskedEmail,
      holderPhone: details.maskedNumber
    };
  });

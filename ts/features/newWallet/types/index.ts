import { Prettify } from "../../../types/helpers";
import { CgnWalletCardProps } from "../../bonus/cgn/components/CgnWalletCard";
import { IdPayWalletCardProps } from "../../idpay/wallet/components/IdPayWalletCard";
import { ItwCredentialCard } from "../../itwallet/common/components/ItwCredentialCard";
import { PaymentWalletCardProps } from "../../payments/wallet/components/PaymentWalletCard";

// Used to group the cards in the wallet. **DO NOT CHANGE THE ITEMS ORDER**
export const walletCardCategories = ["itw", "cgn", "bonus", "payment"] as const;
export type WalletCardCategory = (typeof walletCardCategories)[number];

// Used for the filtering logic in the wallet screen
export const walletCardCategoryFilters = ["itw", "other"] as const;
export type WalletCardCategoryFilter =
  (typeof walletCardCategoryFilters)[number];

// Basic type definition for a wallet card, describes the properties that
// each card MUST have in order to be placed inside the wallet.
type WalletCardBase = {
  key: string;
  category: WalletCardCategory;
};

// Specific type for ID Pay bonus cards
export type WalletCardBonus = Prettify<
  {
    type: "idPay";
  } & IdPayWalletCardProps
>;

// Specific type for CGN bonus cards
export type WalletCardCgn = Prettify<
  {
    type: "cgn";
  } & CgnWalletCardProps
>;

// Specific type for payment cards
export type WalletCardPayment = Prettify<
  {
    type: "payment";
  } & PaymentWalletCardProps
>;

// IT Wallet
export type WalletCardItw = Prettify<
  {
    type: "itw";
  } & ItwCredentialCard
>;

// This card type renders a loading skeleton, used as a placeholder for other cards
export type WalletCardPlaceholder = {
  type: "placeholder";
};

// Base WalletCard type, which includes all card types
export type WalletCard = WalletCardBase &
  (
    | WalletCardBonus
    | WalletCardCgn
    | WalletCardPayment
    | WalletCardItw
    | WalletCardPlaceholder
  );

// Used to map the card to the specific component that will render the card.
export type WalletCardType = WalletCard["type"];

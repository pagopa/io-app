import { Prettify } from "../../../types/helpers";
import { CdcCardProps } from "../../bonus/cdc/wallet/components/CdcCard";
import { CgnWalletCardProps } from "../../bonus/cgn/components/CgnWalletCard";
import { IdPayWalletCardProps } from "../../idpay/wallet/components/IdPayWalletCard";
import { ItwCredentialCard } from "../../itwallet/common/components/ItwCredentialCard";
import { PaymentWalletCardProps } from "../../payments/wallet/components/PaymentWalletCard";

// Used to group the cards in the wallet. **DO NOT CHANGE THE ITEMS ORDER**
export const walletCardCategories = ["itw", "bonus", "cgn", "payment"] as const;
export type WalletCardCategory = (typeof walletCardCategories)[number];

// Used for the filtering logic in the wallet screen
export const walletCardCategoryFilters = ["itw", "other"] as const;
// Base WalletCard type, which includes all card types
export type WalletCard = WalletCardBase &
  (
    | WalletCardBonus
    | WalletCardCdc
    | WalletCardCgn
    | WalletCardItw
    | WalletCardPayment
    | WalletCardPlaceholder
  );

// Specific type for ID Pay bonus cards
export type WalletCardBonus = Prettify<
  IdPayWalletCardProps & {
    type: "idPay";
  }
>;

export type WalletCardCategoryFilter =
  (typeof walletCardCategoryFilters)[number];

// Specific type for CDC bonus cards
export type WalletCardCdc = Prettify<
  CdcCardProps & {
    type: "cdc";
  }
>;

// Specific type for CGN bonus cards
export type WalletCardCgn = Prettify<
  CgnWalletCardProps & {
    type: "cgn";
  }
>;

// IT Wallet
export type WalletCardItw = Prettify<
  ItwCredentialCard & {
    type: "itw";
  }
>;

// Specific type for payment cards
export type WalletCardPayment = Prettify<
  PaymentWalletCardProps & {
    type: "payment";
  }
>;

// This card type renders a loading skeleton, used as a placeholder for other cards
export type WalletCardPlaceholder = {
  type: "placeholder";
};

// Used to map the card to the specific component that will render the card.
export type WalletCardType = WalletCard["type"];

/**
 * Base type definition for all wallet cards.
 * Every card in the wallet must implement these essential properties
 * to ensure proper identification, categorization, and lifecycle management.
 */
type WalletCardBase = {
  /** Classification of the card (e.g., itw, cgn, bonus, payment) */
  category: WalletCardCategory;
  /**
   * Marks a card as hidden. Hidden cards are not displayed in the wallet UI
   * Usefull when we need to remove card without deleting its data from the wallet
   */
  hidden?: true;
  /** Unique identifier used to track and reference individual cards */
  key: string;
};

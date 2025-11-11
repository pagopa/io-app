import { Prettify } from "../../../types/helpers";
import { CdcWalletCardProps } from "../../bonus/cdc/wallet/components/CdcWalletCard";
import { CgnWalletCardProps } from "../../bonus/cgn/components/CgnWalletCard";
import { IdPayWalletCardProps } from "../../idpay/wallet/components/IdPayWalletCard";
import { ItwCredentialCard } from "../../itwallet/common/components/ItwCredentialCard";
import { PaymentWalletCardProps } from "../../payments/wallet/components/PaymentWalletCard";

// Used to group the cards in the wallet. **DO NOT CHANGE THE ITEMS ORDER**
export const walletCardCategories = ["itw", "bonus", "cgn", "payment"] as const;
export type WalletCardCategory = (typeof walletCardCategories)[number];

// Used for the filtering logic in the wallet screen
export const walletCardCategoryFilters = ["itw", "other"] as const;
export type WalletCardCategoryFilter =
  (typeof walletCardCategoryFilters)[number];

/**
 * Base type definition for all wallet cards.
 * Every card in the wallet must implement these essential properties
 * to ensure proper identification, categorization, and lifecycle management.
 */
type WalletCardBase = {
  /** Unique identifier used to track and reference individual cards */
  key: string;
  /** Classification of the card (e.g., itw, cgn, bonus, payment) */
  category: WalletCardCategory;
  /**
   * Marks a card as hidden. Hidden cards are not displayed in the wallet UI
   * Usefull when we need to remove card without deleting its data from the wallet
   */
  hidden?: true;
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

// Specific type for CDC bonus cards
export type WalletCardCdc = Prettify<
  {
    type: "cdc";
  } & CdcWalletCardProps
>;

// This card type renders a loading skeleton, used as a placeholder for other cards
export type WalletCardPlaceholder = {
  type: "placeholder";
};

// Base WalletCard type, which includes all card types
export type WalletCard = WalletCardBase &
  (
    | WalletCardBonus
    | WalletCardCdc
    | WalletCardCgn
    | WalletCardPayment
    | WalletCardItw
    | WalletCardPlaceholder
  );

// Used to map the card to the specific component that will render the card.
export type WalletCardType = WalletCard["type"];

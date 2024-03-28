import { IOIcons } from "@pagopa/io-app-design-system";
import {
  IdPayWalletCard,
  IdPayWalletCardProps
} from "../../idpay/wallet/components/IdPayWalletCard";
import {
  PaymentWalletCard,
  PaymentWalletCardProps
} from "../../payments/common/components/PaymentWalletCard";
import { WalletCardBaseComponent } from "../components/WalletCardBaseComponent";
import {
  CgnWalletCard,
  CgnWalletCardProps
} from "../../bonus/cgn/components/CgnWalletCard";

// Used to group the cards in the wallet.
export type WalletCardCategory = "itw" | "cgn" | "bonus" | "payment";

// Basic type definition for a wallet card, describes the properties that
// each card MUST have in order to be placed inside the wallet.
type WalletCardBase = {
  key: string;
  category: WalletCardCategory;
};

// Specific type for ID Pay bonus cards
export type WalletCardBonus = {
  type: "idPay";
} & IdPayWalletCardProps;

// Specific type for CGN bonus cards
export type WalletCardCgn = {
  type: "cgn";
} & CgnWalletCardProps;

// Specific type for payment cards
export type WalletCardPayment = {
  type: "payment";
} & PaymentWalletCardProps;

// Base WalletCard type, which includes all card types
export type WalletCard = WalletCardBase &
  (WalletCardBonus | WalletCardCgn | WalletCardPayment);

// Used to map the card to the specific component that will render the card.
export type WalletCardType = WalletCard["type"];

/**
 * Wallet card component mapper which translates a WalletCardType to a
 * component to be rendered inside the wallet.
 * Component MUST be a WalletCardBaseComponent, which can be created
 * using {@see withWalletCardBaseComponent} HOC
 */
export const walletCardComponentMapper: Record<
  WalletCardType,
  WalletCardBaseComponent<any> | undefined
> = {
  cgn: CgnWalletCard,
  idPay: IdPayWalletCard,
  payment: PaymentWalletCard
};

/**
 * Icons used for each wallet card category
 */
export const walletCardCategoryIcons: Record<WalletCardCategory, IOIcons> = {
  bonus: "bonus",
  payment: "creditCard",
  itw: "fiscalCodeIndividual",
  cgn: "bonus"
};

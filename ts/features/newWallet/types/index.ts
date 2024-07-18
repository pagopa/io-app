import { IOIcons } from "@pagopa/io-app-design-system";
import { Prettify } from "../../../types/helpers";
import {
  CgnWalletCard,
  CgnWalletCardProps
} from "../../bonus/cgn/components/CgnWalletCard";
import {
  IdPayWalletCard,
  IdPayWalletCardProps
} from "../../idpay/wallet/components/IdPayWalletCard";
import { ItwCredentialCard } from "../../itwallet/common/components/ItwCredentialCard";
import { ItwCredentialWalletCard } from "../../itwallet/wallet/components/ItwCredentialWalletCard";
import {
  PaymentWalletCard,
  PaymentWalletCardProps
} from "../../payments/wallet/components/PaymentWalletCard";
import { WalletCardBaseComponent } from "../components/WalletCardBaseComponent";
import { WalletCardSkeleton } from "../components/WalletCardSkeleton";

// Used to group the cards in the wallet. **DO NOT CHANGE THE ITEMS ORDER**
export const walletCardCategories = ["itw", "cgn", "bonus", "payment"] as const;
export type WalletCardCategory = (typeof walletCardCategories)[number];

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

// This card type renders a loading skeleton, used as a placeholder for other cards
export type WalletCardPlaceholder = {
  type: "placeholder";
};

// IT Wallet
export type WalletCardItw = {
  type: "itw";
} & ItwCredentialCard;

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
  payment: PaymentWalletCard,
  itw: ItwCredentialWalletCard,
  placeholder: WalletCardSkeleton
};

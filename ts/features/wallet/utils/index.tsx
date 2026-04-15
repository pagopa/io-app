import { ComponentType } from "react";
import { useIOSelector } from "../../../store/hooks";
import { GlobalState } from "../../../store/reducers/types";
import { CgnWalletCard } from "../../bonus/cgn/components/CgnWalletCard";
import { IdPayWalletCard } from "../../idpay/wallet/components/IdPayWalletCard";
import { ItwCredentialWalletCard } from "../../itwallet/wallet/components/ItwCredentialWalletCard";
import { PaymentWalletCard } from "../../payments/wallet/components/PaymentWalletCard";
import { WalletCardBaseComponent } from "../components/WalletCardBaseComponent";
import { WalletCardSkeleton } from "../components/WalletCardSkeleton";
import { shouldRenderWalletCategorySelector } from "../store/selectors";
import { WalletCard, WalletCardCategoryFilter, WalletCardType } from "../types";
import { CdcWalletCard } from "../../bonus/cdc/wallet/components/CdcWalletCard";

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
  cdc: CdcWalletCard,
  placeholder: WalletCardSkeleton
};

/**
 * Function that renders a wallet card using the mapped component inside {@see walletCardComponentMapper}
 * @param card - The wallet card object to render
 * @param stacked - Whether the card is stacked or not
 * @returns The rendered card or null if the card is not found
 */
export const renderWalletCardFn = (
  card: WalletCard,
  stacked: boolean = false
) => {
  const { key, category, type, ...cardProps } = card;
  const Component = walletCardComponentMapper[type];
  return Component ? (
    <Component
      key={key}
      testID={`walletCardTestID_${category}_${type}_${key}`}
      cardProps={cardProps}
      isStacked={stacked}
    />
  ) : null;
};

/**
 * A higher-order component which renders a component only if the category filter matches the given category
 * @param category - The category to filter by
 * @param WrappedComponent - The component to render
 * @returns The component or null if the category filter does not match
 */
export const withWalletCategoryFilter =
  <P extends Record<string, unknown>>(
    category: WalletCardCategoryFilter,
    WrappedComponent: ComponentType<P>
  ) =>
  (props: P) => {
    const shouldRenderCategory = useIOSelector((state: GlobalState) =>
      shouldRenderWalletCategorySelector(state, category)
    );
    if (!shouldRenderCategory) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };

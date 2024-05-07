import * as React from "react";
import { WalletCard, walletCardComponentMapper } from "../types";

export const renderWalletCardFn = (
  card: WalletCard,
  stacked: boolean = false
) => {
  const Component = walletCardComponentMapper[card.type];
  return Component ? (
    <Component
      testID={`walletCardTestID_${card.key}`}
      cardProps={card}
      isStacked={stacked}
    />
  ) : null;
};

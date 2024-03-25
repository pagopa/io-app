import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { getWalletCardsByCategorySelector } from "../store/selectors";
import { WalletCardCategory, walletCardCategoryIcons } from "../types";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";

const WalletCardsContainer = () => {
  const cardsByCategory = useIOSelector(getWalletCardsByCategorySelector);

  return (
    <ContentWrapper>
      {Object.entries(cardsByCategory).map(([categoryString, cards], index) => {
        const category = categoryString as WalletCardCategory;

        return (
          <React.Fragment key={`cards_category_${category}`}>
            {index !== 0 && <VSpacer size={16} />}
            <WalletCardsCategoryContainer
              iconName={walletCardCategoryIcons[category]}
              label={I18n.t(`features.wallet.cards.categories.${category}`)}
              cards={cards}
            />
          </React.Fragment>
        );
      })}
    </ContentWrapper>
  );
};

export { WalletCardsContainer };

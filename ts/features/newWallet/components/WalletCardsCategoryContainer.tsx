import {
  IOIcons,
  ListItemHeader,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import { identity } from "lodash";
import * as React from "react";
import Animated, { Layout } from "react-native-reanimated";
import { WalletCard } from "../types";
import { renderWalletCardFn } from "../utils";
import { WalletCardSkeleton } from "./WalletCardSkeleton";

type BaseCategoryContainerProps<T> = WithTestID<{
  iconName: IOIcons;
  label: string;
  cards: ReadonlyArray<T>;
}>;

export type RenderProps<T> = {
  keyExtractorFn: (card: T) => string;
  renderCardFn: (card: T, isStacked: boolean) => JSX.Element | null;
};

const BaseCategoryContainer = <T,>({
  testID,
  label,
  iconName,
  cards,
  keyExtractorFn,
  renderCardFn
}: BaseCategoryContainerProps<T> & RenderProps<T>) => {
  if (cards.length === 0) {
    // If cards are not provided or are an empty array, the component should not render
    return null;
  }

  const isStacked = cards.length > 1;

  return (
    <Animated.View testID={testID} layout={Layout.duration(200)}>
      <ListItemHeader iconName={iconName} label={label} />
      {cards.map((card, index) => (
        <React.Fragment key={`wallet_card_${keyExtractorFn(card)}`}>
          {!isStacked && index !== 0 && <VSpacer size={16} />}
          {renderCardFn(card, isStacked && index < cards.length - 1)}
        </React.Fragment>
      ))}
      <VSpacer size={16} />
    </Animated.View>
  );
};

export type WalletCardsCategoryContainerProps =
  BaseCategoryContainerProps<WalletCard>;

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
const WalletCardsCategoryContainer = (
  props: WalletCardsCategoryContainerProps
) => (
  <BaseCategoryContainer
    {...props}
    keyExtractorFn={({ key }) => key}
    renderCardFn={renderWalletCardFn}
  />
);

/**
 * This component handles the rendering of cards skeleton for a specific category
 */
const WalletCardsCategoryContainerSkeleton = (
  props: BaseCategoryContainerProps<string>
) => (
  <BaseCategoryContainer
    {...props}
    keyExtractorFn={identity}
    renderCardFn={(key, isStacked) => (
      <WalletCardSkeleton
        testID={`walletCardSkeletonTestID_${key}`}
        cardProps={{}}
        isStacked={isStacked}
      />
    )}
  />
);

export { WalletCardsCategoryContainer, WalletCardsCategoryContainerSkeleton };

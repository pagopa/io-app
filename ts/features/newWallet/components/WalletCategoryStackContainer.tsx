import { IOIcons, ListItemHeader } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { WalletCardComponentBase } from "../types/WalletCardComponentBase";

type WalletCategoryStackContainerProps<
  T extends WalletCardComponentBase = WalletCardComponentBase
> = {
  iconName: IOIcons;
  label: string;
  cards: ReadonlyArray<T>;
};

const WalletCategoryStackContainer = (
  props: WalletCategoryStackContainerProps
) => {
  const { label, iconName, cards } = props;

  return (
    <View>
      <ListItemHeader iconName={iconName} label={label} />

      {cards.map(
        card => React.isValidElement(card) && React.cloneElement(card)
      )}
    </View>
  );
};

export { WalletCategoryStackContainer };

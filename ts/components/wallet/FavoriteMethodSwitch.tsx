import * as React from "react";
import { ActivityIndicator } from "react-native";
import { BasePaymentFeatureListItem } from "../../features/wallet/component/features/BasePaymentFeatureListItem";
import I18n from "../../i18n";
import Switch from "../ui/Switch";

type Props = {
  isLoading?: boolean;
  onValueChange?: (value: boolean) => void;
  switchValue: boolean;
};

// this component represents the payment status as favorite and handle the user request to change it
export const FavoritePaymentMethodSwitch = (props: Props) => {
  const rightElement = props.isLoading ? (
    <ActivityIndicator
      color={"black"}
      accessible={false}
      importantForAccessibility={"no-hide-descendants"}
      accessibilityElementsHidden={true}
    />
  ) : (
    <Switch
      onValueChange={v => props.onValueChange?.(v)}
      value={props.switchValue}
    />
  );
  return (
    <BasePaymentFeatureListItem
      title={I18n.t("wallet.favourite.setFavoriteTitle")}
      description={I18n.t("wallet.favourite.setFavoriteSubtitle")}
      rightElement={rightElement}
    />
  );
};

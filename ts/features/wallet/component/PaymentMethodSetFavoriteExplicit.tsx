import { View } from "native-base";
import * as React from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { ActivityIndicator, StyleSheet } from "react-native";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import Switch from "../../../components/ui/Switch";
import I18n from "../../../i18n";
import { handleSetFavourite } from "../../../utils/wallet";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  left: {
    ...IOStyles.flex,
    paddingRight: 8
  }
});

const PaymentMethodSetFavoriteExplicit: React.FC<{
  isFavoritePot: pot.Pot<boolean, Error>;
  onSetFavoriteWallet: () => void;
}> = ({ isFavoritePot, onSetFavoriteWallet }) => {
  const isFavorite = pot.getOrElseWithUpdating(isFavoritePot, undefined);

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <H4
          weight={"SemiBold"}
          color={"bluegreyDark"}
          testID={"PaymentMethodSetFavoriteExplicitTitle"}
        >
          {I18n.t(
            "wallet.methods.card.pagoPaCapability.setFavoriteExplicitTitle"
          )}
        </H4>
        <H5
          weight={"Regular"}
          color={"bluegrey"}
          testID={"PaymentMethodSetFavoriteExplicitDescription"}
        >
          {I18n.t(
            "wallet.methods.card.pagoPaCapability.setFavoriteExplicitSubtitle"
          )}
        </H5>
      </View>
      {isFavorite !== undefined ? (
        <Switch
          testID={"PaymentMethodSetFavoriteUIToggleSwitchTestID"}
          value={isFavorite}
          disabled={false}
          onValueChange={hasBeenSetFavorite => {
            handleSetFavourite(hasBeenSetFavorite, onSetFavoriteWallet);
          }}
        />
      ) : (
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
        />
      )}
    </View>
  );
};

export default PaymentMethodSetFavoriteExplicit;

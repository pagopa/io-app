import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { ActivityIndicator } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { BasePaymentFeatureListItem } from "../../features/wallet/component/features/BasePaymentFeatureListItem";
import I18n from "../../i18n";
import { setFavouriteWalletRequest } from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import { getFavoriteWalletId } from "../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../types/pagopa";
import { handleSetFavourite } from "../../utils/wallet";
import { IOStyleVariables } from "../core/variables/IOStyleVariables";
import Switch from "../ui/Switch";

type OwnProps = {
  onValueChange?: (value: boolean) => void;
  paymentMethod: PaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

/**
 * This component represents the payment "favorite" status and allows the user to change it with a switch
 * @param props
 * @constructor
 */
const FavoritePaymentMethodSwitch = (props: Props) => {
  const isLoading =
    pot.isLoading(props.favoriteWalletId) ||
    pot.isUpdating(props.favoriteWalletId);
  const isFavorite = pot.map(
    props.favoriteWalletId,
    _ => _ === props.paymentMethod.idWallet
  );

  const rightElement = isLoading ? (
    <View style={{ width: IOStyleVariables.switchWidth }}>
      <ActivityIndicator
        color={"black"}
        accessible={false}
        importantForAccessibility={"no-hide-descendants"}
        accessibilityElementsHidden={true}
      />
    </View>
  ) : (
    <Switch
      onValueChange={v =>
        handleSetFavourite(v, () =>
          props.setFavoriteWallet(props.paymentMethod.idWallet)
        )
      }
      value={pot.getOrElse(isFavorite, false)}
    />
  );
  return (
    <BasePaymentFeatureListItem
      testID={"FavoritePaymentMethodSwitch"}
      title={I18n.t("wallet.favourite.setFavoriteTitle")}
      description={I18n.t("wallet.favourite.setFavoriteSubtitle")}
      rightElement={rightElement}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setFavoriteWallet: (walletId?: number) =>
    dispatch(setFavouriteWalletRequest(walletId))
});

const mapStateToProps = (state: GlobalState) => ({
  favoriteWalletId: getFavoriteWalletId(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FavoritePaymentMethodSwitch);

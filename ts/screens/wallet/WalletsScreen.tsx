/**
 * This screen shows the list of available payment methods
 * (credit cards for now)
 */
import { none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { AddPaymentMethodButton } from "../../components/wallet/AddPaymentMethodButton";
import CardComponent from "../../components/wallet/card/CardComponent";
import WalletLayout from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import {
  navigateToWalletAddPaymentMethod,
  navigateToWalletHome,
  navigateToWalletList,
  navigateToWalletTransactionsScreen
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  deleteWalletRequest,
  setFavouriteWalletRequest
} from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import {
  getFavoriteWalletId,
  walletsSelector
} from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
import { Wallet } from "../../types/pagopa";
import { showToast } from "../../utils/showToast";

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row"
  },

  brandDarkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },

  padded: {
    padding: variables.contentPadding
  }
});

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

class WalletsScreen extends React.Component<Props> {
  private renderWallet = (info: ListRenderItemInfo<Wallet>) => {
    const item = info.item;
    const isFavorite = pot.map(
      this.props.favoriteWallet,
      _ => _ === item.idWallet
    );
    return (
      <CardComponent
        type="Full"
        wallet={item}
        isFavorite={isFavorite}
        onSetFavorite={(willBeFavorite: boolean) =>
          this.props.setFavoriteWallet(
            willBeFavorite ? item.idWallet : undefined
          )
        }
        onDelete={() => this.props.deleteWallet(item.idWallet)}
        mainAction={this.props.navigateToWalletTransactionsScreen}
      />
    );
  };

  public render(): React.ReactNode {
    const { favoriteWallet } = this.props;

    const headerContents = (
      <View style={styles.headerContainer}>
        <Left>
          <Text white={true}>{I18n.t("wallet.creditDebitCards")}</Text>
        </Left>
        <Right>
          <AddPaymentMethodButton
            onPress={this.props.navigateToWalletAddPaymentMethod}
          />
        </Right>
      </View>
    );

    return (
      <WalletLayout
        title={I18n.t("wallet.paymentMethods")}
        headerContents={headerContents}
        allowGoBack={true}
        backgroundColor={styles.brandDarkGrayBg}
      >
        <Content style={[styles.padded, styles.brandDarkGrayBg]}>
          <FlatList
            removeClippedSubviews={false}
            data={this.props.wallets as any[]} // tslint:disable-line
            renderItem={this.renderWallet}
            keyExtractor={(item, index) => `wallet-${item.idWallet}-${index}`}
            extraData={{ favoriteWallet }}
          />
        </Content>
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const potWallets = walletsSelector(state);
  return {
    wallets: pot.getOrElse(potWallets, []),
    isLoading: pot.isLoading(potWallets),
    favoriteWallet: getFavoriteWalletId(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletTransactionsScreen: (selectedWallet: Wallet) =>
    dispatch(navigateToWalletTransactionsScreen({ selectedWallet })),
  setFavoriteWallet: (walletId?: number) =>
    dispatch(setFavouriteWalletRequest(walletId)),
  navigateToWalletAddPaymentMethod: () =>
    dispatch(navigateToWalletAddPaymentMethod({ inPayment: none })),
  deleteWallet: (walletId: number) =>
    dispatch(
      deleteWalletRequest({
        walletId,
        onSuccess: action => {
          showToast(I18n.t("wallet.delete.successful"), "success");
          if (action.payload.length > 0) {
            dispatch(navigateToWalletList());
          } else {
            dispatch(navigateToWalletHome());
          }
        },
        onFailure: _ => {
          showToast(I18n.t("wallet.delete.failed"), "danger");
        }
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(WalletsScreen));

/**
 * This screen shows the list of available payment methods
 * (credit cards for now)
 */

import { Content, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo } from "react-native";

import { WalletStyles } from "../../components/styles/wallet";
import WalletLayout, { CardEnum } from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";

import { Button } from "native-base";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import CardComponent from "../../components/wallet/card/CardComponent";
import ROUTES from "../../navigation/routes";
import { navigateToWalletTransactionsScreen } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  deleteWalletRequest,
  setFavoriteWallet
} from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import {
  getFavoriteWalletId,
  walletsSelector
} from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";
import * as pot from "../../types/pot";

type ReduxMappedStateProps = Readonly<{
  wallets: ReadonlyArray<Wallet>;
  isLoading: boolean;
  favoriteWallet?: number;
}>;

type ReduxMappedDispatchProps = Readonly<{
  setFavoriteWallet: (walletId?: number) => void;
  deleteWallet: (walletId: number) => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

class WalletsScreen extends React.Component<Props> {
  private renderWallet = (info: ListRenderItemInfo<Wallet>) => {
    const item = info.item;
    const isFavorite = this.props.favoriteWallet === item.idWallet;
    return (
      <CardComponent
        wallet={item}
        isFavorite={isFavorite}
        onSetFavorite={(willBeFavorite: boolean) =>
          this.props.setFavoriteWallet(
            willBeFavorite ? item.idWallet : undefined
          )
        }
        onDelete={() => this.props.deleteWallet(item.idWallet)}
        navigateToWalletTransactions={(selectedWallet: Wallet) =>
          this.props.navigation.dispatch(
            navigateToWalletTransactionsScreen({ selectedWallet })
          )
        }
      />
    );
  };

  public render(): React.ReactNode {
    const { favoriteWallet } = this.props;
    const headerContents = (
      <View style={WalletStyles.walletBannerText}>
        <Text style={WalletStyles.white}>
          {I18n.t("wallet.creditDebitCards")}
        </Text>
      </View>
    );
    return (
      <WalletLayout
        title={I18n.t("wallet.paymentMethods")}
        cardType={{ type: CardEnum.NONE }}
        headerContents={headerContents}
        showPayButton={true}
        allowGoBack={true}
        favoriteWallet={favoriteWallet}
        onSetFavoriteWallet={this.props.setFavoriteWallet}
        onDeleteWallet={this.props.deleteWallet}
        navigateToWalletList={() =>
          this.props.navigation.navigate(ROUTES.WALLET_LIST)
        }
        navigateToScanQrCode={() =>
          this.props.navigation.navigate(ROUTES.PAYMENT_SCAN_QR_CODE)
        }
        navigateToWalletTransactions={(selectedWallet: Wallet) =>
          this.props.navigation.dispatch(
            navigateToWalletTransactionsScreen({ selectedWallet })
          )
        }
      >
        <Content style={[WalletStyles.padded, WalletStyles.header]}>
          <FlatList
            removeClippedSubviews={false}
            data={this.props.wallets as any[]} // tslint:disable-line
            renderItem={this.renderWallet}
            keyExtractor={(item, index) => `wallet-${item.idWallet}-${index}`}
            extraData={{ favoriteWallet }}
          />
          <View spacer={true} />
          <Button
            bordered={true}
            block={true}
            style={WalletStyles.addPaymentMethodButton}
            onPress={(): boolean =>
              this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD)
            }
          >
            <Text style={WalletStyles.addPaymentMethodText}>
              {I18n.t("wallet.newPaymentMethod.addButton")}
            </Text>
          </Button>
        </Content>
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => {
  const potWallets = walletsSelector(state);
  return {
    wallets: pot.getOrElse(potWallets, []),
    isLoading: pot.isLoading(potWallets),
    favoriteWallet: getFavoriteWalletId(state).toUndefined()
  };
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  setFavoriteWallet: (walletId?: number) =>
    dispatch(setFavoriteWallet(walletId)),
  deleteWallet: (walletId: number) => dispatch(deleteWalletRequest(walletId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(WalletsScreen, {}));

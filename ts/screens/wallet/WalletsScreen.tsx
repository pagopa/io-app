/**
 * This screen shows the list of available payment methods
 * (credit cards for now)
 */

import * as React from "react";

import { Content, List, Text, View } from "native-base";
import { WalletStyles } from "../../components/styles/wallet";
import WalletLayout from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";

import { Button } from "native-base";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import CardComponent from "../../components/wallet/card/CardComponent";
import ROUTES from "../../navigation/routes";
import { navigateToWalletTransactionsScreen } from "../../store/actions/navigation";
import { GlobalState } from "../../store/reducers/types";
import { walletsSelector } from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";
import * as pot from "../../types/pot";

type ReduxMappedStateProps = Readonly<{
  wallets: ReadonlyArray<Wallet>;
  isLoading: boolean;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps;

class WalletsScreen extends React.Component<Props, never> {
  public render(): React.ReactNode {
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
        headerContents={headerContents}
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
          <List
            removeClippedSubviews={false}
            dataArray={this.props.wallets as any[]} // tslint:disable-line
            renderRow={(item): React.ReactElement<any> => (
              <CardComponent
                wallet={item}
                navigateToWalletTransactions={(selectedWallet: Wallet) =>
                  this.props.navigation.dispatch(
                    navigateToWalletTransactionsScreen({ selectedWallet })
                  )
                }
              />
            )}
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
    isLoading: pot.isLoading(potWallets)
  };
};

export default connect(mapStateToProps)(withLoadingSpinner(WalletsScreen, {}));

/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";

import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import CardComponent from "../../components/wallet/card/CardComponent";
import WalletLayout from "../../components/wallet/WalletLayout";
import PaymentMethodCapabilities from "../../features/wallet/component/PaymentMethodCapabilities";
import I18n from "../../i18n";
import {
  navigateToWalletHome,
  navigateToWalletList
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  deleteWalletRequest,
  setFavouriteWalletRequest
} from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import {
  getFavoriteWalletId,
  paymentMethodsSelector
} from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";
import { showToast } from "../../utils/showToast";
import { handleSetFavourite } from "../../utils/wallet";


type NavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.walletCardTransaction.contextualHelpTitle",
  body: "wallet.walletCardTransaction.contextualHelpContent"
};

const HEADER_HEIGHT = 250;

class TransactionsScreen extends React.Component<Props> {
  private headerContent(
    selectedWallet: Wallet,
    isFavorite: pot.Pot<boolean, Error>
  ) {
    return (
      <React.Fragment>
        <CardComponent
          type={"Header"}
          wallet={selectedWallet}
          hideFavoriteIcon={false}
          hideMenu={false}
          isFavorite={isFavorite}
          onSetFavorite={(willBeFavorite: boolean) =>
            handleSetFavourite(willBeFavorite, () =>
              this.props.setFavoriteWallet(selectedWallet.idWallet)
            )
          }
          onDelete={() => this.props.deleteWallet(selectedWallet.idWallet)}
        />
      </React.Fragment>
    );
  }

  public render(): React.ReactNode {
    const selectedWallet = this.props.navigation.getParam("selectedWallet");

    const isFavorite = pot.map(
      this.props.favoriteWallet,
      _ => _ === selectedWallet.idWallet
    );

    // to retro-compatibility purpose
    const pm = pot.getOrElse(
      pot.map(this.props.paymentMethods, pms =>
        pms.find(pm => pm.idWallet === selectedWallet.idWallet)
      ),
      undefined
    );

    return (
      <WalletLayout
        title={I18n.t("wallet.paymentMethod")}
        allowGoBack={true}
        topContent={this.headerContent(selectedWallet, isFavorite)}
        hideHeader={true}
        hasDynamicSubHeader={true}
        topContentHeight={HEADER_HEIGHT}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet_transaction"]}
      >
        {pm && (
          <>
            <View style={IOStyles.horizontalContentPadding}>
              <View spacer={true} extralarge={true} />
              <PaymentMethodCapabilities paymentMethod={pm} />
              <View spacer={true} />
              <ItemSeparatorComponent noPadded={true} />
            </View>
            <EdgeBorderComponent />
          </>

        )}
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  favoriteWallet: getFavoriteWalletId(state),
  paymentMethods: paymentMethodsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setFavoriteWallet: (walletId?: number) =>
    dispatch(setFavouriteWalletRequest(walletId)),
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

export default connect(mapStateToProps, mapDispatchToProps)(TransactionsScreen);

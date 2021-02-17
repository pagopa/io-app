/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import CardComponent from "../../components/wallet/card/CardComponent";
import WalletLayout from "../../components/wallet/WalletLayout";
import PaymentMethodCapabilities from "../../features/wallet/component/PaymentMethodCapabilities";
import I18n from "../../i18n";
import amex from "../../../img/wallet/cards-icons/form/amex.png";
import { useRemovePaymentMethodBottomSheet } from "../../features/wallet/component/RemovePaymentMethod";
import UnsubscribeButton from "../../features/wallet/component/UnsubscribeButton";

import {
  navigateToWalletHome,
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  areMoreTransactionsAvailable,
  getTransactions,
  getTransactionsLoadedLength
} from "../../store/reducers/wallet/transactions";
import {
  deleteWalletRequest,
  setFavouriteWalletRequest
} from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import {
  getFavoriteWalletId,
  paymentMethodsSelector
} from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
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

const styles = StyleSheet.create({
  walletBannerText: {
    alignItems: "flex-end",
    flexDirection: "row"
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },

  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  brandDarkGray: {
    color: variables.brandDarkGray
  },
  cardBox: {
    height: 152,
    paddingTop: 20,
    width: widthPercentageToDP("88%"),
    paddingBottom: 22,
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.18,
    shadowRadius: 4.65,
    zIndex: Platform.OS === "android" ? 35 : 7,
    elevation: Platform.OS === "android" ? 35 : 7
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.walletCardTransaction.contextualHelpTitle",
  body: "wallet.walletCardTransaction.contextualHelpContent"
};

const HEADER_HEIGHT = 250;

const TransactionsScreen: React.FunctionComponent<Props> = (props: Props) => {
  const headerContent = (
    selectedWallet: Wallet,
    isFavorite: pot.Pot<boolean, Error>
  ) => (
    <React.Fragment>
      <View style={styles.cardBox}>
        <CardComponent
          type={"Header"}
          wallet={selectedWallet}
          hideFavoriteIcon={false}
          hideMenu={false}
          isFavorite={isFavorite}
          onSetFavorite={(willBeFavorite: boolean) =>
            handleSetFavourite(willBeFavorite, () =>
              props.setFavoriteWallet(selectedWallet.idWallet)
            )
          }
          onDelete={() => props.deleteWallet(selectedWallet.idWallet)}
        />
      </View>
    </React.Fragment>
  );

  const selectedWallet = props.navigation.getParam("selectedWallet");

  const isFavorite = pot.map(
    props.favoriteWallet,
    _ => _ === selectedWallet.idWallet
  );

  // to retro-compatibility purpose
  const pm = pot.getOrElse(
    pot.map(props.paymentMethods, pms =>
      pms.find(pm => pm.idWallet === selectedWallet.idWallet)
    ),
    undefined
  );

  const { present } = useRemovePaymentMethodBottomSheet({
    icon: amex,
    caption: I18n.t("wallet.methods.card.name")
  });

  return (
    <WalletLayout
      title={I18n.t("wallet.paymentMethod")}
      allowGoBack={true}
      topContent={headerContent(selectedWallet, isFavorite)}
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
          </View>
        </>
      )}
      <View
        style={{ marginHorizontal: variables.contentPadding, marginTop: 24 }}
      >
        <UnsubscribeButton
          onPress={() =>
            present(() => props.deleteWallet(selectedWallet.idWallet))
          }
        />
      </View>
      <EdgeBorderComponent />
    </WalletLayout>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  transactions: getTransactions(state),
  transactionsLoadedLength: getTransactionsLoadedLength(state),
  favoriteWallet: getFavoriteWalletId(state),
  readTransactions: state.entities.transactionsRead,
  areMoreTransactionsAvailable: areMoreTransactionsAvailable(state),
  paymentMethods: paymentMethodsSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setFavoriteWallet: (walletId?: number) =>
    dispatch(setFavouriteWalletRequest(walletId)),
  deleteWallet: (walletId: number) =>
    dispatch(
      deleteWalletRequest({
        walletId,
        onSuccess: _ => {
          showToast(I18n.t("wallet.delete.successful"), "success");
          dispatch(navigateToWalletHome());
        },
        onFailure: _ => {
          showToast(I18n.t("wallet.delete.failed"), "danger");
        }
      })
    )
});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionsScreen);

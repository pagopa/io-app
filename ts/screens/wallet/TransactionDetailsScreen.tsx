import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Clipboard, Image, StyleSheet } from "react-native";
import { NavigationEvents, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Logo from "../../components/wallet/card/Logo";
import { PaymentSummaryComponent } from "../../components/wallet/PaymentSummaryComponent";
import { SlidedContentComponent } from "../../components/wallet/SlidedContentComponent";
import I18n from "../../i18n";
import { navigateToWalletHome } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { fetchPsp } from "../../store/actions/wallet/transactions";
import { GlobalState } from "../../store/reducers/types";
import { pspStateByIdSelector } from "../../store/reducers/wallet/pspsById";
import { getWalletsById } from "../../store/reducers/wallet/wallets";
import customVariables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { formatDateAsLocal } from "../../utils/dates";
import { cleanTransactionDescription } from "../../utils/payment";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";

type NavigationParams = Readonly<{
  isPaymentCompletedTransaction: boolean;
  transaction: Transaction;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface &
  OwnProps;

/**
 * isTransactionStarted will be true when the user accepted to proceed with a transaction
 * and he is going to display the detail of the transaction as receipt
 */

const styles = StyleSheet.create({
  pspLogo: {
    width: 60,
    height: 20,
    resizeMode: "contain"
  },
  darkText: {
    color: customVariables.brandDarkestGray
  },
  bigText: {
    fontSize: 20
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  cardIcon: {
    alignSelf: "flex-end",
    height: 30,
    width: 48
  },
  centered: { alignItems: "center" },
  copyButton: {
    paddingHorizontal: 8,
    backgroundColor: customVariables.colorWhite,
    borderColor: customVariables.brandPrimary,
    borderWidth: 1,
    paddingBottom: 0,
    paddingTop: 0,
    height: 28
  },
  copyText: {
    color: customVariables.brandPrimary,
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: 4
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.transactionDetails",
  body: "wallet.detailsTransaction.contextualHelpContent"
};

/**
 * Transaction details screen, displaying
 * a list of information available about a
 * specific transaction.
 */
class TransactionDetailsScreen extends React.Component<Props> {
  public componentDidMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.props.navigateToWalletHome
    );
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.props.navigateToWalletHome
    );
  }

  private handleWillFocus = () => {
    const transaction = this.props.navigation.getParam("transaction");
    // Fetch psp only if the store not contains this psp
    if (transaction.idPsp !== undefined && this.props.psp === undefined) {
      this.props.fetchPsp(transaction.idPsp);
    }
  };

  public render(): React.ReactNode {
    const { psp } = this.props;
    const transaction = this.props.navigation.getParam("transaction");

    const amount = formatNumberAmount(centsToAmount(transaction.amount.amount));
    const fee = formatNumberAmount(
      centsToAmount(
        transaction.fee === undefined
          ? transaction.grandTotal.amount - transaction.amount.amount
          : transaction.fee.amount
      )
    );
    const totalAmount = formatNumberAmount(
      centsToAmount(transaction.grandTotal.amount)
    );

    const transactionWallet = this.props.wallets
      ? this.props.wallets[transaction.idWallet]
      : undefined;

    const transactionDateTime =
      formatDateAsLocal(transaction.created, true).concat(" - ").concat(
      transaction.created.toLocaleTimeString());
    const paymentMethodIcon =
      transactionWallet &&
      transactionWallet.creditCard &&
      transactionWallet.creditCard.brandLogo;
    const idTransaction = transaction.id;

    const standardRow = (label: string, value: string) => (
      <View style={styles.row}>
        <Text>{label}</Text>
        <Text bold={true} dark={true}>
          {value}
        </Text>
      </View>
    );

    return (
      <BaseScreenComponent
        dark={true}
        contextualHelpMarkdown={contextualHelpMarkdown}
        goBack={this.props.navigateToWalletHome}
      >
        <NavigationEvents onWillFocus={this.handleWillFocus} />
        <SlidedContentComponent hasFlatBottom={true}>
          <PaymentSummaryComponent
            title={"Ricevuta operazione"}
            recipient={transaction.merchant}
            description={cleanTransactionDescription(transaction.description)}
          />

          {/** transaction date */}
          <React.Fragment>
            <View spacer={true} xsmall={true} />
            <View spacer={true} large={true} />
            {standardRow(
              I18n.t("wallet.firstTransactionSummary.date"),
              transactionDateTime
            )}
          </React.Fragment>

          <View spacer={true} large={true} />
          <ItemSeparatorComponent noPadded={true} />
          <View spacer={true} large={true} />

          {standardRow(I18n.t("wallet.firstTransactionSummary.amount"), amount)}
          <View spacer={true} small={true} />
          {standardRow(I18n.t("wallet.firstTransactionSummary.fee"), fee)}

          <View spacer={true} />

          {/** Total amount (amount + fee) */}
          <View style={styles.row}>
            <Text style={styles.bigText} bold={true} dark={true}>
              {I18n.t("wallet.firstTransactionSummary.total")}
            </Text>
            <Text style={styles.bigText} bold={true} dark={true}>
              {totalAmount}
            </Text>
          </View>

          {(paymentMethodIcon || (psp && psp.logoPSP)) && (
            <React.Fragment>
              <View spacer={true} large={true} />
              <ItemSeparatorComponent noPadded={true} />
              <View spacer={true} large={true} />
            </React.Fragment>
          )}

          {/** paymnet method icon */}
          {paymentMethodIcon && (
            <View style={styles.row}>
              <Text>{I18n.t("wallet.paymentMethod")}</Text>
              <View style={styles.cardIcon}>
                <Logo />
              </View>
              <View spacer={true} small={true} />
            </View>
          )}

          {/** psp logo */}
          {psp && (
            <View style={[styles.row, styles.centered]}>
              <Text>{I18n.t("wallet.psp")}</Text>
              {psp.logoPSP ? (
                <Image style={styles.pspLogo} source={{ uri: psp.logoPSP }} />
              ) : psp && psp.businessName ? (
                <Text>{psp.businessName}</Text>
              ) : (
                undefined
              )}
            </View>
          )}

          <View spacer={true} large={true} />
          <ItemSeparatorComponent noPadded={true} />
          <View spacer={true} large={true} />

          {/** Transaction id */}
          <View>
            <Text>
              {I18n.t("wallet.firstTransactionSummary.idTransaction")}
            </Text>
            <View style={styles.row}>
              <Text bold={true}>{idTransaction}</Text>
              <ButtonDefaultOpacity
                onPress={() => Clipboard.setString(idTransaction.toString())}
                style={styles.copyButton}
              >
                <Text style={styles.copyText}>
                  {I18n.t("clipboard.copyText")}
                </Text>
              </ButtonDefaultOpacity>
            </View>
          </View>

          <View spacer={true} large={true} />
          <View spacer={true} large={true} />
          <ButtonDefaultOpacity
            light={true}
            bordered={true}
            block={true}
            onPress={this.props.navigation.goBack}
          >
            <Text>{I18n.t("global.buttons.close")}</Text>
          </ButtonDefaultOpacity>
        </SlidedContentComponent>
      </BaseScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome()),
  fetchPsp: (idPsp: number) => dispatch(fetchPsp.request({ idPsp }))
});

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const transaction = ownProps.navigation.getParam("transaction");
  const idPsp = String(transaction.idPsp);

  const maybePotPspState = fromNullable(pspStateByIdSelector(idPsp)(state));
  const potPsp = maybePotPspState.map(_ => _.psp).getOrElse(pot.none);
  const isLoading = pot.isLoading(potPsp);

  return {
    wallets: pot.toUndefined(getWalletsById(state)),
    isLoading,
    psp: pot.toUndefined(potPsp)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(withLoadingSpinner(TransactionDetailsScreen)));

import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import * as React from "react";
import {
  BackHandler,
  Image,
  NativeEventSubscription,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import CopyButtonComponent from "../../components/CopyButtonComponent";
import { Link } from "../../components/core/typography/Link";
import { IOColors } from "../../components/core/variables/IOColors";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FocusAwareStatusBar from "../../components/ui/FocusAwareStatusBar";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import { PaymentSummaryComponent } from "../../components/wallet/PaymentSummaryComponent";
import { SlidedContentComponent } from "../../components/wallet/SlidedContentComponent";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../navigation/params/WalletParamsList";
import { Dispatch } from "../../store/actions/types";
import { backToEntrypointPayment } from "../../store/actions/wallet/payment";
import { fetchPsp } from "../../store/actions/wallet/transactions";
import { GlobalState } from "../../store/reducers/types";
import { pspStateByIdSelector } from "../../store/reducers/wallet/pspsById";
import { getWalletsById } from "../../store/reducers/wallet/wallets";
import { Transaction } from "../../types/pagopa";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { formatDateAsLocal } from "../../utils/dates";
import {
  cleanTransactionDescription,
  getTransactionFee,
  getTransactionIUV
} from "../../utils/payment";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";

export type TransactionDetailsScreenNavigationParams = Readonly<{
  isPaymentCompletedTransaction: boolean;
  transaction: Transaction;
}>;

type OwnProps = IOStackNavigationRouteProps<
  WalletParamsList,
  "WALLET_TRANSACTION_DETAILS"
>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface &
  OwnProps;

/**
 * isTransactionStarted will be true when the user accepted to proceed with a transaction
 * and he is going to display the detail of the transaction as receipt
 */

const styles = StyleSheet.create({
  cardLogo: {
    alignSelf: "flex-end",
    height: 30,
    width: 48
  },
  bigText: {
    fontSize: 20
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  centered: { alignItems: "center" },
  flex: {
    flex: 1,
    alignSelf: "center"
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.transactionDetails",
  body: "wallet.detailsTransaction.contextualHelpContent"
};

type State = {
  showFullReason: boolean;
};

/**
 * Transaction details screen, displaying
 * a list of information available about a
 * specific transaction.
 */
class TransactionDetailsScreen extends React.Component<Props, State> {
  private subscription: NativeEventSubscription | undefined;
  private navigationEventUnsubscribe!: () => void;
  constructor(props: Props) {
    super(props);
    this.state = { showFullReason: false };
  }

  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.navigationEventUnsubscribe = this.props.navigation.addListener(
      "focus",
      this.handleWillFocus
    );
    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
  }

  public componentWillUnmount() {
    this.subscription?.remove();
    this.navigationEventUnsubscribe();
  }

  private handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  private handleWillFocus = () => {
    const transaction = this.props.route.params.transaction;
    // Fetch psp only if the store not contains this psp
    if (transaction.idPsp !== undefined && this.props.psp === undefined) {
      this.props.fetchPsp(transaction.idPsp);
    }
  };

  private getData = () => {
    const transaction = this.props.route.params.transaction;
    const amount = formatNumberCentsToAmount(transaction.amount.amount, true);

    // fee
    const fee = getTransactionFee(transaction);

    const totalAmount = formatNumberCentsToAmount(
      transaction.grandTotal.amount,
      true
    );

    const transactionWallet = this.props.wallets
      ? this.props.wallets[transaction.idWallet]
      : undefined;

    const transactionDateTime = formatDateAsLocal(transaction.created, true)
      .concat(" - ")
      .concat(transaction.created.toLocaleTimeString());

    const paymentMethodIcon = pipe(
      transactionWallet &&
        transactionWallet.creditCard &&
        transactionWallet.creditCard.brandLogo,
      O.fromNullable,
      O.map(logo => (logo.trim().length > 0 ? logo.trim() : undefined)),
      O.toUndefined
    );

    const paymentMethodBrand =
      transactionWallet &&
      transactionWallet.creditCard &&
      transactionWallet.creditCard.brand;

    const iuv = pipe(getTransactionIUV(transaction.description), O.toUndefined);

    const idTransaction = transaction.id;
    return {
      fullReason: transaction.description,
      iuv,
      idTransaction,
      paymentMethodBrand,
      paymentMethodIcon,
      transactionDateTime,
      amount,
      totalAmount,
      fee
    };
  };

  private handleOnFullReasonPress = () =>
    this.setState(ps => ({ showFullReason: !ps.showFullReason }));

  public render(): React.ReactNode {
    const { psp } = this.props;
    const transaction = this.props.route.params.transaction;
    const data = this.getData();

    const standardRow = (label: string, value: string) => (
      <View style={styles.row}>
        <Text style={styles.flex}>{label}</Text>
        <Text bold={true} dark={true} selectable={true}>
          {value}
        </Text>
      </View>
    );

    return (
      <BaseScreenComponent
        dark={true}
        contextualHelpMarkdown={contextualHelpMarkdown}
        goBack={this.handleBackPress}
        headerTitle={I18n.t("wallet.transactionDetails")}
        faqCategories={["wallet_transaction"]}
      >
        <FocusAwareStatusBar
          backgroundColor={IOColors.bluegrey}
          barStyle={"light-content"}
        />
        <SlidedContentComponent hasFlatBottom={true}>
          <PaymentSummaryComponent
            title={I18n.t("wallet.receipt")}
            recipient={transaction.merchant}
            description={cleanTransactionDescription(transaction.description)}
          />
          <Link
            onPress={this.handleOnFullReasonPress}
            accessible
            accessibilityRole={"button"}
            accessibilityLabel={`${I18n.t("wallet.transactionFullReason")} ${
              this.state.showFullReason
                ? I18n.t("global.accessibility.expanded")
                : I18n.t("global.accessibility.collapsed")
            }`}
          >
            {I18n.t("wallet.transactionFullReason")}
          </Link>
          {this.state.showFullReason && (
            <Text
              selectable={true}
              onLongPress={() =>
                clipboardSetStringWithFeedback(data.fullReason)
              }
            >
              {data.fullReason}
            </Text>
          )}
          <View spacer={true} large={true} />
          {data.iuv && standardRow(I18n.t("payment.IUV"), data.iuv)}
          {/** transaction date */}
          <View spacer={true} xsmall={true} />
          <View spacer={true} large={true} />
          {standardRow(
            I18n.t("wallet.firstTransactionSummary.date"),
            data.transactionDateTime
          )}

          <View spacer={true} large={true} />
          <ItemSeparatorComponent noPadded={true} />
          <View spacer={true} large={true} />

          {standardRow(
            I18n.t("wallet.firstTransactionSummary.amount"),
            data.amount
          )}

          {data.fee && (
            <>
              <View spacer={true} small={true} />
              {standardRow(
                I18n.t("wallet.firstTransactionSummary.fee"),
                data.fee
              )}
            </>
          )}

          <View spacer={true} />

          {/** Total amount (amount + fee) */}
          <View style={styles.row}>
            <Text style={[styles.bigText, styles.flex]} bold={true} dark={true}>
              {I18n.t("wallet.firstTransactionSummary.total")}
            </Text>
            <Text style={styles.bigText} bold={true} dark={true}>
              {data.totalAmount}
            </Text>
          </View>

          {(data.paymentMethodIcon || (psp && psp.logoPSP)) && (
            <React.Fragment>
              <View spacer={true} large={true} />
              <ItemSeparatorComponent noPadded={true} />
              <View spacer={true} large={true} />
            </React.Fragment>
          )}

          {/** paymnet method icon */}
          {/** to be implemented with the card logo when https://github.com/pagopa/io-app/pull/1622/ is merged */}

          {data.paymentMethodIcon ? (
            <View style={[styles.row, styles.centered]}>
              <Text>{I18n.t("wallet.paymentMethod")}</Text>
              <Image
                style={styles.cardLogo}
                source={{ uri: data.paymentMethodIcon }}
              />
            </View>
          ) : (
            data.paymentMethodBrand && (
              <Text bold={true}>{data.paymentMethodBrand}</Text>
            )
          )}

          {(data.paymentMethodIcon || data.paymentMethodBrand) && (
            <View spacer={true} />
          )}

          {/** Transaction id */}
          <View>
            <Text>
              {I18n.t("wallet.firstTransactionSummary.idTransaction")}
            </Text>
            <View style={styles.row}>
              <Text bold={true}>{data.idTransaction}</Text>
              <CopyButtonComponent textToCopy={data.idTransaction.toString()} />
            </View>
          </View>

          <View spacer={true} large={true} />
          <View spacer={true} large={true} />
          <ButtonDefaultOpacity
            light={true}
            bordered={true}
            block={true}
            onPress={this.handleBackPress}
          >
            <Text>{I18n.t("global.buttons.close")}</Text>
          </ButtonDefaultOpacity>
          <View spacer={true} />
        </SlidedContentComponent>
      </BaseScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBackToEntrypointPayment: () => dispatch(backToEntrypointPayment()),
  fetchPsp: (idPsp: number) => dispatch(fetchPsp.request({ idPsp }))
});

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const transaction = ownProps.route.params.transaction;
  const idPsp = String(transaction.idPsp);

  const potPsp = pipe(
    pspStateByIdSelector(idPsp)(state),
    O.fromNullable,
    O.map(_ => _.psp),
    O.getOrElseW(() => pot.none)
  );
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

/**
 * Transaction details screen, displaying
 * a list of information available about a
 * specific transaction.
 * TODO: check what controls implemented into this screen will be included into API
 *      - number deimals fixed to 2
 *      - get total amount from fee + amount
 *      - currency symbol
 *      - sum of amounts
 *      @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
 */
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, H1, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Image, StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationEvents, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { ContextualHelp } from "../../components/ContextualHelp";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import H5 from "../../components/ui/H5";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import Logo from "../../components/wallet/card/Logo";
import { RotatedCards } from "../../components/wallet/card/RotatedCards";
import WalletLayout from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import { navigateToWalletHome } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { fetchPsp } from "../../store/actions/wallet/transactions";
import { GlobalState } from "../../store/reducers/types";
import { pspStateByIdSelector } from "../../store/reducers/wallet/pspsById";
import { getWalletsById } from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
import { Transaction, Wallet } from "../../types/pagopa";
import { formatDateAsLocal } from "../../utils/dates";
import { cleanTransactionDescription } from "../../utils/payment";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";

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
  value: {
    flex: 1,
    flexDirection: "row"
  },

  valueImage: {
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },

  align: {
    textAlign: "right"
  },

  titleRow: {
    justifyContent: "space-between"
  },

  whyLink: {
    color: variables.textLinkColor
  },

  alignCenter: {
    alignItems: "center"
  },

  white: {
    color: variables.colorWhite
  },

  brandDarkGray: {
    color: variables.brandDarkGray
  },

  whiteContent: {
    backgroundColor: variables.colorWhite,
    flex: 1
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },

  pspLogo: {
    width: 100,
    height: 30,
    resizeMode: "contain"
  },

  creditCardLogo: {
    width: 48,
    height: 30,
    resizeMode: "contain"
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.transactionDetails",
  body: "wallet.detailsTransaction.contextualHelpContent"
};

class TransactionDetailsScreen extends React.Component<Props> {
  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }
  // On back button navigate to wallet home (android)
  private handleBackPress = () => this.props.navigateToWalletHome();

  private displayedWallet(transactionWallet: Wallet | undefined) {
    return transactionWallet ? (
      <RotatedCards cardType="Preview" wallets={[transactionWallet]} />
    ) : (
      <RotatedCards cardType="Preview" />
    );
  }

  /**
   * It provides the proper header to the screen. If isTransactionStarted
   * (the user displays the screen during the process of identify and accept a transaction)
   * then the "Thank you message" is displayed
   */
  private topContent(
    paymentCompleted: boolean,
    transactionWallet: Wallet | undefined
  ) {
    return (
      <React.Fragment>
        {paymentCompleted ? (
          <View>
            <Grid>
              <Col size={1} />
              <Col size={5} style={styles.alignCenter}>
                <View spacer={true} />
                <Row>
                  <H1 style={styles.white}>{I18n.t("wallet.thanks")}</H1>
                </Row>
                <Row>
                  <Text white={true}>{I18n.t("wallet.endPayment")}</Text>
                </Row>
                <View spacer={true} />
              </Col>
              <Col size={1} />
            </Grid>
          </View>
        ) : (
          <View spacer={true} />
        )}
        {this.displayedWallet(transactionWallet)}
      </React.Fragment>
    );
  }

  /**
   * It provides the proper format to the listed content by using flex layout
   */
  private labelValueRow(
    label: string | React.ReactElement<any>,
    value: string | React.ReactElement<any>,
    labelIsNote: boolean = true
  ): React.ReactNode {
    return (
      <Col>
        <View spacer={true} />
        <Row style={{ alignItems: "center" }}>
          <Text note={labelIsNote}>{label}</Text>
          <Text style={[styles.value, styles.align]} bold={true}>
            {value}
          </Text>
        </Row>
      </Col>
    );
  }

  /**
   * It provides the proper format to the listed content by using flex layout
   */
  private labelImageRow(
    label: string | React.ReactElement<any>,
    value: string | React.ReactElement<any>,
    labelIsNote: boolean = true
  ): React.ReactNode {
    return (
      <Col>
        <View spacer={true} />
        <Row style={{ alignItems: "center" }}>
          <Text note={labelIsNote}>{label}</Text>
          <View style={[styles.value, styles.valueImage]}>{value}</View>
        </Row>
      </Col>
    );
  }

  private handleWillFocus = () => {
    const transaction = this.props.navigation.getParam("transaction");
    // Fetch psp only if the store not contains this psp
    if (transaction.idPsp !== undefined && this.props.psp === undefined) {
      this.props.fetchPsp(transaction.idPsp);
    }
  };

  private showHelp = () => {
    this.props.showModal(
      <ContextualHelp
        onClose={this.props.hideModal}
        title={I18n.t("wallet.whyAFee.title")}
        body={() => <Markdown>{I18n.t("wallet.whyAFee.text")}</Markdown>}
      />
    );
  };

  public render(): React.ReactNode {
    const { psp } = this.props;
    const transaction = this.props.navigation.getParam("transaction");

    // whether this transaction is the result of a just completed payment
    const isPaymentCompletedTransaction = this.props.navigation.getParam(
      "isPaymentCompletedTransaction",
      false
    );
    const amount = formatNumberCentsToAmount(transaction.amount.amount);
    const fee = formatNumberCentsToAmount(
      transaction.fee === undefined
        ? transaction.grandTotal.amount - transaction.amount.amount
        : transaction.fee.amount
    );
    const totalAmount = formatNumberCentsToAmount(
      transaction.grandTotal.amount
    );

    const transactionWallet = this.props.wallets
      ? this.props.wallets[transaction.idWallet]
      : undefined;

    const creditCard =
      transactionWallet !== undefined
        ? transactionWallet.creditCard
        : undefined;

    return (
      <WalletLayout
        title={I18n.t("wallet.transaction")}
        allowGoBack={!isPaymentCompletedTransaction}
        topContent={this.topContent(
          isPaymentCompletedTransaction,
          transactionWallet
        )}
        hideHeader={true}
        hasDynamicSubHeader={false}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet_transaction"]}
      >
        <NavigationEvents onWillFocus={this.handleWillFocus} />
        <Content
          scrollEnabled={false}
          style={[styles.noBottomPadding, styles.whiteContent]}
        >
          <Grid>
            <Row style={styles.titleRow}>
              <H5 style={styles.brandDarkGray}>
                {I18n.t("wallet.transactionDetails")}
              </H5>
              <IconFont
                name="io-close"
                size={variables.iconSizeBase}
                onPress={this.props.navigateToWalletHome}
                style={styles.brandDarkGray}
              />
            </Row>
            <View spacer={true} large={true} />
            {this.labelValueRow(
              I18n.t("wallet.total"),
              <H5 style={styles.value}>{`€ ${totalAmount}`}</H5>
            )}
            {this.labelValueRow(I18n.t("wallet.payAmount"), `€ ${amount}`)}
            <TouchableDefaultOpacity onPress={this.showHelp}>
              {this.labelValueRow(
                <Text>
                  <Text note={true}>{`${I18n.t(
                    "wallet.transactionFee"
                  )} `}</Text>

                  <Text style={styles.whyLink} note={true} bold={true}>
                    {I18n.t("wallet.why")}
                  </Text>
                </Text>,
                `€ ${fee}`
              )}
            </TouchableDefaultOpacity>
            {this.labelValueRow(
              I18n.t("wallet.paymentReason"),
              cleanTransactionDescription(transaction.description)
            )}
            {this.labelValueRow(
              I18n.t("wallet.recipient"),
              transaction.merchant
            )}
            {this.labelValueRow(
              I18n.t("wallet.date"),
              formatDateAsLocal(transaction.created, true)
            )}
            {this.labelValueRow(
              I18n.t("wallet.time"),
              transaction.created.toLocaleTimeString()
            )}
            {creditCard && creditCard.brandLogo
              ? this.labelImageRow(
                  I18n.t("wallet.paymentMethod"),
                  <Logo imageStyle={styles.creditCardLogo} item={creditCard} />
                )
              : creditCard && creditCard.brand
                ? this.labelValueRow(
                    I18n.t("wallet.paymentMethod"),
                    creditCard.brand
                  )
                : undefined}
            {psp && psp.logoPSP
              ? this.labelImageRow(
                  I18n.t("wallet.psp"),
                  <Image style={styles.pspLogo} source={{ uri: psp.logoPSP }} />
                )
              : psp && psp.businessName
                ? this.labelValueRow(I18n.t("wallet.psp"), psp.businessName)
                : undefined}
          </Grid>
        </Content>
      </WalletLayout>
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

/**
 * Transaction details screen, displaying
 * a list of information available about a
 * specific transaction.
 */
import * as React from "react";

import { Content, Text, View } from "native-base";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";

import { connect } from "react-redux";
import { WalletStyles } from "../../components/styles/wallet";
import { CardEnum, WalletLayout } from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import {} from "../../store/reducers/wallet";
import { selectedCreditCardSelector } from "../../store/reducers/wallet/cards";
import { transactionForDetailsSelector } from "../../store/reducers/wallet/transactions";
import { CreditCard, UNKNOWN_CARD } from "../../types/CreditCard";
import { UNKNOWN_TRANSACTION, WalletTransaction } from "../../types/wallet";

type ReduxMappedProps = Readonly<{
  transaction: WalletTransaction;
  selectedCard: CreditCard;
}>;

type Props = ReduxMappedProps & NavigationInjectedProps;

const styles = StyleSheet.create({
  rowStyle: {
    paddingTop: 10
  },
  alignedRight: {
    textAlign: "right"
  }
});

/**
 * > PREFIXES:
 *   - LABEL_COL_SIZE_*: prefix that represents
 *     the width of the "label" column (the description
 *     of the field)
 *
 *   - VALUE_COL_SIZE_*: prefix that represents
 *     the width of the "value" column (the actual
 *     contents of the field)
 *
 *
 * > SUFFIXES:
 *   - *_NARROW_LABEL: suffix that represents the cases
 *     where "label" column should be narrow
 *     (i.e. when the "value" column contains free text)
 *     Proportions: 1/3 : 2/3
 *
 *   - *_WIDE_LABEL: suffix that represents the cases
 *     where the "label" columnn should be wide (i.e. when
 *     the "value" column is narrow (it has either a number
 *     or a date/time, thus allowing additional space for
 *     the label)
 *     Proportions: 1/2 : 1/2
 */
const LABEL_COL_SIZE_NARROW_LABEL = 1;
const VALUE_COL_SIZE_NARROW_LABEL = 2;

const LABEL_COL_SIZE_WIDE_LABEL = 1;
const VALUE_COL_SIZE_WIDE_LABEL = 1;

/**
 * Details of transaction
 */
export class TransactionDetailsScreen extends React.Component<Props, never> {
  private labelValueRow(
    label: string | React.ReactElement<any>,
    value: string | React.ReactElement<any>,
    ratio: "WIDE" | "NARROW",
    labelIsNote: boolean = true
  ): React.ReactNode {
    const labelSize =
      ratio === "WIDE"
        ? LABEL_COL_SIZE_WIDE_LABEL
        : LABEL_COL_SIZE_NARROW_LABEL;
    const valueSize =
      ratio === "WIDE"
        ? VALUE_COL_SIZE_WIDE_LABEL
        : VALUE_COL_SIZE_NARROW_LABEL;
    return (
      <Row style={styles.rowStyle}>
        <Col size={labelSize}>
          {typeof label === "string" ? (
            <Text note={labelIsNote}>{label}</Text>
          ) : (
            label
          )}
        </Col>
        <Col size={valueSize}>
          {typeof value === "string" ? (
            <Text style={styles.alignedRight} bold={true}>
              {value}
            </Text>
          ) : (
            value
          )}
        </Col>
      </Row>
    );
  }

  public render(): React.ReactNode {
    const { transaction } = this.props;

    return (
      <WalletLayout
        title={I18n.t("wallet.transaction")}
        navigation={this.props.navigation}
        headerContents={<View spacer={true} />}
        cardType={{ type: CardEnum.HEADER, card: this.props.selectedCard }}
        showPayButton={false}
      >
        <Content scrollEnabled={false} style={WalletStyles.whiteContent}>
          <Grid>
            <Row>
              <Text bold={true}>{I18n.t("wallet.transactionDetails")}</Text>
            </Row>
            {this.labelValueRow(
              `${I18n.t("wallet.total")} ${transaction.currency}`,
              `${transaction.amount}`,
              "WIDE",
              false
            )}
            {this.labelValueRow(
              I18n.t("wallet.payAmount"),
              `${transaction.amount}`,
              "WIDE"
            )}
            {this.labelValueRow(
              <Text>
                <Text note={true}>{`${I18n.t(
                  "wallet.transactionFee"
                )}  `}</Text>
                <Text note={true} style={WalletStyles.whyLink}>
                  {I18n.t("wallet.why")}
                </Text>
              </Text>,
              `${transaction.transactionCost}`,
              "WIDE"
            )}
            {this.labelValueRow(
              I18n.t("wallet.paymentReason"),
              transaction.paymentReason,
              "NARROW"
            )}
            {this.labelValueRow(
              I18n.t("wallet.recipient"),
              transaction.recipient,
              "NARROW"
            )}
            {this.labelValueRow(
              I18n.t("wallet.date"),
              transaction.date,
              "WIDE"
            )}
            {this.labelValueRow(
              I18n.t("wallet.time"),
              transaction.time,
              "WIDE"
            )}
          </Grid>
        </Content>
      </WalletLayout>
    );
  }
}
const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  transaction: transactionForDetailsSelector(state).getOrElse(
    UNKNOWN_TRANSACTION
  ),
  selectedCard: selectedCreditCardSelector(state).getOrElse(UNKNOWN_CARD)
});

export default connect(mapStateToProps)(TransactionDetailsScreen);

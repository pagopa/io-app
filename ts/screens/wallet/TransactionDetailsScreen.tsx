/**
 * Transaction details screen, displaying
 * a list of information available about a
 * specific transaction.
 */
import * as React from "react";

import { Button, Content, Text, View } from "native-base";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import { WalletStyles } from "../../components/styles/wallet";
import { CardType, WalletLayout } from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import { WalletTransaction } from "../../types/wallet";

interface ParamType {
  readonly transaction: WalletTransaction;
}

interface StateParams extends NavigationState {
  readonly params: ParamType;
}

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<StateParams>;
}>;

type Props = OwnProps & NavigationInjectedProps;

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
  constructor(props: Props) {
    super(props);
  }

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
    const { navigate } = this.props.navigation;
    const transaction: WalletTransaction = this.props.navigation.state.params
      .transaction;
    return (
      <WalletLayout
        title={I18n.t("wallet.transaction")}
        navigation={this.props.navigation}
        headerContents={<View spacer={true} />}
        cardType={CardType.HEADER}
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
            <Row style={styles.rowStyle}>
              <Button
                style={{ marginTop: 20 }}
                block={true}
                success={true}
                onPress={(): boolean => navigate("")}
              >
                <Text>{I18n.t("wallet.seeReceipt")}</Text>
              </Button>
            </Row>
          </Grid>
        </Content>
      </WalletLayout>
    );
  }
}

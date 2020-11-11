import { Badge, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import CopyButtonComponent from "../../../../../../../components/CopyButtonComponent";
import { Body } from "../../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../../components/core/typography/H4";
import { H5 } from "../../../../../../../components/core/typography/H5";
import { Monospace } from "../../../../../../../components/core/typography/Monospace";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../../i18n";
import { format } from "../../../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../../../utils/stringBuilder";
import { EnhancedBpdTransaction } from "../../../../components/transactionItem/BpdTransactionItem";
import { BpdTransactionWarning } from "./BpdTransactionWarning";

type Props = { transaction: EnhancedBpdTransaction };

const styles = StyleSheet.create({
  image: { width: 48, height: 30 },
  rowId: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  badgeText: {
    color: IOColors.red,
    fontSize: 12
  },
  badge: {
    backgroundColor: IOColors.white,
    borderColor: IOColors.red,
    borderWidth: 1,
    top: -10,
    height: 25
  }
});

const loadLocales = () => ({
  paymentMethod: I18n.t("wallet.paymentMethod"),
  acquirerId: I18n.t("bonus.bpd.details.transaction.detail.acquirerId"),
  issuerId: I18n.t("bonus.bpd.details.transaction.detail.issuerId")
});

type IdBlockProps = {
  title: string;
  value: string;
};

const CancelBadge = () => (
  <Badge style={styles.badge}>
    <Text semibold={true} style={styles.badgeText}>
      {I18n.t("bonus.bpd.details.transaction.detail.canceled")}
    </Text>
  </Badge>
);

const Table = (props: Props) => (
  <View>
    <View style={styles.rowId}>
      <H5 weight={"Regular"} color={"bluegrey"}>
        {I18n.t("payment.details.info.dateAndTime")}
      </H5>
      <H4 weight={"SemiBold"} color={"bluegreyDark"}>
        {format(props.transaction.trxDate, "DD MMM YYYY, HH:mm")}
      </H4>
    </View>
    <View spacer={true} small={true} />
    <View style={styles.rowId}>
      <H5 weight={"Regular"} color={"bluegrey"}>
        {I18n.t("bonus.bpd.details.transaction.detail.paymentCircuit")}
      </H5>
      <H4 weight={"SemiBold"} color={"bluegreyDark"}>
        {props.transaction.circuitType}
      </H4>
    </View>
    <View spacer={true} small={true} />
    <View style={styles.rowId}>
      <H5 weight={"Regular"} color={"bluegrey"}>
        {I18n.t("bonus.bpd.details.transaction.detail.transactionAmount")}
      </H5>
      <View style={styles.rowId}>
        {props.transaction.amount < 0 && (
          <>
            <CancelBadge />
            <View hspacer={true} />
          </>
        )}
        <H4 weight={"SemiBold"} color={"bluegreyDark"}>
          {formatNumberAmount(props.transaction.amount, true)}
        </H4>
      </View>
    </View>
    <View spacer={true} small={true} />
    <View style={styles.rowId}>
      <H5 weight={"Regular"} color={"bluegrey"}>
        {I18n.t("bonus.bpd.details.transaction.detail.cashbackAmount")}
      </H5>
      <H4 weight={"SemiBold"} color={"bluegreyDark"}>
        {formatNumberAmount(props.transaction.cashback, true)}
      </H4>
    </View>
  </View>
);

const IdBlock = (props: IdBlockProps) => (
  <View>
    <H5 weight={"Regular"}>{props.title}</H5>
    <View style={styles.rowId}>
      <Monospace weight={"SemiBold"}>{props.value}</Monospace>
      <CopyButtonComponent textToCopy={props.value} />
    </View>
  </View>
);

/**
 * This screen shows the details about a single transaction.
 * https://pagopa.invisionapp.com/console/IO---Cashback---Dettaglio-e-transazioni-ckg6bcpcr0ryb016nas1h4nbf/ckg6cwqfc03uf012khxbr6mun/play
 * @param props
 * @constructor
 */
export const BpdTransactionDetailComponent: React.FunctionComponent<Props> = props => {
  const { paymentMethod, acquirerId, issuerId } = loadLocales();

  return (
    <View>
      <View spacer={true} />
      <Body>{paymentMethod}</Body>
      <View spacer={true} />
      <View style={[IOStyles.flex, IOStyles.row]}>
        <Image source={props.transaction.image} style={styles.image} />
        <View hspacer={true} small={true} />
        <H4>{props.transaction.title}</H4>
      </View>
      <View spacer={true} />
      {/* using the keyvaluetable with custom style in order to be quick */}
      <Table transaction={props.transaction} />
      <BpdTransactionWarning transaction={props.transaction} />
      <View spacer={true} />
      <IdBlock title={acquirerId} value={props.transaction.idTrxAcquirer} />
      <View spacer={true} />
      <IdBlock title={issuerId} value={props.transaction.idTrxIssuer} />
    </View>
  );
};

import { View } from "native-base";
import * as React from "react";
import { Image, StyleProp, StyleSheet, TextStyle } from "react-native";
import CopyButtonComponent from "../../../../../../../components/CopyButtonComponent";
import { Body } from "../../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../../components/core/typography/H4";
import { Monospace } from "../../../../../../../components/core/typography/Monospace";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../../i18n";
import { format } from "../../../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../../../utils/stringBuilder";
import {
  KeyValueRow,
  KeyValueTable
} from "../../../../../bonusVacanze/components/keyValueTable/KeyValueTable";
import { EnhancedBpdTransaction } from "../../../../components/transactionItem/BpdTransactionItem";
import { H5 } from "../../../../../../../components/core/typography/H5";
import { BpdTransactionWarning } from "./BpdTransactionWarning";

type Props = { transaction: EnhancedBpdTransaction };

const styles = StyleSheet.create({
  image: { width: 48, height: 30 },
  rowId: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

const loadLocales = () => ({
  paymentMethod: I18n.t("wallet.paymentMethod"),
  acquirerId: I18n.t("bonus.bpd.details.transaction.detail.acquirerId"),
  issuerId: I18n.t("bonus.bpd.details.transaction.detail.issuerId")
});

const keyStyle: StyleProp<TextStyle> = {
  fontSize: 14
};

const valueStyle: StyleProp<TextStyle> = {
  fontWeight: "500",
  color: IOColors.bluegreyDark
};

const getRows = (
  transaction: EnhancedBpdTransaction
): ReadonlyArray<KeyValueRow> => [
  {
    key: {
      text: I18n.t("payment.details.info.dateAndTime"),
      style: keyStyle
    },
    value: {
      text: format(transaction.trxDate, "DD MMM YYYY, HH:mm"),
      style: valueStyle
    }
  },
  {
    key: {
      text: I18n.t("bonus.bpd.details.transaction.detail.paymentCircuit"),
      style: keyStyle
    },
    value: {
      text: transaction.circuitType,
      style: valueStyle
    }
  },
  {
    key: {
      text: I18n.t("bonus.bpd.details.transaction.detail.transactionAmount"),
      style: keyStyle
    },
    value: {
      text: `€ ${formatNumberAmount(transaction.amount)}`,
      style: valueStyle
    }
  },
  {
    key: {
      text: I18n.t("bonus.bpd.details.transaction.detail.cashbackAmount"),
      style: keyStyle
    },
    value: {
      text: `€ ${formatNumberAmount(transaction.cashback)}`,
      style: valueStyle
    }
  }
];

type IdBlockProps = {
  title: string;
  value: string;
};

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
      <KeyValueTable
        leftFlex={1}
        rightFlex={1}
        rows={getRows(props.transaction)}
      />
      <BpdTransactionWarning transaction={props.transaction} />
      <View spacer={true} />
      <IdBlock title={acquirerId} value={props.transaction.idTrxAcquirer} />
      <View spacer={true} />
      <IdBlock title={issuerId} value={props.transaction.idTrxIssuer} />
    </View>
  );
};

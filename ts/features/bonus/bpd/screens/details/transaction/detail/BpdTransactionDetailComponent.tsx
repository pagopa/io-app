import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import CopyButtonComponent from "../../../../../../../components/CopyButtonComponent";
import { IOBadge } from "../../../../../../../components/core/IOBadge";
import {
  HSpacer,
  VSpacer
} from "../../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../../components/core/typography/H4";
import { H5 } from "../../../../../../../components/core/typography/H5";
import { Monospace } from "../../../../../../../components/core/typography/Monospace";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../../i18n";
import { localeDateFormat } from "../../../../../../../utils/locale";
import { formatNumberAmount } from "../../../../../../../utils/stringBuilder";
import { EnhancedBpdTransaction } from "../../../../components/transactionItem/BpdTransactionItem";
import { BpdTransactionWarning } from "./BpdTransactionWarning";

/**
 * @deprecated
 */
export type BpdTransactionDetailRepresentation = EnhancedBpdTransaction & {
  // false if the transaction is not valid for the cashback (eg: the user has
  // already reached the maximum cashback value for the period )
  validForCashback: boolean;
};

export type BpdTransactionDetailRepresentationV2 =
  BpdTransactionDetailRepresentation & {
    isPivot: boolean;
  };

type Props = { transaction: BpdTransactionDetailRepresentation };

const styles = StyleSheet.create({
  image: { width: 48, height: 30 },
  rowId: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  copyText: {
    flex: 1,
    paddingRight: 16
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
  <IOBadge
    text={I18n.t("bonus.bpd.details.transaction.detail.canceled")}
    variant="outline"
    color="red"
  />
);

const Table = (props: Props) => {
  const isMidNight =
    props.transaction.trxDate.getHours() +
      props.transaction.trxDate.getMinutes() +
      props.transaction.trxDate.getSeconds() ===
    0;
  return (
    <View>
      <View style={styles.rowId}>
        <H5 weight={"Regular"} color={"bluegrey"} testID="dateLabel">
          {isMidNight
            ? I18n.t("payment.details.info.onlyDate")
            : I18n.t("payment.details.info.dateAndTime")}
        </H5>
        <H4 weight={"SemiBold"} color={"bluegreyDark"} testID="dateValue">
          {isMidNight
            ? localeDateFormat(
                props.transaction.trxDate,
                I18n.t(
                  "global.dateFormats.fullFormatShortMonthLiteralWithoutTime"
                )
              )
            : localeDateFormat(
                props.transaction.trxDate,
                I18n.t("global.dateFormats.fullFormatShortMonthLiteralWithTime")
              )}
        </H4>
      </View>
      <VSpacer size={8} />
      <View style={styles.rowId}>
        <H5 weight={"Regular"} color={"bluegrey"}>
          {I18n.t("bonus.bpd.details.transaction.detail.paymentCircuit")}
        </H5>
        <H4 weight={"SemiBold"} color={"bluegreyDark"}>
          {props.transaction.circuitType === "Unknown"
            ? I18n.t("global.unknown")
            : props.transaction.circuitType}
        </H4>
      </View>
      <VSpacer size={8} />
      <View style={styles.rowId}>
        <H5 weight={"Regular"} color={"bluegrey"}>
          {I18n.t("bonus.bpd.details.transaction.detail.transactionAmount")}
        </H5>
        <View style={styles.rowId}>
          {props.transaction.amount < 0 && (
            <>
              <CancelBadge />
              <HSpacer size={16} />
            </>
          )}
          <H4 weight={"SemiBold"} color={"bluegreyDark"}>
            {formatNumberAmount(props.transaction.amount, true)}
          </H4>
        </View>
      </View>
      <VSpacer size={8} />
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
};

const IdBlock = (props: IdBlockProps) => (
  <View>
    <H5 weight={"Regular"}>{props.title}</H5>
    <View style={styles.rowId}>
      <Monospace weight={"SemiBold"} style={styles.copyText}>
        {props.value}
      </Monospace>
      <CopyButtonComponent
        textToCopy={props.value}
        onPressWithGestureHandler={true}
      />
    </View>
  </View>
);

/**
 * This screen shows the details about a single transaction.
 * https://pagopa.invisionapp.com/console/IO---Cashback---Dettaglio-e-transazioni-ckg6bcpcr0ryb016nas1h4nbf/ckg6cwqfc03uf012khxbr6mun/play
 * @param props
 * @constructor
 */
export const BpdTransactionDetailComponent: React.FunctionComponent<Props> =
  props => {
    const { paymentMethod, acquirerId, issuerId } = loadLocales();

    return (
      <View>
        <VSpacer size={16} />
        <Body>{paymentMethod}</Body>
        <VSpacer size={16} />
        <View style={IOStyles.row}>
          <Image
            source={props.transaction.image}
            style={styles.image}
            resizeMode={"contain"}
          />
          <HSpacer size={8} />
          <H4>{props.transaction.title}</H4>
        </View>
        <VSpacer size={16} />
        {/* using the keyvaluetable with custom style in order to be quick */}
        <Table transaction={props.transaction} />
        <BpdTransactionWarning transaction={props.transaction} />
        <VSpacer size={16} />
        <IdBlock title={acquirerId} value={props.transaction.idTrxAcquirer} />
        <VSpacer size={16} />
        <IdBlock title={issuerId} value={props.transaction.idTrxIssuer} />
      </View>
    );
  };

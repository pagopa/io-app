import * as React from "react";
import { StyleSheet } from "react-native";
import { format } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { BpdTransaction } from "../../store/actions/transactions";
import { BaseBpdTransactionItem } from "./BaseBpdTransactionItem";

type Props = {
  transaction: BpdTransaction;
};

const styles = StyleSheet.create({});

const getSubtitle = (transaction: BpdTransaction) =>
  `${format(transaction.trxDate, "DD MMM, HH:mm")} · € ${formatNumberAmount(
    transaction.amount
  )} `;

export const BpdTransactionItem: React.FunctionComponent<Props> = props => (
  <BaseBpdTransactionItem
    subtitle={getSubtitle(props.transaction)}
    rightText={formatNumberAmount(props.transaction.cashback)}
  />
);

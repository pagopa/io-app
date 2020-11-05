import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { format } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { BpdTransaction } from "../../store/actions/transactions";
import { BaseBpdTransactionItem } from "./BaseBpdTransactionItem";

type EnhancedBpdTransaction = {
  image: ImageSourcePropType;
  title: string;
} & BpdTransaction;

type Props = {
  transaction: any;
};

/**
 * Create the subtitle for the transaction item, based on the trx date and trx amount
 * @param transaction
 */
const getSubtitle = (transaction: BpdTransaction) =>
  `${format(transaction.trxDate, "DD MMM, HH:mm")} · € ${formatNumberAmount(
    transaction.amount
  )} `;

export const BpdTransactionItem: React.FunctionComponent<Props> = props => (
  <BaseBpdTransactionItem
    image={props.transaction.imageMy}
    subtitle={getSubtitle(props.transaction)}
    rightText={formatNumberAmount(props.transaction.cashback)}
  />
);

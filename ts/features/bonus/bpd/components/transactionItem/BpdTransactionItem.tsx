import * as pot from "italia-ts-commons/lib/pot";
import _ from "lodash";
import * as React from "react";
import { ImageSourcePropType } from "react-native";
import I18n from "../../../../../i18n";
import { useIOBottomSheet } from "../../../../../utils/bottomSheet";
import { localeDateFormat } from "../../../../../utils/locale";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import {
  BpdTransactionDetailComponent,
  BpdTransactionDetailRepresentation
} from "../../screens/details/transaction/detail/BpdTransactionDetailComponent";
import { BpdTransaction } from "../../store/actions/transactions";
import { BaseBpdTransactionItem } from "./BaseBpdTransactionItem";

export type EnhancedBpdTransaction = {
  image: ImageSourcePropType;
  title: string;
  keyId: string;
  maxCashbackForTransactionAmount: number | undefined;
} & BpdTransaction;

type Props = {
  transaction: BpdTransactionDetailRepresentation;
};

/**
 * Create the subtitle for the transaction item, based on the trx date and trx amount
 * TODO: move the get subtitle in the combiner and remove this component?
 * @param transaction
 */
export const getSubtitle = (transaction: BpdTransaction) => {
  const isMidNight =
    transaction.trxDate.getHours() +
      transaction.trxDate.getMinutes() +
      transaction.trxDate.getSeconds() ===
    0;
  return isMidNight
    ? `€ ${formatNumberAmount(transaction.amount)} · ${localeDateFormat(
        transaction.trxDate,
        I18n.t("global.dateFormats.dayMonthWithoutTime")
      )} `
    : `€ ${formatNumberAmount(transaction.amount)} · ${localeDateFormat(
        transaction.trxDate,
        I18n.t("global.dateFormats.dayMonthWithTime")
      )} `;
};

const BpdTransactionItemBase: React.FunctionComponent<Props> = props => {
  const { present: openBottomSheet } = useIOBottomSheet(
    <BpdTransactionDetailComponent transaction={props.transaction} />,
    I18n.t("bonus.bpd.details.transaction.detail.title"),
    522
  );

  return (
    <BaseBpdTransactionItem
      title={props.transaction.title}
      image={props.transaction.image}
      subtitle={getSubtitle(props.transaction)}
      rightText={formatNumberAmount(props.transaction.cashback)}
      onPress={openBottomSheet}
    />
  );
};

/**
 * In order to optimize the rendering of the item, we use the keyId as unique identifier to avoid to redraw the component.
 * The trx data cannot change while consulting the list and we use this information to avoid a props deep comparison
 */
export const BpdTransactionItem = React.memo(
  BpdTransactionItemBase,
  (prev: Props, curr: Props) =>
    prev.transaction.keyId === curr.transaction.keyId
);

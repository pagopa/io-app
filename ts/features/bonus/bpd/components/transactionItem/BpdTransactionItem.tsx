import * as React from "react";
import { ImageSourcePropType } from "react-native";
import I18n from "../../../../../i18n";
import { useIOBottomSheet } from "../../../../../utils/bottomSheet";
import { localeDateFormat } from "../../../../../utils/locale";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { BpdTransactionDetailComponent } from "../../screens/details/transaction/detail/BpdTransactionDetailComponent";
import { BpdTransaction } from "../../store/actions/transactions";
import { BaseBpdTransactionItem } from "./BaseBpdTransactionItem";

export type EnhancedBpdTransaction = {
  image: ImageSourcePropType;
  title: string;
  keyId: string;
  maxCashbackForTransactionAmount: number | undefined;
} & BpdTransaction;

type Props = {
  transaction: EnhancedBpdTransaction;
};

/**
 * Create the subtitle for the transaction item, based on the trx date and trx amount
 * TODO: move the get subtitle in the combiner and remove this component?
 * @param transaction
 */
const getSubtitle = (transaction: BpdTransaction) =>
  `${localeDateFormat(
    transaction.trxDate,
    I18n.t("global.dateFormats.dayMonthWithTime")
  )} · € ${formatNumberAmount(transaction.amount)} `;

export const BpdTransactionItem: React.FunctionComponent<Props> = props => {
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

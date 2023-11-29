import React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  HSpacer,
  IOStyles,
  ListItemTransaction,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Transaction } from "../../../../types/pagopa";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { Dettaglio } from "../../../../../definitions/pagopa/Dettaglio";

type Props =
  | {
      transaction?: Transaction | null;
      loading: boolean;
      onPress: (operationDetails: Dettaglio) => void;
    }
  | {
      transaction?: Transaction | null;
      loading: true;
      onPress: (operationDetails: Dettaglio) => void;
    };

export const WalletTransactionDetailsList = ({
  transaction,
  loading,
  onPress
}: Props) => {
  if (loading) {
    return <SkeletonTransactionDetailsList />;
  }
  if (!transaction) {
    return <></>;
  }

  return (
    <>
      {transaction.detailsList?.map((operationDetails, index) => (
        <ListItemTransaction
          key={index}
          title={transaction.description}
          subtitle={transaction.merchant}
          transactionStatus="success"
          transactionAmount={formatNumberCentsToAmount(
            transaction.amount.amount,
            true,
            "right"
          )}
          hasChevronRight
          onPress={() => onPress?.(operationDetails)}
        />
      ))}
    </>
  );
};

const SkeletonTransactionDetailsList = () => (
  <View style={[IOStyles.flex, IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
    <View style={[IOStyles.flex, { paddingVertical: 12 }]}>
      <Placeholder.Box height={16} width="90%" radius={4} />
      <VSpacer size={8} />
      <Placeholder.Box height={16} width="30%" radius={4} />
    </View>
    <Placeholder.Box height={16} width={48} radius={4} />
    <HSpacer size={16} />
    <Placeholder.Box height={16} width={16} radius={4} />
  </View>
);

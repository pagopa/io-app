import { ListItem, Text, View } from "native-base";
import React from "react";
import { Image, StyleSheet } from "react-native";
import {
  IbanOperationDTO,
  OperationTypeEnum as IbanOperationTypeEnum
} from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import {
  InstrumentOperationDTO,
  OperationTypeEnum as InstrumentOperationTypeEnum
} from "../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import {
  OnboardingOperationDTO,
  OperationTypeEnum as OnboardingOperationTypeEnum
} from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import {
  TransactionOperationDTO,
  OperationTypeEnum as TransactionOperationTypeEnum
} from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { formatDateAsShortFormat } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";

import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { Icon } from "../../../../../components/core/icons";
type TransactionProps<T> = { transaction: T };

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  spaceBetween: {
    justifyContent: "space-between"
  },
  sidePadding: {
    paddingHorizontal: 8
  },
  imageSize: { height: 16, width: 24 }
});

const getHourAndMinuteFromDate = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

type BaseTransactionCardProps = { children: React.ReactNode };
const BaseTransactionCard = ({ children }: BaseTransactionCardProps) => (
  <ListItem style={styles.spaceBetween}>
    <View
      style={[
        IOStyles.flex,
        IOStyles.row,
        styles.alignCenter,
        styles.sidePadding
      ]}
    >
      {children}
    </View>
  </ListItem>
);
export const TimelineTransactionCard = ({
  transaction
}: TransactionProps<TransactionOperationDTO>) => (
  <BaseTransactionCard>
    <Image style={styles.imageSize} source={{ uri: transaction.brandLogo }} />
    <View hspacer />
    <View style={IOStyles.flex}>
      <H4>{transaction.operationType}</H4>
      <LabelSmall weight="Regular" color="bluegrey">
        {`${formatDateAsShortFormat(
          transaction.operationDate
        )}, ${getHourAndMinuteFromDate(
          transaction.operationDate
        )} · ${formatNumberAmount(Math.abs(transaction.amount), true)}`}
      </LabelSmall>
    </View>
    <H4> {`${formatNumberAmount(transaction.amount, false)} €`}</H4>
  </BaseTransactionCard>
);

export const OnboardingTransactionCard = ({
  transaction
}: TransactionProps<OnboardingOperationDTO>) => (
  <BaseTransactionCard>
    <Icon name="bonus" color="blue" />
    <View hspacer />
    <View style={IOStyles.flex}>
      <H4>{transaction.operationType}</H4>
      <LabelSmall weight="Regular" color="bluegrey">
        {`${formatDateAsShortFormat(
          transaction.operationDate
        )}, ${getHourAndMinuteFromDate(transaction.operationDate)}`}
      </LabelSmall>
    </View>
  </BaseTransactionCard>
);

export const InstrumentOnboardingCard = ({
  transaction
}: TransactionProps<InstrumentOperationDTO>) => (
  <BaseTransactionCard>
    <Image style={styles.imageSize} source={{ uri: transaction.brandLogo }} />
    <View hspacer />
    <View style={IOStyles.flex}>
      <H4>
        {transaction.operationType} {transaction.maskedPan}
      </H4>
      <LabelSmall weight="Regular" color="bluegrey">
        {`${formatDateAsShortFormat(
          transaction.operationDate
        )}, ${getHourAndMinuteFromDate(transaction.operationDate)}`}
      </LabelSmall>
    </View>
  </BaseTransactionCard>
);

export const IbanOnboardingCard = ({
  transaction
}: TransactionProps<IbanOperationDTO>) => (
  <BaseTransactionCard>
    <Icon name="amount" color="bluegreyLight" />
    <View hspacer />
    <View style={IOStyles.flex}>
      <H4>{transaction.operationType}</H4>
      <LabelSmall weight="Regular" color="bluegrey">
        {`${formatDateAsShortFormat(
          transaction.operationDate
        )}, ${getHourAndMinuteFromDate(transaction.operationDate)}`}
      </LabelSmall>
    </View>
  </BaseTransactionCard>
);

export const pickTransactionCard = (transaction: OperationListDTO) => {
  switch (transaction.operationType) {
    case TransactionOperationTypeEnum.TRANSACTION:
      return <TimelineTransactionCard transaction={transaction} />;
    case TransactionOperationTypeEnum.REVERSAL:
      return <TimelineTransactionCard transaction={transaction} />;
    case OnboardingOperationTypeEnum.ONBOARDING:
      return <OnboardingTransactionCard transaction={transaction} />;
    case InstrumentOperationTypeEnum.ADD_INSTRUMENT:
      return <InstrumentOnboardingCard transaction={transaction} />;
    case InstrumentOperationTypeEnum.DELETE_INSTRUMENT:
      return <InstrumentOnboardingCard transaction={transaction} />;
    case IbanOperationTypeEnum.ADD_IBAN:
      return <IbanOnboardingCard transaction={transaction} />;
    default:
      return <Text>Error loading {transaction.operationType}</Text>;
  }
};

import { ListItem } from "native-base";
import React from "react";
import { View, StyleSheet } from "react-native";
import { IbanOperationDTO } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { InstrumentOperationDTO } from "../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import { OnboardingOperationDTO } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { TransactionOperationDTO } from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { formatDateAsShortFormat } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";

type TransactionProps<T> = { transaction: T };

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  spaceBetween: {
    justifyContent: "space-between"
  }
});

const getHourAndMinuteFromDate = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

type BaseTransactionCardProps = { children: React.ReactNode };
const BaseTransactionCard = ({ children }: BaseTransactionCardProps) => (
  <ListItem style={styles.spaceBetween}>
    <View style={[IOStyles.flex, IOStyles.row, styles.alignCenter]}>
      {children}
    </View>
  </ListItem>
);
export const TimelineTransactionCard = ({
  transaction
}: TransactionProps<TransactionOperationDTO>) => (
  <BaseTransactionCard>
    <Body>LOGO</Body>
    <HSpacer size={16} />
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
    <Body>LOGO</Body>
    <HSpacer size={16} />
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
    <Body>LOGO</Body>
    <HSpacer size={16} />
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
    <Body>IBANLOGO</Body>
    <HSpacer size={16} />
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

import { View, Text } from "native-base";
import React from "react";
import { IbanOperationDTO } from "../../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { InstrumentOperationDTO } from "../../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import { OnboardingOperationDTO } from "../../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { TransactionOperationDTO } from "../../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { H4 } from "../../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { formatDateAsShortFormat } from "../../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../../utils/stringBuilder";

type TransactionProps<T> = { transaction: T };

const getHourAndMinuteFromDate = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

export const TimelineTransactionCard = ({
  transaction
}: TransactionProps<TransactionOperationDTO>) => (
  <>
    <Text>LOGO</Text>
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
    <H4> {`${transaction.amount} €`}</H4>
  </>
);

export const OnboardingTransactionCard = ({
  transaction
}: TransactionProps<OnboardingOperationDTO>) => (
  <>
    <Text>LOGO</Text>
    <View hspacer />
    <View style={IOStyles.flex}>
      <H4>{transaction.operationType}</H4>
      <LabelSmall weight="Regular" color="bluegrey">
        {`${formatDateAsShortFormat(
          transaction.operationDate
        )}, ${getHourAndMinuteFromDate(transaction.operationDate)}`}
      </LabelSmall>
    </View>
  </>
);

export const InstrumentOnboardingCard = ({
  transaction
}: TransactionProps<InstrumentOperationDTO>) => (
  <>
    <Text>LOGO</Text>
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
  </>
);

export const IbanOnboardingCard = ({
  transaction
}: TransactionProps<IbanOperationDTO>) => (
  <>
    <Text>IBANLOGO</Text>
    <View hspacer />
    <View style={IOStyles.flex}>
      <H4>{transaction.operationType}</H4>
      <LabelSmall weight="Regular" color="bluegrey">
        {`${formatDateAsShortFormat(
          transaction.operationDate
        )}, ${getHourAndMinuteFromDate(transaction.operationDate)}`}
      </LabelSmall>
    </View>
  </>
);

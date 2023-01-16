import { ListItem, View } from "native-base";
import React from "react";
import { Image, StyleSheet } from "react-native";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/RefundOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { formatDateAsShortFormat } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { Icon } from "../../../../../components/core/icons";

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

type TimelineOperationCardProps = {
  transaction: OperationListDTO;
};

export const TimelineOperationCard = ({
  transaction
}: TimelineOperationCardProps) => {
  const hasAmount = "amount" in transaction;
  return (
    <ListItem style={styles.spaceBetween}>
      <View
        style={[
          IOStyles.flex,
          IOStyles.row,
          styles.alignCenter,
          styles.sidePadding
        ]}
      >
        {"brandLogo" in transaction ? (
          <Image
            style={styles.imageSize}
            source={{ uri: transaction.brandLogo }}
          />
        ) : (
          RenderCorrectIcon(transaction.operationType)
        )}
        <View hspacer />
        <View style={IOStyles.flex}>
          <H4>
            {operationDescriptionsMap[transaction.operationType](
              "maskedPan" in transaction ? transaction.maskedPan : ""
            )}
          </H4>
          <LabelSmall weight="Regular" color="bluegrey">
            {`${formatDateAsShortFormat(
              transaction.operationDate
            )}, ${getHourAndMinuteFromDate(transaction.operationDate)} ${
              hasAmount
                ? "· " + formatNumberAmount(Math.abs(transaction.amount), true)
                : ""
            }`}
          </LabelSmall>
        </View>
        {hasAmount ? (
          <H4> {`${formatNumberAmount(transaction.amount, false)} €`}</H4>
        ) : null}
      </View>
    </ListItem>
  );
};

type TypesForIcons =
  | IbanOperationTypeEnum
  | OnboardingOperationTypeEnum
  | RefundOperationTypeEnum;
const RenderCorrectIcon = (type: TypesForIcons) => {
  switch (type) {
    case OnboardingOperationTypeEnum.ONBOARDING:
      return <Icon name={"bonus"} color="blue" />;
    case IbanOperationTypeEnum.ADD_IBAN:
      return <Icon name={"amount"} color="bluegreyLight" />;
    case RefundOperationTypeEnum.PAID_REFUND:
      return <Icon name={"reload"} color="bluegreyLight" />;
    case RefundOperationTypeEnum.REJECTED_REFUND:
      return <Icon name={"error"} color="bluegreyLight" />;
    default:
      return null;
  }
};

const operationDescriptionsMap = {
  ONBOARDING: () => "Hai aderito all'iniziativa",
  ADD_IBAN: () => "Aggiunto IBAN",
  ADD_INSTRUMENT: (maskedPan: string) => `Hai aggiunto ···· ${maskedPan}`,
  TRANSACTION: () => "Pagamento Pos",
  REVERSAL: () => "Ricarica saldo disponibile",
  DELETE_INSTRUMENT: () => "Hai eliminato un metodo di pagamento",
  REJECTED_ADD_INSTRUMENT: () => "Hai rifiutato un metodo di pagamento",
  REJECTED_DELETE_INSTRUMENT: () =>
    "Hai rifiutato di eliminare un metodo di pagamento",
  PAID_REFUND: () => "Rimborso",
  REJECTED_REFUND: () => "Rifiuto rimborso"
};
